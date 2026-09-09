export const LANGUAGES = ["nl", "en"] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = "nl";

export function isLang(value: string): value is Lang {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** Publieke URL-segmenten per taal. Zie de rewrites in next.config.ts. */
const SEGMENTS = {
  nl: { news: "nieuws", category: "categorie", author: "auteur", search: "zoeken" },
  en: { news: "news", category: "category", author: "author", search: "search" },
} as const;

type Segment = keyof (typeof SEGMENTS)["nl"];

export function seg(lang: Lang, key: Segment) {
  return SEGMENTS[lang][key];
}

/** Bouwt altijd de nette, canonieke URL voor een taal. */
export const href = {
  home: (lang: Lang) => `/${lang}`,
  post: (lang: Lang, slug: string) => `/${lang}/${seg(lang, "news")}/${slug}`,
  newsIndex: (lang: Lang) => `/${lang}/${seg(lang, "news")}`,
  category: (lang: Lang, slug: string) => `/${lang}/${seg(lang, "category")}/${slug}`,
  author: (lang: Lang, slug: string) => `/${lang}/${seg(lang, "author")}/${slug}`,
  search: (lang: Lang) => `/${lang}/${seg(lang, "search")}`,
  page: (lang: Lang, slug: string) => `/${lang}/${slug}`,
  rss: (lang: Lang) => `/${lang}/rss.xml`,
};

export const t = {
  nl: {
    siteName: "CryptoCourant",
    tagline: "Crypto nieuws zonder ruis",
    latest: "Laatste nieuws",
    readMore: "Lees verder",
    allNews: "Al het nieuws",
    categories: "Categorieën",
    inCategory: "Alles over",
    byAuthor: "Artikelen van",
    relatedTitle: "Meer over dit onderwerp",
    published: "Gepubliceerd",
    updated: "Bijgewerkt",
    readingTime: (m: number) => `${m} min leestijd`,
    searchTitle: "Zoeken",
    searchPlaceholder: "Zoek op coin, project of trefwoord",
    searchButton: "Zoeken",
    searchResults: (n: number, q: string) =>
      `${n} ${n === 1 ? "resultaat" : "resultaten"} voor "${q}"`,
    searchEmpty: "Niets gevonden. Probeer een andere zoekterm.",
    searchPrompt: "Typ hierboven waar je naar op zoek bent.",
    nothingYet: "Nog geen artikelen in deze taal.",
    marketsTitle: "Koersen",
    change24h: "24u",
    newsletterTitle: "Elke ochtend het crypto nieuws in je inbox",
    newsletterBody:
      "Eén mail per werkdag met wat er die nacht is gebeurd. Geen promoties, geen presales.",
    newsletterPlaceholder: "jouw@email.nl",
    newsletterButton: "Aanmelden",
    newsletterNote: "Uitschrijven kan met één klik.",
    newsletterThanks: "Bedankt. Check je inbox om je aanmelding te bevestigen.",
    switchTo: "English",
    backHome: "Terug naar de voorpagina",
    notFoundTitle: "Deze pagina bestaat niet",
    notFoundBody: "De link klopt niet meer, of het artikel is verplaatst.",
    prev: "Vorige",
    next: "Volgende",
    page: "Pagina",
    menu: "Menu",
    close: "Sluiten",
    toc: "In dit artikel",
    share: "Delen",
    copyLink: "Link kopiëren",
    copied: "Gekopieerd",
    disclaimer:
      "Niets op deze site is beleggingsadvies. Crypto is volatiel; onderzoek altijd zelf voordat je instapt.",
    sources: "Bronnen",
    draftMode: "Preview-modus staat aan",
    exitDraft: "Preview verlaten",
  },
  en: {
    siteName: "CryptoCourant",
    tagline: "Crypto news without the noise",
    latest: "Latest news",
    readMore: "Read more",
    allNews: "All news",
    categories: "Categories",
    inCategory: "Everything on",
    byAuthor: "Articles by",
    relatedTitle: "More on this topic",
    published: "Published",
    updated: "Updated",
    readingTime: (m: number) => `${m} min read`,
    searchTitle: "Search",
    searchPlaceholder: "Search a coin, project or keyword",
    searchButton: "Search",
    searchResults: (n: number, q: string) =>
      `${n} ${n === 1 ? "result" : "results"} for "${q}"`,
    searchEmpty: "Nothing found. Try a different term.",
    searchPrompt: "Type above to find what you are looking for.",
    nothingYet: "No articles in this language yet.",
    marketsTitle: "Markets",
    change24h: "24h",
    newsletterTitle: "Crypto news in your inbox every morning",
    newsletterBody:
      "One email per weekday covering what happened overnight. No promotions, no presales.",
    newsletterPlaceholder: "you@email.com",
    newsletterButton: "Subscribe",
    newsletterNote: "Unsubscribe in one click.",
    newsletterThanks: "Thanks. Check your inbox to confirm.",
    switchTo: "Nederlands",
    backHome: "Back to the front page",
    notFoundTitle: "This page does not exist",
    notFoundBody: "The link is out of date, or the article moved.",
    prev: "Previous",
    next: "Next",
    page: "Page",
    menu: "Menu",
    close: "Close",
    toc: "In this article",
    share: "Share",
    copyLink: "Copy link",
    copied: "Copied",
    disclaimer:
      "Nothing on this site is investment advice. Crypto is volatile; always do your own research.",
    sources: "Sources",
    draftMode: "Preview mode is on",
    exitDraft: "Exit preview",
  },
} as const;

export type Dict = (typeof t)[Lang];

export const LOCALE = { nl: "nl_NL", en: "en_US" } as const;
export const HTML_LANG = { nl: "nl", en: "en" } as const;

export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
