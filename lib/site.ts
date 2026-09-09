import type { Lang } from "./i18n";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://cryptocourant.com"
).replace(/\/$/, "");

export const absolute = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const POSTS_PER_PAGE = 12;

export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function pageRange(page: number, perPage = POSTS_PER_PAGE) {
  const from = (page - 1) * perPage;
  return { from, to: from + perPage };
}

export function hreflangAlternates(paths: Partial<Record<Lang, string>>) {
  const languages: Record<string, string> = {};
  if (paths.nl) languages["nl-NL"] = absolute(paths.nl);
  if (paths.nl) languages["nl"] = absolute(paths.nl);
  if (paths.en) languages["en"] = absolute(paths.en);
  if (paths.nl) languages["x-default"] = absolute(paths.nl);
  return languages;
}
