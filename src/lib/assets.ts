import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { embedUrl, mediaKind, orphanFolders } from "./media";

// Both letter cases are listed because cameras and phones write IMG_1234.JPG
// and glob patterns are case-sensitive.
const images = import.meta.glob<ImageMetadata>(
  "/content/work/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF,AVIF}",
  { eager: true, import: "default" },
);
const files = import.meta.glob<string>(
  "/content/work/**/*.{mp3,m4a,wav,ogg,mp4,webm,MP3,M4A,WAV,OGG,MP4,WEBM}",
  { eager: true, import: "default", query: "?url" },
);

type Piece = CollectionEntry<"work">;

export type ResolvedMedia =
  | { kind: "image"; image: ImageMetadata; alt: string }
  | { kind: "audio" | "video"; url: string; label: string }
  | { kind: "embed"; url: string; label: string };

function lookup<T>(map: Record<string, T>, pieceId: string, name: string): T {
  const folder = `/content/work/${pieceId}/`;
  const found = map[folder + name];
  if (found !== undefined) return found;
  const present = [...Object.keys(images), ...Object.keys(files)]
    .filter((path) => path.startsWith(folder))
    .map((path) => path.slice(folder.length));
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

/** The first image in a piece's media, used as its thumbnail and preview-card image. */
export function coverImage(
  piece: Piece,
): { image: ImageMetadata; alt: string } | undefined {
  const first = resolveMedia(piece).find((media) => media.kind === "image");
  return first?.kind === "image"
    ? { image: first.image, alt: first.alt }
    : undefined;
}

/** Fails the build when a folder holds media but its index.md is missing or misnamed. */
export function assertNoOrphanFolders(pieceIds: string[]): void {
  const orphans = orphanFolders(
    [...Object.keys(images), ...Object.keys(files)],
    pieceIds,
  );
  if (orphans.length > 0) {
    throw new Error(
      `These folders in content/work have media files but no index.md, so they would not appear on the site: ${orphans.join(", ")}. ` +
        `Each piece needs a file named exactly "index.md".`,
    );
  }
}
