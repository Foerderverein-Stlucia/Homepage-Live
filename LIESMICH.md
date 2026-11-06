# Förderverein Kita St. Lucia Walbeck – Web-App

Reine HTML/CSS/JS-Seite ohne Build-Schritt. Läuft bei jedem Webhoster, ist als App installierbar (PWA)
und lädt nichts von fremden Servern (keine Google-Fonts, keine Tracker).

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `js/inhalte.js` | Startinhalte. Sobald in der Verwaltung gespeichert wird, gelten die Inhalte aus der Datenbank. |
| `js/config.js` | Datenbank-Zugang und feste Adresse für QR-Codes |
| `js/daten.js` | Datenschicht (Demo im Browser oder Supabase) |
| `js/app.js` | Seiten, Navigation, Formulare |
| `js/verwaltung.js` | Verwaltung für den Vorstand |
| `vendor/xlsx.mini.min.js` | Excel-Leser für den Mitglieder-Import (SheetJS, Apache-2.0) |
| `css/app.css` | Gestaltung (Farben aus dem Kita-Logo, hell/dunkel) |
| `supabase/schema.sql` | Datenbank mit Zugriffsregeln |
| `sw.js`, `manifest.webmanifest`, `img/` | App-Installation und Symbole |

Seiten: `#start #termine #mithelfen #liste-<id> #aushang-<id|mitglied|mithelfen|termine> #mitglied #projekte #projekt-<id> #verein #spenden #kontakt #impressum #datenschutz #verwaltung #registrieren`

## 1. Inhalte anpassen
In `js/inhalte.js` alle Beispiele ersetzen: Vorstand, Gläubiger-ID, Bankverbindung, Adresse,
Registernummer, Projekte, Termine. Danach Impressum und Datenschutz prüfen (Vorlagen).
Logo: `img/logo.png` ist aus dem Foto ausgeschnitten – besser die Originaldatei von der Kita einsetzen.

## 2. Hochladen
Den ganzen Ordner per FTP in ein Verzeichnis mit **HTTPS** hochladen (z. B. All-Inkl, GitHub Pages,
Netlify, Cloudflare Pages). Ohne HTTPS lässt sich die App nicht installieren.
In `js/config.js` bei `seitenUrl` die endgültige Adresse eintragen, damit gedruckte QR-Codes stimmen.

## 3. Datenbank anbinden (Supabase)
Ohne Datenbank läuft die Seite im Demo-Modus: Eintragungen bleiben auf dem eigenen Gerät.
1. Bei supabase.com ein Projekt für den Verein anlegen, Region **Frankfurt (eu-central-1)**.
   Am besten unter einem Vereinskonto, nicht unter einem privaten. Im kostenlosen Tarif sind
   zwei aktive Projekte je Organisation möglich.
2. SQL-Editor → Inhalt von `supabase/schema.sql` ausführen.
3. Authentication → Users → „Add user“ für jedes Vorstandsmitglied, dann im SQL-Editor:
   `insert into public.vorstand (user_id, name) select id, 'Name' from auth.users where email = '…';`
4. Authentication → Sign In / Providers: „Allow new users to sign up“ **ausschalten**.
5. Project Settings → API: Project URL und Publishable/anon key in `js/config.js` eintragen.
6. Mit Supabase den Auftragsverarbeitungsvertrag (DPA) abschließen.

Hinweis: Kostenlose Supabase-Projekte werden nach einer Woche ohne Zugriff pausiert und lassen
sich im Dashboard mit einem Klick wieder starten. Bei regelmäßiger Nutzung passiert das nicht.

## 4. Verwaltung (Mehr → Verwaltung)
Alles lässt sich ohne Programmierkenntnisse in der App pflegen:
- **Anträge:** eingegangene Mitgliedsanträge ansehen, mit „Übernehmen“ in die Mitgliederliste.
- **Mitglieder:** anlegen, bearbeiten, Austritt eintragen, suchen, Export als CSV, Import aus Excel (.xlsx) oder CSV.
- **Eintragelisten:** Listen und Aufgaben anlegen, Einträge ansehen, Aushang mit QR-Code.
- **Termine** und **Projekte** (mit Foto-Upload) anlegen, ändern, löschen, Reihenfolge ändern.
- **Vereinsdaten:** Texte, Vorstand, Kontakt, Bankverbindung, Beiträge, Gläubiger-ID, Impressumsangaben.
- **Zugänge:** offene Anfragen freischalten (mit Amt) oder ablehnen, Zugänge entfernen, eigenes Passwort ändern, Gesamtsicherung.

Voraussetzung: `supabase/erweiterung-verwaltung.sql` einmal im SQL-Editor ausführen.

### Neue Vorstandsmitglieder
1. In Supabase: Authentication → Sign In / Providers → „Allow new users to sign up“ **an**, beim Anbieter „Email“ „Confirm email“ **aus**.
   (Neue Konten haben keinerlei Rechte, bis sie freigeschaltet sind.)
2. Den Link `…/#registrieren` (steht mit QR-Code unter Verwaltung → Zugänge) an die Person schicken.
3. Die Person trägt Name, E-Mail und ein eigenes Passwort ein.
4. Unter Verwaltung → Zugänge die Anfrage prüfen (am besten kurz persönlich nachfragen), Amt eintragen, freischalten.

### Übergabe bei Wechsel im Vorsitz
- Nachfolger über den Link registrieren lassen und freischalten.
- Zugangsdaten übergeben: Vereins-Gmail, GitHub-Konto „Foerderverein-Stlucia“, Supabase-Vereinskonto.
- Gesamtsicherung herunterladen und sicher aufbewahren.
- Danach entfernt der Nachfolger den alten Zugang.

## 5. Änderungen am Programm veröffentlichen
Nach jeder Änderung in `index.html` die `?v=1` hochzählen und in `sw.js` die `VERSION`
(z. B. `fv-2`). Sonst sehen installierte Apps noch die alte Fassung.

## Datenschutz im Überblick
- Öffentlich sichtbar in Listen: nur Vorname + Initial. Kontaktangaben sieht nur der Vorstand.
- Austragen geht nur vom eigenen Gerät (geheimer Schlüssel im Browser).
- Mitgliedsanträge dürfen alle abschicken, lesen kann sie nur ein Vorstandskonto.
- Listen nach der Veranstaltung in der Verwaltung löschen.
- Ein verstecktes Feld hält einfache Spam-Bots ab.
