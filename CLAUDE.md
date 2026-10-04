# kai-portfolio

Static Astro site for Kai's paintings, drawings, writing and marimba,
published to GitHub Pages at `/kai-portfolio`. README.md covers running the
site and adding pieces; it is written for the person adding content, so keep
it in plain language.

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
- `content/about.md`: bio, plus front matter the whole site uses (mission
  statement on the home page, contact links in every footer, About photos
  from `content/about/`). It is the `about` collection in
  `src/content.config.ts`; `about()` in `src/lib/assets.ts` fetches it.
- `src/content.config.ts`: the `work` and `about` collection schemas. All
  content validation happens here, at build time.
- `src/lib/media.ts`: pure content rules (media kinds, embed links, dates,
  sort order, piece ids, the `TYPES` list, mosaic tile shapes). No Astro
  imports, so Vitest can test it; put new rules here with a test in
  `media.test.ts`.
- `src/lib/assets.ts`: the Astro side. Resolves a piece's media to built
  assets through `import.meta.glob`.
- `src/pages/`: `index.astro` (mission, type filters, mosaic of pieces newest
  first), `work/[id].astro` (text on the left, media on the right),
  `about.astro`, `404.astro`.
- `src/components/`: `Tile.astro` (one mosaic tile, a link or a plain
  picture), `ContactLinks.astro` (the contact list in the footer and on
  About), `Media.astro` (one image, player or embed on a piece page).
- `src/styles/global.css`: the whole design. Theme tokens in `:root` first,
  then base rules, then plain CSS classes (`.top`, `.sheet`/`.tile` mosaic,
  `.doc`/`.side`/`.plate` two-column page). Tailwind is loaded but only its
  `prose` and `sr-only` classes are used. Dark only for now.
- `src/site.ts`: site name, author and description, used by the page head and
  the share cards. The values are guesses until Kai confirms them.
- `src/lib/card.ts`: draws the share card (the 1200x630 preview image for
  links) with sharp. The whole design is the one `renderCard` function and is a
  placeholder. `src/pages/work/[id]/card.jpg.ts` builds one per piece from its
  first image; `src/pages/card.jpg.ts` builds the site-wide one.

## Things to keep in sync

- Supported file extensions are listed in three places: `EXTENSIONS` in
  `src/lib/media.ts`, the two globs in `src/lib/assets.ts` (each letter in
  both cases), and the README.
- The base path `/kai-portfolio` is in both `astro.config.ts` and
  `playwright.config.ts`.
- A change to the frontmatter fields of a piece or of `about.md` needs the
  matching README table updated.
- The piece page hangs the media from the title's bottom line: `--title-bottom`
  in `global.css`, measured by the script in `work/[id].astro`.
- The phone breakpoint (560px) is in `global.css` and in the image `sizes` in
  `Tile.astro`. The page colour `--bg` is repeated in the `theme-color` tag in
  `Base.astro`.
- The fonts are listed in `astro.config.ts` (`fonts`), loaded by `<Font>` in
  `Base.astro`, and named `--sans` and `--mono` in `global.css`. A weight the
  CSS uses must be in the config list. The build downloads them, so it needs
  a network connection the first time.

## Design rules

Every change to a page or component keeps to these. They are checked by
`npm run test:e2e` where a test can check them.

- **Use the theme.** Colours, type sizes, spacing, lines, corners, focus ring
  and motion speed are tokens in `:root` of `global.css`. Use a token; do not
  write a new literal value in a rule. If no token fits, add one there. Type
  sizes are in `rem`.
- **One design language.** Mono capitals for labels and navigation, the sans
  face for titles and reading text, ink lines between regions, square corners,
  one accent colour for "current" and "chosen". A new page reuses `Base.astro`
  and the existing classes before adding any.
- **Reuse before writing.** Markup that appears twice becomes a component in
  `src/components/`. No per-page `<style>` blocks.
- **Responsive.** Two breakpoints only: 900px (two-column pages stack) and
  560px (phone). Check 320, 768, 900, 1280 and 1920px wide, with long titles
  and many or few pieces. No page may scroll sideways.
- **Accessible (WCAG 2.2 AA).** One `h1` per page and headings in order. Real
  elements (`a`, `button`, `input`, `nav`, lists), not clickable `div`s. Every
  control reachable by keyboard with the visible `--focus` ring; never remove
  an outline without replacing it. Text contrast at least 4.5:1. Targets at
  least 24px. Decorative glyphs such as arrows get `aria-hidden`, with
  `sr-only` text when meaning would be lost. Motion uses `--speed`, which
  `prefers-reduced-motion` sets to zero.
- **States are designed.** Hover, focus, current, chosen, disabled (a filter
  with no pieces), empty (no pieces, no photos, no contact links), loading (a
  tile's `--well` background, with image sizes reserved) and error (the 404
  page, and build messages for content mistakes). The site has no forms, so
  there is no success state; design one with the first form.
- **Works without JavaScript.** Content, navigation and the filters are HTML
  and CSS. The one script (the title measurement on a piece page) only
  refines a CSS default. Prefer a native element or CSS to a new script.
- **Fast.** No client framework and no third-party requests on our own pages.
  Images go through `<Image>` with `widths` and `sizes`; the first image in
  view gets `priority` and the rest stay lazy. Fonts are self-hosted and
  preloaded. Nothing may shift the layout as it loads.
- **Restrained motion.** A transition only where it shows a change of state
  (a caption appearing). Nothing decorative.
- **Validate before calling it done.** Run all the checks, and look at the
  built pages at phone, tablet, laptop and large desktop widths.

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
- Tiles in a mosaic (`.sheet`) are plain pictures except on the home page,
  where they link to pieces; the About photos and a piece's own images do not
  open anything.
- The home page's filters are radio buttons; one generated CSS rule per entry
  in `TYPES` hides the other tiles (`index.astro`). A new type needs no CSS.
- The browser tests include an axe accessibility scan of every page, a
  sideways-scroll check at five widths, and a check of every internal link.
  A failure there is a real defect; fix the page, not the test.
