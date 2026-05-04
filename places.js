const ortCache = {};

async function ladeOrtDaten(name, kiez) {
  const cacheKey = name + "|" + kiez;
  if (ortCache[cacheKey] !== undefined) return ortCache[cacheKey];

  try {
    const query = `${name} ${kiez} Berlin`;

    const res = await fetch(`/api/maps?place=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      ortCache[cacheKey] = null;
      return null;
    }

    const place = data[0];

    const ergebnis = {
      foto: place.photoRef ? `/api/photo?ref=${place.photoRef}` : null,
      bewertung: place.rating || null,
      rezensionen: place.userRatingCount || null,
      adresse: place.address || null,
      telefon: null,
      website: null,
      heuteText: null,
      jetztOffen: null,
      reservierbar: false,
      mapsUrl: null,
      wochentag: null,
    };

    ortCache[cacheKey] = ergebnis;
    return ergebnis;

  } catch (e) {
    console.warn("API Fehler:", name, e);
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
