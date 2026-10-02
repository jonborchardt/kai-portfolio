# Kai portfolio: project scaffold

Date: 2026-10-01
Status: approved

## Purpose

A portfolio site for Kai's artwork, photos, video and music, aimed at
admissions and application reviewers. A reviewer opens one link on any device
and sees curated, labeled work.

The visual design is not decided yet. This spec covers the project scaffold
only: the structure, content format, tooling and deployment that the design
will later be applied to. Pages are unstyled placeholders.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Astro, static output, TypeScript strict |
| Styling | Tailwind CSS, plus its typography plugin for rendered Markdown |
| UI framework | None. React can be added later (`npx astro add react`) if the design needs interactive components |
| Quality tooling | ESLint, Prettier, Vitest, Playwright |
| Content | One folder per piece, with a Markdown file for metadata and writing |
| Images and audio | Stored in the repo |
| Video | Either a file in the repo or a YouTube/Vimeo link, per item |
| Hosting | GitHub Pages at `jonborchardt.github.io/kai-portfolio`, custom domain possible later |
| Repo | `jonborchardt/kai-portfolio`, public |

## Content

```
content/
  about.md                 artist statement and contact
  work/
    2026-koi-pond/         folder name is the URL: /work/2026-koi-pond
      index.md
      cover.jpg
      detail.jpg
      process.mp4
```

`index.md`:

```md
---
title: Koi Pond
date: 2026-03
type: art
medium: Watercolor on paper
media:
  - cover.jpg
  - { src: detail.jpg, alt: Close-up of the fins }
  - process.mp4
  - https://youtu.be/abc123
---
Anything Kai wants to write about the piece.
```

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | Display name |
| `date` | yes | `YYYY-MM` or `YYYY-MM-DD`. Pieces are listed newest first |
| `type` | yes | One of `art`, `photo`, `video`, `music`. Adding a type is a one-line schema change |
| `medium` | no | Free text, such as "Watercolor on paper" |
| `media` | yes, at least one | Ordered list. Each item is a file name in the piece's folder or a YouTube/Vimeo link, optionally written as `{ src, alt }` |

Rules:

- The kind of each media item is decided by its file extension or link:
  - images: jpg, jpeg, png, webp, gif, avif
  - audio: mp3, m4a, wav, ogg
  - video: mp4, webm
  - embeds: YouTube and Vimeo links
- Image alt text defaults to the piece title when `alt` is not given.
- The first image in `media` is the piece's thumbnail on the home page. A piece
  with no image gets a text-only entry.
- The build fails with a message naming the piece when a required field is
  missing, a named file does not exist, or an item has an unsupported extension
  or link (for example an iPhone `.heic` photo, which browsers cannot show).

## Pages

| URL | Content |
|---|---|
| `/` | Every piece, newest first: thumbnail, title, type, date |
| `/work/<folder-name>` | One piece: its media in order, metadata, and writing |
| `/about` | `content/about.md` rendered |
| not-found page | Shown by GitHub Pages for unknown URLs |

All pages share one layout with a header linking Home and About. Markup is
semantic HTML with minimal Tailwind classes, so the design can be applied
without restructuring.

Media rendering uses the browser's built-in elements: images through Astro's
image component, `<audio controls>`, `<video controls>`, and an `<iframe>` for
embeds. YouTube embeds use the `youtube-nocookie.com` address.

Images are resized at build time by Astro: a thumbnail size for the home page
and a large size for the piece page. Originals in the repo are never modified.

Three placeholder pieces named `sample-*` (one image, one audio, one embedded
video) ship with the scaffold so every media kind is exercised. They are
deleted when real work arrives.

## Project layout

```
content/                   as above
src/
  content.config.ts        collection definition and metadata schema
  lib/media.ts             media kind detection, embed address, file lookup
  lib/media.test.ts
  layouts/Base.astro
  components/Media.astro   renders one media item by kind
  pages/index.astro
  pages/work/[id].astro
  pages/about.astro
  pages/404.astro
  styles/global.css        Tailwind import and theme tokens
e2e/site.spec.ts           Playwright tests
astro.config.ts            site address and base path
eslint.config.js
prettier.config.js
vitest.config.ts
playwright.config.ts
.github/workflows/deploy.yml
README.md                  how to run locally and how to add a piece
```

## Tooling

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Static site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run lint` | ESLint with the Astro and TypeScript rules |
| `npm run format` | Prettier, with its Astro and Tailwind plugins |
| `npm run format:check` | Fails if any file is not formatted |
| `npm run check` | `astro check` type-checking |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright tests against the built site |

ESLint and Prettier do not overlap: ESLint has its formatting rules turned off
(`eslint-config-prettier`), and Prettier owns formatting.

**Unit tests (Vitest)** cover the only hand-written logic: classifying a media
item and converting YouTube/Vimeo links to embed addresses. Metadata
validation is Astro's own and is exercised by the build.

**End-to-end tests (Playwright, Chromium)** run against the built site served
under the real base path:

- the home page lists at least one piece;
- opening the first piece shows its title and at least one media element;
- a piece page loads when its URL is opened directly;
- the About page loads;
- an unknown URL shows the not-found page.

These tests do not name the sample pieces, so they keep passing when the
samples are replaced with real work.

There are no git hooks; the checks run in CI.

## Deployment

A GitHub Actions workflow runs on every push to `main`: install, lint, format
check, type-check, unit tests, build, end-to-end tests, then publish `dist/`
with GitHub's official Pages actions. A failing step blocks the publish. The
repo's Pages source is set to "GitHub Actions".

The site address and base path (`/kai-portfolio`) are set in
`astro.config.ts`, and internal links are built from that base. Moving to a
custom domain later means changing those two settings and adding a
`public/CNAME` file.

Creating the public GitHub repo and the first push are done only after
explicit confirmation.

## Constraints

- GitHub rejects any file over 100 MB, and a Pages site is limited to about
  1 GB. Local video should be short, compressed clips; longer pieces go on
  YouTube or Vimeo.
- GitHub Pages on a free plan requires a public repo, so original files are
  publicly downloadable.

## Out of scope

- Visual design, fonts, colors
- Filtering by type, search, lightbox, custom audio or video players
- Manual ordering or featured pieces (date order only)
- Draft or hidden pieces
- React, Radix UI, or any other UI framework or component library
- Git hooks (husky, lint-staged)
- Analytics, contact form, custom domain setup
