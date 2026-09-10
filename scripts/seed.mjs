#!/usr/bin/env node
/**
 * Vult je Sanity-dataset met de voorbeeldinhoud die de demo-modus ook gebruikt:
 * 2 auteurs, 5 categorieen, 14 artikelen (NL + EN) en de site-instellingen.
 *
 *   SANITY_API_WRITE_TOKEN=sk... node scripts/seed.mjs
 *
 * Draai dit één keer, verwijder daarna wat je niet wilt houden in de Studio.
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import process from "node:process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// .env.local inlezen zonder extra dependency
try {
  const env = await readFile(join(root, ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* geen .env.local, dan uit de shell */
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Zet NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local en geef SANITY_API_WRITE_TOKEN mee.\n" +
      "Een write token maak je op sanity.io/manage onder API > Tokens (rechten: Editor)."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-09-09",
  useCdn: false,
});

const demo = JSON.parse(
  await readFile(join(root, "sanity/demo/content.json"), "utf8")
);

console.log(`Seeden van ${projectId}/${dataset} ...`);

// Afbeeldingen uploaden
const assets = new Map();
for (let i = 1; i <= 9; i++) {
  const buffer = await readFile(join(root, `public/demo/${i}.svg`));
  const asset = await client.assets.upload("image", buffer, {
    filename: `cryptocourant-demo-${i}.svg`,
    contentType: "image/svg+xml",
  });
  assets.set(i, asset._id);
  console.log(`  afbeelding ${i}/9`);
}

const imageRef = (n) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assets.get(n) },
});

const docs = [];

for (const a of demo.authors) {
  docs.push({
    _id: `author.${a.slug}`,
    _type: "author",
    name: a.name,
    slug: { _type: "slug", current: a.slug },
    role: a.role,
    bio: a.bio,
    image: imageRef(a.demo),
    ...(a.x ? { x: a.x } : {}),
  });
}

for (const c of demo.categories) {
  docs.push({
    _id: `category-${c.slug}`,
    _type: "category",
    title: c.title,
    slug: { _type: "slug", current: c.slug },
    slugEn: { _type: "slug", current: c.slugEn || c.slug },
    ...(c.coinId ? { coinId: c.coinId } : {}),
    order: c.order,
    showInNav: true,
  });
}

const idFor = (p) => `post-${p.language}-${p.slug}`;

for (const p of demo.posts) {
  const authorSlug = demo.authors.find((a) => a._id === p.authorId)?.slug;
  docs.push({
    _id: idFor(p),
    _type: "post",
    language: p.language,
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    excerpt: p.excerpt,
    mainImage: {
      ...imageRef(Number(p.demoImage.replace(/\D/g, ""))),
      alt: p.title,
    },
    body: p.body,
    author: { _type: "reference", _ref: `author.${authorSlug}` },
    categories: p.categoryIds.map((c) => {
      const cat = demo.categories.find((x) => x._id === c);
      return {
        _type: "reference",
        _key: c,
        _ref: `category-${cat.slug}`,
      };
    }),
    publishedAt: p.publishedAt,
    featured: p.featured,
    ...(p.sources
      ? {
          sources: p.sources.map((s, i) => ({
            _type: "object",
            _key: `s${i}`,
            label: s.label,
            url: s.url,
          })),
        }
      : {}),
  });
}

docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  title: "CryptoCourant",
  description: {
    nl: "Dagelijks crypto nieuws in het Nederlands en Engels. Geen presales, geen promoties.",
    en: "Daily crypto news in Dutch and English. No presales, no promotions.",
  },
  tickerCoins: ["bitcoin", "ethereum", "ripple", "solana", "cardano"],
});

docs.push(
  {
    _id: "page.nl.over-ons",
    _type: "page",
    language: "nl",
    title: "Over ons",
    slug: { _type: "slug", current: "over-ons" },
    showInFooter: true,
    metaDescription:
      "CryptoCourant brengt dagelijks crypto nieuws in het Nederlands en Engels, zonder presales of betaalde promoties.",
    body: [
      {
        _type: "block",
        _key: "a1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "a1s",
            marks: [],
            text: "CryptoCourant is opgericht met één regel: geen presales, geen betaalde promoties, geen casino. Wat er staat is nieuws, en wat commercieel is staat er niet.",
          },
        ],
      },
    ],
  },
  {
    _id: "page.en.about",
    _type: "page",
    language: "en",
    title: "About",
    slug: { _type: "slug", current: "about" },
    showInFooter: true,
    metaDescription:
      "CryptoCourant publishes daily crypto news in Dutch and English, with no presales or paid promotions.",
    body: [
      {
        _type: "block",
        _key: "b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "b1s",
            marks: [],
            text: "CryptoCourant was built on one rule: no presales, no paid promotions, no casino content. What you read here is news.",
          },
        ],
      },
    ],
  }
);

// Eerst alle documenten, daarna de vertaalverwijzingen
let tx = client.transaction();
for (const doc of docs) tx = tx.createOrReplace(doc);
await tx.commit();
console.log(`  ${docs.length} documenten geschreven`);

let tx2 = client.transaction();
let links = 0;
for (const p of demo.posts) {
  if (!p.translationId) continue;
  const other = demo.posts.find((x) => x._id === p.translationId);
  if (!other) continue;
  tx2 = tx2.patch(idFor(p), {
    set: { translation: { _type: "reference", _ref: idFor(other) } },
  });
  links++;
}
if (links) await tx2.commit();
console.log(`  ${links} vertaalkoppelingen gelegd`);

console.log("\nKlaar. Zet NEXT_PUBLIC_DEMO_MODE=0 en start de dev server.");
