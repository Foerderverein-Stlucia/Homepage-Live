/* ============================================================
   INHALTE DER SEITE
   Hier werden Texte, Projekte und Termine gepflegt.
   Alles, was mit "BEISPIEL" markiert ist, bitte ersetzen.
   Farben: pink, blue, green, orange, purple, yellow, red, teal
   Symbole: rutsche, buch, theater, musik, baum, kueche, ausflug, stern, herz, wasser, reck, steine, wippe, luft
   ============================================================ */
window.FV_INHALT = {
  verein: {
    name: "Förderverein der kath. KiTa St. Lucia Walbeck e.V.",
    kurzname: "Förderverein St. Lucia",
    ort: "Walbeck",
    kita: "Kath. Kindertageseinrichtung St. Lucia",
    zweck: "Wir unterstützen die Kita St. Lucia dort, wo das Budget des Trägers nicht reicht: bei Spielgeräten, Ausflügen, Projekten und Festen. Jeder Euro kommt direkt den Kindern zugute.",
    // BEISPIEL – bitte durch echte Angaben ersetzen
    vorstand: [
      { rolle: "1. Vorsitzende", name: "Name folgt" },
      { rolle: "2. Vorsitzender", name: "Name folgt" },
      { rolle: "Kassiererin", name: "Name folgt" },
      { rolle: "Schriftführer", name: "Name folgt" }
    ],
    beitraege: [12, 24, 48],           // Beiträge in Euro pro Kindergartenjahr (wie Flyer)
    beitragZeitraum: "pro Kindergartenjahr",
    mindestbeitrag: 12,
    glaeubigerId: "",                  // Gläubiger-ID der Bundesbank eintragen, sobald bekannt (wird sonst ausgeblendet)
    bank: { inhaber: "Förderverein der kath. KiTa St. Lucia Walbeck e.V.", iban: "DE89 3206 1384 2006 2290 10", bic: "GENODED1GDL", institut: "Volksbank an der Niers eG" },
    kontakt: { email: "foerderverein.stlucia.kiga@gmail.com", adresse: "Meusweg 12 · 47608 Geldern" },
    papierAntrag: "Die ausgefüllte Beitrittserklärung auf Papier könnt ihr in die verschlossene Briefbox des Fördervereins im Eingangsbereich des Kindergartens einwerfen.",
    zitat: ["Kinder sind nicht nur unsere Zukunft.", "Kinder sind ein Schatz, den es zu hüten, zu unterstützen und zu fördern gilt."],
    kitaInfo: {
      adresse: "Meusweg 12, 47608 Geldern-Walbeck",
      text: "Die Kita St. Lucia gehört zur Pfarrei St. Maria Magdalena Geldern. In zwei Gruppen für Kinder von 3 bis 6 Jahren und einer Gruppe für Kinder von 2 bis 4 Jahren gibt es bis zu 70 Plätze.",
      link: "https://www.st-mariamagdalena-geldern.de"
    },
    registergericht: "Registergericht und Nummer folgen",
    gemeinnuetzig: null              // true, sobald die Gemeinnützigkeit bestätigt ist
  },

  // Projekte aus dem Flyer 2026. Jahr und Betrag ergänzen, sobald bekannt (leer = wird nicht angezeigt).
  // Fotos von Kindern nur mit schriftlicher Einwilligung der Eltern veröffentlichen.
  projekte: [
    { id: "wasserspiel", titel: "Wasser- und Matschanlage", jahr: null, betrag: null, farbe: "blue", symbol: "wasser", bild: "img/projekte/wasserspiel.jpg",
      kurz: "Rinnen, Schleusen und eine Pumpe im Sandbereich zum Bauen, Stauen und Matschen.",
      text: ["Mit der Wasser- und Matschanlage können die Kinder Wasser pumpen, durch Rinnen leiten und mit Schiebern stauen. Dabei wird gebaut, ausprobiert und gemeinsam getüftelt."], partner: "" },
    { id: "turnreck", titel: "Turnreck im Außengelände", jahr: null, betrag: null, farbe: "red", symbol: "reck", bild: "img/projekte/aussengelaende.jpg",
      kurz: "Reckstangen in verschiedenen Höhen zum Hangeln, Schwingen und Turnen.",
      text: ["Die Reckstangen im Außengelände laden zum Hangeln, Schwingen und Klettern ein und stärken Kraft und Geschicklichkeit."], partner: "" },
    { id: "weidentipis", titel: "Weidentipis im Garten", jahr: null, betrag: null, farbe: "green", symbol: "baum",
      kurz: "Geflochtene Weidenhäuser als Rückzugsort und Spielhöhle.",
      text: ["Die Weidentipis sind kleine Höhlen im Garten: zum Verstecken, Ausruhen und für Rollenspiele."], partner: "" },
    { id: "stapelsteine", titel: "Stapel- und Balanciersteine", jahr: null, betrag: null, farbe: "purple", symbol: "steine",
      kurz: "Bunte Steine zum Stapeln, Bauen und Balancieren für drinnen.",
      text: ["Die Steine lassen sich zu Türmen stapeln oder als Balancierpfad auslegen. Das fördert Gleichgewicht, Körpergefühl und Fantasie."], partner: "" },
    { id: "wipptier", titel: "Federwippe für die Kleinen", jahr: null, betrag: null, farbe: "orange", symbol: "wippe",
      kurz: "Ein Wippfahrzeug auf Feder für das Außengelände.",
      text: ["Die Federwippe ist besonders bei den jüngeren Kindern beliebt und trainiert spielerisch das Gleichgewicht."], partner: "" },
    { id: "luftreiniger", titel: "Luftreiniger für die Gruppenräume", jahr: null, betrag: null, farbe: "teal", symbol: "luft",
      kurz: "Mobile Luftreiniger für bessere Luft in den Räumen.",
      text: ["Die Luftreiniger filtern Staub und Keime aus der Raumluft und sorgen für ein gesünderes Klima in den Gruppen."], partner: "" }
  ],

  // Datum als JJJJ-MM-TT. "liste" verknüpft einen Termin mit einer Eintrageliste (ID aus der Verwaltung).
  termine: [
    { id: "martin26", titel: "St.-Martins-Zug", datum: "2026-11-11", von: "17:00", bis: "18:30", ort: "Start an der Kita, Ziel Kirchplatz",
      text: "Laternenumzug mit Martinsfeuer. Wir verkaufen Weckmänner und Kinderpunsch.", farbe: "orange", liste: "martin" },
    { id: "basar26", titel: "Adventsbasar", datum: "2026-11-28", von: "14:00", bis: "17:00", ort: "Kita St. Lucia",
      text: "Gebasteltes aus den Gruppen, Waffeln und Kaffee. Der Erlös geht in neue Fahrzeuge für den Hof.", farbe: "purple", liste: "basar" },
    { id: "lucia26", titel: "Luciafest", datum: "2026-12-13", von: "16:30", bis: "17:30", ort: "Pfarrkirche",
      text: "Am Namenstag unserer Patronin ziehen die Kinder mit Lichterkränzen durch die Kirche.", farbe: "yellow" },
    { id: "jhv27", titel: "Mitgliederversammlung", datum: "2027-03-10", von: "19:30", bis: "21:00", ort: "Kita St. Lucia, Turnraum",
      text: "Bericht des Vorstands, Kassenbericht, Ideen für neue Projekte. Gäste sind willkommen.", farbe: "teal" },
    { id: "sommer27", titel: "Sommerfest", datum: "2027-06-19", von: "11:00", bis: "16:00", ort: "Außengelände der Kita",
      text: "Spiele, Tombola und Grillstand. Helferinnen und Helfer werden noch gesucht.", farbe: "green" }
  ],

  // Beispiellisten für den Demo-Modus (mit Datenbank werden Listen in der Verwaltung angelegt)
  demoListen: [
    { id: "martin", titel: "St.-Martins-Zug", datum: "2026-11-11", beschreibung: "Bitte 15 Minuten vor Beginn an der Kita sein. Warnwesten liegen bereit.", aktiv: true,
      plaetze: [
        { id: "m1", bezeichnung: "Ordner Zugspitze", zeit: "16:45–18:00", anzahl: 2, belegt: ["Anna K."] },
        { id: "m2", bezeichnung: "Ordner Straßenübergang Kirchstraße", zeit: "16:45–18:00", anzahl: 4, belegt: ["Tobias M.", "Sandra L."] },
        { id: "m3", bezeichnung: "Verkauf Weckmänner", zeit: "17:30–18:30", anzahl: 3, belegt: [] },
        { id: "m4", bezeichnung: "Kinderpunsch ausschenken", zeit: "17:30–18:30", anzahl: 2, belegt: ["Jens B.", "Maria H."] },
        { id: "m5", bezeichnung: "Abbau", zeit: "ab 18:30", anzahl: 3, belegt: ["Peter W."] }
      ] },
    { id: "basar", titel: "Adventsbasar", datum: "2026-11-28", beschreibung: "Kuchen bitte bis 13:30 Uhr in der Kita abgeben.", aktiv: true,
      plaetze: [
        { id: "b1", bezeichnung: "Kuchenspende", zeit: "", anzahl: 12, belegt: ["Lena S.", "Familie R.", "Oma Gertrud"] },
        { id: "b2", bezeichnung: "Waffelstand", zeit: "14:00–15:30", anzahl: 2, belegt: [] },
        { id: "b3", bezeichnung: "Waffelstand", zeit: "15:30–17:00", anzahl: 2, belegt: ["Markus T."] },
        { id: "b4", bezeichnung: "Kasse Basar", zeit: "14:00–17:00", anzahl: 1, belegt: [] }
      ] }
  ]
};
