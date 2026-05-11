const API_KEY = "AIzaSyCLeisSqYANXUYJ1BCg1hQe6r3AubVYbG0";
const ortCache = {};
let placesService = null;

async function ladeGoogleMaps() {
  if (window.google && google.maps && google.maps.places) return;

  if (!window.google || !google.maps) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=__mapsReady`;
      s.onerror = reject;
      window.__mapsReady = resolve;
      document.head.append(s);
    });
    delete window.__mapsReady;
  }

  if (!google.maps.places) {
    await google.maps.importLibrary("places");
  }
}

async function ladeOrtDaten(name, kiez) {
  const cacheKey = name + "|" + kiez;
  if (ortCache[cacheKey] !== undefined) return ortCache[cacheKey];

  try {
    await ladeGoogleMaps();

    if (!placesService) {
      const mapEl = document.createElement("div");
      placesService = new google.maps.places.PlacesService(mapEl);
    }

    const request = {
      query: `${name} ${kiez} Berlin`,
      fields: ["name", "formatted_address", "rating", "user_ratings_total", "photos", "website", "formatted_phone_number", "opening_hours", "url"],
    };

    const results = await new Promise((resolve, reject) => {
      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error("Places status: " + status));
        }
      });
    });

    const ergebnis = {
      foto: results.photos && results.photos.length > 0
        ? results.photos[0].getUrl({ maxWidth: 600 })
        : null,
      bewertung: results.rating || null,
      rezensionen: results.user_ratings_total || null,
      adresse: results.formatted_address || null,
      telefon: results.formatted_phone_number || null,
      website: results.website || null,
      heuteText: results.opening_hours ? results.opening_hours.weekday_text[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] : null,
      jetztOffen: results.opening_hours ? results.opening_hours.isOpen() : null,
      reservierbar: false,
      mapsUrl: results.url || null,
      wochentag: results.opening_hours ? results.opening_hours.weekday_text : null,
    };

    ortCache[cacheKey] = ergebnis;
    return ergebnis;

  } catch (e) {
    console.warn("Places API Fehler:", name, e);
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
  var teile = [];
  if (daten.bewertung) {
    var sterne = daten.bewertung.toFixed(1);
    var rez = daten.rezensionen ? " (" + daten.rezensionen + ")" : "";
    teile.push('<span style="font-weight:600;color:var(--accent2);">' + sterne + ' &#9733;</span>' + rez);
  }
  if (daten.jetztOffen !== null) {
    var offenText = daten.jetztOffen ? "Geoeffnet" : "Geschlossen";
    var offenFarbe = daten.jetztOffen ? "var(--accent2)" : "var(--accent)";
    teile.push('<span style="font-size:0.74rem;color:' + offenFarbe + ';">' + offenText + '</span>');
  }
  if (daten.heuteText) {
    teile.push('<span style="font-size:0.74rem;color:var(--muted);">' + daten.heuteText + '</span>');
  }
  if (daten.adresse) {
    teile.push('<span style="font-size:0.74rem;color:var(--muted);">' + daten.adresse + '</span>');
  }
  if (daten.telefon) {
    teile.push('<a href="tel:' + daten.telefon + '" style="font-size:0.74rem;color:var(--ink);text-decoration:none;">' + daten.telefon + '</a>');
  }
  if (daten.website) {
    teile.push('<a href="' + daten.website + '" target="_blank" rel="noopener" style="font-size:0.74rem;color:var(--accent);text-decoration:none;">Website</a>');
  }
  if (teile.length === 0) return "";
  return '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:0.75rem;font-size:0.78rem;">' + teile.join("") + '</div>';
}

async function initPlaces() {}
