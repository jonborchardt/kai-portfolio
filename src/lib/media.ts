export type MediaKind = "image" | "audio" | "video" | "embed";

const EXTENSIONS: Record<string, MediaKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  avif: "image",
  mp3: "audio",
  m4a: "audio",
  wav: "audio",
  ogg: "audio",
  mp4: "video",
  webm: "video",
};

/** For error messages shown to whoever is adding content. */
export const SUPPORTED = `${Object.keys(EXTENSIONS).join(", ")} files, or a link to a YouTube or Vimeo video`;

/** Embed address for a YouTube or Vimeo link; undefined for anything else. */
export function embedUrl(src: string): string | undefined {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;

  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "youtube.com") {
    let id: string | null | undefined;
    if (host === "youtu.be") id = path[0];
    else if (path[0] === "watch") id = url.searchParams.get("v");
    else if (["shorts", "embed", "live"].includes(path[0])) id = path[1];
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : undefined;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    // The video number is the first all-digit part of the path, which covers
    // vimeo.com/<id>, vimeo.com/manage/videos/<id> and player.vimeo.com/video/<id>.
    const at = path.findIndex((part) => /^\d+$/.test(part));
    if (at === -1) return undefined;
    // Unlisted videos carry a hash the player needs: <id>/<hash> or ?h=<hash>
    const hash = url.searchParams.get("h") ?? path[at + 1] ?? "";
    return `https://player.vimeo.com/video/${path[at]}${/^[0-9a-f]+$/i.test(hash) ? `?h=${hash}` : ""}`;
  }

  return undefined;
}

/** Kind of a media item, from its file extension or link; undefined if unsupported. */
export function mediaKind(src: string): MediaKind | undefined {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(src)) {
    return embedUrl(src) ? "embed" : undefined;
  }
  const extension = src.split(".").pop()?.toLowerCase() ?? "";
  return Object.hasOwn(EXTENSIONS, extension)
    ? EXTENSIONS[extension]
    : undefined;
}

/** Parses `YYYY-MM` or `YYYY-MM-DD` (or a Date) as UTC; undefined for anything else. */
export function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? undefined : value;
  }
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(value));
  if (!match) return undefined;
  const day = `${match[1]}-${match[2]}-${match[3] ?? "01"}`;
  const date = new Date(`${day}T00:00:00Z`);
  // A day that does not exist rolls over (2026-02-31 becomes March 3), so
  // only a date that comes back as it was written is accepted.
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(day)
    ? date
    : undefined;
}

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** A date as shown on the site: "March 2026". */
export function formatMonthYear(date: Date): string {
  return monthYear.format(date);
}

interface Dated {
  id: string;
  data: { date: Date };
}

/** Sort order for pieces: newest first, and by folder name within the same date. */
export function byNewest(a: Dated, b: Dated): number {
  return (
    b.data.date.valueOf() - a.data.date.valueOf() || (a.id < b.id ? -1 : 1)
  );
}

/** A piece's folder name is its URL, so: lowercase letters, digits, single hyphens. */
export function isValidPieceId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/** The kinds of work, as written in a piece's `type` field, with the label shown on the site. */
export const TYPES = {
  painting: "Paintings",
  drawing: "Drawings",
  writing: "Writing",
  marimba: "Marimba",
} as const;

export type WorkType = keyof typeof TYPES;

/**
 * How much of the mosaic a tile takes: every 11th tile is big, and the rest
 * take one or two cells to suit the image's shape.
 */
export function tileShape(
  index: number,
  width?: number,
  height?: number,
): "big" | "wide" | "tall" | "" {
  if (index % 11 === 0) return "big";
  if (!width || !height) return "";
  const ratio = width / height;
  return ratio > 1.3 ? "wide" : ratio < 0.85 ? "tall" : "";
}
