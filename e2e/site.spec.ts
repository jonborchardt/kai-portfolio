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
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).href),
    );
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

test("the About page loads", async ({ page }) => {
  const response = await page.goto("./about/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("article")).not.toBeEmpty();
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
