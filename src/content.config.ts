import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { isValidPieceId, mediaKind, parseDate, SUPPORTED } from "./lib/media";

const mediaItem = z
  .union([
    z.string(),
    z.object({ src: z.string(), alt: z.string().optional() }),
  ])
  .transform((item) => (typeof item === "string" ? { src: item } : item))
  .refine((item) => mediaKind(item.src) !== undefined, {
    message: `Unsupported media item. Use ${SUPPORTED}.`,
  });

const work = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./content/work",
    generateId: ({ entry }) => {
      const id = entry.replace(/[\\/]index\.md$/, "");
      if (!isValidPieceId(id)) {
        throw new Error(
          `content/work/${id}: the folder name becomes the page URL, so it may only use lowercase letters, numbers and hyphens (for example "koi-pond").`,
        );
      }
      return id;
    },
  }),
  schema: z.object({
    title: z.string().min(1),
    date: z
      .any()
      .refine((value) => parseDate(value) !== undefined, {
        message: "date must look like 2026-03 or 2026-03-14",
      })
      .transform((value) => parseDate(value) as Date),
    type: z.enum(["art", "photo", "video", "music"]),
    medium: z.string().optional(),
    media: z.array(mediaItem).min(1),
  }),
});

export const collections = { work };
