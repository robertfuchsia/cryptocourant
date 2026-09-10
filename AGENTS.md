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
