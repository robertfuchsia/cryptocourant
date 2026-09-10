/**
 * Zet het auteursdocument van Robert Bemelmans goed in Sanity.
 * Nodig: SANITY_API_WRITE_TOKEN (Editor) in .env.local of in je shell.
 *   node scripts/fix-author.mjs
 */
import { readFileSync } from "node:fs";

const env = { ...process.env };
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(new URL(`../${file}`, import.meta.url), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && m[2]) env[m[1]] ??= m[2];
    }
  } catch {}
}

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID || "jen186iw";
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-09";
const token = env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("Geen SANITY_API_WRITE_TOKEN gevonden. Maak er een aan op sanity.io/manage (rol Editor) en zet hem in .env.local.");
  process.exit(1);
}

const bioNl =
  "Robert Bemelmans volgt de cryptomarkt sinds 2016 en schrijft sinds 2025 dagelijks crypto nieuws, in het Nederlands en het Engels. " +
  "Hij heeft een Bachelor of Business Administration van Shanghai University en een Blockchain-certificaat van UC Berkeley, en werkte bij " +
  "crypto exchanges uit de wereldwijde top 10, met meer dan 10 miljard dollar aan dagelijks handelsvolume. Hij schrijft vanuit Singapore.";

const bioEn =
  "Robert Bemelmans has followed the crypto market since 2016 and has written crypto news daily since 2025, in Dutch and English. " +
  "He holds a Bachelor of Business Administration from Shanghai University and a Blockchain certificate from UC Berkeley, and has worked at " +
  "top 10 crypto exchanges handling more than $10 billion in daily trading volume. He writes from Singapore.";

const mutations = [
  {
    patch: {
      id: "author-robert-bemelmans",
      set: {
        name: "Robert Bemelmans",
        role: { nl: "Oprichter en hoofdredacteur", en: "Founder and editor-in-chief" },
        bio: { nl: bioNl, en: bioEn },
        linkedin: "https://www.linkedin.com/in/robert-bemelmans-b19096181/",
      },
    },
  },
];

const res = await fetch(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnDocuments=true`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  },
);

const json = await res.json();
if (!res.ok) {
  console.error("Mislukt:", JSON.stringify(json, null, 2));
  process.exit(1);
}
console.log("Bijgewerkt:", JSON.stringify(json.results ?? json, null, 2));
