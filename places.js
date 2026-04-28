// ─────────────────────────────────────────────
// Google Places API - Foto Laden
// ─────────────────────────────────────────────

const PLACES_API_KEY = "AIzaSyC-_ePhbQ89N2T8hpg4a5gzgeGeN3Pqo0I";

// Cache damit jeder Ort nur einmal abgefragt wird
const fotoCache = {};

// Lädt ein Foto für einen Ort anhand seines Namens und Kiezes
// Gibt eine Bild-URL zurück oder null wenn kein Foto gefunden
async function ladeFoto(name, kiez) {
  const cacheKey = name + kiez;
  if (fotoCache[cacheKey] !== undefined) return fotoCache[cacheKey];

  try {
    // Schritt 1: Place ID suchen
    const suchAnfrage = encodeURIComponent(`${name} ${kiez} Berlin`);
    const suchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${suchAnfrage}&inputtype=textquery&fields=place_id&key=${PLACES_API_KEY}`;

    // Da Browser CORS blockiert, nutzen wir den Places JavaScript SDK stattdessen
    // Dieser wird direkt im Browser ausgeführt
    const ergebnis = await sucheOrtUndFoto(name, kiez);
    fotoCache[cacheKey] = ergebnis;
    return ergebnis;

  } catch (e) {
    console.warn("Foto konnte nicht geladen werden fuer:", name);
    fotoCache[cacheKey] = null;
    return null;
  }
}

// Nutzt die Places JavaScript API (läuft im Browser, kein CORS Problem)
function sucheOrtUndFoto(name, kiez) {
  return new Promise((resolve) => {
    if (typeof google === "undefined") { resolve(null); return; }

    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.findPlaceFromQuery(
      {
        query: `${name} ${kiez} Berlin`,
        fields: ["place_id", "photos", "name"],
      },
      (ergebnisse, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          ergebnisse &&
          ergebnisse[0] &&
          ergebnisse[0].photos &&
          ergebnisse[0].photos.length > 0
        ) {
          const fotoUrl = ergebnisse[0].photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
          resolve(fotoUrl);
        } else {
          resolve(null);
        }
      }
    );
  });
}

// Lädt alle Fotos für eine Liste von Orten
// Ruft callback(ort, fotoUrl) für jeden geladenen Ort auf
async function ladeFotos(orte, callback) {
  for (const ort of orte) {
    const foto = await ladeFoto(ort.name, ort.kiez);
    if (foto) callback(ort, foto);
  }
}
