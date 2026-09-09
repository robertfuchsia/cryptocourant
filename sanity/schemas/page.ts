import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Losse pagina",
  type: "document",
  description: "Voor over ons, contact, privacy, disclaimer en dergelijke.",
  fields: [
    defineField({
      name: "language",
      title: "Taal",
      type: "string",
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
      name: "title",
      title: "Titel",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "body", title: "Inhoud", type: "blockContent" }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      validation: (r) => r.max(165),
    }),
    defineField({
      name: "showInFooter",
      title: "In de footer tonen",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", language: "language" },
    prepare: ({ title, language }) => ({
      title,
      subtitle: String(language ?? "").toUpperCase(),
    }),
  },
});
