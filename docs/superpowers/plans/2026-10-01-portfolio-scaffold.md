# Kai Portfolio Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working, unstyled Astro site that turns one-folder-per-piece Markdown content into a static portfolio, with lint, format, unit and end-to-end checks and a GitHub Pages deploy workflow.

**Architecture:** Astro builds every page to static HTML. An Astro content collection reads `content/work/<piece>/index.md` and validates its metadata; pure functions in `src/lib/media.ts` hold the content rules (media kinds, embed addresses, dates, folder names) and are unit-tested; `src/lib/assets.ts` maps file names in a piece folder to built assets through `import.meta.glob`. Pages are thin Astro templates over those two modules.

**Tech Stack:** Astro 7 (Vite 8), TypeScript 6.0, Tailwind CSS 4 with `@tailwindcss/typography`, ESLint 10, Prettier 3, Vitest 5, Playwright, GitHub Actions and GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-01-portfolio-scaffold-design.md`

## Global Constraints

- Node 24 locally and in CI (Astro requires `>=22.12.0`).
- TypeScript is pinned to `^6.0.3`. TypeScript 7 is the npm `latest`, but `typescript-eslint` requires `<6.1.0` and `@astrojs/check` requires `^5 || ^6`.
- No React, Radix UI, or any other UI framework or component library.
- No git hooks.
- Site address `https://jonborchardt.github.io`, base path `/kai-portfolio`. Every internal link is built with `href()` from `src/lib/href.ts`.
- Content lives in `content/` at the repo root. Media types: images jpg, jpeg, png, webp, gif, avif; audio mp3, m4a, wav, ogg; video mp4, webm; embeds YouTube and Vimeo.
- `type` is one of `art`, `photo`, `video`, `music`.
- Prettier and ESLint never touch `content/` or `docs/`: a hand-written Markdown file must not be able to fail CI on formatting.
- Astro 7 specifics that differ from older Astro: zod is imported from `astro/zod`; Markdown renders with the built-in pipeline (no remark install); the compiler rejects unclosed tags; whitespace between inline elements follows JSX rules.
- Creating the GitHub repo and pushing happen only after the user confirms (Task 7).

## Review Focus

Inputs the spec implies but does not spell out, most likely first. Each has a pinning test in the named task.

1. **Upper-case file extensions** (`IMG_1234.JPG` straight off a camera or phone) should work like lower-case ones. Unit test in Task 3; the `detail.JPG` sample file in Task 4 pins it end to end through Task 5's image-loading test.
2. **Link variants and wrong links**: unlisted Vimeo links carry a hash (`vimeo.com/123/abc`), YouTube links come as `youtu.be`, `watch?v=`, `shorts/`, `m.youtube.com`, with `&t=` suffixes; a Google Drive or SoundCloud link should fail the build with a clear message, not render a broken frame. Unit tests in Task 3.
3. **Year-only or malformed dates** (`date: 2024`) should fail with a clear message rather than silently becoming 1970. Unit tests in Task 3.
4. **A piece folder with no `index.md`** (misnamed `Index.md` or `koi.md`) should fail the build, not silently vanish from the site. Unit test in Task 3, wired in Task 4.
5. **Folder names with spaces or capitals** (`Koi Pond`) should fail with a message naming the folder, since the folder name is the URL. Unit test in Task 3, wired in Task 4.

## File Structure

| File | Responsibility |
|---|---|
| `astro.config.ts` | Site address, base path, Tailwind plugin |
| `src/styles/global.css` | Tailwind import, typography plugin, theme tokens |
| `src/lib/href.ts` | Prefix internal paths with the base path |
| `src/lib/media.ts` | Pure content rules: media kind, embed address, date parsing, folder-name rule, orphan-folder detection |
| `src/lib/media.test.ts` | Vitest tests for the above |
| `src/lib/assets.ts` | `import.meta.glob` maps; resolve a piece's media items to built assets; cover image; orphan-folder assertion |
| `src/content.config.ts` | `work` collection: loader, id rule, metadata schema |
| `src/layouts/Base.astro` | HTML shell, head tags, header nav |
| `src/components/Media.astro` | Render one resolved media item |
| `src/pages/index.astro`, `work/[id].astro`, `about.astro`, `404.astro` | Pages |
| `content/` | `about.md` and three `sample-*` pieces |
| `e2e/site.spec.ts` | Playwright tests |
| `eslint.config.js`, `prettier.config.js`, `.prettierignore`, `vitest.config.ts`, `playwright.config.ts` | Tooling |
| `.github/workflows/deploy.yml` | CI and Pages deploy |
| `README.md` | Run locally, add a piece |

The spec's layout put file lookup in `media.ts`. It lives in `assets.ts` instead so `media.ts` stays free of `import.meta.glob` and Astro types and can be unit-tested as plain TypeScript.

