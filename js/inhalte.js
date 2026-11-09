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
    beitraegeFirma: [50, 100, 250],     // Beiträge für Firmen (Vorschlag, in der Verwaltung änderbar)
    mindestbeitragFirma: 50,
    mindestbeitrag: 12,
    glaeubigerId: "",                  // Gläubiger-ID der Bundesbank eintragen, sobald bekannt (wird sonst ausgeblendet)
    bank: { inhaber: "Förderverein der kath. KiTa St. Lucia Walbeck e.V.", iban: "DE89 3206 1384 2006 2290 10", bic: "GENODED1GDL", institut: "Volksbank an der Niers eG" },
    kontakt: { email: "foerderverein.stlucia.kiga@gmail.com", adresse: "Meusweg 12 · 47608 Geldern", instagram: "foerdervereinkitastlucia" },
    papierAntrag: "Die ausgefüllte Beitrittserklärung auf Papier könnt ihr in die verschlossene Briefbox des Fördervereins im Eingangsbereich des Kindergartens einwerfen.",
    zitat: ["Kinder sind nicht nur unsere Zukunft.", "Kinder sind ein Schatz, den es zu hüten, zu unterstützen und zu fördern gilt."],
    kitaInfo: {
      adresse: "Meusweg 12, 47608 Geldern-Walbeck",
      text: "Die Kita St. Lucia gehört zur Pfarrei St. Maria Magdalena Geldern. In zwei Gruppen für Kinder von 3 bis 6 Jahren und einer Gruppe für Kinder von 2 bis 4 Jahren gibt es bis zu 70 Plätze.",
      link: "https://www.st-mariamagdalena-geldern.de"
    },
    registergericht: "Amtsgericht Kleve, VR 31096",
    datenschutz: { name: "Carsten Göthner", email: "dsb@mentor-gmbh.de" },
    gemeinnuetzig: null              // true, sobald die Gemeinnützigkeit bestätigt ist
  },

  // Projekte aus dem Flyer 2026. Jahr und Betrag ergänzen, sobald bekannt (leer = wird nicht angezeigt).
  // Fotos von Kindern nur mit schriftlicher Einwilligung der Eltern veröffentlichen.
  projekte: [
    {"id": "garderobe", "titel": "Neue Garderobe für die Kinder", "jahr": null, "betrag": null, "farbe": "yellow", "symbol": "stern", "bild": "img/projekte/garderobe.svg", "kurz": "Eine Garderobe im Flur, auf der sich die Kinder bequem hinsetzen können.", "text": ["Die Garderoben der Kinder hängen im Flur. Dort finden Jacken, Turnbeutel, Schuhe und vieles mehr ihren Platz.", "Die Kinder sollen sich beim An- und Ausziehen vernünftig hinsetzen können. Gleichzeitig darf der Fluchtweg aus Brandschutzgründen nicht zu eng werden. Wir suchen deshalb eine Lösung, die beides verbindet: genug Platz zum Sitzen und Verstauen und ein freier Flur.", "Dafür sammeln wir gerade. Jede Spende hilft."], "partner": "", "status": "geplant", "ziel": null, "gesammelt": null},
    {"id": "zirkus", "titel": "Zirkusprojektwoche 2027", "jahr": null, "betrag": null, "farbe": "red", "symbol": "stern", "bild": "img/projekte/zirkus.svg", "kurz": "Eine ganze Woche Zirkus mit Tieren, Artistik und Clown für unsere Kinder.", "text": ["Vom 26. bis 30. April 2027 findet in unserer Kita eine fünftägige Zirkusprojektwoche statt, mit Tieren, Artistik und Clown. Täglich wird ab 10:00 Uhr geprobt, rund 60 bis 70 Kinder machen mit.", "Zum Abschluss gibt es am 30. April 2027 eine Galavorstellung im Zirkuszelt.", "Der Gesamtpreis der Projektwoche liegt bei 2.800 € (ein größeres Zelt ist inklusive). Dafür sammeln wir."], "partner": "", "status": "geplant", "ziel": 2800, "gesammelt": null},
    {"id": "fotoalben", "bild": "img/projekte/fotoalben.svg", "titel": "Fotoalben", "jahr": 2026, "betrag": 20.0, "farbe": "pink", "symbol": "herz", "kurz": "Fotoalben für schöne Erinnerungen aus dem Kindergartenalltag.", "text": ["Angeschafft am 10.10.2026. Investition des Fördervereins: 20,00 €.", "Schöne Erinnerungen verdienen einen besonderen Platz! Der Förderverein hat Fotoalben angeschafft, in denen besondere Momente und Erlebnisse aus dem Kindergartenalltag festgehalten werden können. So bleiben viele schöne gemeinsame Erinnerungen auch langfristig erhalten."], "partner": ""},
    {"id": "regale2", "bild": "img/projekte/regale2.svg", "titel": "Weitere Regale und neues Spielzeug", "jahr": 2026, "betrag": 162.92, "farbe": "orange", "symbol": "stern", "kurz": "Weitere KALLAX-Regale und neues Spielzeug für die Spielbereiche.", "text": ["Angeschafft am 02.10.2026. Investition des Fördervereins: 162,92 €.", "Für unseren Kindergarten wurden weitere KALLAX-Regale sowie neues Spielzeug angeschafft. Damit konnten die Spielbereiche sinnvoll ergänzt und zusätzliche Möglichkeiten zum Spielen, Entdecken und Lernen geschaffen werden. Eine Investition, die den Kindern im Alltag unmittelbar zugutekommt!"], "partner": ""},
    {"id": "moskitonetz", "bild": "img/projekte/moskitonetz.svg", "titel": "Moskitonetz als Spielmaterial", "jahr": 2026, "betrag": 15.98, "farbe": "teal", "symbol": "stern", "kurz": "Ein Moskitonetz für kreatives Spielen und fantasievolles Entdecken.", "text": ["Angeschafft am 02.10.2026. Investition des Fördervereins: 15,98 €.", "Auch das Spielangebot im Kindergarten wurde erweitert: Der Förderverein hat ein Moskitonetz angeschafft, das den Kindern neue Möglichkeiten für kreatives Spielen und fantasievolles Entdecken bietet."], "partner": ""},
    {"id": "kleiderstaender", "bild": "img/projekte/kleiderstaender.svg", "titel": "Neue Kleiderständer für die Kinder", "jahr": 2026, "betrag": 28.94, "farbe": "green", "symbol": "stern", "kurz": "Kleiderständer für eine übersichtliche Garderobe.", "text": ["Angeschafft am 30.09.2026. Investition des Fördervereins: 28,94 €.", "Mit neuen Kleiderständern unterstützt der Förderverein eine praktische und kindgerechte Organisation im Kindergarten. Die Kinder können ihre Jacken und Kleidungsstücke übersichtlich aufhängen und haben diese jederzeit griffbereit. Ein weiterer kleiner Beitrag zu einem aufgeräumten Kindergartenalltag!"], "partner": ""},
    {"id": "teppich", "bild": "img/projekte/teppich.svg", "titel": "Neuer Teppich für den Kindergarten", "jahr": 2026, "betrag": 49.0, "farbe": "purple", "symbol": "stern", "kurz": "Ein neuer Teppich macht einen weiteren Bereich gemütlicher.", "text": ["Angeschafft am 26.09.2026. Investition des Fördervereins: 49,00 €.", "Mit einem neuen Teppich wurde ein weiterer Bereich im Kindergarten gemütlicher gestaltet. Er schafft eine angenehme Atmosphäre und bietet den Kindern eine schöne Fläche zum Spielen und gemeinsamen Entdecken."], "partner": ""},
    {"id": "puppenhaus", "bild": "img/projekte/puppenhaus.svg", "titel": "Puppenhaus und Kindereisdiele", "jahr": 2026, "betrag": 70.0, "farbe": "yellow", "symbol": "stern", "kurz": "Ein Puppenhaus und eine Kindereisdiele für Rollenspiele.", "text": ["Angeschafft am 04.09.2026. Investition des Fördervereins: 70,00 €.", "Für noch mehr Abwechslung im Kindergartenalltag hat der Förderverein ein neues Puppenhaus und eine Kindereisdiele angeschafft. Damit werden die Möglichkeiten für Rollenspiele erweitert und die Fantasie der Kinder angeregt. Ob Familie spielen oder eine eigene Eisdiele betreiben – hier ist jede Menge Raum für kreative Spielideen!"], "partner": ""},
    {"id": "regale1", "bild": "img/projekte/regale1.svg", "titel": "Neue Regale", "jahr": 2026, "betrag": 120.0, "farbe": "blue", "symbol": "stern", "kurz": "Neue Regale bieten zusätzlichen Stauraum.", "text": ["Angeschafft am 31.07.2026. Investition des Fördervereins: 120,00 €.", "Für unseren Kindergarten wurden neue Regale angeschafft. Sie bieten zusätzlichen Stauraum und sorgen dafür, dass Spielmaterialien und Alltagsgegenstände ordentlich und übersichtlich verstaut werden können. Damit unterstützen wir eine praktische und kindgerechte Gestaltung der Räumlichkeiten."], "partner": ""},
    {"id": "an-20260730-1", "titel": "Cosy Wasserspieltische für die Schneckengruppe", "jahr": 2026, "betrag": 349.0, "farbe": "blue", "symbol": "stern", "kurz": "Angeschafft am 30.07.2026 für 349,00 €.", "text": ["Angeschafft am 30.07.2026. Investition des Fördervereins: 349,00 €."], "partner": "", "bild": "img/projekte/an-wasserspieltisch.svg", "stumm": true},
    {"id": "an-20260720-2", "titel": "Abschiedsgeschenke für die Vorschulkinder", "jahr": 2026, "betrag": 288.0, "farbe": "orange", "symbol": "stern", "kurz": "Angeschafft am 20.07.2026 für 288,00 €.", "text": ["Angeschafft am 20.07.2026. Investition des Fördervereins: 288,00 €."], "partner": "", "bild": "img/projekte/an-geschenke.svg", "stumm": true},
    {"id": "an-20260713-3", "titel": "Eintritt und Verpflegung im Irrland für die Vorschulkinder", "jahr": 2026, "betrag": 195.5, "farbe": "green", "symbol": "stern", "kurz": "Angeschafft am 13.07.2026 für 195,50 €.", "text": ["Angeschafft am 13.07.2026. Investition des Fördervereins: 195,50 €."], "partner": "", "bild": "img/projekte/an-irrland.svg", "stumm": true},
    {"id": "an-20260623-4", "titel": "Neue Dreiräder und andere Fahrzeuge", "jahr": 2026, "betrag": 1126.8, "farbe": "purple", "symbol": "stern", "kurz": "Angeschafft am 23.06.2026 für 1.126,80 €.", "text": ["Angeschafft am 23.06.2026. Investition des Fördervereins: 1.126,80 €."], "partner": "", "bild": "img/projekte/an-dreirad.svg", "stumm": true},
    {"id": "an-20260528-5", "titel": "Neue Regale, Bilderleisten und mehr", "jahr": 2026, "betrag": 632.89, "farbe": "teal", "symbol": "stern", "kurz": "Angeschafft am 28.05.2026 für 632,89 €.", "text": ["Angeschafft am 28.05.2026. Investition des Fördervereins: 632,89 €."], "partner": "", "bild": "img/projekte/regale2.svg", "stumm": true},
    {"id": "an-20260505-6", "titel": "Malerarbeiten für die Turnhalle", "jahr": 2026, "betrag": 1590.02, "farbe": "red", "symbol": "stern", "kurz": "Angeschafft am 05.05.2026 für 1.590,02 €.", "text": ["Angeschafft am 05.05.2026. Investition des Fördervereins: 1.590,02 €."], "partner": "", "bild": "img/projekte/an-maler.svg", "stumm": true},
    {"id": "an-20260423-7", "titel": "Edubini Mikroskope", "jahr": 2026, "betrag": 149.6, "farbe": "pink", "symbol": "stern", "kurz": "Angeschafft am 23.04.2026 für 149,60 €.", "text": ["Angeschafft am 23.04.2026. Investition des Fördervereins: 149,60 €."], "partner": "", "bild": "img/projekte/an-mikroskop.svg", "stumm": true},
    {"id": "an-20260413-8", "titel": "Kindergartenkalender für die Gruppen und Bilderrahmen", "jahr": 2026, "betrag": 73.9, "farbe": "yellow", "symbol": "stern", "kurz": "Angeschafft am 13.04.2026 für 73,90 €.", "text": ["Angeschafft am 13.04.2026. Investition des Fördervereins: 73,90 €."], "partner": "", "bild": "img/projekte/an-kalender.svg", "stumm": true},
    {"id": "an-20260309-9", "titel": "Erste-Hilfe-Kurs für die Vorschulkinder", "jahr": 2026, "betrag": 225.0, "farbe": "blue", "symbol": "stern", "kurz": "Angeschafft am 09.03.2026 für 225,00 €.", "text": ["Angeschafft am 09.03.2026. Investition des Fördervereins: 225,00 €."], "partner": "", "bild": "img/projekte/an-erstehilfe.svg", "stumm": true},
    {"id": "an-20260305-10", "titel": "Thermomix für die Kita", "jahr": 2026, "betrag": 300.0, "farbe": "orange", "symbol": "stern", "kurz": "Angeschafft am 05.03.2026 für 300,00 €.", "text": ["Angeschafft am 05.03.2026. Investition des Fördervereins: 300,00 €."], "partner": "", "bild": "img/projekte/an-thermomix.svg", "stumm": true},
    {"id": "an-20260204-11", "titel": "Smiley-Anhänger für die neuen Kindergartenkinder", "jahr": 2026, "betrag": 223.05, "farbe": "green", "symbol": "stern", "kurz": "Angeschafft am 04.02.2026 für 223,05 €.", "text": ["Angeschafft am 04.02.2026. Investition des Fördervereins: 223,05 €."], "partner": "", "bild": "img/projekte/an-smiley.svg", "stumm": true},
    {"id": "an-20251215-12", "titel": "Nikolausgeschenke: Bücher, Tonies, Knetsand und weiteres Spielzeug", "jahr": 2025, "betrag": 273.03, "farbe": "purple", "symbol": "stern", "kurz": "Angeschafft am 15.12.2025 für 273,03 €.", "text": ["Angeschafft am 15.12.2025. Investition des Fördervereins: 273,03 €."], "partner": "", "bild": "img/projekte/an-nikolaus.svg", "stumm": true},
    {"id": "an-20251209-13", "titel": "Regale und Bilderleisten", "jahr": 2025, "betrag": 431.88, "farbe": "teal", "symbol": "stern", "kurz": "Angeschafft am 09.12.2025 für 431,88 €.", "text": ["Angeschafft am 09.12.2025. Investition des Fördervereins: 431,88 €."], "partner": "", "bild": "img/projekte/regale1.svg", "stumm": true},
    {"id": "an-20251013-14", "titel": "Fotoalben für die Gruppen", "jahr": 2025, "betrag": 43.55, "farbe": "red", "symbol": "stern", "kurz": "Angeschafft am 13.10.2025 für 43,55 €.", "text": ["Angeschafft am 13.10.2025. Investition des Fördervereins: 43,55 €."], "partner": "", "bild": "img/projekte/fotoalben.svg", "stumm": true},
    {"id": "an-20250930-15", "titel": "Spielzeug für die Glücksradgewinne beim Kinderschützenfest", "jahr": 2025, "betrag": 316.98, "farbe": "pink", "symbol": "stern", "kurz": "Angeschafft am 30.09.2025 für 316,98 €.", "text": ["Angeschafft am 30.09.2025. Investition des Fördervereins: 316,98 €."], "partner": "", "bild": "img/projekte/an-gluecksrad.svg", "stumm": true},
    {"id": "an-20250730-16", "titel": "Fotoalben", "jahr": 2025, "betrag": 114.94, "farbe": "yellow", "symbol": "stern", "kurz": "Angeschafft am 30.07.2025 für 114,94 €.", "text": ["Angeschafft am 30.07.2025. Investition des Fördervereins: 114,94 €."], "partner": "", "bild": "img/projekte/fotoalben.svg", "stumm": true},
    {"id": "an-20250716-17", "titel": "Beetle Push Buggy", "jahr": 2025, "betrag": 40.0, "farbe": "blue", "symbol": "stern", "kurz": "Angeschafft am 16.07.2025 für 40,00 €.", "text": ["Angeschafft am 16.07.2025. Investition des Fördervereins: 40,00 €."], "partner": "", "bild": "img/projekte/an-buggy.svg", "stumm": true},
    {"id": "an-20250716-18", "titel": "Ersatzteile für Tretautos", "jahr": 2025, "betrag": 37.48, "farbe": "orange", "symbol": "stern", "kurz": "Angeschafft am 16.07.2025 für 37,48 €.", "text": ["Angeschafft am 16.07.2025. Investition des Fördervereins: 37,48 €."], "partner": "", "bild": "img/projekte/an-ersatzteile.svg", "stumm": true},
    {"id": "an-20250705-19", "titel": "Eintritt und Verpflegung im Irrland für die Vorschulkinder", "jahr": 2025, "betrag": 157.5, "farbe": "green", "symbol": "stern", "kurz": "Angeschafft am 05.07.2025 für 157,50 €.", "text": ["Angeschafft am 05.07.2025. Investition des Fördervereins: 157,50 €."], "partner": "", "bild": "img/projekte/an-irrland.svg", "stumm": true},
    {"id": "an-20250701-20", "titel": "Wochenplaner für die Gruppen", "jahr": 2025, "betrag": 89.85, "farbe": "purple", "symbol": "stern", "kurz": "Angeschafft am 01.07.2025 für 89,85 €.", "text": ["Angeschafft am 01.07.2025. Investition des Fördervereins: 89,85 €."], "partner": "", "bild": "img/projekte/an-wochenplaner.svg", "stumm": true},
    {"id": "an-20250610-21", "titel": "Einrichtungsgegenstände für die Igelgruppe: Regale, Lampen, Teppich und mehr", "jahr": 2025, "betrag": 240.17, "farbe": "teal", "symbol": "stern", "kurz": "Angeschafft am 10.06.2025 für 240,17 €.", "text": ["Angeschafft am 10.06.2025. Investition des Fördervereins: 240,17 €."], "partner": "", "bild": "img/projekte/an-igel.svg", "stumm": true},
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
    {"id": "mv26", "titel": "Mitgliederversammlung", "datum": "2026-11-12", "von": "18:00", "bis": "", "ort": "", "text": "Versammlung der Mitglieder des Fördervereins. Auch Nichtmitglieder sind herzlich willkommen, die sich ein Bild vom Förderverein machen möchten.", "farbe": "teal"},
    {"id": "wm26a", "titel": "Weihnachtsmarkt am Schloss Walbeck (Samstag)", "datum": "2026-11-28", "von": "11:00", "bis": "20:00", "ort": "Schloss Walbeck", "text": "Unser Stand am 1. Adventswochenende: Glücksrad mit tollen Preisen, Glitzer-Tattoos für Groß und Klein und ein kleiner Verkaufsstand mit selbstgemachter Deko. Wir sammeln für eine neue Garderobe für die Kinder. Helferinnen und Helfer für Auf- und Abbau und Standbetreuung werden gesucht.", "farbe": "purple", "liste": "cf6eb454-5cab-454a-aa7d-f17f8b6a60c5"},
    {"id": "wm26b", "titel": "Weihnachtsmarkt am Schloss Walbeck (Sonntag)", "datum": "2026-11-29", "von": "10:30", "bis": "20:00", "ort": "Schloss Walbeck", "text": "Unser Stand am 1. Adventswochenende: Glücksrad mit tollen Preisen, Glitzer-Tattoos für Groß und Klein und ein kleiner Verkaufsstand mit selbstgemachter Deko. Wir sammeln für eine neue Garderobe für die Kinder. Helferinnen und Helfer für Standbetreuung und Abbau werden gesucht.", "farbe": "purple", "liste": "a3b5c7d9-1111-4222-8333-444455556666"},
    {"id": "zirkus27", "spende": "ja", "titel": "Zirkusprojektwoche in der Kita", "datum": "2027-04-26", "von": "10:00", "bis": "", "ort": "Kita St. Lucia", "text": "Fünf Tage Zirkus mit Tieren, Artistik und Clown, 26. bis 30. April 2027. Proben täglich ab 10:00 Uhr, rund 60 bis 70 Kinder machen mit.", "farbe": "red"},
    {"id": "zirkus27g", "spende": "ja", "titel": "Galavorstellung im Zirkuszelt", "datum": "2027-04-30", "von": "", "bis": "", "ort": "Kita St. Lucia", "text": "Zum Abschluss der Zirkusprojektwoche zeigen die Kinder, was sie gelernt haben.", "farbe": "red"}
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
