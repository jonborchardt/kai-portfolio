import sharp from "sharp";
import { expect, test } from "vitest";
import { CARD_HEIGHT, CARD_WIDTH, renderCard } from "./card";

async function describeImage(card: Buffer) {
  const { format, width, height } = await sharp(card).metadata();
  return { format, width, height };
}

const expected = { format: "jpeg", width: CARD_WIDTH, height: CARD_HEIGHT };

test("a card without an image is a 1200x630 JPEG", async () => {
  const card = await renderCard({ title: "Sample Song", caption: "Piano" });
  expect(await describeImage(card)).toEqual(expected);
});

test.each([
  ["tall", 300, 900],
  ["wide", 2000, 400],
])("a %s piece fits on the card", async (_shape, width, height) => {
  const image = await sharp({
    create: { width, height, channels: 3, background: "#c2410c" },
  })
    .png()
    .toBuffer();
  const card = await renderCard({ title: "Koi Pond", image });
  expect(await describeImage(card)).toEqual(expected);
});

test("long titles and markup characters do not break the card", async () => {
  const card = await renderCard({
    title: `Salt & <Smoke> ${"a very long title ".repeat(20)}`,
    caption: "Ink & <wash>",
  });
  expect(await describeImage(card)).toEqual(expected);
});
