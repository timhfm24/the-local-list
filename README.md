# The Local List

Kuratierte Restaurant-Empfehlungen für Berlin. Keine Algorithmen, keine endlosen Listen — nur Orte, die persönlich besucht und ausgewertet wurden.

## Seiten

- **Finder** (`index.html`) — Ein Quiz führt in 3 Schritten zur passenden Empfehlung (Tageszeit, Vibe, Budget)
- **Alle Orte** (`liste.html`) — Filterbare Übersicht aller eingetragenen Orte

## Tech-Stack

- Vanilla HTML/CSS/JS, kein Build-System
- Google Places API (client-side, geladen über `places.js`)
- Hosting: GitHub Pages oder statisches Hosting

## Google Places API

Die Seite lädt Fotos, Bewertungen, Öffnungszeiten, Adresse, Telefon und Website automatisch über die Google Places API. Der API Key liegt in `places.js` und ist im Frontend sichtbar — das ist bei Client-side Maps-Nutzung unavoidable.

### API Key absichern (zwingend)

1. **Google Cloud Console** → APIs & Services → Credentials → deinen Key anklicken
2. **Application restrictions** → HTTP referrers → folgende Referrer hinzufügen:
   - `http://localhost:*` (lokale Entwicklung)
   - `https://DEIN_GITHUB_USERNAME.github.io/*` (GitHub Pages)
   - Weitere Domains falls nötig
3. **API restrictions** → Only specific APIs → **Maps JavaScript API** + **Places API** auswählen
4. **Billing** → Ein Billing-Konto ist erforderlich, auch im Free-Tier ($200 Freiguthaben/Monat)

### Benötigte APIs aktivieren

In der Google Cloud Console:
- Maps JavaScript API
- Places API

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
