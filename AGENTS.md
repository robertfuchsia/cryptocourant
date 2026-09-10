<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:vercel -->
## Vercel

- Team: `cryptocourant` (`team_hvs8lolJSGXIDeSF2E0WTlQO`), plan hobby
- Project: `cryptocourant` (`prj_ECex98azkeFRmHLz3bAQT4BD9tq9`), gelinkt aan GitHub `robertfuchsia/cryptocourant`
- Deploys gaan automatisch bij push naar `main` — dus `git push` is deployen
- API-toegang: `VERCEL_TOKEN` in `.env` (niet in git). Voorbeeld:
  `curl -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/deployments?projectId=prj_ECex98azkeFRmHLz3bAQT4BD9tq9&teamId=team_hvs8lolJSGXIDeSF2E0WTlQO&limit=5"`
- Lokale link staat in `.vercel/project.json` (gitignored)
<!-- END:vercel -->

<!-- BEGIN:sanity-ids -->
## Sanity: document-ID's zonder punten

De publieke leesregel van dit project is `_id in path("*")`. Die dekt alleen
ID's **zonder punt**. Een ID als `post.nl.slug` is daardoor onzichtbaar voor
bezoekers (en voor de server-fetch van de site, die zonder token leest), terwijl
het in Studio gewoon zichtbaar lijkt.

Regel: gepubliceerde documenten krijgen punt-loze ID's — `post-<lang>-<slug>`,
`category-<slug>`, `author-<slug>`. Drafts houden het `drafts.`-voorvoegsel en
blijven daardoor privé. Zie `scripts/seed.mjs`.

Snelle controle (zonder token, zo ziet een bezoeker het):
`curl "https://jen186iw.api.sanity.io/v2026-09-09/data/query/production?query=count(*[])"`
<!-- END:sanity-ids -->

<!-- BEGIN:featured -->
## Featured image bij elk artikel

Elk artikel krijgt een featured image, gemaakt met `scripts/featured-image.py`.
Vaste eisen: **1200x600, .webp, onder 200 kB** (het script regelt de kwaliteit),
blauw palet (diep marine → lichtblauw), en het CryptoCourant-logo rechtsonder —
dat wordt ná het terugschalen op ware grootte getekend, zodat het scherp blijft.
Altijd een beschrijvende Nederlandse alt-tekst op `mainImage.alt`.

```
python3 scripts/featured-image.py --out featured-images/<naam>.webp \
  --ticker ADA --kicker Cardano \
  --headline "Steunzone onder" "de ADA koers" \
  --sub "GPT-5 wijst op \$0,197 als vervalpunt" \
  --motif support --label "steun \$0,197"
```

Motieven: `cross` (golden/death cross), `support` (steunzone met grens),
`up` / `down` (koerslijn met vlak). Kop maximaal twee korte regels.

Uploaden naar Sanity en aan het artikel hangen:
```
curl -X POST -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
  -H "Content-Type: image/webp" --data-binary @featured-images/<naam>.webp \
  "https://jen186iw.api.sanity.io/v2026-09-09/assets/images/production?filename=<naam>.webp"
```
Daarna `mainImage` zetten met `{_type:"image", asset:{_ref:<asset-id>}, alt:"..."}`.

De bronbestanden staan in `featured-images/` (buiten git; ze leven in Sanity).

### Twee wegen naar dezelfde featured image

1. **Zelf tekenen** — `scripts/featured-image.py`, zie hierboven. Altijd
   beschikbaar, altijd binnen de specs, geen beeldmodel nodig.
2. **Beeldmodel** — gebruik `scripts/featured-image-prompt.json` als prompt.
   Die vraagt om een blauwe, minimale illustratie **zonder tekst en zonder
   logo**, met rechtsonder een rustig vlak vrijgehouden. Haal het resultaat
   daarna door:

   ```
   python3 scripts/brand-image.py --in ruw.png --out featured-images/<naam>.webp
   ```

   Dat snijdt naar 2:1, schaalt naar 1200x600, zet een zachte donkere hoek,
   tekent het logo op ware grootte en drukt de webp onder 200 kB.

Beeldmodellen kunnen geen letters. Daarom staat er nooit tekst of een logo
in de prompt zelf — dat komt er achteraf scherp op.
<!-- END:featured -->

<!-- BEGIN:aanlever -->
## Vaste werkwijze bij een aangeleverd artikel

Robert levert een tekst aan, eventueel met tijden en met afbeeldingen. Zonder
dat hij erom vraagt gebeurt dit, in deze volgorde:

**1. Artikel in Sanity zetten**
Als draft, met punt-loos id `post-<lang>-<slug>`, `language`, `title`, `slug`,
`excerpt`, `seoTitle`, `metaDescription`, `author` en `categories`. Koppen uit
het schrijfdoc blijven exact staan: geen kop verplaatst, geen kop tot tekst
gemaakt, geen keyword of interne link weggelaten.

**2. Featured image**
Maken volgens `scripts/featured-image-prompt.json` — 1200x600 webp onder
200 kB, blauw palet, logo rechtsonder. Zelf tekenen met
`scripts/featured-image.py`, of een beeld uit een beeldmodel door
`scripts/brand-image.py` halen. Daarna uploaden naar Sanity **en instellen als
`mainImage` met een beschrijvende Nederlandse `alt`**. Uploaden zonder
instellen is niet af.

**3. X-links naar embeds**
Elke x.com- of twitter.com-link die als losse regel in de tekst staat wordt een
`embed`-blok met die url, geen link in een tekstregel. YouTube net zo.
`components/TweetEmbed.tsx` rendert ze server-side.

**4. Aangeleverde afbeeldingen in de tekst**
Origineel uploaden, niet herschalen en niet opnieuw comprimeren — Sanity maakt
zelf de varianten en `SanityImage` levert ze op maat. Als `image`-blok op de
plek waar ze in het schrijfdoc staan, altijd met `alt`. Alleen omzetten als het
formaat niet door Sanity wordt geslikt.

**5. Inplannen op Nederlandse tijd**
Tijden die Robert noemt zijn Nederlandse tijd (Europe/Amsterdam), ook al zit
hij in Singapore. Nooit zelf omrekenen; dit script doet het, inclusief zomer-
en wintertijd:

```
python3 scripts/schedule-publish.py post-nl-<slug> "2026-09-11 09:00"
python3 scripts/schedule-publish.py --list
python3 scripts/schedule-publish.py --cancel sch-...
```

De schedule draait bij Sanity zelf, dus publiceren gaat door zonder dat er een
sessie openstaat. Zonder tijd: als draft laten staan en het even vragen.

**6. Controleren**
Na publicatie de live URL ophalen: status 200, featured image aanwezig, embeds
gerenderd (`react-tweet-theme` in de HTML), geen terugval-links.
<!-- END:aanlever -->
