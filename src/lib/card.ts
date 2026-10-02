import sharp, { type OverlayOptions } from "sharp";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const PADDING = 48;
const IMAGE_WIDTH = 552;
const TEXT_HEIGHT = 260;
const BACKGROUND = "#18181b";

export interface Card {
  title: string;
  /** Smaller line under the title. */
  caption?: string;
  /** The piece to show: a path to an image file, or its bytes. */
  image?: string | Buffer;
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Draws a social share card (the preview image shown when a page is linked)
 * as a 1200x630 JPEG. The whole design lives in this function, and it is a
 * placeholder: the piece on the left, uncropped, and the text on the right.
 */
export async function renderCard({
  title,
  caption,
  image,
}: Card): Promise<Buffer> {
  const layers: OverlayOptions[] = [];
  const textLeft = image ? PADDING + IMAGE_WIDTH + PADDING : PADDING;

  if (image) {
    layers.push({
      input: await sharp(image)
        .autoOrient()
        .resize(IMAGE_WIDTH, CARD_HEIGHT - 2 * PADDING, {
          fit: "contain",
          background: BACKGROUND,
        })
        .png()
        .toBuffer(),
      left: PADDING,
      top: PADDING,
    });
  }

  // With a width and height, the text wraps and shrinks until it fits the box.
  const text = await sharp({
    text: {
      text:
        `<span foreground="white"><b>${escape(title)}</b>` +
        (caption ? `\n<span size="50%">${escape(caption)}</span>` : "") +
        `</span>`,
      font: "sans",
      width: CARD_WIDTH - textLeft - PADDING,
      height: TEXT_HEIGHT,
      rgba: true,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  layers.push({
    input: text.data,
    left: textLeft,
    top: Math.round((CARD_HEIGHT - text.info.height) / 2),
  });

  return sharp({
    create: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      channels: 3,
      background: BACKGROUND,
    },
  })
    .composite(layers)
    .jpeg({ quality: 85 })
    .toBuffer();
}
