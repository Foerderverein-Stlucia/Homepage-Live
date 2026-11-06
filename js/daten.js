/* ============================================================
   DATENSCHICHT
   Zwei Betriebsarten mit derselben Schnittstelle:
   - Demo: speichert im Browser (localStorage), ideal zum Ausprobieren
   - Supabase: echte Datenbank, alle Eltern sehen dieselben Listen
   ============================================================ */
(function () {
  const C = window.FV_CONFIG || {};
  const I = window.FV_INHALT || {};
  const LIVE = !!(C.supabaseUrl && C.supabaseKey);

  const store = {
    get(k, d) { try { const v = localStorage.getItem("fv_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("fv_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const anzeigename = (n) => { const t = String(n || "").trim().split(/\s+/); return t.length > 1 ? t[0] + " " + t[1][0] + "." : t[0]; };

  /* Eigene Eintragungen merken (für "Austragen") – in beiden Modi nur auf diesem Gerät */
  const meine = {
    alle() { return store.get("meine", []); },
    add(e) { const a = meine.alle(); a.push(e); store.set("meine", a); },
    weg(token) { store.set("meine", meine.alle().filter(x => x.token !== token)); }
  };

  /* ---------------- Demo ---------------- */
  function demoDb() {
    let db = store.get("demo", null);
    if (!db) {
      db = { listen: [], eintraege: [], antraege: [] };
      (I.demoListen || []).forEach(l => {
        db.listen.push({ id: l.id, titel: l.titel, datum: l.datum, beschreibung: l.beschreibung, aktiv: l.aktiv,
          plaetze: l.plaetze.map((p, i) => ({ id: p.id, bezeichnung: p.bezeichnung, zeit: p.zeit, anzahl: p.anzahl, reihenfolge: i })) });
        l.plaetze.forEach(p => p.belegt.forEach(n => db.eintraege.push({ id: uid(), platz_id: p.id, name: n, kontakt: "", token: uid(), erstellt: new Date().toISOString() })));
      });
      db.antraege.push({ id: uid(), erstellt: "2026-10-28T18:12:00Z", vorname: "Beispiel", nachname: "Antrag", strasse: "Musterweg 1", plz: "47608", ort: "Geldern-Walbeck",
        email: "beispiel@example.org", telefon: "", kind: "Gruppe Sonnenblume", beitrag: 24, kontoinhaber: "Beispiel Antrag", iban: "DE02120300000000202051", status: "neu" });
      store.set("demo", db);
    }
    return db;
  }
  const demoSave = (db) => store.set("demo", db);

  function statAus(z, tage) {
    const von = new Date(); von.setDate(von.getDate() - tage + 1); const v = von.toISOString().slice(0, 10);
    const r = z.filter(x => x.tag >= v), sum = (k, f) => { const m = new Map(); r.forEach(x => m.set(f(x), (m.get(f(x)) || 0) + x.anzahl)); return [...m].map(([a, anzahl]) => ({ ...k(a), anzahl })); };
    return { tage: sum(a => ({ tag: a }), x => x.tag).sort((a, b) => a.tag.localeCompare(b.tag)), seiten: sum(a => ({ seite: a }), x => x.seite).sort((a, b) => b.anzahl - a.anzahl), geraete: sum(a => ({ geraet: a }), x => x.geraet), app: sum(a => ({ app: a }), x => x.app) };
  }
  const Demo = {
    async listen({ alle = false } = {}) {
      const db = demoDb();
      return db.listen.filter(l => alle || l.aktiv).map(l => ({ ...l,
        plaetze: l.plaetze.slice().sort((a, b) => a.reihenfolge - b.reihenfolge).map(p => ({ ...p,
          belegt: db.eintraege.filter(e => e.platz_id === p.id).map(e => ({ name: anzeigename(e.name), token: e.token })) })) }))
        .sort((a, b) => String(a.datum).localeCompare(String(b.datum)));
    },
    async eintragen(platzId, name, kontakt) {
      const db = demoDb();
      const l = db.listen.find(l => l.plaetze.some(p => p.id === platzId));
      const p = l && l.plaetze.find(p => p.id === platzId);
      if (!p || !l.aktiv) throw new Error("Diese Liste ist nicht mehr offen.");
      if (db.eintraege.filter(e => e.platz_id === platzId).length >= p.anzahl) throw new Error("Dieser Platz ist schon voll.");
      const token = uid();
      db.eintraege.push({ id: uid(), platz_id: platzId, name, kontakt, token, erstellt: new Date().toISOString() });
      demoSave(db); return token;
    },
    async austragen(token) {
      const db = demoDb(); const n = db.eintraege.length;
      db.eintraege = db.eintraege.filter(e => e.token !== token); demoSave(db); return db.eintraege.length < n;
    },
    async antrag(a) { const db = demoDb(); db.antraege.push({ ...a, id: uid(), erstellt: new Date().toISOString(), status: "neu" }); demoSave(db); },
    // Verwaltung
    async anmelden(email, pw) { if (pw !== (C.demoPasswort || "demo")) throw new Error("Passwort falsch. Im Demo-Modus lautet es „" + (C.demoPasswort || "demo") + "“."); store.set("sitzung", { demo: true, email }); },
    async abmelden() { store.set("sitzung", null); },
    angemeldet() { return !!store.get("sitzung", null); },
    async antraege() { return demoDb().antraege.slice().sort((a, b) => b.erstellt.localeCompare(a.erstellt)); },
    async antragStatus(id, status) { const db = demoDb(); const a = db.antraege.find(x => x.id === id); if (a) a.status = status; demoSave(db); },
    async eintraegeVoll(listeId) {
      const db = demoDb(); const l = db.listen.find(x => x.id === listeId); if (!l) return [];
      const ids = l.plaetze.map(p => p.id);
      return db.eintraege.filter(e => ids.includes(e.platz_id));
    },
    async eintragLoeschen(id) { const db = demoDb(); db.eintraege = db.eintraege.filter(e => e.id !== id); demoSave(db); },
    async listeSpeichern(l) {
      const db = demoDb();
      const neu = { id: l.id || uid(), titel: l.titel, datum: l.datum || null, beschreibung: l.beschreibung || "", aktiv: !!l.aktiv,
        plaetze: l.plaetze.map((p, i) => ({ id: p.id || uid(), bezeichnung: p.bezeichnung, zeit: p.zeit || "", anzahl: +p.anzahl || 1, reihenfolge: i })) };
      const ix = db.listen.findIndex(x => x.id === neu.id);
      if (ix >= 0) {
        const behalten = neu.plaetze.map(p => p.id);
        const alt = db.listen[ix].plaetze.map(p => p.id).filter(id => !behalten.includes(id));
        db.eintraege = db.eintraege.filter(e => !alt.includes(e.platz_id));
        db.listen[ix] = neu;
      } else db.listen.push(neu);
      demoSave(db); return neu.id;
    },
    async listeLoeschen(id) {
      const db = demoDb(); const l = db.listen.find(x => x.id === id); if (!l) return;
      const ids = l.plaetze.map(p => p.id);
      db.eintraege = db.eintraege.filter(e => !ids.includes(e.platz_id));
      db.listen = db.listen.filter(x => x.id !== id); demoSave(db);
    },
    /* Inhalte, Bilder, Mitglieder, Zugänge (Demo) */
    async inhalteLaden() { return store.get("inhalte", null); },
    async inhaltSpeichern(k, wert) { const x = store.get("inhalte", {}) || {}; x[k] = wert; store.set("inhalte", x); },
    async inhaltLesen(k) { const x = store.get("inhalte", {}) || {}; return x[k] ?? null; },
    async aufruf(seite, geraet, app) { const z = store.get("stat", []) || []; const tag = new Date().toISOString().slice(0, 10); let e = z.find(r => r.tag === tag && r.seite === seite && r.geraet === geraet && r.app === app); if (!e) z.push(e = { tag, seite, geraet, app, anzahl: 0 }); e.anzahl++; store.set("stat", z); },
    async statistik(tage) { return statAus(store.get("stat", []) || [], tage); },
    async bildHochladen(blob) {
      return await new Promise((ok, bad) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = bad; r.readAsDataURL(blob); });
    },
    async mitglieder() { return (store.get("mitglieder", []) || []).slice().sort((a, b) => (a.nachname + a.vorname).localeCompare(b.nachname + b.vorname, "de")); },
    async mitgliedSpeichern(m) {
      const a = store.get("mitglieder", []) || []; const jetzt = new Date().toISOString();
      if (m.id) { const i = a.findIndex(x => x.id === m.id); if (i >= 0) a[i] = { ...a[i], ...m, geaendert: jetzt }; }
      else a.push({ status: "aktiv", newsletter: false, ...m, id: uid(), erstellt: jetzt, geaendert: jetzt });
      store.set("mitglieder", a);
    },
    async mitgliederImport(liste) { const a = store.get("mitglieder", []) || []; const jetzt = new Date().toISOString(); liste.forEach(m => a.push({ status: "aktiv", newsletter: false, ...m, id: uid(), erstellt: jetzt, geaendert: jetzt })); store.set("mitglieder", a); return liste.length; },
    async mitgliedLoeschen(id) { store.set("mitglieder", (store.get("mitglieder", []) || []).filter(x => x.id !== id)); },
    async vorstandListe() { const s = store.get("sitzung", {}) || {}; return [{ user_id: "demo", name: "Demo-Vorstand", amt: "1. Vorsitz", email: s.email || "vorstand@beispiel.de", ich: true }].concat(store.get("demoVorstand", []) || []); },
    async registrieren(name, email, pw) { const a = store.get("demoAnfragen", []) || []; if (a.some(x => x.email.toLowerCase() === email.toLowerCase())) throw new Error("Mit dieser E-Mail gibt es schon eine Anfrage."); a.push({ user_id: uid(), name, email, erstellt: new Date().toISOString() }); store.set("demoAnfragen", a); },
    async zugangAnfragen() { return store.get("demoAnfragen", []) || []; },
    async zugangFreischalten(id, name, amt) {
      const a = store.get("demoAnfragen", []) || []; const x = a.find(y => y.user_id === id);
      const v = store.get("demoVorstand", []) || []; const i = v.findIndex(y => y.user_id === id);
      if (i >= 0) { v[i].name = name; v[i].amt = amt; } else v.push({ user_id: id, name, amt, email: x ? x.email : "", ich: false });
      store.set("demoVorstand", v); store.set("demoAnfragen", a.filter(y => y.user_id !== id));
    },
    async zugangAblehnen(id) { store.set("demoAnfragen", (store.get("demoAnfragen", []) || []).filter(y => y.user_id !== id)); },
    async vorstandHinzufuegen(email, name) { const a = store.get("demoVorstand", []) || []; a.push({ user_id: uid(), name, email, ich: false }); store.set("demoVorstand", a); },
    async vorstandEntfernen(id) { store.set("demoVorstand", (store.get("demoVorstand", []) || []).filter(x => x.user_id !== id)); },
    async passwortPruefen(pw) { if (pw !== (C.demoPasswort || "demo")) throw new Error("Passwort falsch."); },
    async passwortAendern() { throw new Error("Im Vorschau-Modus gibt es kein echtes Passwort."); },
    async unterstuetzer() { return (store.get("mitglieder", []) || []).filter(m => m.art === "firma" && m.nennung && m.status !== "ausgetreten" && m.firma).map(m => m.firma).sort((a, b) => a.localeCompare(b, "de")); },
    zuruecksetzen() { try { ["fv_demo", "fv_meine", "fv_inhalte", "fv_mitglieder", "fv_demoVorstand", "fv_demoAnfragen"].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  };

  /* ---------------- Supabase (ohne Bibliothek, per REST) ---------------- */
  const base = (C.supabaseUrl || "").replace(/\/$/, "");
  function sitzung() { return store.get("sitzung", null); }
  async function req(path, { method = "GET", body, auth = false, prefer } = {}) {
    const s = sitzung();
    const h = { apikey: C.supabaseKey, "Content-Type": "application/json" };
    // Neue Schlüssel (sb_publishable_…) nur im apikey-Header senden; Authorization nur mit Anmelde-Token
    if (auth && s && s.access_token) h.Authorization = "Bearer " + s.access_token;
    else if (!/^sb_/.test(C.supabaseKey)) h.Authorization = "Bearer " + C.supabaseKey;
    if (prefer) h.Prefer = prefer;
    let r = await fetch(base + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401 && auth && s && s.refresh_token) {
      await erneuern(); return req(path, { method, body, auth, prefer });
    }
    if (!r.ok) {
      let m = ""; try { const j = await r.json(); m = j.message || j.msg || j.error_description || ""; } catch (e) {}
      throw new Error(fehlerText(m) || "Die Verbindung zum Server hat nicht geklappt (" + r.status + "). Bitte später noch einmal versuchen.");
    }
    if (r.status === 204) return null;
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  function fehlerText(m) {
    if (/VOLL/.test(m)) return "Dieser Platz ist inzwischen voll.";
    if (/GESCHLOSSEN/.test(m)) return "Diese Liste ist nicht mehr offen.";
    if (/Invalid login/i.test(m)) return "E-Mail oder Passwort stimmt nicht.";
    if (/not confirmed/i.test(m)) return "Die E-Mail-Adresse ist noch nicht bestätigt. In Supabase „Confirm email“ ausschalten oder den Vorstand um Hilfe bitten.";
    if (/rate limit|too many/i.test(m)) return "Zu viele Versuche in kurzer Zeit. Bitte in ein paar Minuten noch einmal.";
    if (/KEIN_KONTO/.test(m)) return "Zu dieser E-Mail gibt es noch kein Konto. Bitte zuerst in Supabase anlegen (siehe Hinweis).";
    if (/SELBST/.test(m)) return "Den eigenen Zugang kann man nicht entfernen.";
    if (/IST_VORSTAND/.test(m)) return "Dieser Zugang ist schon freigeschaltet. Erst entfernen, dann ablehnen.";
    if (/inhalte|mitglieder|vorstand_liste|zugang_/.test(m) && /(does not exist|Could not find)/i.test(m)) return "Die Datenbank-Erweiterung fehlt noch. Bitte supabase/erweiterung-verwaltung.sql einmal im SQL-Editor ausführen.";
    return m;
  }
  async function erneuern() {
    const s = sitzung();
    const r = await fetch(base + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
    if (!r.ok) { store.set("sitzung", null); throw new Error("Bitte erneut anmelden."); }
    const j = await r.json(); store.set("sitzung", { access_token: j.access_token, refresh_token: j.refresh_token, email: s.email });
  }

  const Live = {
    async listen({ alle = false } = {}) {
      const auth = alle && Live.angemeldet();
      const q = "/rest/v1/listen?select=id,titel,datum,beschreibung,aktiv,plaetze(id,bezeichnung,zeit,anzahl,reihenfolge)&order=datum.asc.nullslast" + (alle ? "" : "&aktiv=eq.true");
      const [ls, bel] = await Promise.all([req(q, { auth }), req("/rest/v1/rpc/belegung", { method: "POST", body: {} })]);
      return ls.map(l => ({ ...l, plaetze: l.plaetze.sort((a, b) => a.reihenfolge - b.reihenfolge).map(p => ({ ...p,
        belegt: bel.filter(b => b.platz_id === p.id).map(b => ({ name: b.anzeigename, token: null })) })) }));
    },
    async eintragen(platzId, name, kontakt) {
      return await req("/rest/v1/rpc/eintragen", { method: "POST", body: { p_platz: platzId, p_name: name, p_kontakt: kontakt || "" } });
    },
    async austragen(token) { return await req("/rest/v1/rpc/austragen", { method: "POST", body: { p_token: token } }); },
    async antrag(a) {
      try { await req("/rest/v1/mitgliedsantraege", { method: "POST", body: a, prefer: "return=minimal" }); }
      catch (e) { // Falls die Spalte "newsletter" in der Datenbank noch fehlt
        if (!/newsletter/i.test(e.message)) throw e;
        const { newsletter, ...rest } = a; await req("/rest/v1/mitgliedsantraege", { method: "POST", body: rest, prefer: "return=minimal" });
      }
    },
    async anmelden(email, pw) {
      const r = await fetch(base + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(fehlerText(j.error_description || j.msg || "") || "Anmeldung fehlgeschlagen.");
      store.set("sitzung", { access_token: j.access_token, refresh_token: j.refresh_token, email });
      const ok = await req("/rest/v1/rpc/ist_vorstand", { method: "POST", body: {}, auth: true });
      if (!ok) { store.set("sitzung", null); throw new Error("Dein Zugang ist noch nicht freigeschaltet. Ein Vorstandsmitglied muss ihn erst in der Verwaltung bestätigen."); }
    },
    async passwortPruefen(pw) {
      const s = sitzung(); if (!s || !s.email) throw new Error("Bitte erneut anmelden.");
      if (!pw) throw new Error("Bitte dein Passwort eingeben.");
      const r = await fetch(base + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email: s.email, password: pw }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(r.status === 429 ? "Zu viele Versuche. Bitte kurz warten." : "Passwort falsch."); }
    },
    async abmelden() { store.set("sitzung", null); },
    angemeldet() { const s = sitzung(); return !!(s && s.access_token); },
    async antraege() { return await req("/rest/v1/mitgliedsantraege?select=*&order=erstellt.desc", { auth: true }); },
    async antragStatus(id, status) { await req("/rest/v1/mitgliedsantraege?id=eq." + id, { method: "PATCH", body: { status }, auth: true, prefer: "return=minimal" }); },
    async eintraegeVoll(listeId) {
      const ps = await req("/rest/v1/plaetze?select=id&liste_id=eq." + listeId, { auth: true });
      if (!ps.length) return [];
      return await req("/rest/v1/eintraege?select=id,platz_id,name,kontakt,erstellt&platz_id=in.(" + ps.map(p => p.id).join(",") + ")&order=erstellt.asc", { auth: true });
    },
    async eintragLoeschen(id) { await req("/rest/v1/eintraege?id=eq." + id, { method: "DELETE", auth: true }); },
    async listeSpeichern(l) {
      const r = await req("/rest/v1/rpc/liste_speichern", { method: "POST", auth: true, body: { p_liste: {
        id: l.id || null, titel: l.titel, datum: l.datum || null, beschreibung: l.beschreibung || "", aktiv: !!l.aktiv,
        plaetze: l.plaetze.map((p, i) => ({ id: p.id || null, bezeichnung: p.bezeichnung, zeit: p.zeit || "", anzahl: +p.anzahl || 1, reihenfolge: i })) } } });
      return r;
    },
    async listeLoeschen(id) { await req("/rest/v1/listen?id=eq." + id, { method: "DELETE", auth: true }); },
    /* Inhalte, Bilder, Mitglieder, Zugänge (Supabase) */
    async inhalteLaden() {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
      try {
        const r = await fetch(base + "/rest/v1/inhalte?select=schluessel,wert", { headers: { apikey: C.supabaseKey }, signal: ctl.signal });
        if (!r.ok) throw new Error(r.status);
        const rows = await r.json(); const x = {}; rows.forEach(z => x[z.schluessel] = z.wert);
        store.set("inhalteCache", x); return x;
      } catch (e) { return store.get("inhalteCache", null); }
      finally { clearTimeout(t); }
    },
    async aufruf(seite, geraet, app) {
      try { await fetch(base + "/rest/v1/rpc/aufruf", { method: "POST", keepalive: true, headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ p_seite: seite, p_geraet: geraet, p_app: app }) }); } catch (e) {}
    },
    async statistik(tage) { return await req("/rest/v1/rpc/statistik", { method: "POST", body: { p_tage: tage }, auth: true }); },
    async inhaltLesen(k) {
      const r = await req("/rest/v1/inhalte?select=wert&schluessel=eq." + encodeURIComponent(k), { auth: true });
      return r && r[0] ? r[0].wert : null;
    },
    async inhaltSpeichern(k, wert) {
      await req("/rest/v1/inhalte?on_conflict=schluessel", { method: "POST", auth: true, body: { schluessel: k, wert, geaendert: new Date().toISOString() }, prefer: "resolution=merge-duplicates,return=minimal" });
      const c = store.get("inhalteCache", {}) || {}; c[k] = wert; store.set("inhalteCache", c);
    },
    async bildHochladen(blob, name) {
      const s = sitzung(); if (!s || !s.access_token) throw new Error("Bitte erneut anmelden.");
      const pfad = "projekte/" + Date.now() + "-" + String(name || "bild").toLowerCase().replace(/[^a-z0-9.-]+/g, "-").slice(0, 40) + ".jpg";
      const send = () => fetch(base + "/storage/v1/object/bilder/" + pfad, { method: "POST", headers: { apikey: C.supabaseKey, Authorization: "Bearer " + sitzung().access_token, "Content-Type": blob.type || "image/jpeg", "x-upsert": "true" }, body: blob });
      let r = await send();
      if (r.status === 401 || r.status === 403) { try { await erneuern(); r = await send(); } catch (e) {} }
      if (!r.ok) { let m = ""; try { m = (await r.json()).message || ""; } catch (e) {} throw new Error("Bild konnte nicht hochgeladen werden" + (m ? ": " + m : ".") ); }
      return base + "/storage/v1/object/public/bilder/" + pfad;
    },
    async mitglieder() { return await req("/rest/v1/mitglieder?select=*&order=nachname.asc,vorname.asc", { auth: true }); },
    async mitgliedSpeichern(m) {
      const { id, erstellt, ...rest } = m; rest.geaendert = new Date().toISOString();
      ["beitrag"].forEach(k => { if (rest[k] === "" || rest[k] == null || isNaN(rest[k])) rest[k] = null; });
      ["eintritt", "austritt"].forEach(k => { if (!rest[k]) rest[k] = null; });
      if (id) await req("/rest/v1/mitglieder?id=eq." + id, { method: "PATCH", auth: true, body: rest, prefer: "return=minimal" });
      else await req("/rest/v1/mitglieder", { method: "POST", auth: true, body: rest, prefer: "return=minimal" });
    },
    async mitgliederImport(liste) {
      for (let i = 0; i < liste.length; i += 200) await req("/rest/v1/mitglieder", { method: "POST", auth: true, body: liste.slice(i, i + 200), prefer: "return=minimal" });
      return liste.length;
    },
    async mitgliedLoeschen(id) { await req("/rest/v1/mitglieder?id=eq." + id, { method: "DELETE", auth: true }); },
    async vorstandListe() { return await req("/rest/v1/rpc/vorstand_liste", { method: "POST", body: {}, auth: true }); },
    async registrieren(name, email, pw) {
      const r = await fetch(base + "/auth/v1/signup", { method: "POST", headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw, data: { name } }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const m = j.msg || j.message || j.error_description || "";
        if (/already|registered|exists/i.test(m)) throw new Error("Mit dieser E-Mail gibt es schon einen Zugang oder eine Anfrage.");
        if (/not allowed|disabled/i.test(m)) throw new Error("Neue Zugänge sind gerade abgeschaltet. Bitte beim Vorstand melden.");
        if (/password/i.test(m)) throw new Error("Das Passwort ist zu kurz oder zu einfach.");
        if (/email rate limit/i.test(m)) throw new Error("Die Anfrage ist wahrscheinlich angekommen, aber Supabase konnte keine Bestätigungsmail senden. Bitte beim Vorstand melden (dort muss „Confirm email“ ausgeschaltet werden).");
        if (/rate|too many/i.test(m)) throw new Error("Zu viele Versuche in kurzer Zeit. Bitte später noch einmal.");
        throw new Error("Die Anfrage hat nicht geklappt." + (m ? " (" + m + ")" : ""));
      }
    },
    async zugangAnfragen() { return await req("/rest/v1/rpc/zugang_anfragen", { method: "POST", body: {}, auth: true }); },
    async unterstuetzer() { return (await req("/rest/v1/rpc/unterstuetzer", { method: "POST", body: {} })).map(x => x.firma); },
    async zugangFreischalten(id, name, amt) { await req("/rest/v1/rpc/zugang_freischalten", { method: "POST", body: { p_user: id, p_name: name, p_amt: amt }, auth: true }); },
    async zugangAblehnen(id) { await req("/rest/v1/rpc/zugang_ablehnen", { method: "POST", body: { p_user: id }, auth: true }); },
    async vorstandHinzufuegen(email, name) { await req("/rest/v1/rpc/vorstand_hinzufuegen", { method: "POST", body: { p_email: email, p_name: name }, auth: true }); },
    async vorstandEntfernen(id) { await req("/rest/v1/rpc/vorstand_entfernen", { method: "POST", body: { p_user: id }, auth: true }); },
    async passwortAendern(pw) {
      const s = sitzung(); const r = await fetch(base + "/auth/v1/user", { method: "PUT", headers: { apikey: C.supabaseKey, Authorization: "Bearer " + s.access_token, "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (!r.ok) { let m = ""; try { const j = await r.json(); m = j.msg || j.message || ""; } catch (e) {} throw new Error(/weak|short|least/i.test(m) ? "Das Passwort ist zu kurz oder zu einfach." : "Passwort konnte nicht geändert werden." + (m ? " (" + m + ")" : "")); }
    },
    zuruecksetzen() {}
  };

  window.FV_DATEN = Object.assign(LIVE ? Live : Demo, { live: LIVE, meine, anzeigename });
})();
