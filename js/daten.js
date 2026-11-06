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
    zuruecksetzen() { try { localStorage.removeItem("fv_demo"); localStorage.removeItem("fv_meine"); } catch (e) {} }
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
    async antrag(a) { await req("/rest/v1/mitgliedsantraege", { method: "POST", body: a, prefer: "return=minimal" }); },
    async anmelden(email, pw) {
      const r = await fetch(base + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: C.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(fehlerText(j.error_description || j.msg || "") || "Anmeldung fehlgeschlagen.");
      store.set("sitzung", { access_token: j.access_token, refresh_token: j.refresh_token, email });
      const ok = await req("/rest/v1/rpc/ist_vorstand", { method: "POST", body: {}, auth: true });
      if (!ok) { store.set("sitzung", null); throw new Error("Dieses Konto ist nicht als Vorstand freigeschaltet."); }
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
    zuruecksetzen() {}
  };

  window.FV_DATEN = Object.assign(LIVE ? Live : Demo, { live: LIVE, meine, anzeigename });
})();
