import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { sitemapQuery } from "@/sanity/queries";
import { href, LANGUAGES, type Lang } from "@/lib/i18n";
import { absolute } from "@/lib/site";

type SitemapData = {
  posts: Array<{ slug: string; language: Lang; publishedAt: string; updatedAt?: string }>;
  pages: Array<{ slug: string; language: Lang }>;
  categories: Array<{ nl: string; en: string }>;
  authors: Array<{ slug: string }>;
};

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<SitemapData>({
    query: sitemapQuery,
    tags: ["post", "category", "author", "page"],
  });

  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGUAGES) {
    entries.push({
      url: absolute(href.home(lang)),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    });
    entries.push({
      url: absolute(href.newsIndex(lang)),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  for (const post of data?.posts ?? []) {
    if (!post.slug) continue;
    entries.push({
      url: absolute(href.post(post.language, post.slug)),
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const category of data?.categories ?? []) {
    if (category.nl) {
      entries.push({
        url: absolute(href.category("nl", category.nl)),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
    if (category.en) {
      entries.push({
        url: absolute(href.category("en", category.en)),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  for (const author of data?.authors ?? []) {
    if (!author.slug) continue;
    for (const lang of LANGUAGES) {
      entries.push({
        url: absolute(href.author(lang, author.slug)),
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  }

  for (const page of data?.pages ?? []) {
    if (!page.slug) continue;
    entries.push({
      url: absolute(href.page(page.language, page.slug)),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  return entries;
}
