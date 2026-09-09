import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site-instellingen",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Sitenaam",
      type: "string",
      initialValue: "CryptoCourant",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Omschrijving",
      type: "object",
      fields: [
        defineField({ name: "nl", title: "Nederlands", type: "text", rows: 2 }),
        defineField({ name: "en", title: "English", type: "text", rows: 2 }),
      ],
    }),
    defineField({
      name: "defaultOgImage",
      title: "Standaard deelafbeelding",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tickerCoins",
      title: "Coins in de koersbalk",
      description: "CoinGecko-ids, in de volgorde die je wilt tonen.",
      type: "array",
      of: [{ type: "string" }],
      initialValue: ["bitcoin", "ethereum", "ripple", "solana"],
      validation: (r) => r.max(8),
    }),
    defineField({
      name: "social",
      title: "Social",
      type: "object",
      fields: [
        defineField({ name: "x", title: "X / Twitter URL", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
        defineField({ name: "youtube", title: "YouTube URL", type: "url" }),
        defineField({ name: "telegram", title: "Telegram URL", type: "url" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site-instellingen" }) },
});
