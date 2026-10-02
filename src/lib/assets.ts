import { existsSync, readdirSync } from "node:fs";
import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { embedUrl, mediaKind } from "./media";

// Glob patterns are case-sensitive, and cameras and phones write IMG_1234.JPG,
// so each letter is listed in both cases.
const images = import.meta.glob<ImageMetadata>(
  "/content/work/**/*.{[jJ][pP][gG],[jJ][pP][eE][gG],[pP][nN][gG],[wW][eE][bB][pP],[gG][iI][fF],[aA][vV][iI][fF]}",
  { eager: true, import: "default" },
);
const files = import.meta.glob<string>(
  "/content/work/**/*.{[mM][pP]3,[mM]4[aA],[wW][aA][vV],[oO][gG][gG],[mM][pP]4,[wW][eE][bB][mM]}",
  { eager: true, import: "default", query: "?url" },
);

type Piece = CollectionEntry<"work">;

export type ResolvedMedia =
  | { kind: "image"; image: ImageMetadata; alt: string }
  | { kind: "audio" | "video" | "embed"; url: string; label: string };

function lookup<T>(map: Record<string, T>, pieceId: string, name: string): T {
  const found = map[`/content/work/${pieceId}/${name}`];
  if (found !== undefined) return found;
  const present = readdirSync(`content/work/${pieceId}`).filter(
    (file) => file !== "index.md",
  );
  throw new Error(
    `content/work/${pieceId}/index.md lists "${name}" but that file is not in the folder. ` +
      `File names are case-sensitive. Files found: ${present.join(", ") || "none"}.`,
  );
}

/** A piece's media items, in order, resolved to built assets and embed addresses. */
export function resolveMedia(piece: Piece): ResolvedMedia[] {
  const label = piece.data.title;
  return piece.data.media.map((item): ResolvedMedia => {
    const kind = mediaKind(item.src);
    switch (kind) {
      case "image":
        return {
          kind,
          image: lookup(images, piece.id, item.src),
          alt: item.alt ?? label,
        };
      case "audio":
      case "video":
        return { kind, url: lookup(files, piece.id, item.src), label };
      default:
        // The collection schema has already rejected anything else.
        return { kind: "embed", url: embedUrl(item.src) ?? item.src, label };
    }
  });
}

/**
 * The first image in a piece's media: the built asset for its thumbnail, and
 * the path from the project root to the file for its share card.
 */
export function cover(
  piece: Piece,
): { image: ImageMetadata; path: string } | undefined {
  const first = piece.data.media.find(
    (item) => mediaKind(item.src) === "image",
  );
  return (
    first && {
      image: lookup(images, piece.id, first.src),
      path: `content/work/${piece.id}/${first.src}`,
    }
  );
}

/** Fails the build when a folder in content/work has no index.md, or a misnamed one. */
export function assertNoOrphanFolders(pieceIds: string[]): void {
  // Read from disk rather than the globs above, so a piece with only a video
  // link, or only unsupported files, is still seen.
  const orphans = existsSync("content/work")
    ? readdirSync("content/work", { withFileTypes: true })
        .filter(
          (entry) => entry.isDirectory() && !pieceIds.includes(entry.name),
        )
        .map((entry) => entry.name)
    : [];
  if (orphans.length > 0) {
    throw new Error(
      `These folders in content/work have no index.md, so they would not appear on the site: ${orphans.join(", ")}. ` +
        `Each piece needs a file named exactly "index.md".`,
    );
  }
}
