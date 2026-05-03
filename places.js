// ─────────────────────────────────────────────
// Google Places API (neue Version ab 2025)
// Verwendet google.maps.places.Place
// ─────────────────────────────────────────────

const ortCache = {};
const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

async function ladeOrtDaten(name, kiez) {
  const cacheKey = name + "|" + kiez;
  if (ortCache[cacheKey] !== undefined) return ortCache[cacheKey];

  try {
    const { Place } = await google.maps.importLibrary("places");

    // Schritt 1: Suche nach dem Ort
    const request = {
      textQuery: name + " " + kiez + " Berlin",
      fields: [
        "id",
        "displayName",
        "photos",
        "rating",
        "userRatingCount",
        "formattedAddress",
        "nationalPhoneNumber",
        "websiteURI",
        "regularOpeningHours",
        "googleMapsURI",
      ],
      language: "de",
      region: "de",
    };

    const { places } = await Place.searchByText(request);

    if (!places || places.length === 0) {
      ortCache[cacheKey] = null;
      return null;
    }

    const place = places[0];
    const heute = new Date().getDay();

    // Öffnungszeiten heute
    let heuteText = null;
    let jetztOffen = null;

    if (place.regularOpeningHours) {
      const zeiten = place.regularOpeningHours.weekdayDescriptions;
      if (zeiten && zeiten.length > 0) {
        const idx = heute === 0 ? 6 : heute - 1;
        const voll = zeiten[idx] || null;
        if (voll) {
          const teile = voll.split(": ");
          heuteText = teile.length > 1 ? teile[1] : voll;
        }
      }
      // isOpen() prüfen
      try {
        jetztOffen = place.regularOpeningHours.isOpen();
      } catch(e) {
        jetztOffen = null;
      }
    }

    // Foto
    let fotoUrl = null;
    if (place.photos && place.photos.length > 0) {
      fotoUrl = place.photos[0].getURI({ maxWidth: 800, maxHeight: 500 });
    }

    const ergebnis = {
      foto:        fotoUrl,
      bewertung:   place.rating || null,
      rezensionen: place.userRatingCount || null,
      adresse:     place.formattedAddress || null,
      telefon:     place.nationalPhoneNumber || null,
      website:     place.websiteURI || null,
      heuteText:   heuteText,
      jetztOffen:  jetztOffen,
      reservierbar: false,
      mapsUrl:     place.googleMapsURI || null,
      wochentag:   WOCHENTAGE[heute],
    };

    ortCache[cacheKey] = ergebnis;
    return ergebnis;

  } catch(e) {
    console.warn("Places API Fehler fuer:", name, e);
    ortCache[cacheKey] = null;
    return null;
  }
}

function ladePlacesDaten(orte, callback) {
  orte.forEach(function(ort) {
    ladeOrtDaten(ort.name, ort.kiez).then(function(daten) {
      if (daten) callback(ort, daten);
    });
  });
}

function baueInfoBlock(daten) {
  var html = '<div class="place-info">';

  if (daten.bewertung) {
    html += '<div class="place-bewertung">';
    html += '<span class="place-stern">★</span>';
    html += '<span class="place-note">' + daten.bewertung.toFixed(1) + '</span>';
    if (daten.rezensionen) {
      html += '<span class="place-rez">(' + daten.rezensionen.toLocaleString("de-DE") + ' Bewertungen)</span>';
    }
    html += '</div>';
  }

  if (daten.heuteText !== null) {
    var offenKlasse = daten.jetztOffen ? "offen" : (daten.jetztOffen === false ? "geschlossen" : "unbekannt");
    var offenText   = daten.jetztOffen ? "Jetzt geöffnet" : (daten.jetztOffen === false ? "Jetzt geschlossen" : "");
    html += '<div class="place-zeiten">';
    if (offenText) html += '<span class="place-offen-badge ' + offenKlasse + '">' + offenText + '</span>';
    html += '<span class="place-heute">' + daten.wochentag + ': ' + daten.heuteText + '</span>';
    html += '</div>';
  }

  if (daten.adresse) {
    var adresseKurz = daten.adresse.replace(", Germany", "").replace(", Deutschland", "");
    html += '<div class="place-zeile">📍 <span>' + adresseKurz + '</span></div>';
  }

  if (daten.telefon) {
    html += '<div class="place-zeile">📞 <a href="tel:' + daten.telefon + '" class="place-link">' + daten.telefon + '</a></div>';
  }

  if (daten.website) {
    var domain = daten.website.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0];
    html += '<div class="place-zeile">🌐 <a href="' + daten.website + '" target="_blank" rel="noopener" class="place-link">' + domain + '</a></div>';
  }

  html += '</div>';

  if (daten.reservierbar && daten.mapsUrl) {
    html += '<a href="' + daten.mapsUrl + '" target="_blank" rel="noopener" class="reservier-btn">Tisch reservieren →</a>';
  }

  return html;
}

function injectPlacesCSS() {
  if (document.getElementById("places-css")) return;
  var style = document.createElement("style");
  style.id = "places-css";
  style.textContent = [
    ".place-info { margin: 0.75rem 0; display: flex; flex-direction: column; gap: 0.4rem; }",
    ".place-bewertung { display: flex; align-items: center; gap: 0.35rem; }",
    ".place-stern { color: #E8A020; font-size: 0.9rem; }",
    ".place-note { font-size: 0.82rem; font-weight: 600; }",
    ".place-rez { font-size: 0.72rem; color: var(--muted); }",
    ".place-zeiten { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }",
    ".place-offen-badge { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 3px; }",
    ".place-offen-badge.offen { background: #EBF3EE; color: #4A7C59; }",
    ".place-offen-badge.geschlossen { background: #F9EEEA; color: #C4501A; }",
    ".place-heute { font-size: 0.75rem; color: var(--muted); }",
    ".place-zeile { font-size: 0.75rem; color: var(--muted); display: flex; align-items: flex-start; gap: 0.4rem; }",
    ".place-zeile span { line-height: 1.4; }",
    ".place-link { color: var(--muted); text-decoration: underline; text-underline-offset: 2px; transition: color 0.12s; }",
    ".place-link:hover { color: var(--ink); }",
    ".reservier-btn { display: inline-block; margin-top: 0.6rem; background: var(--accent); color: white; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; transition: opacity 0.15s; }",
    ".reservier-btn:hover { opacity: 0.85; }",
  ].join("\n");
  document.head.appendChild(style);
}

function initPlaces() {
  injectPlacesCSS();
}
