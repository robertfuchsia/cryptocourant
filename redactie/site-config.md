# Site config — cryptocourant.com

Ingevuld voor de skill `crypto-nieuws-redactie`. Wat hier niet staat, wordt niet
gebruikt: geen verzonnen shortcodes, geen verzonnen interne links.

```yaml
site:
  naam: CryptoCourant
  domein: https://cryptocourant.com
  taal: nl
  auteur_standaard: Robert Bemelmans
  publicatiesysteem: Sanity (Portable Text), niet WordPress

opmaak:
  koppen: markdown (# H1, ## H2, ### H3)
  bronnenlijst: genummerd onder het artikel, komt in het veld `sources`
  disclaimerregel: "Dit artikel is crypto nieuws en analyse, geen beleggingsadvies."

shortcodes:
  # Geen shortcodes. De site gebruikt contentblokken in Sanity:
  lees_ook: leeg
  gerelateerd_artikel: leeg
  commercieel_blok: leeg
  cta: leeg
  disclaimer: callout-blok met tone "warning"

contentblokken:
  # In plaats van shortcodes. Zet in de tekst waar het blok moet staan.
  tradingView: koersgrafiek, symbool BINANCE:<TICKER>USDT, variant chart of mini
  priceTable: koerstabel, met CoinGecko-ids
  liveData: fearGreed | movers | derivatives | etfFlows | marketBar
  callout: kader, tone neutral | warning | summary
  keyTakeaways: kort samengevat, 2 tot 5 punten
  embed: X- of YouTube-link, wordt server-side ingesloten
  image: afbeelding met alt en bijschrift

interne_links:
  # Alleen wat echt bestaat. Bijwerken zodra er een pagina bij komt.
  categorie_bitcoin: https://cryptocourant.com/nl/categorie/bitcoin
  categorie_altcoins: https://cryptocourant.com/nl/categorie/altcoins
  categorie_regelgeving: https://cryptocourant.com/nl/categorie/regelgeving
  nieuwsoverzicht: https://cryptocourant.com/nl/nieuws
  bitcoin_koers_verwachting: leeg
  xrp_koers_verwachting: leeg
  ethereum_koers_verwachting: leeg
  cardano_koers_verwachting: leeg
  solana_koers_verwachting: leeg
  overzichtspagina_altcoins: leeg

commercieel:
  partners: []          # geen presale funnels op deze site, bewuste keuze
  label: leeg
  vergoedingsregel: leeg
  risicoregel: "De waarde van cryptoactiva kan sterk schommelen en je kunt je inleg verliezen."

lengtes:
  nieuwsflits: 150-250
  standaard: 450-700
  diepteanalyse: 900-1400
```

## Eigen data die deze site heeft en andere sites niet

Bruikbaar als informatiewinst (W1 tot W6) zonder externe bron:

- XRP ETF-stromen per dag en per uitgever, plus beheerd vermogen — `liveData: etfFlows`
- Angst en hebzucht, met de stand van gisteren en vorige week — `liveData: fearGreed`
- Financieringsrente, open interest en long tegenover short op BTC — `liveData: derivatives`
- Grootste stijgers en dalers over 24 uur, gefilterd op volume en marktwaarde — `liveData: movers`
- Marktwaarde, dagvolume en BTC-dominantie — `liveData: marketBar`

## Wat de site automatisch doet

- Onder elke hoofdafbeelding staat wat de koers deed sinds publicatie, mits het
  artikel een `coin` heeft. Schrijf daar dus niet zelf een zin over.
- X-links in de tekst worden ingesloten; plaats ze als los blok, niet als link.
