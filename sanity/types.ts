import type { PortableTextBlock } from "next-sanity";
import type { Image } from "sanity";
import type { Lang } from "@/lib/i18n";

export type SanityImage = Partial<Image> & {
  alt?: string;
  caption?: string;
  credit?: string;
  /** Alleen gebruikt in demo-modus. */
  demoSrc?: string;
};

export type CategoryLite = {
  _id: string;
  title: string;
  slug: string;
};

export type AuthorLite = {
  _id: string;
  name: string;
  slug: string;
  image?: SanityImage;
};

export type PostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean;
  mainImage?: SanityImage;
  readingTime: number;
  author?: AuthorLite;
  categories?: CategoryLite[];
};

export type Source = { label: string; url: string };

export type Post = PostCard & {
  body: PortableTextBlock[];
  sources?: Source[];
  seoTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
  author?: AuthorLite & {
    role?: string;
    bio?: string;
    x?: string;
    linkedin?: string;
  };
  translation?: { slug: string; language: Lang; title: string } | null;
};

export type Author = {
  _id: string;
  name: string;
  slug: string;
  image?: SanityImage;
  role?: string;
  bio?: string;
  x?: string;
  linkedin?: string;
  email?: string;
};

export type Category = CategoryLite & {
  description?: string;
  coinId?: string;
};

export type SitePage = {
  _id: string;
  title: string;
  slug: string;
  body?: PortableTextBlock[];
  metaDescription?: string;
};

export type Settings = {
  title?: string;
  description?: Record<Lang, string>;
  defaultOgImage?: SanityImage;
  tickerCoins?: string[];
  social?: {
    x?: string;
    linkedin?: string;
    youtube?: string;
    telegram?: string;
  };
};

export type Paginated<T> = { items: T[]; total: number };
