import Link from "next/link";
import { href, type Lang } from "@/lib/i18n";
import type { CategoryLite } from "@/sanity/types";

export function CategoryPill({
  category,
  lang,
}: {
  category: CategoryLite;
  lang: Lang;
}) {
  return (
    <Link
      href={href.category(lang, category.slug)}
      className="text-accent inline-flex items-center text-[0.7rem] font-semibold uppercase tracking-[0.08em] hover:underline"
    >
      {category.title}
    </Link>
  );
}
