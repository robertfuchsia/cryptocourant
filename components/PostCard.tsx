import Link from "next/link";
import { SanityImage } from "./SanityImage";
import { CategoryPill } from "./Pill";
import { formatDate, href, t, type Lang } from "@/lib/i18n";
import type { PostCard as PostCardType } from "@/sanity/types";

type Variant = "hero" | "feature" | "standard" | "compact" | "row";

export function PostCard({
  post,
  lang,
  variant = "standard",
  priority = false,
}: {
  post: PostCardType;
  lang: Lang;
  variant?: Variant;
  priority?: boolean;
}) {
  const dict = t[lang];
  const url = href.post(lang, post.slug);
  const category = post.categories?.[0];

  const meta = (
    <div className="text-subtle flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
      <span aria-hidden="true">·</span>
      <span>{dict.readingTime(post.readingTime)}</span>
    </div>
  );

  if (variant === "hero") {
    return (
      <article className="group grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        <Link href={url} className="block overflow-hidden rounded-[var(--radius-card)]" tabIndex={-1} aria-hidden="true">
          <SanityImage
            image={post.mainImage}
            alt=""
            width={1200}
            height={600}
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div>
          {category ? (
            <div className="mb-3">
              <CategoryPill category={category} lang={lang} />
            </div>
          ) : null}
          <h2 className="headline text-3xl sm:text-4xl lg:text-[2.6rem]">
            <Link href={url}>
              <span className="hover-title">{post.title}</span>
            </Link>
          </h2>
          <p className="text-muted mt-4 text-base leading-relaxed sm:text-lg">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3">
            {post.author ? (
              <span className="text-muted text-sm font-medium">{post.author.name}</span>
            ) : null}
            {meta}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="group border-line flex gap-4 border-b py-4 last:border-b-0">
        <div className="min-w-0 flex-1">
          {category ? (
            <div className="mb-1.5">
              <CategoryPill category={category} lang={lang} />
            </div>
          ) : null}
          <h3 className="headline text-base leading-snug sm:text-lg">
            <Link href={url}>
              <span className="hover-title">{post.title}</span>
            </Link>
          </h3>
          <div className="mt-2">{meta}</div>
        </div>
        <Link href={url} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <SanityImage
            image={post.mainImage}
            alt=""
            width={220}
            height={165}
            sizes="110px"
            className="h-[68px] w-[92px] rounded-lg object-cover sm:h-[76px] sm:w-[110px]"
          />
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <h3 className="headline text-[0.95rem] leading-snug">
          <Link href={url}>
            <span className="hover-title">{post.title}</span>
          </Link>
        </h3>
        <div className="mt-1.5">{meta}</div>
      </article>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article className="group flex flex-col">
      <Link href={url} className="block overflow-hidden rounded-[var(--radius-card)]" tabIndex={-1} aria-hidden="true">
        <SanityImage
          image={post.mainImage}
          alt=""
          width={800}
          height={400}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        {category ? (
          <div className="mb-2">
            <CategoryPill category={category} lang={lang} />
          </div>
        ) : null}
        <h3 className={`headline ${isFeature ? "text-xl sm:text-2xl" : "text-lg"}`}>
          <Link href={url}>
            <span className="hover-title">{post.title}</span>
          </Link>
        </h3>
        {isFeature ? (
          <p className="text-muted mt-2.5 text-sm leading-relaxed">{post.excerpt}</p>
        ) : null}
        <div className="mt-3 pt-0.5">{meta}</div>
      </div>
    </article>
  );
}