---

### Task 1: Project foundation

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.ts`, `.gitignore`, `.gitattributes`, `src/styles/global.css`, `src/lib/href.ts`, `src/layouts/Base.astro`, `src/pages/index.astro`

**Interfaces:**
- Produces: `href(path: string): string` from `src/lib/href.ts`; `Base.astro` with props `{ title?: string; description?: string; image?: string }` (`image` is a site-root-relative path used for the preview-card image).

- [ ] **Step 1: Initialise git**

```bash
git init -b main
```

- [ ] **Step 2: Write `.gitignore` and `.gitattributes`**

`.gitignore`:

```
node_modules/
dist/
.astro/
playwright-report/
test-results/
.env
.DS_Store
```

`.gitattributes` (keeps line endings LF on Windows so `prettier --check` passes everywhere):

```
* text=auto eol=lf
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "kai-portfolio",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

- [ ] **Step 4: Install runtime and build dependencies**

```bash
npm install astro tailwindcss @tailwindcss/vite @tailwindcss/typography
npm install -D typescript@^6.0.3 @astrojs/check @types/node
```

Expected: installs without peer-dependency errors.

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 6: Write `astro.config.ts`**

```ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Moving to a custom domain: set `site` to the domain, delete `base`,
// add public/CNAME, and update the base path in playwright.config.ts.
export default defineConfig({
  site: "https://jonborchardt.github.io",
  base: "/kai-portfolio",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 7: Write `src/styles/global.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Design tokens (fonts, colors, spacing) go in an @theme block here
   once the visual design is decided. */
```

- [ ] **Step 8: Write `src/lib/href.ts`**

```ts
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site-internal link: prefixes a root-relative path with the configured base path. */
export function href(path: string): string {
  return `${base}${path}`;
}
```

- [ ] **Step 9: Write `src/layouts/Base.astro`**

```astro
---
import "../styles/global.css";
import { href } from "../lib/href";

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

const siteName = "Kai's Portfolio";
const { title, description, image } = Astro.props;
const pageTitle = title ? `${title} | ${siteName}` : siteName;
const pageUrl = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    {description && <meta name="description" content={description} />}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:title" content={title ?? siteName} />
    <meta property="og:url" content={pageUrl} />
    {description && <meta property="og:description" content={description} />}
    {image && <meta property="og:image" content={new URL(image, Astro.site)} />}
  </head>
  <body>
    <header>
      <nav aria-label="Main">
        <a href={href("/")}>Work</a>
        <a href={href("/about/")}>About</a>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 10: Write a temporary `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---

<Base>
  <h1>Work</h1>
</Base>
```

- [ ] **Step 11: Build and type-check**

```bash
npm run build
npx astro check
```

Expected: build writes `dist/index.html`; `astro check` reports 0 errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Scaffold Astro project with Tailwind"
```

---

### Task 2: Lint, format and unit-test tooling

**Files:**
- Create: `eslint.config.js`, `prettier.config.js`, `.prettierignore`, `vitest.config.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: npm scripts `lint`, `format`, `format:check`, `check`, `test`.

- [ ] **Step 1: Install**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-astro eslint-config-prettier prettier prettier-plugin-astro prettier-plugin-tailwindcss vitest
```

- [ ] **Step 2: Write `eslint.config.js`**

```js
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "dist/",
    ".astro/",
    "content/",
    "docs/",
    "playwright-report/",
    "test-results/",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  prettier,
);
```

- [ ] **Step 3: Write `prettier.config.js` and `.prettierignore`**

`prettier.config.js`:

```js
export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
```

`.prettierignore`:

```
dist/
.astro/
content/
docs/
playwright-report/
test-results/
package-lock.json
```

- [ ] **Step 4: Write `vitest.config.ts`**

The `include` keeps Vitest away from the Playwright files in `e2e/`.

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "check": "astro check",
  "test": "vitest run"
}
```

- [ ] **Step 6: Run them**

```bash
npm run format
npm run lint
npm run format:check
npm run check
```

Expected: all exit 0. (`npm test` has no test files until Task 3.)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add ESLint, Prettier and Vitest"
```

---

### Task 3: Content rules (`src/lib/media.ts`)

**Files:**
- Create: `src/lib/media.ts`
- Test: `src/lib/media.test.ts`

**Interfaces:**
- Produces:
  - `type MediaKind = "image" | "audio" | "video" | "embed"`
  - `SUPPORTED: string` — human-readable list of supported media, for error messages
  - `embedUrl(src: string): string | undefined`
  - `mediaKind(src: string): MediaKind | undefined`
  - `parseDate(value: unknown): Date | undefined`
  - `isValidPieceId(id: string): boolean`
  - `orphanFolders(filePaths: string[], pieceIds: string[]): string[]`

- [ ] **Step 1: Write the failing tests**

`src/lib/media.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import {
  embedUrl,
  isValidPieceId,
  mediaKind,
  orphanFolders,
  parseDate,
} from "./media";

