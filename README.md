# The Local List

Kuratierte Restaurant-Empfehlungen für Berlin. Keine Algorithmen, keine endlosen Listen — nur Orte, die persönlich besucht und ausgewertet wurden.

## Seiten

- **Finder** (`index.html`) — Ein Quiz führt in 3 Schritten zur passenden Empfehlung (Tageszeit, Vibe, Budget)
- **Alle Orte** (`liste.html`) — Filterbare Übersicht aller eingetragenen Orte

## Tech-Stack

- Vanilla HTML/CSS/JS, kein Build-System
- Google Places API über Vercel Serverless Function (`api/maps.js`)
- Deployment via Vercel

## Neuen Ort hinzufügen

Orte werden in der Datei `data.js` als Einträge im `ORTE`-Array gepflegt. Einfach ein neues Objekt ans Array anhängen:

```js
{
  name: "Restaurantname",
  kiez: "Kiez / Stadtteil",
  maps: "https://maps.app.goo.gl/DEIN_LINK",
  kommentar: "Kurze Beschreibung des Ortes, Besonderheiten, Favoriten.",
  kueche: "Küche / Stil",
  tageszeit: ["lunch", "dinner"],
  vibe: ["entspannt", "lebendig"],
  budget: ["mid"],
  vegan: false,
  reservierung: true,
  walkin: false,
  cashonly: false,
},
```

### Felder

| Feld | Typ | Werte |
|---|---|---|
| `name` | String | Restaurantname |
| `kiez` | String | Stadtteil / Kiez |
| `maps` | String | Google Maps Shortlink |
| `kommentar` | String | Persönliche Beschreibung |
| `kueche` | String | Küchenrichtung (frei) |
| `tageszeit` | Array | `"brunch"`, `"lunch"`, `"dinner"` |
| `vibe` | Array | `"entspannt"`, `"lebendig"`, `"draussen"`, `"besonders"`, `"schnell"` |
| `budget` | Array | `"low"` (bis 10€), `"mid"` (10–25€), `"high"` (25€+) |
| `vegan` | Boolean | Vegane Optionen verfügbar |
| `reservierung` | Boolean | Reservierung empfohlen |
| `walkin` | Boolean | Walk-in möglich |
| `cashonly` | Boolean | Nur Barzahlung |

### Google Maps Link

Den Shortlink generierst du in Google Maps: Ort suchen → Teilen → Link kopieren.
