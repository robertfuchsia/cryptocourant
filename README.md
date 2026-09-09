# CryptoCourant

Tweetalige crypto-nieuwssite. Next.js 16 (App Router) op Vercel, content uit Sanity.

- Nederlands op `/nl`, Engels op `/en`, met hreflang tussen vertalingen
- Nederlandse URL's: `/nl/nieuws/...`, `/nl/categorie/...`, `/nl/auteur/...`
- Sanity Studio ingebouwd op `/studio`
- Sitemap, RSS per taal, JSON-LD (NewsArticle + BreadcrumbList), OG-images
- Live koersen via CoinGecko, geen API-key nodig
- Dark mode, respecteert de systeemvoorkeur

---

## 1. Snel starten

```bash
npm install
npm run dev
```

Open http://localhost:3000. Zonder Sanity-gegevens start de site in **demo-modus**
met veertien voorbeeldartikelen, zodat je meteen ziet wat je bouwt.

## 2. Sanity aansluiten

Kopieer `.env.example` naar `.env.local` en vul in:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="je-project-id"   # sanity.io/manage
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-09-09"
NEXT_PUBLIC_SITE_URL="https://cryptocourant.com"
SANITY_API_READ_TOKEN=""                        # Viewer-token, voor preview
SANITY_REVALIDATE_SECRET=""                     # zelfbedacht, voor de webhook
```

Zodra `NEXT_PUBLIC_SANITY_PROJECT_ID` staat ingevuld, gaat de demo-modus uit.
Wil je die tijdelijk terug, zet dan `NEXT_PUBLIC_DEMO_MODE=1`.

**CORS.** Zet in sanity.io/manage onder *API > CORS origins* zowel
`http://localhost:3000` als `https://cryptocourant.com` op de lijst, met
credentials aan.

### De dataset vullen met de voorbeeldinhoud

```bash
SANITY_API_WRITE_TOKEN=sk... npm run seed
```

Dit zet dezelfde artikelen, auteurs en categorieën in je echte dataset, inclusief
afbeeldingen en vertaalkoppelingen. Daarna kun je in `/studio` verder werken en
de voorbeelden verwijderen wanneer je eigen artikelen erin staan.

## 3. Deployen op Vercel

1. Push de repo naar GitHub en importeer hem in Vercel.
2. Zet dezelfde variabelen uit `.env.local` in Vercel onder *Settings >
   Environment Variables*. `NEXT_PUBLIC_SITE_URL` moet
   `https://cryptocourant.com` zijn, zonder slash aan het eind.
3. Voeg `cryptocourant.com` toe onder *Domains* en zet `www` door naar de
   hoofddomeinnaam.

### Direct publiceren zonder wachten op de cache

Maak in sanity.io/manage een webhook:

- URL: `https://cryptocourant.com/api/revalidate`
- Dataset: `production`
- Trigger op: Create, Update, Delete
- Secret: dezelfde waarde als `SANITY_REVALIDATE_SECRET`
- HTTP-methode: POST, API-versie `v2026-09-09`
- Projection: `{_type}`

Zonder webhook verversen pagina's zichzelf elke 60 seconden.

## 4. Hoe de content is opgebouwd

| Type | Waarvoor |
| --- | --- |
| `post` | Artikel. Heeft een `language` (nl of en) en optioneel een `translation` naar het artikel in de andere taal. |
| `category` | Draagt beide talen in één document, met een aparte slug per taal en optioneel een CoinGecko-id voor de koers boven de pagina. |
| `author` | Naam, foto, functie en bio per taal. |
| `page` | Losse pagina's zoals Over ons, per taal. |
| `siteSettings` | Sitenaam, omschrijving, coins in de koersbalk, social links. |

Artikelen worden per taal geschreven, niet als veldvertaling. Twee losse
artikelen die naar elkaar verwijzen dus, wat past bij nieuws waar de Engelse
versie zelden een letterlijke vertaling is. De `translation`-koppeling zorgt voor
de juiste `hreflang` en voor de taalwissel in de header.

### Blokken in de editor

Naast koppen, lijsten en quotes kun je in de body kwijt:

- **Kort samengevat** — lijstje met de kernpunten bovenaan
- **Kader** — neutraal, let op, of samenvatting
- **Koerstabel** — geef CoinGecko-id's op, de koers wordt live opgehaald
- **Embed** — YouTube werkt ingebouwd, andere URL's worden een link
- **Afbeelding** met alt-tekst en bijschrift

Interne links leg je met de annotatie *Interne link*; die volgt automatisch de
juiste taal-URL.

## 5. Preview van concepten

`/api/draft` zet preview-modus aan. In Sanity Studio kun je onder *Document
actions* een preview-URL instellen naar:

```
https://cryptocourant.com/api/draft?sanity-preview-secret=...&sanity-preview-pathname=/nl/nieuws/slug
```

Preview vraagt om `SANITY_API_READ_TOKEN`. Uitzetten kan via de balk bovenaan.

## 6. Wat je nog wilt regelen

- **Nieuwsbrief**: het formulier staat er, maar de submit doet nog niets. Koppel
  in `components/Newsletter.tsx` je maildienst.
- **Analytics**: Vercel Analytics of Plausible toevoegen in de layout.
- **Google Search Console**: dien `https://cryptocourant.com/sitemap.xml` in en
  meld de site aan bij Google Publisher Center voor Nieuws.
- **Advertenties**: er zit nog geen ad-slot in. Handigste plek is een component
  tussen de artikelblokken op de voorpagina en na de eerste H2 in het artikel.

## Structuur

```
app/
  (site)/[lang]/          alle publieke pagina's, root layout met <html lang>
    page.tsx              voorpagina
    news/[slug]/          artikel
    category/[slug]/      categorie
    author/[slug]/        auteur
    [slug]/               losse pagina
    rss.xml/              feed per taal
  (studio)/studio/        Sanity Studio
  api/revalidate/         webhook vanuit Sanity
  api/draft/              preview aan en uit
components/               UI, alles server-side tenzij "use client"
lib/i18n.ts               teksten, taal- en URL-helpers
lib/markets.ts            CoinGecko
sanity/                   schema's, queries, client, demo-inhoud
proxy.ts                  stuurt bezoekers zonder taalprefix door
next.config.ts            Nederlandse URL-segmenten (rewrites + redirects)
```

Alle zichtbare teksten staan in `lib/i18n.ts`. Wil je een woord veranderen, dan
hoef je nergens anders te zoeken.
