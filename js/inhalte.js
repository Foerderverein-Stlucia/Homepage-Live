/* ============================================================
   INHALTE DER SEITE
   Hier werden Texte, Projekte und Termine gepflegt.
   Alles, was mit "BEISPIEL" markiert ist, bitte ersetzen.
   Farben: pink, blue, green, orange, purple, yellow, red, teal
   Symbole: rutsche, buch, theater, musik, baum, kueche, ausflug, stern, herz
   ============================================================ */
window.FV_INHALT = {
  verein: {
    name: "Förderverein der Kath. Kita St. Lucia Walbeck e.V.",
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
    beitraege: [12, 24, 36],           // Jahresbeiträge in Euro zur Auswahl
    mindestbeitrag: 12,
    glaeubigerId: "DE00ZZZ00000000000",  // BEISPIEL – Gläubiger-ID der Bundesbank
    bank: { inhaber: "Förderverein Kita St. Lucia Walbeck e.V.", iban: "DE00 0000 0000 0000 0000 00", bic: "XXXXDEXXXXX", institut: "Bank folgt" },
    kontakt: { email: "kontakt@beispiel.de", adresse: "Kita St. Lucia · Straße folgt · 47608 Geldern-Walbeck" },
    registergericht: "Registergericht und Nummer folgen",
    gemeinnuetzig: true
  },

  projekte: [
    { id: "garten", titel: "Neue Spielgeräte im Außengelände", jahr: 2025, betrag: 4800, farbe: "pink", symbol: "rutsche",
      kurz: "Kletterturm mit Rutsche und ein überdachter Sandspielbereich.",
      text: ["Das alte Klettergerüst war nicht mehr sicher und musste abgebaut werden. Mit Spenden vom Sommerfest und vielen Einzelspenden konnten wir einen neuen Kletterturm mit Rutsche finanzieren.",
             "Dazu kam ein Sonnensegel über dem Sandkasten, damit die Kinder auch im Hochsommer draußen spielen können."],
      partner: "Eltern und Sommerfest", beispiel: true },
    { id: "buecherei", titel: "Kita-Bücherei und Leseecke", jahr: 2024, betrag: 1200, farbe: "blue", symbol: "buch",
      kurz: "Über 120 neue Bilderbücher und eine gemütliche Leseecke.",
      text: ["Jede Woche dürfen sich die Kinder ein Buch mit nach Hause nehmen. Dafür haben wir den Bestand aufgefrischt und ein Regal mit Sitzkissen angeschafft.",
             "Vorlese-Omas und -Opas aus Walbeck kommen jetzt regelmäßig donnerstags."],
      partner: "", beispiel: true },
    { id: "theater", titel: "Theaterworkshop für die Maxi-Kinder", jahr: 2024, betrag: 900, farbe: "orange", symbol: "theater",
      kurz: "Drei Vormittage mit einer Theaterpädagogin und eine Aufführung für die Familien.",
      text: ["Die Vorschulkinder haben mit einer Theaterpädagogin ein eigenes Stück entwickelt und es beim Abschlussfest aufgeführt."],
      partner: "", beispiel: true },
    { id: "kueche", titel: "Kinderküche", jahr: 2023, betrag: 650, farbe: "green", symbol: "kueche",
      kurz: "Eine Küchenzeile in Kinderhöhe für Back- und Kochprojekte.",
      text: ["Seitdem backen die Gruppen regelmäßig selbst, zum Beispiel Weckmänner für St. Martin."],
      partner: "", beispiel: true }
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
