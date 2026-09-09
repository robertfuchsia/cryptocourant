import { groq } from "next-sanity";

/** Categorie-slug hangt af van de taal: EN valt terug op de NL-slug. */
const CATEGORY_SLUG = `"slug": select($lang == "en" => coalesce(slugEn.current, slug.current), slug.current)`;
const CATEGORY_TITLE = `"title": coalesce(title[$lang], title.nl)`;

const CATEGORY_LITE = `{ _id, ${CATEGORY_TITLE}, ${CATEGORY_SLUG} }`;

const CARD = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  updatedAt,
  featured,
  mainImage,
  "readingTime": round(length(pt::text(body)) / 5 / 220) + 1,
  author->{ _id, name, "slug": slug.current, image },
  categories[]->${CATEGORY_LITE}
}`;

export const settingsQuery = groq`*[_type == "siteSettings"][0]{
  title,
  description,
  defaultOgImage,
  tickerCoins,
  social
}`;

export const navCategoriesQuery = groq`*[_type == "category" && showInNav == true] | order(order asc) ${CATEGORY_LITE}`;

export const footerPagesQuery = groq`*[_type == "page" && language == $lang && showInFooter == true] | order(title asc){
  _id, title, "slug": slug.current
}`;

export const homeQuery = groq`{
  "featured": *[_type == "post" && language == $lang && featured == true && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...3] ${CARD},
  "latest": *[_type == "post" && language == $lang && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...18] ${CARD},
  "categories": *[_type == "category" && showInNav == true] | order(order asc)[0...4]{
    _id,
    ${CATEGORY_TITLE},
    ${CATEGORY_SLUG},
    "posts": *[_type == "post" && language == $lang && references(^._id)]
      | order(publishedAt desc)[0...4] ${CARD}
  }
}`;

export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current, language
}`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug && language == $lang][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  publishedAt,
  updatedAt,
  mainImage,
  sources,
  seoTitle,
  metaDescription,
  noIndex,
  "readingTime": round(length(pt::text(body)) / 5 / 220) + 1,
  author->{ _id, name, "slug": slug.current, image, role, bio, x, linkedin },
  categories[]->${CATEGORY_LITE},
  translation->{ "slug": slug.current, language, title }
}`;

export const relatedQuery = groq`*[
  _type == "post" &&
  language == $lang &&
  _id != $id &&
  count(categories[@._ref in $categoryIds]) > 0
] | order(publishedAt desc)[0...3] ${CARD}`;

export const newsIndexQuery = groq`{
  "items": *[_type == "post" && language == $lang] | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[_type == "post" && language == $lang])
}`;

export const categoryQuery = groq`*[
  _type == "category" &&
  (slug.current == $slug || slugEn.current == $slug)
][0]{
  _id,
  ${CATEGORY_TITLE},
  ${CATEGORY_SLUG},
  "description": coalesce(description[$lang], description.nl),
  coinId
}`;

export const categoryPostsQuery = groq`{
  "items": *[_type == "post" && language == $lang && references($id)]
    | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[_type == "post" && language == $lang && references($id)])
}`;

export const categorySlugsQuery = groq`*[_type == "category"]{
  "nl": slug.current, "en": coalesce(slugEn.current, slug.current)
}`;

export const authorQuery = groq`*[_type == "author" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  image,
  "role": coalesce(role[$lang], role.nl),
  "bio": coalesce(bio[$lang], bio.nl),
  x,
  linkedin,
  email
}`;

export const authorPostsQuery = groq`{
  "items": *[_type == "post" && language == $lang && author._ref == $id]
    | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[_type == "post" && language == $lang && author._ref == $id])
}`;

export const authorSlugsQuery = groq`*[_type == "author" && defined(slug.current)]{ "slug": slug.current }`;

export const searchQuery = groq`*[
  _type == "post" &&
  language == $lang &&
  (title match $q || excerpt match $q || pt::text(body) match $q)
] | order(publishedAt desc)[0...30] ${CARD}`;

export const pageQuery = groq`*[_type == "page" && slug.current == $slug && language == $lang][0]{
  _id, title, "slug": slug.current, body, metaDescription
}`;

export const pageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{
  "slug": slug.current, language
}`;

export const sitemapQuery = groq`{
  "posts": *[_type == "post" && noIndex != true]{
    "slug": slug.current, language, publishedAt, updatedAt
  },
  "pages": *[_type == "page"]{ "slug": slug.current, language },
  "categories": *[_type == "category"]{
    "nl": slug.current, "en": coalesce(slugEn.current, slug.current)
  },
  "authors": *[_type == "author"]{ "slug": slug.current }
}`;

export const feedQuery = groq`*[_type == "post" && language == $lang && noIndex != true]
  | order(publishedAt desc)[0...30]{
  title, "slug": slug.current, excerpt, publishedAt, mainImage,
  author->{ name },
  categories[]->{ ${CATEGORY_TITLE} }
}`;
