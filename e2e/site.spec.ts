import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const pieceLinks = 'a[href*="/work/"]';

/** Opens the home page and returns the address of every piece it lists. */
async function pieceUrls(page: Page): Promise<string[]> {
  await page.goto("./");
  return page
    .locator(pieceLinks)
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href),
    );
}

/** Every page of the site: home, About, each piece, and the not-found page. */
async function allPages(page: Page): Promise<string[]> {
  const pieces = await pieceUrls(page);
  const home = page.url();
  return [
    home,
    new URL("about/", home).href,
    ...pieces,
    new URL("no-such-page/", home).href,
  ];
}

test.beforeEach(async ({ page }) => {
  // The tests check our own pages; third-party video players are not loaded.
  await page.route(
    (url) => url.hostname !== "localhost",
    (route) => route.abort(),
  );
});

test("the home page lists at least one piece", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("header a").first()).toBeVisible();
  expect(await page.locator(pieceLinks).count()).toBeGreaterThan(0);
});

test("a filter shows only pieces of its type", async ({ page }) => {
  await page.goto("./");
  const filters = page.getByRole("group", { name: "Filter by type" });
  // The first type that has at least one piece; a type with none is disabled.
  const radio = filters.locator("input:not([value=all]):enabled").first();
  const type = await radio.getAttribute("value");
  await radio.check();
  const shown = page.locator(`${pieceLinks}:visible`);
  expect(await shown.count()).toBeGreaterThan(0);
  for (const tile of await shown.all()) {
    await expect(tile).toHaveAttribute("data-type", type ?? "");
  }
  await filters.locator("input[value=all]").check();
  expect(await page.locator(`${pieceLinks}:visible`).count()).toBe(
    await page.locator(pieceLinks).count(),
  );
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
  const urls = await pieceUrls(page);
  expect(urls.length).toBeGreaterThan(0);

  for (const url of urls) {
    const response = await page.goto(url);
    expect(response?.status(), url).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.locator("article :is(img, audio, video, iframe)").count(),
      `${url} shows no media`,
    ).toBeGreaterThan(0);

    // The item at the top of the page is in view at once, so it must not
    // wait to load.
    const first = page
      .locator("article :is(img, audio, video, iframe)")
      .first();
    if (await first.evaluate((el) => el.tagName === "IMG")) {
      await expect(first).not.toHaveAttribute("loading", "lazy");
    }

    for (const image of await page.locator("article img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate(
              (el) =>
                (el as HTMLImageElement).complete &&
                (el as HTMLImageElement).naturalWidth > 0,
            ),
          { message: `an image on ${url} did not load` },
        )
        .toBe(true);
    }

    const sources = await page
      .locator("article :is(audio, video)")
      .evaluateAll((players) =>
        players.map((player) => (player as HTMLMediaElement).src),
      );
    for (const source of sources) {
      if (source.startsWith("data:")) continue;
      const file = await page.request.get(source);
      expect(file.ok(), `${source} on ${url}`).toBe(true);
    }
  }
});

test("every page's share card image loads", async ({ page }) => {
  const urls = await pieceUrls(page);

  for (const url of [page.url(), ...urls]) {
    await page.goto(url);
    const card = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    // The address points at the published site; fetch the same path locally.
    const image = await page.request.get(new URL(card ?? "").pathname);
    expect(image.ok(), `${card} on ${url}`).toBe(true);
    expect(image.headers()["content-type"]).toBe("image/jpeg");
  }
});

test("the About page loads", async ({ page }) => {
  const response = await page.goto("./about/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("article")).not.toBeEmpty();
});

test("every link to another page of the site leads to a real page", async ({
  page,
}) => {
  const pages = await allPages(page);
  const links = new Set<string>();
  // The not-found page is last, and is itself not a real page.
  for (const url of pages.slice(0, -1)) {
    await page.goto(url);
    const found = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
      );
    for (const link of found) {
      if (new URL(link).hostname === "localhost") links.add(link);
    }
  }
  for (const link of links) {
    const target = await page.request.get(link);
    expect(target.ok(), link).toBe(true);
  }
});

test("an unknown URL shows the not-found page", async ({ page }) => {
  const response = await page.goto("./no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
  await page.getByRole("link", { name: "Back to the work" }).click();
  await expect(page.locator(pieceLinks).first()).toBeVisible();
});

// A small phone, a tablet either side of the one-column breakpoint, a laptop
// and a large desktop.
for (const width of [320, 768, 900, 1280, 1920]) {
  test(`no page scrolls sideways at ${width}px wide`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const url of await allPages(page)) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${url} is ${overflow}px too wide`).toBeLessThanOrEqual(
        0,
      );
    }
  });
}

test("every page passes the accessibility check, with one main heading and no errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // Blocked third-party players (see beforeEach) are not our errors, and
    // the not-found page is meant to answer 404.
    const from = message.location().url;
    const ours = from.includes("//localhost") && !from.includes("no-such-page");
    if (message.type() === "error" && ours) errors.push(message.text());
  });

  for (const url of await allPages(page)) {
    await page.goto(url);
    await expect(page.locator("h1"), url).toHaveCount(1);
    const { violations } = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22aa",
        "best-practice",
      ])
      // A third-party player's insides are not ours to fix.
      .exclude("iframe")
      .analyze();
    expect(
      violations.map(
        (violation) =>
          `${violation.id}: ${violation.help} (${violation.nodes
            .map((node) => node.target.join(" "))
            .join("; ")})`,
      ),
      url,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("the first Tab stop is a link that skips to the content", async ({
  page,
}) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("the filters and the pieces can be reached and used from the keyboard", async ({
  page,
}) => {
  await page.goto("./");
  const all = page.locator(".filters input[value=all]");
  await all.focus();
  // Arrow keys move between radio buttons; a disabled one is skipped.
  await page.keyboard.press("ArrowRight");
  const chosen = page.locator(".filters input:checked");
  await expect(chosen).not.toHaveAttribute("value", "all");
  const type = await chosen.getAttribute("value");
  // The next Tab stop is the first piece still showing, with its caption.
  await page.keyboard.press("Tab");
  const tile = page.locator(`${pieceLinks}:focus`);
  await expect(tile).toHaveAttribute("data-type", type ?? "");
  await expect(tile.locator(".cap")).toHaveCSS("opacity", "1");
  await expect(tile).not.toHaveCSS("outline-style", "none");
});
