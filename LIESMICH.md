# Förderverein Kita St. Lucia Walbeck – Web-App

Reine HTML/CSS/JS-Seite ohne Build-Schritt. Läuft bei jedem Webhoster, ist als App installierbar (PWA)
und lädt nichts von fremden Servern (keine Google-Fonts, keine Tracker).

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Einstieg |
| `js/inhalte.js` | **Texte, Vorstand, Bankdaten, Projekte, Termine** – hier wird gepflegt |
| `js/config.js` | Datenbank-Zugang und feste Adresse für QR-Codes |
| `js/daten.js` | Datenschicht (Demo im Browser oder Supabase) |
| `js/app.js` | Seiten, Navigation, Formulare, Verwaltung |
| `css/app.css` | Gestaltung (Farben aus dem Kita-Logo, hell/dunkel) |
| `supabase/schema.sql` | Datenbank mit Zugriffsregeln |
| `sw.js`, `manifest.webmanifest`, `img/` | App-Installation und Symbole |

Seiten: `#start #termine #mithelfen #liste-<id> #aushang-<id|mitglied|mithelfen|termine> #mitglied #projekte #projekt-<id> #verein #spenden #kontakt #impressum #datenschutz #verwaltung`

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

## 4. Änderungen veröffentlichen
Nach jeder Änderung in `index.html` die `?v=1` hochzählen und in `sw.js` die `VERSION`
(z. B. `fv-2`). Sonst sehen installierte Apps noch die alte Fassung.

## Datenschutz im Überblick
- Öffentlich sichtbar in Listen: nur Vorname + Initial. Kontaktangaben sieht nur der Vorstand.
- Austragen geht nur vom eigenen Gerät (geheimer Schlüssel im Browser).
- Mitgliedsanträge dürfen alle abschicken, lesen kann sie nur ein Vorstandskonto.
- Listen nach der Veranstaltung in der Verwaltung löschen.
- Ein verstecktes Feld hält einfache Spam-Bots ab.
