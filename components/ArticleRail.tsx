import Link from "next/link";
import { SanityImage } from "./SanityImage";
import type { PostCard as PostCardType } from "@/sanity/types";
import { href, type Lang } from "@/lib/i18n";

/**
 * Smalle lijst voor de zijkolom: nummer, kleine featured image en de kop.
 * Kort genoeg om vijf artikelen te tonen zonder de kolom te laten uitdijen.
 */
export function ArticleRail({
  title,
  posts,
  lang,
}: {
  title: string;
  posts: PostCardType[];
  lang: Lang;
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
              <span className="text-accent w-4 shrink-0 pt-0.5 text-[0.85rem] font-bold tabular-nums">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.84rem] font-medium leading-snug group-hover:underline">
                  {post.title}
                </span>
                {post.categories?.[0]?.title ? (
                  <span className="text-subtle mt-1 block text-[0.66rem] uppercase tracking-[0.06em]">
                    {post.categories[0].title}
                  </span>
                ) : null}
              </span>
              <span className="w-[68px] shrink-0 overflow-hidden rounded-[6px]">
                <SanityImage
                  image={post.mainImage}
                  alt=""
                  width={136}
                  height={68}
                  sizes="68px"
                  className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