describe("mediaKind", () => {
  test.each([
    ["cover.jpg", "image"],
    ["scan.jpeg", "image"],
    ["a.png", "image"],
    ["a.webp", "image"],
    ["a.gif", "image"],
    ["a.avif", "image"],
    ["song.mp3", "audio"],
    ["song.m4a", "audio"],
    ["song.wav", "audio"],
    ["song.ogg", "audio"],
    ["clip.mp4", "video"],
    ["clip.webm", "video"],
    ["https://youtu.be/aqz-KE-bpKQ", "embed"],
    ["https://vimeo.com/76979871", "embed"],
  ])("%s is %s", (src, kind) => {
    expect(mediaKind(src)).toBe(kind);
  });

  test("upper-case extensions from cameras and phones are accepted", () => {
    expect(mediaKind("IMG_1234.JPG")).toBe("image");
    expect(mediaKind("MOV_0001.MP4")).toBe("video");
  });

  test("file names with extra dots use the last extension", () => {
    expect(mediaKind("koi.pond.final.png")).toBe("image");
  });

  test.each(["photo.heic", "notes.txt", "art.psd", "noextension", ""])(
    "%j is unsupported",
    (src) => {
      expect(mediaKind(src)).toBeUndefined();
    },
  );

  test("links that are not YouTube or Vimeo are unsupported", () => {
    expect(mediaKind("https://drive.google.com/file/d/abc/view")).toBeUndefined();
    expect(mediaKind("https://soundcloud.com/kai/song")).toBeUndefined();
    expect(mediaKind("https://example.com/cover.jpg")).toBeUndefined();
  });
});

