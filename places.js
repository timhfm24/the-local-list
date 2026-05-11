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

function baueInfoBlock(daten) {
  var teile = [];
  if (daten.bewertung) {
    var sterne = daten.bewertung.toFixed(1);
    var rez = daten.rezensionen ? " (" + daten.rezensionen + ")" : "";
    teile.push('<span style="font-weight:600;color:var(--accent2);">' + sterne + ' &#9733;</span>' + rez);
  }
  if (daten.adresse) {
    teile.push('<span style="font-size:0.74rem;color:var(--muted);">' + daten.adresse + '</span>');
  }
  if (daten.jetztOffen !== null) {
    var offenText = daten.jetztOffen ? "Geoeffnet" : "Geschlossen";
    var offenFarbe = daten.jetztOffen ? "var(--accent2)" : "var(--accent)";
    teile.push('<span style="font-size:0.74rem;color:' + offenFarbe + ';">' + offenText + '</span>');
  }
  if (teile.length === 0) return "";
  return '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:0.75rem;font-size:0.78rem;">' + teile.join("") + '</div>';
}

function injectPlacesCSS() {}
