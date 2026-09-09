import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

export function Pagination({
  lang,
  basePath,
  page,
  totalPages,
}: {
  lang: Lang;
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const dict = t[lang];
  const url = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <nav className="mt-12 flex items-center justify-between" aria-label={dict.page}>
      {page > 1 ? (
        <Link
          href={url(page - 1)}
          rel="prev"
          className="border-line text-muted hover:text-fg rounded-full border px-4 py-2 text-sm font-medium transition-colors"
        >
          ← {dict.prev}
        </Link>
      ) : (
        <span />
      )}

      <span className="text-subtle text-sm tabular-nums">
        {dict.page} {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={url(page + 1)}
          rel="next"
          className="border-line text-muted hover:text-fg rounded-full border px-4 py-2 text-sm font-medium transition-colors"
        >
          {dict.next} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
