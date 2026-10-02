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

test("links written in Markdown from the site root lead to real pages", async ({
  page,
}) => {
  const urls = await pieceUrls(page);

  for (const url of [new URL("about/", page.url()).href, ...urls]) {
    await page.goto(url);
    const links = await page
      .locator('article a[href^="/"]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
      );
    for (const link of links) {
      const target = await page.request.get(link);
      expect(target.ok(), `${link} on ${url}`).toBe(true);
    }
  }
});

test("the theme button switches to dark mode and the choice is kept", async ({
  page,
}) => {
  await page.goto("./");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Light mode" })).toBeVisible();
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
