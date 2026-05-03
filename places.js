// ─────────────────────────────────────────────
// Google Places API
// Laedt: Foto, Oeffnungszeiten, Bewertung, Adresse, Telefon, Website, Reservierung
// ─────────────────────────────────────────────

const PLACES_API_KEY = "AIzaSyC-_ePhbQ89N2T8hpg4a5gzgeGeN3Pqo0I";

const ortCache = {};

const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function ladeOrtDaten(name, kiez) {
  const cacheKey = name + "|" + kiez;
  if (ortCache[cacheKey] !== undefined) return Promise.resolve(ortCache[cacheKey]);

  return new Promise(function(resolve) {
    if (typeof google === "undefined") { resolve(null); return; }

    var service = new google.maps.places.PlacesService(document.createElement("div"));

    service.findPlaceFromQuery(
      {
        query: name + " " + kiez + " Berlin",
        fields: ["place_id", "name"],
      },
      function(ergebnisse, status) {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !ergebnisse || !ergebnisse[0]
        ) {
          ortCache[cacheKey] = null;
          resolve(null);
          return;
        }

        service.getDetails(
          {
            placeId: ergebnisse[0].place_id,
            fields: [
              "name",
              "photos",
              "rating",
              "user_ratings_total",
              "formatted_address",
              "formatted_phone_number",
              "website",
              "opening_hours",
              "reservable",
              "url",
            ],
          },
          function(detail, detailStatus) {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !detail) {
              ortCache[cacheKey] = null;
              resolve(null);
              return;
            }

            var heute = new Date().getDay(); // 0=So, 1=Mo, ...
            var heuteText = null;
            var jetztOffen = null;

            if (detail.opening_hours) {
              jetztOffen = detail.opening_hours.isOpen();
              var zeiten = detail.opening_hours.weekday_text;
              if (zeiten && zeiten.length > 0) {
                // weekday_text startet bei Montag (Index 0), heute ist 0=So
                // Umrechnung: JS So=0 -> index 6, Mo=1 -> index 0
                var idx = heute === 0 ? 6 : heute - 1;
                heuteText = zeiten[idx] || null;
                // Nur die Uhrzeit extrahieren (nach dem Doppelpunkt)
                if (heuteText) {
                  var teile = heuteText.split(": ");
                  heuteText = teile.length > 1 ? teile[1] : heuteText;
                }
              }
            }

            var fotoUrl = null;
            if (detail.photos && detail.photos.length > 0) {
              fotoUrl = detail.photos[0].getUrl({ maxWidth: 800, maxHeight: 500 });
            }

            var ergebnis = {
              foto:        fotoUrl,
              bewertung:   detail.rating || null,
              rezensionen: detail.user_ratings_total || null,
              adresse:     detail.formatted_address || null,
              telefon:     detail.formatted_phone_number || null,
              website:     detail.website || null,
              heuteText:   heuteText,
              jetztOffen:  jetztOffen,
              reservierbar: detail.reservable || false,
              mapsUrl:     detail.url || null,
              wochentag:   WOCHENTAGE[heute],
            };

            ortCache[cacheKey] = ergebnis;
            resolve(ergebnis);
          }
        );
      }
    );
  });
}

// Laedt Daten fuer alle Orte und ruft callback(ort, daten) auf
function ladePlacesDaten(orte, callback) {
  orte.forEach(function(ort) {
    ladeOrtDaten(ort.name, ort.kiez).then(function(daten) {
      if (daten) callback(ort, daten);
    });
  });
}

// Hilfsfunktion: Baut den Info-Block HTML
function baueInfoBlock(daten) {
  var html = '<div class="place-info">';

  // Bewertung
  if (daten.bewertung) {
    var sterne = Math.round(daten.bewertung * 2) / 2;
    html += '<div class="place-bewertung">';
    html += '<span class="place-stern">★</span>';
    html += '<span class="place-note">' + daten.bewertung.toFixed(1) + '</span>';
    if (daten.rezensionen) {
      html += '<span class="place-rez">(' + daten.rezensionen.toLocaleString("de-DE") + ' Bewertungen)</span>';
    }
    html += '</div>';
  }

  // Oeffnungszeiten heute
  if (daten.heuteText !== null) {
    var offenKlasse = daten.jetztOffen ? "offen" : "geschlossen";
    var offenText   = daten.jetztOffen ? "Jetzt geöffnet" : "Jetzt geschlossen";
    html += '<div class="place-zeiten">';
    html += '<span class="place-offen-badge ' + offenKlasse + '">' + offenText + '</span>';
    html += '<span class="place-heute">' + daten.wochentag + ': ' + daten.heuteText + '</span>';
    html += '</div>';
  }

  // Adresse
  if (daten.adresse) {
    var adresseKurz = daten.adresse.replace(", Germany", "").replace(", Deutschland", "");
    html += '<div class="place-zeile">📍 <span>' + adresseKurz + '</span></div>';
  }

  // Telefon
  if (daten.telefon) {
    html += '<div class="place-zeile">📞 <a href="tel:' + daten.telefon + '" class="place-link">' + daten.telefon + '</a></div>';
  }

  // Website
  if (daten.website) {
    var domain = daten.website.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0];
    html += '<div class="place-zeile">🌐 <a href="' + daten.website + '" target="_blank" rel="noopener" class="place-link">' + domain + '</a></div>';
  }

  html += '</div>';

  // Reservierungs-Button
  if (daten.reservierbar && daten.mapsUrl) {
    html += '<a href="' + daten.mapsUrl + '" target="_blank" rel="noopener" class="reservier-btn">Tisch reservieren →</a>';
  }

  return html;
}

// CSS fuer den Info-Block — wird einmalig in den Head eingefuegt
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
