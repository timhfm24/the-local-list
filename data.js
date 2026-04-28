const ORTE = [

  // ─────────────────────────────────────────────
  // VORLAGE — kopiere diesen Block um einen neuen Ort hinzuzufügen
  // ─────────────────────────────────────────────
  //
  // {
  //   name: "",                        // Name des Ortes
  //   kiez: "",                        // Kiez / Bezirk
  //   maps: "",                        // Google Maps Link
  //   kommentar: "",                   // Dein persönlicher Kommentar
  //   kueche: "",                      // Küche / Essensrichtung (nur zur Anzeige)
  //
  //   // FINDER-TAGS (mehrere möglich, mindestens einer pro Kategorie)
  //   tageszeit: ["brunch", "lunch", "dinner"],   // brunch · lunch · dinner
  //   vibe: ["entspannt", "lebendig", "draussen", "besonders", "schnell"],
  //   budget: "low",                   // low (bis 10€) · mid (10–25€) · high (25€+)
  //
  //   // HINTERGRUND-TAGS (true oder false)
  //   vegan: false,
  //   reservierung: false,
  //   walkin: false,
  //   cashonly: false,
  // },

  // ─────────────────────────────────────────────
  // BEISPIELORTE
  // ─────────────────────────────────────────────

    {
    name: "CHUWOO 初伍",
    kiez: "Mitte",
    maps: "https://maps.app.goo.gl/t5nk5V3Ybbptj85H9",
    kommentar: "Kleines Restaurant mit wenigen Tischen — aber genau das macht es aus. Die Küche bietet chinesische Spezialitäten die man in Berlin kaum findet. Nicht verpassen: die besondere Dessertauswahl. Einrichtung verspielt und liebevoll, mit einer Ästhetik die Fans von Pop Mart oder Miniso sofort ansprechen wird.",
    kueche: "Chinesisch / Asiatisch",

    tageszeit: ["lunch", "dinner"],
    vibe: ["schnell", "lebendig"],
    budget: "mid",

    vegan: true,
    reservierung: false,
    walkin: true,
    cashonly: false,
},

  {
    name: "Doyum Grillhaus",
    kiez: "Kreuzberg",
    maps: "https://maps.app.goo.gl/Doyum",
    kommentar: "Kein Schnickschnack. Bestes Adana-Kebab in Kreuzberg, seit Jahrzehnten. Einfach hingehen.",
    kueche: "Türkisch",

    tageszeit: ["lunch", "dinner"],
    vibe: ["schnell", "lebendig"],
    budget: "low",

    vegan: false,
    reservierung: false,
    walkin: true,
    cashonly: true,
  },

  {
    name: "Silo Coffee",
    kiez: "Friedrichshain",
    maps: "https://maps.app.goo.gl/SiloCoffee",
    kommentar: "Top Specialty-Coffee und dicke Brunchplatten. Lässige Atmosphäre, gute Energie. Wochenends voll — unter der Woche entspannter.",
    kueche: "Café / Brunch",

    tageszeit: ["brunch"],
    vibe: ["entspannt", "lebendig"],
    budget: "mid",

    vegan: true,
    reservierung: false,
    walkin: true,
    cashonly: false,
  },

  {
    name: "Nobelhart & Schmutzig",
    kiez: "Mitte",
    maps: "https://maps.app.goo.gl/Nobelhart",
    kommentar: "Brutal local. Nur Zutaten aus Brandenburg. Eines der besten Restaurants Berlins — für Abende die man nicht vergisst.",
    kueche: "Fine Dining / Regional",

    tageszeit: ["dinner"],
    vibe: ["besonders"],
    budget: "high",

    vegan: false,
    reservierung: true,
    walkin: false,
    cashonly: false,
  },

];
