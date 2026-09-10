import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Artikel",
  type: "document",
  groups: [
    { name: "content", title: "Inhoud", default: true },
    { name: "meta", title: "Publicatie" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "language",
      title: "Taal",
      type: "string",
      group: "meta",
      initialValue: "nl",
      options: {
        list: [
          { title: "Nederlands", value: "nl" },
          { title: "English", value: "en" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coin",
      title: "Munt (CoinGecko-id)",
      description:
        'Bijvoorbeeld bitcoin, ethereum, ripple of cardano. Hiermee toont het artikel wat de koers deed sinds publicatie. Leeg laten als het artikel niet over één munt gaat.',
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "title",
      title: "Titel (H1)",
      type: "string",
      group: "content",
      validation: (r) => r.required().max(110),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96, isUnique: () => true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Samenvatting",
      description:
        "Twee tot drie zinnen. Wordt getoond op de voorpagina en in overzichten.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: "mainImage",
      title: "Hoofdafbeelding",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt-tekst", type: "string" }),
        defineField({ name: "credit", title: "Fotocredit", type: "string" }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Artikel",
      type: "blockContent",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Auteur",
      type: "reference",
      to: [{ type: "author" }],
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categories",
      title: "Categorieën",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      group: "meta",
      validation: (r) => r.required().min(1).max(4),
    }),
    defineField({
      name: "publishedAt",
      title: "Publicatiedatum",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Laatst bijgewerkt",
      description: "Alleen invullen bij een inhoudelijke update.",
      type: "datetime",
      group: "meta",
    }),
    defineField({
      name: "featured",
      title: "Op de voorpagina uitlichten",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "translation",
      title: "Vertaling",
      description:
        "Koppel het artikel in de andere taal. Zorgt voor de juiste hreflang-tags.",
      type: "reference",
      to: [{ type: "post" }],
      group: "meta",
      options: {
        filter: ({ document }) => ({
          filter: "language != $lang",
          params: { lang: (document as { language?: string }).language ?? "nl" },
        }),
      },
    }),
    defineField({
      name: "sources",
      title: "Bronnen",
      description: "Externe bronnen die onder het artikel komen te staan.",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Naam",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO-titel",
      description: "Leeg laten om de H1 te gebruiken.",
      type: "string",
      group: "seo",
      validation: (r) => r.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      group: "seo",
      validation: (r) => r.max(165),
    }),
    defineField({
      name: "noIndex",
      title: "Uitsluiten van Google",
      type: "boolean",
      group: "seo",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Publicatiedatum, nieuwste eerst",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      media: "mainImage",
      date: "publishedAt",
    },
    prepare({ title, language, media, date }) {
      const d = date ? new Date(date).toLocaleDateString("nl-NL") : "geen datum";
      return {
        title,
        subtitle: `${String(language ?? "").toUpperCase()} · ${d}`,
        media,
      };
    },
  },
});
