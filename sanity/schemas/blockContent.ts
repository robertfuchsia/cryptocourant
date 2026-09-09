import { defineArrayMember, defineField, defineType } from "sanity";

export const blockContent = defineType({
  name: "blockContent",
  title: "Inhoud",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Tekst", value: "normal" },
        { title: "Kop 2", value: "h2" },
        { title: "Kop 3", value: "h3" },
        { title: "Kop 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullets", value: "bullet" },
        { title: "Genummerd", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Vet", value: "strong" },
          { title: "Cursief", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (r) =>
                  r.required().uri({ scheme: ["http", "https", "mailto"] }),
              }),
              defineField({
                name: "nofollow",
                title: "Nofollow",
                type: "boolean",
                initialValue: false,
              }),
            ],
          },
          {
            name: "internalLink",
            title: "Interne link",
            type: "object",
            fields: [
              defineField({
                name: "reference",
                title: "Artikel",
                type: "reference",
                to: [{ type: "post" }],
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt-tekst", type: "string" }),
        defineField({ name: "caption", title: "Bijschrift", type: "string" }),
      ],
    }),
    defineArrayMember({
      name: "callout",
      title: "Kader",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Kop", type: "string" }),
        defineField({
          name: "text",
          title: "Tekst",
          type: "text",
          rows: 4,
          validation: (r) => r.required(),
        }),
        defineField({
          name: "tone",
          title: "Stijl",
          type: "string",
          initialValue: "neutral",
          options: {
            list: [
              { title: "Neutraal", value: "neutral" },
              { title: "Let op", value: "warning" },
              { title: "Kort samengevat", value: "summary" },
            ],
          },
        }),
      ],
      preview: { select: { title: "title", subtitle: "text" } },
    }),
    defineArrayMember({
      name: "keyTakeaways",
      title: "Kort samengevat",
      type: "object",
      fields: [
        defineField({
          name: "points",
          title: "Punten",
          type: "array",
          of: [{ type: "string" }],
          validation: (r) => r.required().min(2).max(5),
        }),
      ],
      preview: {
        select: { points: "points" },
        prepare: ({ points }) => ({
          title: "Kort samengevat",
          subtitle: (points as string[] | undefined)?.join(" · "),
        }),
      },
    }),
    defineArrayMember({
      name: "embed",
      title: "Embed (X, YouTube)",
      type: "object",
      fields: [
        defineField({
          name: "url",
          title: "URL",
          type: "url",
          validation: (r) => r.required(),
        }),
      ],
      preview: { select: { title: "url" }, prepare: ({ title }) => ({ title: `Embed: ${title}` }) },
    }),
    defineArrayMember({
      name: "priceTable",
      title: "Koerstabel",
      type: "object",
      fields: [
        defineField({
          name: "coinIds",
          title: "CoinGecko-ids",
          description: 'Bijvoorbeeld: bitcoin, ethereum, ripple',
          type: "array",
          of: [{ type: "string" }],
          validation: (r) => r.required().min(1).max(10),
        }),
      ],
      preview: {
        select: { ids: "coinIds" },
        prepare: ({ ids }) => ({
          title: "Koerstabel",
          subtitle: (ids as string[] | undefined)?.join(", "),
        }),
      },
    }),
  ],
});
