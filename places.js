const API_KEY = "AIzaSyAiQAEBL9W2BvztAcZRxh4mP-SujNVf8uQ";
const ortCache = {};
let placesService = null;
let mapsReady = null;

async function ladeGoogleMaps() {
  if (mapsReady) return mapsReady;

  mapsReady = new Promise((resolve, reject) => {
    if (window.google && google.maps && google.maps.places) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }

    window.__mapsReady = () => {
      delete window.__mapsReady;
      resolve();
    };

    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=__mapsReady`;
    s.onerror = () => { delete window.__mapsReady; reject(new Error("Google Maps load failed")); };
    document.head.append(s);
  });

  return mapsReady;
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
      fields: ["name", "formatted_address", "rating", "user_ratings_total", "photos", "opening_hours", "place_id"],
    };

    const place = await new Promise((resolve, reject) => {
      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          resolve(results[0]);
        } else {
          reject(new Error("Places status: " + status));
        }
      });
    });

    const detailRequest = {
      placeId: place.place_id,
      fields: ["website", "formatted_phone_number", "opening_hours", "url"],
    };

    const details = await new Promise((resolve, reject) => {
      placesService.getDetails(detailRequest, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          resolve(null);
        }
      });
    });

    const heuteIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    function openStatus(oh) {
      if (!oh) return null;
      
      // Versuche zuerst open_now (zuverlässiger)
      if (typeof oh.open_now === "boolean") return oh.open_now;
      
      // Fallback auf isOpen(), aber prüfe ob es wirklich ein boolean zurückgibt
      if (typeof oh.isOpen === "function") {
        const result = oh.isOpen();
        if (typeof result === "boolean") return result;
      }
      
      return null;
    }

    const ergebnis = {
      foto: place.photos && place.photos.length > 0
        ? place.photos[0].getUrl({ maxWidth: 600 })
        : null,
      bewertung: place.rating || null,
      rezensionen: place.user_ratings_total || null,
      adresse: place.formatted_address || null,
      telefon: details && details.formatted_phone_number ? details.formatted_phone_number : null,
      website: details && details.website ? details.website : null,
      heuteText: details && details.opening_hours ? details.opening_hours.weekday_text[heuteIndex] : null,
      jetztOffen: openStatus(details && details.opening_hours ? details.opening_hours : place.opening_hours),
      reservierbar: false,
      mapsUrl: details && details.url ? details.url : null,
      wochentag: details && details.opening_hours ? details.opening_hours.weekday_text : null,
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
  orte.forEach(function (ort) {
    ladeOrtDaten(ort.name, ort.kiez).then(function (daten) {
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

async function initPlaces() { }
