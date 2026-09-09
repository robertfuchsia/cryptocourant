import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Categorie",
  type: "document",
  description:
    "Eén categorie draagt beide talen. Zo blijft de navigatie in NL en EN gekoppeld.",
  fields: [
    defineField({
      name: "title",
      title: "Naam",
      type: "object",
      fields: [
        defineField({
          name: "nl",
          title: "Nederlands",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "en",
          title: "English",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (NL)",
      type: "slug",
      options: { source: "title.nl", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slugEn",
      title: "Slug (EN)",
      description: "Leeg laten om dezelfde slug als het Nederlands te gebruiken.",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
    }),
    defineField({
      name: "description",
      title: "Omschrijving",
      type: "object",
      fields: [
        defineField({ name: "nl", title: "Nederlands", type: "text", rows: 3 }),
        defineField({ name: "en", title: "English", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "coinId",
      title: "CoinGecko-id",
      description:
        'Optioneel. Bijvoorbeeld "bitcoin" of "ripple". Zet de live koers boven de categoriepagina.',
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Volgorde in het menu",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "showInNav",
      title: "In hoofdmenu tonen",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    { title: "Menuvolgorde", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title.nl", subtitle: "title.en" } },
});
