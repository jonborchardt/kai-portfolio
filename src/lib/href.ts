const base = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site-internal link: prefixes a root-relative path with the configured base path. */
export function href(path: string): string {
  return `${base}${path}`;
}
