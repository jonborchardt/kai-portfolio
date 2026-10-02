# kai-portfolio

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

| Field    | Required | Notes                                                         |
| -------- | -------- | ------------------------------------------------------------- |
| `title`  | yes      |                                                               |
| `date`   | yes      | `2026-03` or `2026-03-14`. Newest pieces are listed first     |
| `type`   | yes      | `art`, `photo`, `video` or `music`                            |
| `medium` | no       | Free text                                                     |
| `media`  | yes      | Files in the folder, or YouTube/Vimeo links, in display order |

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

| Command                | Does                                       |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Local dev server                           |
| `npm run build`        | Build the site into `dist/`                |
| `npm run preview`      | Serve the built site                       |
| `npm run lint`         | ESLint                                     |
| `npm run format`       | Format with Prettier                       |
| `npm run format:check` | Check formatting                           |
| `npm run check`        | Type-check                                 |
| `npm test`             | Unit tests (Vitest)                        |
| `npm run test:e2e`     | Build, then run browser tests (Playwright) |

The first time, run `npx playwright install chromium` before `npm run test:e2e`.

## Publishing

Every push to `main` runs all the checks and, if they pass, publishes the site
to GitHub Pages (`.github/workflows/deploy.yml`).

To move to a custom domain: set `site` to the domain and delete `base` in
`astro.config.ts`, add a `public/CNAME` file containing the domain, and update
the base path in `playwright.config.ts`.
