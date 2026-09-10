import Link from "next/link";
import type { PostCard as PostCardType } from "@/sanity/types";
import { href, type Lang } from "@/lib/i18n";

/**
 * Smalle lijst met genummerde artikelen voor de zijkolom. Bewust zonder
 * afbeeldingen: het is een leeslijst, geen tweede raster.
 */
export function ArticleRail({
  title,
  posts,
  lang,
  start = 1,
}: {
  title: string;
  posts: PostCardType[];
  lang: Lang;
  start?: number;
}) {
  if (!posts.length) return null;

  return (
    <section>
      <h2 className="text-subtle mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.09em]">
        {title}
      </h2>
      <ol className="divide-line divide-y">
        {posts.map((post, i) => (
          <li key={post._id} className="py-3 first:pt-0 last:pb-0">
            <Link href={href.post(lang, post.slug)} className="group flex gap-3">
              <span className="text-accent w-5 shrink-0 text-[0.95rem] font-semibold tabular-nums leading-snug">
                {start + i}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.88rem] font-medium leading-snug group-hover:underline">
                  {post.title}
                </span>
                {post.categories?.[0]?.title ? (
                  <span className="text-subtle mt-1 block text-[0.7rem] uppercase tracking-[0.06em]">
                    {post.categories[0].title}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
