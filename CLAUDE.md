# kai-portfolio

Static Astro site for Kai's artwork, photos, video and music, published to
GitHub Pages at `/kai-portfolio`. README.md covers running the site and adding
pieces; it is written for the person adding content, so keep it in plain
language.

## Commands

- `npm run dev`: dev server at http://localhost:4321/kai-portfolio/
- `npm run lint`, `npm run format:check`, `npm run check`, `npm test`,
  `npm run test:e2e`: the checks CI runs before deploying
  (`.github/workflows/deploy.yml`). Run them all before calling work done.
  Prettier also checks Markdown, including this file.
- One unit test file: `npx vitest run src/lib/media.test.ts`
- One browser test: `npm run build`, then `npx playwright test -g "About"`.
  Playwright serves the built `dist/` on port 4331, so rebuild after changes.

## Layout

- `content/work/<piece-id>/index.md` plus that piece's media files. The folder
  name is the page URL. `content/` sits at the repo root, not under `src/`.
- `src/content.config.ts`: the `work` collection schema. All content
  validation happens here, at build time.
- `src/lib/media.ts`: pure content rules (media kinds, embed links, dates,
  sort order, piece ids). No Astro imports, so Vitest can test it; put new rules here with
  a test in `media.test.ts`.
- `src/lib/assets.ts`: the Astro side. Resolves a piece's media to built
  assets through `import.meta.glob`.
- `src/pages/`: `index.astro` (grid, newest first), `work/[id].astro`,
  `about.astro` (renders `content/about.md`), `404.astro`.
- `src/site.ts`: site name, author and description, used by the page head and
  the share cards. The values are guesses until Kai confirms them.
- `src/lib/card.ts`: draws the share card (the 1200x630 preview image for
  links) with sharp. The whole design is the one `renderCard` function and is a
  placeholder. `src/pages/work/[id]/card.jpg.ts` builds one per piece from its
  first image; `src/pages/card.jpg.ts` builds the site-wide one.

## Things to keep in sync

- Supported file extensions are listed three times: `EXTENSIONS` in
  `src/lib/media.ts`, the two globs in `src/lib/assets.ts` (each letter in both cases),
  and the README.
- The base path `/kai-portfolio` is in both `astro.config.ts` and
  `playwright.config.ts`.
- A change to the frontmatter fields needs the README table updated.

## Conventions

- Build internal links with `href()` from `src/lib/href.ts`, with a trailing
  slash (`trailingSlash: "always"`). A bare `/about/` breaks under the base
  path. Links in Markdown are the exception: a plugin in `astro.config.ts`
  adds the base path to them, so content is written with plain `/about/`.
- Dates are parsed and formatted as UTC.
- A content mistake should fail the build with a message that names the piece
  and says how to fix it. Whoever reads it may not be a developer.
- The browser tests do not name specific pieces, so they keep passing when the
  `sample-*` folders are replaced with real work. Keep them that way.
