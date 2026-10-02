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
export const SUPPORTED = `${Object.keys(EXTENSIONS).join(", ")}, or a YouTube or Vimeo link`;

/** Embed address for a YouTube or Vimeo link; undefined for anything else. */
export function embedUrl(src: string): string | undefined {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;

  const host = url.hostname.replace(/^(www|m)\./, "");
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "youtube.com") {
    let id: string | null | undefined;
    if (host === "youtu.be") id = path[0];
    else if (path[0] === "watch") id = url.searchParams.get("v");
    else if (path[0] === "shorts" || path[0] === "embed") id = path[1];
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : undefined;
  }

  if (host === "vimeo.com" && /^\d+$/.test(path[0] ?? "")) {
    // Unlisted Vimeo links carry a hash the player needs: vimeo.com/<id>/<hash>
    const hash = /^[0-9a-f]+$/i.test(path[1] ?? "") ? `?h=${path[1]}` : "";
    return `https://player.vimeo.com/video/${path[0]}${hash}`;
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
  const date = new Date(
    `${match[1]}-${match[2]}-${match[3] ?? "01"}T00:00:00Z`,
  );
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

/** A piece's folder name is its URL, so: lowercase letters, digits, single hyphens. */
export function isValidPieceId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/** Folder names under content/work that have no piece, sorted. */
export function orphanFolders(folders: string[], pieceIds: string[]): string[] {
  const known = new Set(pieceIds);
  return folders.filter((folder) => !known.has(folder)).sort();
}