describe("embedUrl", () => {
  const youtube = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ";

  test.each([
    "https://youtu.be/aqz-KE-bpKQ",
    "https://youtu.be/aqz-KE-bpKQ?t=42",
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    "https://www.youtube.com/watch?v=aqz-KE-bpKQ&t=42s",
    "https://m.youtube.com/watch?v=aqz-KE-bpKQ",
    "https://youtube.com/shorts/aqz-KE-bpKQ",
    "https://www.youtube.com/embed/aqz-KE-bpKQ",
    "http://youtu.be/aqz-KE-bpKQ",
  ])("YouTube link %s", (src) => {
    expect(embedUrl(src)).toBe(youtube);
  });

  test("public Vimeo link", () => {
    expect(embedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  test("unlisted Vimeo link keeps its privacy hash", () => {
    expect(embedUrl("https://vimeo.com/76979871/0a1b2c3d4e")).toBe(
      "https://player.vimeo.com/video/76979871?h=0a1b2c3d4e",
    );
  });

  test.each([
    "cover.jpg",
    "https://www.youtube.com/",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/@somechannel",
    "https://vimeo.com/kai",
    "https://example.com/watch?v=aqz-KE-bpKQ",
    "ftp://youtu.be/aqz-KE-bpKQ",
  ])("%s has no embed address", (src) => {
    expect(embedUrl(src)).toBeUndefined();
  });
});

describe("parseDate", () => {
  test("year and month", () => {
    expect(parseDate("2026-03")?.toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  test("full date", () => {
    expect(parseDate("2026-03-14")?.toISOString()).toBe(
      "2026-03-14T00:00:00.000Z",
    );
  });

  test("a Date, as YAML produces for a full date, passes through", () => {
    const date = new Date("2026-03-14T00:00:00Z");
    expect(parseDate(date)).toBe(date);
  });

  test.each([2024, "2024", "March 2026", "2026-13", "03-2026", "", null, undefined])(
    "%j is rejected rather than guessed",
    (value) => {
      expect(parseDate(value)).toBeUndefined();
    },
  );

  test("an invalid Date is rejected", () => {
    expect(parseDate(new Date("nonsense"))).toBeUndefined();
  });
});

describe("isValidPieceId", () => {
  test.each(["koi-pond", "2026-koi-pond", "a", "piece2"])("%s is valid", (id) => {
    expect(isValidPieceId(id)).toBe(true);
  });

  test.each(["Koi Pond", "koi pond", "Koi-Pond", "koi_pond", "-koi", "koi-", "koi--pond", "ko/i", ""])(
    "%j is invalid",
    (id) => {
      expect(isValidPieceId(id)).toBe(false);
    },
  );
});

describe("orphanFolders", () => {
  test("folders with media but no piece are reported once each, sorted", () => {
    const files = [
      "/content/work/koi-pond/cover.jpg",
      "/content/work/koi-pond/detail.jpg",
      "/content/work/no-index/a.jpg",
      "/content/work/no-index/b.mp3",
      "/content/work/also-missing/a.png",
    ];
    expect(orphanFolders(files, ["koi-pond"])).toEqual([
      "also-missing",
      "no-index",
    ]);
  });

  test("no orphans when every folder has a piece", () => {
    expect(
      orphanFolders(["/content/work/koi-pond/cover.jpg"], ["koi-pond"]),
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL, cannot resolve `./media`.

- [ ] **Step 3: Write `src/lib/media.ts`**

```ts
export type MediaKind = "image" | "audio" | "video" | "embed";

const EXTENSIONS: Record<string, MediaKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  avif: "image",
  mp3: "audio",
  m4a: "audio",
  wav: "audio",
  ogg: "audio",
  mp4: "video",
  webm: "video",
};

/** For error messages shown to whoever is adding content. */
export const SUPPORTED = `${Object.keys(EXTENSIONS).join(", ")}, or a YouTube or Vimeo link`;

/** Embed address for a YouTube or Vimeo link; undefined for anything else. */
export function embedUrl(src: string): string | undefined {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;

  const host = url.hostname.replace(/^(www|m)\./, "");
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "youtube.com") {
    let id: string | null | undefined;
    if (host === "youtu.be") id = path[0];
    else if (path[0] === "watch") id = url.searchParams.get("v");
    else if (path[0] === "shorts" || path[0] === "embed") id = path[1];
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : undefined;
  }

  if (host === "vimeo.com" && /^\d+$/.test(path[0] ?? "")) {
    // Unlisted Vimeo links carry a hash the player needs: vimeo.com/<id>/<hash>
    const hash = /^[0-9a-f]+$/i.test(path[1] ?? "") ? `?h=${path[1]}` : "";
    return `https://player.vimeo.com/video/${path[0]}${hash}`;
  }

  return undefined;
}

/** Kind of a media item, from its file extension or link; undefined if unsupported. */
export function mediaKind(src: string): MediaKind | undefined {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(src)) {
    return embedUrl(src) ? "embed" : undefined;
  }
  const extension = src.split(".").pop()?.toLowerCase() ?? "";
  return Object.hasOwn(EXTENSIONS, extension) ? EXTENSIONS[extension] : undefined;
}

/** Parses `YYYY-MM` or `YYYY-MM-DD` (or a Date) as UTC; undefined for anything else. */
export function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? undefined : value;
  }
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value));
  if (!match) return undefined;
  const date = new Date(`${match[1]}-${match[2]}-${match[3] ?? "01"}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

/** A piece's folder name is its URL, so: lowercase letters, digits, single hyphens. */
export function isValidPieceId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/**
 * Folders under content/work that hold media files but have no piece.
 * `filePaths` look like "/content/work/<folder>/<file>".
 */
export function orphanFolders(filePaths: string[], pieceIds: string[]): string[] {
  const known = new Set(pieceIds);
  const folders = new Set(
    filePaths.map((path) => path.split("/").at(-2) ?? ""),
  );
  return [...folders].filter((folder) => !known.has(folder)).sort();
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Format, lint, commit**

```bash
npm run format
npm run lint
git add -A
git commit -m "Add content rules for media, dates and piece folders"
```

---

### Task 4: Content collection, sample content and pages

**Files:**
- Create: `src/content.config.ts`, `src/lib/assets.ts`, `src/components/Media.astro`, `src/pages/work/[id].astro`, `src/pages/about.astro`, `src/pages/404.astro`
- Create: `content/about.md`, `content/work/sample-painting/{index.md,cover.png,detail.JPG}`, `content/work/sample-song/{index.md,tone.wav}`, `content/work/sample-film/index.md`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `mediaKind`, `embedUrl`, `parseDate`, `isValidPieceId`, `orphanFolders`, `SUPPORTED` from `src/lib/media.ts`; `href` from `src/lib/href.ts`; `Base.astro`.
- Produces:
  - Collection `work`; entry `id` is the folder name; `data` is `{ title: string; date: Date; type: "art" | "photo" | "video" | "music"; medium?: string; media: { src: string; alt?: string }[] }`.
  - From `src/lib/assets.ts`:
    - `type ResolvedMedia = { kind: "image"; image: ImageMetadata; alt: string } | { kind: "audio" | "video"; url: string; label: string } | { kind: "embed"; url: string; label: string }`
    - `resolveMedia(piece: CollectionEntry<"work">): ResolvedMedia[]`
    - `coverImage(piece: CollectionEntry<"work">): { image: ImageMetadata; alt: string } | undefined`
    - `assertNoOrphanFolders(pieceIds: string[]): void`

- [ ] **Step 1: Generate the sample media**

Run this once from the repo root with Node (`sharp` is installed with Astro). It is a one-off; do not keep the script in the repo.

```js
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

mkdirSync("content/work/sample-painting", { recursive: true });
mkdirSync("content/work/sample-song", { recursive: true });

const svg = (a, b, label) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="1600" height="1200" fill="url(#g)"/>
  <text x="800" y="620" font-family="sans-serif" font-size="72" fill="#fff" text-anchor="middle">${label}</text>
</svg>`);

await sharp(svg("#2b6cb0", "#ed8936", "Sample painting"))
  .png()
  .toFile("content/work/sample-painting/cover.png");
await sharp(svg("#276749", "#d69e2e", "Sample detail"))
  .jpeg({ quality: 80 })
  .toFile("content/work/sample-painting/detail.JPG");

// Two seconds of a 440 Hz tone: 8 kHz, 16-bit mono WAV.
const rate = 8000;
const samples = rate * 2;
const wav = Buffer.alloc(44 + samples * 2);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + samples * 2, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) {
  wav.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 8000), 44 + i * 2);
}
writeFileSync("content/work/sample-song/tone.wav", wav);
```

- [ ] **Step 2: Write the sample content**

`content/work/sample-painting/index.md`:

```md
---
title: Sample Painting
date: 2026-03
type: art
medium: Watercolor on paper
media:
  - cover.png
  - { src: detail.JPG, alt: A close-up of the lower corner }
---

This is a placeholder piece. Delete the `sample-painting` folder when real work is added.

Anything written here appears under the images on the piece's page.
```

`content/work/sample-song/index.md`:

```md
---
title: Sample Song
date: 2026-01-15
type: music
medium: Piano
media:
  - tone.wav
---

A placeholder for a music piece. It has no image, so it appears as a text-only entry on the home page.
```

`content/work/sample-film/index.md`:

```md
---
title: Sample Film
date: 2025-11
type: video
media:
  - https://www.youtube.com/watch?v=aqz-KE-bpKQ
---

A placeholder for a video hosted on YouTube or Vimeo.
```

`content/about.md`:

```md
# About

A placeholder for Kai's artist statement and contact details.
```

- [ ] **Step 3: Write `src/content.config.ts`**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { isValidPieceId, mediaKind, parseDate, SUPPORTED } from "./lib/media";

const mediaItem = z
  .union([
    z.string(),
    z.object({ src: z.string(), alt: z.string().optional() }),
  ])
  .transform((item) => (typeof item === "string" ? { src: item } : item))
  .refine((item) => mediaKind(item.src) !== undefined, {
    message: `Unsupported media item. Use ${SUPPORTED}.`,
  });

const work = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./content/work",
    generateId: ({ entry }) => {
      const id = entry.replace(/[\\/]index\.md$/, "");
      if (!isValidPieceId(id)) {
        throw new Error(
          `content/work/${id}: the folder name becomes the page URL, so it may only use lowercase letters, numbers and hyphens (for example "koi-pond").`,
        );
      }
      return id;
    },
  }),
  schema: z.object({
    title: z.string().min(1),
    date: z
      .any()
      .refine((value) => parseDate(value) !== undefined, {
        message: "date must look like 2026-03 or 2026-03-14",
      })
      .transform((value) => parseDate(value) as Date),
    type: z.enum(["art", "photo", "video", "music"]),
    medium: z.string().optional(),
    media: z.array(mediaItem).min(1),
  }),
});

export const collections = { work };
```

- [ ] **Step 4: Write `src/lib/assets.ts`**

```ts
import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { embedUrl, mediaKind, orphanFolders } from "./media";

// Both letter cases are listed because cameras and phones write IMG_1234.JPG
// and glob patterns are case-sensitive.
const images = import.meta.glob<ImageMetadata>(
  "/content/work/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF,AVIF}",
  { eager: true, import: "default" },
);
const files = import.meta.glob<string>(
  "/content/work/**/*.{mp3,m4a,wav,ogg,mp4,webm,MP3,M4A,WAV,OGG,MP4,WEBM}",
  { eager: true, import: "default", query: "?url" },
);

type Piece = CollectionEntry<"work">;

export type ResolvedMedia =
  | { kind: "image"; image: ImageMetadata; alt: string }
  | { kind: "audio" | "video"; url: string; label: string }
  | { kind: "embed"; url: string; label: string };

function lookup<T>(map: Record<string, T>, pieceId: string, name: string): T {
  const folder = `/content/work/${pieceId}/`;
  const found = map[folder + name];
  if (found !== undefined) return found;
  const present = [...Object.keys(images), ...Object.keys(files)]
    .filter((path) => path.startsWith(folder))
    .map((path) => path.slice(folder.length));
  throw new Error(
    `content/work/${pieceId}/index.md lists "${name}" but that file is not in the folder. ` +
      `File names are case-sensitive. Files found: ${present.join(", ") || "none"}.`,
  );
}

/** A piece's media items, in order, resolved to built assets and embed addresses. */
export function resolveMedia(piece: Piece): ResolvedMedia[] {
  const label = piece.data.title;
  return piece.data.media.map((item): ResolvedMedia => {
    const kind = mediaKind(item.src);
    switch (kind) {
      case "image":
        return {
          kind,
          image: lookup(images, piece.id, item.src),
          alt: item.alt ?? label,
        };
      case "audio":
      case "video":
        return { kind, url: lookup(files, piece.id, item.src), label };
      default:
        // The collection schema has already rejected anything else.
        return { kind: "embed", url: embedUrl(item.src) ?? item.src, label };
    }
  });
}

/** The first image in a piece's media, used as its thumbnail and preview-card image. */
export function coverImage(
  piece: Piece,
): { image: ImageMetadata; alt: string } | undefined {
  const first = resolveMedia(piece).find((media) => media.kind === "image");
  return first?.kind === "image"
    ? { image: first.image, alt: first.alt }
    : undefined;
}

/** Fails the build when a folder holds media but its index.md is missing or misnamed. */
export function assertNoOrphanFolders(pieceIds: string[]): void {
  const orphans = orphanFolders(
    [...Object.keys(images), ...Object.keys(files)],
    pieceIds,
  );
  if (orphans.length > 0) {
    throw new Error(
      `These folders in content/work have media files but no index.md, so they would not appear on the site: ${orphans.join(", ")}. ` +
        `Each piece needs a file named exactly "index.md".`,
    );
  }
}
```

- [ ] **Step 5: Write `src/components/Media.astro`**

```astro
---
import { Image } from "astro:assets";
import type { ResolvedMedia } from "../lib/assets";

interface Props {
  media: ResolvedMedia;
}

const { media } = Astro.props;
---

{
  media.kind === "image" && (
    <Image
      src={media.image}
      alt={media.alt}
      widths={[640, 1280, 2000]}
      sizes="(min-width: 1280px) 1280px, 100vw"
    />
  )
}
{
  media.kind === "audio" && (
    <audio controls preload="metadata" src={media.url} aria-label={media.label} />
  )
}
{
  media.kind === "video" && (
    <video
      controls
      playsinline
      preload="metadata"
      src={media.url}
      aria-label={media.label}
    />
  )
}
{
  media.kind === "embed" && (
    <iframe
      class="aspect-video w-full"
      src={media.url}
      title={media.label}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  )
}
```

- [ ] **Step 6: Replace `src/pages/index.astro`**

```astro
---
import { Image } from "astro:assets";
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import { assertNoOrphanFolders, coverImage } from "../lib/assets";
import { href } from "../lib/href";

const pieces = (await getCollection("work")).sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
);
assertNoOrphanFolders(pieces.map((piece) => piece.id));

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
---

<Base description="Artwork, photography, video and music by Kai.">
  <h1>Work</h1>
  {pieces.length === 0 && <p>No work has been added yet.</p>}
  <ul>
    {
      pieces.map((piece) => {
        const cover = coverImage(piece);
        return (
          <li>
            <a href={href(`/work/${piece.id}/`)}>
              {cover && <Image src={cover.image} alt={cover.alt} width={640} />}
              <h2>{piece.data.title}</h2>
            </a>
            <p>
              {piece.data.type}
              {" · "}
              <time datetime={piece.data.date.toISOString().slice(0, 10)}>
                {monthYear.format(piece.data.date)}
              </time>
            </p>
          </li>
        );
      })
    }
  </ul>
</Base>
```

- [ ] **Step 7: Write `src/pages/work/[id].astro`**

```astro
---
import { getImage } from "astro:assets";
import { getCollection, render } from "astro:content";
import type { CollectionEntry } from "astro:content";
import Media from "../../components/Media.astro";
import Base from "../../layouts/Base.astro";
import { coverImage, resolveMedia } from "../../lib/assets";

export async function getStaticPaths() {
  const pieces = await getCollection("work");
  return pieces.map((piece) => ({ params: { id: piece.id }, props: { piece } }));
}

interface Props {
  piece: CollectionEntry<"work">;
}

const { piece } = Astro.props;
const { title, type, medium, date } = piece.data;
const { Content } = await render(piece);
const media = resolveMedia(piece);

const cover = coverImage(piece);
const preview =
  cover && (await getImage({ src: cover.image, width: 1200, format: "jpg" }));

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const description = [medium, monthYear.format(date)].filter(Boolean).join(", ");
---

<Base title={title} description={description} image={preview?.src}>
  <article>
    <h1>{title}</h1>
    <p>
      {type}
      {medium && ` · ${medium}`}
      {" · "}
      <time datetime={date.toISOString().slice(0, 10)}>{monthYear.format(date)}</time>
    </p>
    {media.map((item) => <Media media={item} />)}
    <div class="prose">
      <Content />
    </div>
  </article>
</Base>
```

- [ ] **Step 8: Write `src/pages/about.astro` and `src/pages/404.astro`**

`src/pages/about.astro`:

```astro
---
import { Content } from "../../content/about.md";
import Base from "../layouts/Base.astro";
---

<Base title="About">
  <article class="prose">
    <Content />
  </article>
</Base>
```

`src/pages/404.astro`:

```astro
---
import Base from "../layouts/Base.astro";
import { href } from "../lib/href";
---

<Base title="Page not found">
  <h1>Page not found</h1>
  <p><a href={href("/")}>Back to the work</a></p>
</Base>
```

- [ ] **Step 9: Build and inspect**

```bash
npm run build
```

Expected: `dist/index.html`, `dist/about/index.html`, `dist/404.html`, and `dist/work/sample-painting/index.html`, `sample-song`, `sample-film`. Then check:

- `dist/index.html` links to `/kai-portfolio/work/sample-painting/` and has an `<img>` whose `src` starts with `/kai-portfolio/_astro/`.
- `dist/work/sample-painting/index.html` has two `<img>` elements with `srcset`, and an `og:image` meta tag with an absolute `https://jonborchardt.github.io/kai-portfolio/...` URL.
- `dist/work/sample-song/index.html` has an `<audio>` whose `src` file exists in `dist/`.
- `dist/work/sample-film/index.html` has an `<iframe>` with `src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"`.

- [ ] **Step 10: Verify each build failure message, restoring after each**

Make each change, run `npm run build`, confirm it fails with the quoted message, then undo the change.

| Change | Expected message contains |
|---|---|
| In `sample-painting/index.md`, change `cover.png` to `Cover.png` | `lists "Cover.png" but that file is not in the folder` and `Files found: cover.png, detail.JPG` |
| In `sample-song/index.md`, change `date: 2026-01-15` to `date: 2026` | `date must look like 2026-03 or 2026-03-14` |
| In `sample-film/index.md`, change the link to `https://example.com/video` | `Unsupported media item` |
| Rename `sample-song/index.md` to `sample-song/song.md` | `have media files but no index.md` and `sample-song` |
| Rename folder `sample-film` to `Sample Film` | `may only use lowercase letters, numbers and hyphens` |
| In `sample-painting/index.md`, delete the `title:` line | names `title` as required |

After restoring everything, `npm run build` passes and `git status` shows no changes under `content/`.

- [ ] **Step 11: Run all checks and commit**

```bash
npm run format
npm run lint
npm run check
npm test
git add -A
git commit -m "Add work collection, pages and sample pieces"
```

---

### Task 5: End-to-end tests

**Files:**
- Create: `playwright.config.ts`, `e2e/site.spec.ts`
- Modify: `package.json` (script)

**Interfaces:**
- Consumes: the built site in `dist/`, served by `npm run preview` under `/kai-portfolio/`.
- Produces: npm script `test:e2e` (builds, then runs Playwright).

- [ ] **Step 1: Install**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

// Keep in step with `base` in astro.config.ts.
const baseURL = "http://localhost:4321/kai-portfolio/";

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: Write `e2e/site.spec.ts`**

The tests never name a sample piece, so they keep passing when real work replaces the samples.

```ts
import { expect, test } from "@playwright/test";

const pieceLinks = 'a[href*="/work/"]';

test.beforeEach(async ({ page }) => {
  // The tests check our own pages; third-party video players are not loaded.
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) => route.abort(),
  );
});

test("the home page lists at least one piece", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.locator(pieceLinks).count()).toBeGreaterThan(0);
});

test("opening the first piece shows its title and media", async ({ page }) => {
  await page.goto("./");
  const link = page.locator(pieceLinks).first();
  const title = await link.getByRole("heading").innerText();
  await link.click();
  await expect(page).toHaveURL(/\/work\/[^/]+\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(
    page.locator("article :is(img, audio, video, iframe)").first(),
  ).toBeVisible();
});

test("every piece page opens directly and its media files load", async ({
  page,
}) => {
  await page.goto("./");
  const urls = await page
    .locator(pieceLinks)
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
  expect(urls.length).toBeGreaterThan(0);

  for (const url of urls) {
    const response = await page.goto(url);
    expect(response?.status(), url).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.locator("article :is(img, audio, video, iframe)").count(),
      `${url} shows no media`,
    ).toBeGreaterThan(0);

    for (const image of await page.locator("article img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate(
              (el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
            ),
          { message: `an image on ${url} did not load` },
        )
        .toBe(true);
    }

    const sources = await page
      .locator("article :is(audio, video)")
      .evaluateAll((players) => players.map((player) => (player as HTMLMediaElement).src));
    for (const source of sources) {
      if (source.startsWith("data:")) continue;
      const file = await page.request.get(source);
      expect(file.ok(), `${source} on ${url}`).toBe(true);
    }
  }
});

test("the About page loads", async ({ page }) => {
  const response = await page.goto("./about/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("article")).not.toBeEmpty();
});

test("an unknown URL shows the not-found page", async ({ page }) => {
  const response = await page.goto("./no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await page.getByRole("link", { name: "Back to the work" }).click();
  await expect(page.locator(pieceLinks).first()).toBeVisible();
});
```

- [ ] **Step 4: Add the script to `package.json`**

```json
"test:e2e": "npm run build && playwright test"
```

- [ ] **Step 5: Run**

Run: `npm run test:e2e`
Expected: 5 passed.

- [ ] **Step 6: Confirm the tests can fail**

Temporarily change `href("/")` in `src/pages/404.astro` to `"/"`, run `npm run test:e2e`, and confirm the not-found test fails (the link leaves the base path). Restore the file and confirm 5 passed again.

- [ ] **Step 7: Format, lint, check, commit**

```bash
npm run format
npm run lint
npm run check
git add -A
git commit -m "Add Playwright end-to-end tests"
```

---

### Task 6: Deploy workflow and README

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run check
      - run: npm test
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Write `README.md`**

````markdown
# Kai's Portfolio

A static site for Kai's artwork, photos, video and music, built with
[Astro](https://astro.build) and published to GitHub Pages.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:4321/kai-portfolio/.

## Add a piece

1. Make a folder in `content/work/`. Its name becomes the page address, so use
   lowercase letters, numbers and hyphens: `content/work/2026-koi-pond/`.
2. Put the piece's images, audio or video files in the folder.
3. Add a file named exactly `index.md`:

   ```md
   ---
   title: Koi Pond
   date: 2026-03
   type: art
   medium: Watercolor on paper
   media:
     - cover.jpg
     - { src: detail.jpg, alt: Close-up of the fins }
     - https://youtu.be/abc123
   ---

   Anything you want to say about the piece.
   ```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | |
| `date` | yes | `2026-03` or `2026-03-14`. Newest pieces are listed first |
| `type` | yes | `art`, `photo`, `video` or `music` |
| `medium` | no | Free text |
| `media` | yes | Files in the folder, or YouTube/Vimeo links, in display order |

- Files can be jpg, jpeg, png, webp, gif, avif, mp3, m4a, wav, ogg, mp4 or webm.
  iPhone `.heic` photos need converting to jpg first.
- The first image is the piece's thumbnail.
- File names in `media` must match the real file names exactly, including
  upper and lower case.
- Keep video files short and compressed. GitHub rejects any file over 100 MB;
  put longer videos on YouTube or Vimeo (unlisted is fine) and list the link.

If something is wrong (a missing field, a misspelled file name), `npm run build`
stops and says which piece to fix.

The About page is `content/about.md`. The three `sample-*` folders are
placeholders; delete them once real work is in.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built site |
| `npm run lint` | ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |
| `npm run check` | Type-check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Build, then run browser tests (Playwright) |

The first time, run `npx playwright install chromium` before `npm run test:e2e`.

## Publishing

Every push to `main` runs all the checks and, if they pass, publishes the site
to GitHub Pages (`.github/workflows/deploy.yml`).

To move to a custom domain: set `site` to the domain and delete `base` in
`astro.config.ts`, add a `public/CNAME` file containing the domain, and update
the base path in `playwright.config.ts`.
````

- [ ] **Step 3: Run every check the workflow runs**

```bash
npm run lint
npm run format:check
npm run check
npm test
npm run test:e2e
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add GitHub Pages deploy workflow and README"
```

---

### Task 7: Publish (requires user confirmation)

Do not start this task until the user confirms. It creates a public repo and publishes the site.

- [ ] **Step 1: Create the repo and push**

```bash
gh repo create jonborchardt/kai-portfolio --public --source . --remote origin --push
```

- [ ] **Step 2: Set the Pages source to GitHub Actions**

```bash
gh api -X POST repos/jonborchardt/kai-portfolio/pages -f build_type=workflow
```

- [ ] **Step 3: Run the workflow and watch it**

```bash
gh workflow run deploy.yml
gh run watch
```

Expected: both jobs succeed.

- [ ] **Step 4: Verify the live site**

Open https://jonborchardt.github.io/kai-portfolio/ and one piece page directly; confirm both load with their media.
