# kai-portfolio

A static site for Kai's paintings, drawings, writing and marimba, built with
[Astro](https://astro.build) and published to GitHub Pages.

## Run it

You need [Node.js](https://nodejs.org) 22.12 or newer.

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
   type: painting
   medium: Watercolor on paper
   media:
     - cover.jpg
     - { src: detail.jpg, alt: Close-up of the fins }
     - https://youtu.be/aqz-KE-bpKQ
   ---

   Anything you want to say about the piece.
   ```

| Field    | Required | Notes                                                                  |
| -------- | -------- | ---------------------------------------------------------------------- |
| `title`  | yes      |                                                                        |
| `date`   | yes      | `2026-03` or `2026-03-14`. Newest first; same date goes by folder name |
| `type`   | yes      | `painting`, `drawing`, `writing` or `marimba`; the home page filters   |
| `medium` | no       | Free text                                                              |
| `media`  | yes      | Files in the folder, or YouTube/Vimeo links, in display order          |

- Files can be jpg, jpeg, png, webp, gif, avif, mp3, m4a, wav, ogg, mp4 or webm.
  iPhone `.heic` photos need converting to jpg first.
- The first image is the piece's thumbnail on the home page, and appears on
  the preview card shown when someone shares a link to the piece. A piece
  with no image shows its title in the thumbnail's place.
- On the piece's page, images listed one after another appear together as a
  mosaic; a single image, or a video, audio file or YouTube/Vimeo link, gets
  its own full-width spot.
- Give each image an `alt`: a few words saying what the picture shows, for
  people who use a screen reader. Without one, the piece's title is used.
- File names in `media` must match the real file names exactly, including
  upper and lower case.
- To link to another page of the site in your text, start the address with
  `/`: `[About](/about/)`.
- Keep video files short and compressed. GitHub rejects any file over 100 MB;
  put longer videos on YouTube or Vimeo (unlisted is fine) and list the link.

If something is wrong (a missing field, a misspelled file name), `npm run build`
stops and says which piece to fix.

## The About page and the site's own words

`content/about.md` holds the bio (the text under the `---` block) and, between
the `---` marks:

| Field         | Required | Notes                                                                           |
| ------------- | -------- | ------------------------------------------------------------------------------- |
| `description` | yes      | The short summary that search engines and link previews show                    |
| `mission`     | yes      | The sentence or two shown at the top of the home page                           |
| `contact`     | no       | `label` and `url` pairs, shown on the About page and in every footer            |
| `portrait`    | no       | A small photo next to the name in the header, written as `./about/portrait.jpg` |
| `images`      | no       | Photos for the About page, each written as `./about/<file name>`                |

The pictures themselves go in the `content/about/` folder. The `sample-*`
folders and the pictures in `content/about/` are placeholders; replace them
once real work is in.

## How the site is built to behave

- It fits phones, tablets, laptops and large screens.
- It works with a keyboard and a screen reader, and without JavaScript.
- The look comes from one list of colours, sizes and spacings at the top of
  `src/styles/global.css`. Change a value there and it changes everywhere.
- The fonts are downloaded when the site is built and served from the site
  itself, so the first build needs an internet connection.

`npm run test:e2e` checks all of this: every page at five screen widths, an
accessibility scan, keyboard use, and every link. `CLAUDE.md` has the rules in
full for anyone changing the design.

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

To move to a custom domain: set `site` to the domain and `base` to `""` in
`astro.config.ts`, add a `public/CNAME` file containing the domain, and update
the base path in `playwright.config.ts`.

## License

Copyright © 2026 Kai Borchardt. All rights reserved. See [LICENSE](LICENSE).
