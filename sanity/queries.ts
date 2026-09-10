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

/**
 * Taalfilter. Elk documenttype heeft een verplicht `language`-veld, dus filteren
 * op dat veld is genoeg. Let op: document-ID's mogen geen punten bevatten —
 * de publieke leesregel van Sanity (`_id in path("*")`) sluit gepunte ID's uit,
 * waardoor bezoekers zonder token niets zouden zien.
 */
const LANG_FILTER = `language == $lang`;

export const settingsQuery = groq`*[_type == "siteSettings"][0]{
  title,
  description,
  defaultOgImage,
  tickerCoins,
  social
}`;

export const navCategoriesQuery = groq`*[_type == "category" && showInNav == true] | order(order asc) ${CATEGORY_LITE}`;

export const footerPagesQuery = groq`*[_type == "page" && ${LANG_FILTER} && showInFooter == true] | order(title asc){
  _id, title, "slug": slug.current
}`;

export const homeQuery = groq`{
  "featured": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...3] ${CARD},
  "latest": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[0...18] ${CARD},
  "categories": *[_type == "category" && showInNav == true] | order(order asc)[0...4]{
    _id,
    ${CATEGORY_TITLE},
    ${CATEGORY_SLUG},
    "posts": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && references(^._id) && !(_id in path("drafts.**"))]
      | order(publishedAt desc)[0...4] ${CARD}
  }
}`;

export const postSlugsQuery = groq`*[(_type == "post" || _type == "article") && defined(slug.current) && !(_id in path("drafts.**"))]{
  "slug": slug.current, language
}`;

export const postQuery = groq`*[(_type == "post" || _type == "article") && slug.current == $slug && ${LANG_FILTER} && !(_id in path("drafts.**"))][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body[]{
    ...,
    _type == "image" => { "dim": asset->metadata.dimensions }
  },
  publishedAt,
  updatedAt,
  mainImage,
  sources,
  seoTitle,
  metaDescription,
  noIndex,
  "readingTime": round(length(pt::text(body)) / 5 / 220) + 1,
  author->{ _id, name, "slug": slug.current, image, "role": coalesce(role[$lang], role.nl), "bio": coalesce(bio[$lang], bio.nl), x, linkedin },
  categories[]->${CATEGORY_LITE},
  translation->{ "slug": slug.current, language, title }
}`;

export const relatedQuery = groq`*[
  (_type == "post" || _type == "article") &&
  ${LANG_FILTER} &&
  _id != $id &&
  !(_id in path("drafts.**")) &&
  count(categories[@._ref in $categoryIds]) > 0
] | order(publishedAt desc)[0...3] ${CARD}`;

export const newsIndexQuery = groq`{
  "items": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && !(_id in path("drafts.**"))] | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[(_type == "post" || _type == "article") && ${LANG_FILTER} && !(_id in path("drafts.**"))])
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
  "items": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && references($id) && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[(_type == "post" || _type == "article") && ${LANG_FILTER} && references($id) && !(_id in path("drafts.**"))])
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
  "items": *[(_type == "post" || _type == "article") && ${LANG_FILTER} && author._ref == $id && !(_id in path("drafts.**"))]
    | order(publishedAt desc)[$from...$to] ${CARD},
  "total": count(*[(_type == "post" || _type == "article") && ${LANG_FILTER} && author._ref == $id && !(_id in path("drafts.**"))])
}`;

export const authorSlugsQuery = groq`*[_type == "author" && defined(slug.current)]{ "slug": slug.current }`;

export const searchQuery = groq`*[
  (_type == "post" || _type == "article") &&
  ${LANG_FILTER} &&
  !(_id in path("drafts.**")) &&
  (title match $q || excerpt match $q || pt::text(body) match $q)
] | order(publishedAt desc)[0...30] ${CARD}`;

export const pageQuery = groq`*[_type == "page" && slug.current == $slug && ${LANG_FILTER}][0]{
  _id, title, "slug": slug.current, body, metaDescription
}`;

export const pageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{
  "slug": slug.current, language
}`;

export const sitemapQuery = groq`{
  "posts": *[(_type == "post" || _type == "article") && noIndex != true && !(_id in path("drafts.**"))]{
    "slug": slug.current, language, publishedAt, updatedAt
  },
  "pages": *[_type == "page"]{ "slug": slug.current, language },
  "categories": *[_type == "category"]{
    "nl": slug.current, "en": coalesce(slugEn.current, slug.current)
  },
  "authors": *[_type == "author"]{ "slug": slug.current }
}`;

export const feedQuery = groq`*[(_type == "post" || _type == "article") && ${LANG_FILTER} && noIndex != true && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0...30]{
  title, "slug": slug.current, excerpt, publishedAt, mainImage,
  author->{ name },
  categories[]->{ ${CATEGORY_TITLE} }
}`;