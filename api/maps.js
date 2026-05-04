export default async function handler(req, res) {
  // 🔐 API Key aus Vercel Environment Variable
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // 📥 Parameter aus URL holen
  const { place } = req.query;

  // ❗ Fehler, wenn nichts übergeben wurde
  if (!place) {
    return res.status(400).json({ error: "Missing 'place' parameter" });
  }

  // 🌍 Google Maps API URL (Places Text Search)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(place)}&key=${API_KEY}`;

  try {
    // 📡 Anfrage an Google senden
    const response = await fetch(url);
    const data = await response.json();

    // ✅ Ergebnis zurück an dein Frontend
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
