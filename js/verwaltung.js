/* ============================================================
   VERWALTUNG – nur für Vorstandskonten
   Alles, was auf der Seite steht, lässt sich hier pflegen:
   Anträge, Mitglieder, Eintragelisten, Termine, Projekte (mit Fotos),
   Vereinsdaten und Zugänge für den Vorstand.
   ============================================================ */
(function () {
  "use strict";
  const A = window.FV_APP, D = window.FV_DATEN, C = window.FV_CONFIG || {};
  const IN = () => window.FV_INHALT;
  const { esc, euro, toast, sheet, ICON, kopf, datumLang, frei, gesamt } = A;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const PREVIEW = !!window.FV_PREVIEW;
  const FARBEN = [["pink", "Pink"], ["blue", "Blau"], ["green", "Grün"], ["orange", "Orange"], ["purple", "Lila"], ["yellow", "Gelb"], ["red", "Rot"], ["teal", "Petrol"]];
  const SYMBOLE = [["stern", "Stern"], ["rutsche", "Rutsche"], ["wasser", "Wasser"], ["reck", "Turnen"], ["baum", "Baum/Garten"], ["steine", "Steine"], ["wippe", "Wippe"], ["luft", "Luft"], ["buch", "Buch"], ["theater", "Theater"], ["musik", "Musik"], ["kueche", "Küche"], ["ausflug", "Ausflug"], ["herz", "Herz"]];
  const TABS = [["antraege", "Anträge"], ["mitglieder", "Mitglieder"], ["listen", "Eintragelisten"], ["termine", "Termine"], ["projekte", "Projekte"], ["verein", "Vereinsdaten"], ["zugaenge", "Zugänge"]];
  let tab = "antraege";

  /* ---------- kleine Helfer ---------- */
  const feld = (id, label, wert, o = {}) => `<div class="field${o.cls ? " " + o.cls : ""}"><label for="${id}">${label}</label>${
    o.type === "textarea" ? `<textarea id="${id}" ${o.k ? `data-k="${o.k}"` : ""} ${o.rows ? `rows="${o.rows}"` : ""} placeholder="${esc(o.ph || "")}">${esc(wert ?? "")}</textarea>`
    : o.type === "select" ? `<select id="${id}" ${o.k ? `data-k="${o.k}"` : ""}>${o.opts.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(wert ?? "") ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`
    : `<input id="${id}" type="${o.type || "text"}" ${o.k ? `data-k="${o.k}"` : ""} value="${esc(wert ?? "")}" placeholder="${esc(o.ph || "")}" ${o.attrs || ""}>`
  }${o.hint ? `<span class="hint">${o.hint}</span>` : ""}</div>`;
  const haken = (id, label, an, k) => `<label class="check"><input type="checkbox" id="${id}" ${k ? `data-k="${k}"` : ""} ${an ? "checked" : ""}><span>${label}</span></label>`;
  function herunterladen(name, inhalt, typ) {
    if (PREVIEW) { toast("Herunterladen geht nur in der echten App."); return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([inhalt], { type: typ })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function sicherheitsfrage(ziel, text, knopf, ja) {
    ziel.innerHTML = `<div class="notice" style="margin-top:12px;background:var(--tint-red)"><div class="stack" style="--gap:8px"><p>${text}</p>
      <div class="row"><button type="button" class="btn small" style="background:var(--err);color:#fff" data-ja>${knopf}</button><button type="button" class="btn sec small" data-nein>Abbrechen</button></div></div></div>`;
    $("[data-nein]", ziel).onclick = () => ziel.innerHTML = "";
    $("[data-ja]", ziel).onclick = async () => { $("[data-ja]", ziel).disabled = true; try { await ja(); } catch (e) { toast(e.message); } };
  }
  const slug = (t) => String(t || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "eintrag";
  const eindeutig = (basis, vorhanden) => { let id = basis, n = 2; while (vorhanden.includes(id)) id = basis + "-" + n++; return id; };
  const heuteISO = () => new Date().toISOString().slice(0, 10);
  const datumDE = (iso) => iso ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("de-DE") : "";
  function datenSammeln(root) {
    const o = {};
    $$("[data-k]", root).forEach(el => {
      const pfad = el.dataset.k.split("."); let z = o;
      pfad.slice(0, -1).forEach(p => { z[p] = z[p] || {}; z = z[p]; });
      z[pfad.at(-1)] = el.type === "checkbox" ? el.checked : el.value.trim();
    });
    return o;
  }
  async function verkleinern(datei, max) {
    let quelle, w, h;
    try { quelle = await createImageBitmap(datei); w = quelle.width; h = quelle.height; }
    catch (e) { const img = new Image(); img.src = URL.createObjectURL(datei); await img.decode(); quelle = img; w = img.naturalWidth; h = img.naturalHeight; }
    const k = Math.min(1, max / Math.max(w, h));
    const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(quelle, 0, 0, c.width, c.height);
    return await new Promise(ok => c.toBlob(ok, "image/jpeg", 0.82));
  }
  const csvZelle = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';

  /* ================= Seite ================= */
  A.SEITEN.verwaltung = async (v) => {
    if (!D.angemeldet()) return anmeldung(v);
    v.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="eyebrow" style="--dot:var(--teal)">Verwaltung</span><button class="btn ghost small" id="abmelden">Abmelden</button></div>
      <div class="tabs scroll" role="tablist">${TABS.map(([k, t]) => `<button role="tab" aria-selected="${k === tab}" data-t="${k}">${t}</button>`).join("")}</div><div id="vInhalt"><p class="mute">Lädt …</p></div>`;
    $("#abmelden").onclick = async () => { await D.abmelden(); A.render(); };
    $$("[data-t]", v).forEach(b => b.onclick = () => { tab = b.dataset.t; A.render(); });
    const box = $("#vInhalt");
    try { await TAB[tab](box); }
    catch (e) { box.innerHTML = `<div class="card"><h2>Das hat nicht geklappt</h2><p class="mute" style="margin-top:6px">${esc(e.message)}</p></div>`; }
  };

  function anmeldung(v) {
    v.innerHTML = kopf("teal", "Nur für den Vorstand", "Verwaltung", D.live ? "Meldet euch mit eurem Vorstandskonto an." : "Im Vorschau-Modus lautet das Passwort „" + esc(C.demoPasswort || "demo") + "“.") +
      `<form id="login" class="card" style="max-width:420px" novalidate>
        <div class="field"><label for="l_mail">E-Mail</label><input id="l_mail" type="email" autocomplete="username" ${D.live ? "required" : `value="vorstand@beispiel.de"`}></div>
        <div class="field"><label for="l_pw">Passwort</label><input id="l_pw" type="password" autocomplete="current-password" required></div>
        <p class="err" id="l_err" hidden></p><button class="btn block" type="submit">Anmelden</button>
        <p class="small" style="text-align:center">Neu im Vorstand? <a href="#registrieren">Zugang beantragen</a></p></form>`;
    $("#login").onsubmit = async (e) => {
      e.preventDefault(); const er = $("#l_err"); er.hidden = true;
      try { await D.anmelden($("#l_mail").value.trim(), $("#l_pw").value); A.render(); } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  }

  const TAB = {};

  /* ---------- Anträge ---------- */
  TAB.antraege = async (box) => {
    const a = await D.antraege();
    const neu = a.filter(x => x.status === "neu").length;
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:8px"><h1 style="font-size:1.6rem">Mitgliedsanträge</h1>
        <button class="btn sec small" id="csvBtn" ${a.length ? "" : "disabled"}>${ICON.install}Als Tabelle (CSV)</button></div>
      <p class="mute" style="margin-bottom:12px">${a.length} Anträge, davon ${neu} neu. Mit „Übernehmen“ landet ein Antrag in der Mitgliederliste und wird auf „angenommen“ gesetzt.</p>
      ${a.length ? `<div class="tablewrap"><table><thead><tr><th>Eingang</th><th>Name</th><th>Ort</th><th>E-Mail</th><th>Beitrag</th><th>Newsletter</th><th>IBAN</th><th>Status</th><th></th></tr></thead><tbody>
        ${a.map(x => `<tr><td class="tnum">${new Date(x.erstellt).toLocaleDateString("de-DE")}</td><td>${esc(x.vorname)} ${esc(x.nachname)}${x.kind ? `<br><span class="mute small">${esc(x.kind)}</span>` : ""}</td>
          <td>${esc(x.plz)} ${esc(x.ort)}</td><td>${esc(x.email)}</td><td class="tnum">${euro(+x.beitrag)}</td><td>${x.newsletter ? "ja" : "–"}</td><td class="tnum">${esc(String(x.iban).replace(/(.{4})/g, "$1 "))}</td>
          <td><select data-st="${esc(x.id)}" aria-label="Status">${["neu", "angenommen", "abgelehnt"].map(s => `<option ${s === x.status ? "selected" : ""}>${s}</option>`).join("")}</select></td>
          <td>${x.status === "neu" ? `<button class="btn small green" data-ueb="${esc(x.id)}">Übernehmen</button>` : ""}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card"><p class="mute">Noch keine Anträge eingegangen.</p></div>`}`;
    $$("[data-st]", box).forEach(s => s.onchange = async () => { try { await D.antragStatus(s.dataset.st, s.value); toast("Status gespeichert"); } catch (e) { toast(e.message); } });
    $$("[data-ueb]", box).forEach(b => b.onclick = async () => {
      const x = a.find(y => y.id === b.dataset.ueb); b.disabled = true;
      try {
        await D.mitgliedSpeichern({ vorname: x.vorname, nachname: x.nachname, strasse: x.strasse, plz: x.plz, ort: x.ort, email: x.email, telefon: x.telefon || "", kind: x.kind || "",
          beitrag: +x.beitrag, newsletter: !!x.newsletter, kontoinhaber: x.kontoinhaber, iban: x.iban, eintritt: heuteISO(), status: "aktiv", antrag_id: D.live ? x.id : null });
        await D.antragStatus(x.id, "angenommen"); toast(x.vorname + " ist jetzt in der Mitgliederliste"); A.render();
      } catch (e) { toast(e.message); b.disabled = false; }
    });
    const cb = $("#csvBtn"); if (cb) cb.onclick = () => {
      const cols = ["erstellt", "vorname", "nachname", "strasse", "plz", "ort", "email", "telefon", "kind", "beitrag", "newsletter", "kontoinhaber", "iban", "status"];
      herunterladen("mitgliedsantraege_" + heuteISO() + ".csv", "﻿" + [cols.join(";"), ...a.map(x => cols.map(c => csvZelle(x[c])).join(";"))].join("\r\n"), "text/csv;charset=utf-8");
    };
  };

  /* ---------- Mitglieder ---------- */
  const M_FELDER = ["mitgliedsnr", "vorname", "nachname", "strasse", "plz", "ort", "email", "telefon", "kind", "beitrag", "newsletter", "kontoinhaber", "iban", "bic", "bank", "mandatsreferenz", "eintritt", "austritt", "status", "notiz"];
  let mFilter = { q: "", status: "aktiv" };
  TAB.mitglieder = async (box) => {
    const alle = await D.mitglieder();
    const aktiv = alle.filter(m => m.status !== "ausgetreten");
    const summe = aktiv.reduce((s, m) => s + (+m.beitrag || 0), 0);
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:8px"><h1 style="font-size:1.6rem">Mitglieder</h1>
        <div class="row"><button class="btn small" id="mNeu">${ICON.plus}Neues Mitglied</button><button class="btn sec small" id="mImport">Importieren</button><button class="btn sec small" id="mExport" ${alle.length ? "" : "disabled"}>${ICON.install}Export (CSV)</button></div></div>
      <div class="facts"><div><dt>Aktive Mitglieder</dt><dd class="tnum">${aktiv.length}</dd></div><div><dt>Beiträge gesamt</dt><dd class="tnum">${euro(summe)}</dd></div><div><dt>Newsletter</dt><dd class="tnum">${aktiv.filter(m => m.newsletter).length}</dd></div></div>
      <div class="row" style="margin-bottom:12px"><input type="text" id="mSuche" placeholder="Suchen nach Name, Ort, E-Mail …" value="${esc(mFilter.q)}" style="flex:1 1 220px">
        <select id="mStatus" style="flex:0 0 auto;width:auto">${[["aktiv", "Aktive"], ["ausgetreten", "Ausgetretene"], ["alle", "Alle"]].map(([k, t]) => `<option value="${k}" ${k === mFilter.status ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div id="mListe"></div>`;
    const zeichnen = () => {
      const q = mFilter.q.toLowerCase();
      const liste = alle.filter(m => (mFilter.status === "alle" || (mFilter.status === "aktiv" ? m.status !== "ausgetreten" : m.status === "ausgetreten")) &&
        (!q || [m.vorname, m.nachname, m.ort, m.email, m.kind, m.mitgliedsnr].join(" ").toLowerCase().includes(q)));
      $("#mListe", box).innerHTML = liste.length ? `<p class="mute small" style="margin-bottom:6px">${liste.length} Einträge</p><div class="tablewrap"><table><thead><tr><th>Nr.</th><th>Name</th><th>Ort</th><th>E-Mail</th><th>Beitrag</th><th>NL</th><th>Eintritt</th><th>Status</th><th></th></tr></thead><tbody>
        ${liste.map(m => `<tr><td class="tnum">${esc(m.mitgliedsnr || "")}</td><td>${esc(m.nachname)}, ${esc(m.vorname)}${m.kind ? `<br><span class="mute small">${esc(m.kind)}</span>` : ""}</td><td>${esc(m.plz || "")} ${esc(m.ort || "")}</td><td>${esc(m.email || "")}</td>
          <td class="tnum">${m.beitrag != null && m.beitrag !== "" ? euro(+m.beitrag) : "–"}</td><td>${m.newsletter ? "ja" : "–"}</td><td class="tnum">${datumDE(m.eintritt)}</td><td>${m.status === "ausgetreten" ? "ausgetreten" : "aktiv"}</td>
          <td><button class="btn sec small" data-ed="${esc(m.id)}">Bearbeiten</button></td></tr>`).join("")}</tbody></table></div>`
        : `<div class="card"><p class="mute">${alle.length ? "Keine Treffer." : "Noch keine Mitglieder eingetragen. Legt das erste an oder importiert eine bestehende Liste (Excel oder CSV)."}</p></div>`;
      $$("[data-ed]", box).forEach(b => b.onclick = () => mitgliedForm(alle.find(m => m.id === b.dataset.ed)));
    };
    zeichnen();
    $("#mSuche", box).oninput = (e) => { mFilter.q = e.target.value; zeichnen(); };
    $("#mStatus", box).onchange = (e) => { mFilter.status = e.target.value; zeichnen(); };
    $("#mNeu", box).onclick = () => mitgliedForm(null);
    $("#mImport", box).onclick = () => importDialog(alle);
    $("#mExport", box).onclick = () => herunterladen("mitglieder_" + heuteISO() + ".csv",
      "﻿" + [M_FELDER.join(";"), ...alle.map(m => M_FELDER.map(f => csvZelle(f === "newsletter" ? (m[f] ? "ja" : "nein") : f === "beitrag" && m[f] != null ? String(m[f]).replace(".", ",") : m[f])).join(";"))].join("\r\n"), "text/csv;charset=utf-8");
  };

  function mitgliedForm(m) {
    const neu = !m; m = m || { status: "aktiv", eintritt: heuteISO(), newsletter: false };
    const V = IN().verein;
    sheet(`<h2>${neu ? "Neues Mitglied" : esc(m.vorname + " " + m.nachname)}</h2>
      <form id="mf" style="margin-top:12px" novalidate>
        <div class="cols">${feld("m_vn", "Vorname", m.vorname, { k: "vorname" })}${feld("m_nn", "Nachname", m.nachname, { k: "nachname" })}</div>
        ${feld("m_str", "Straße und Hausnummer", m.strasse, { k: "strasse" })}
        <div class="cols plz">${feld("m_plz", "PLZ", m.plz, { k: "plz", attrs: 'inputmode="numeric" maxlength="5"' })}${feld("m_ort", "Ort", m.ort, { k: "ort" })}</div>
        <div class="cols">${feld("m_mail", "E-Mail", m.email, { k: "email", type: "email" })}${feld("m_tel", "Telefon", m.telefon, { k: "telefon", type: "tel" })}</div>
        ${feld("m_kind", "Kind / Gruppe", m.kind, { k: "kind" })}
        <div class="cols">${feld("m_beitrag", "Beitrag in € " + esc(V.beitragZeitraum || "pro Jahr"), m.beitrag ?? "", { k: "beitrag", attrs: 'inputmode="decimal"' })}${feld("m_nr", "Mitgliedsnummer", m.mitgliedsnr, { k: "mitgliedsnr" })}</div>
        ${haken("m_nl", "Newsletter erwünscht", m.newsletter, "newsletter")}
        <fieldset><legend>Bankverbindung</legend>
          ${feld("m_ki", "Kontoinhaber/in", m.kontoinhaber, { k: "kontoinhaber" })}
          ${feld("m_iban", "IBAN", m.iban ? String(m.iban).replace(/(.{4})/g, "$1 ").trim() : "", { k: "iban" })}
          <div class="cols">${feld("m_bic", "BIC", m.bic, { k: "bic" })}${feld("m_bank", "Bank", m.bank, { k: "bank" })}</div>
          ${feld("m_mref", "Mandatsreferenz", m.mandatsreferenz, { k: "mandatsreferenz" })}
        </fieldset>
        <fieldset><legend>Mitgliedschaft</legend>
          <div class="cols">${feld("m_ein", "Eintritt", m.eintritt || "", { k: "eintritt", type: "date" })}${feld("m_aus", "Austritt", m.austritt || "", { k: "austritt", type: "date" })}</div>
          ${feld("m_st", "Status", m.status || "aktiv", { k: "status", type: "select", opts: [["aktiv", "aktiv"], ["ausgetreten", "ausgetreten"]] })}
          ${feld("m_notiz", "Notiz", m.notiz, { k: "notiz", type: "textarea", rows: 2 })}
        </fieldset>
        <p class="err" id="mf_err" hidden></p>
        <div class="row"><button class="btn" type="submit">Speichern</button><button class="btn sec" type="button" data-zu>Abbrechen</button>${neu ? "" : `<button class="btn ghost" type="button" id="mDel" style="color:var(--err)">Löschen</button>`}</div>
        <div id="mDelBox"></div></form>`, (bg, zu) => {
      const f = $("#mf", bg);
      $("#m_aus", bg).onchange = (e) => { if (e.target.value) $("#m_st", bg).value = "ausgetreten"; };
      f.onsubmit = async (e) => {
        e.preventDefault(); const er = $("#mf_err", bg); er.hidden = true;
        const d = datenSammeln(f);
        if (!d.vorname && !d.nachname) { er.textContent = "Bitte mindestens einen Namen eintragen."; er.hidden = false; return; }
        d.iban = d.iban.replace(/\s+/g, "").toUpperCase(); d.bic = d.bic.toUpperCase();
        d.beitrag = d.beitrag === "" ? null : parseFloat(String(d.beitrag).replace(",", "."));
        if (d.beitrag != null && isNaN(d.beitrag)) { er.textContent = "Beitrag bitte als Zahl eintragen, z. B. 24."; er.hidden = false; return; }
        try { await D.mitgliedSpeichern({ ...(neu ? {} : { id: m.id }), ...d }); zu(); toast("Gespeichert"); A.render(); }
        catch (ex) { er.textContent = ex.message; er.hidden = false; }
      };
      const del = $("#mDel", bg);
      if (del) del.onclick = () => sicherheitsfrage($("#mDelBox", bg), `<b>${esc(m.vorname)} ${esc(m.nachname)} wirklich löschen?</b> Für Ausgetretene besser den Status auf „ausgetreten“ setzen, damit die Daten für die Aufbewahrungsfrist erhalten bleiben.`, "Endgültig löschen",
        async () => { await D.mitgliedLoeschen(m.id); zu(); toast("Gelöscht"); A.render(); });
    });
  }

  /* Import aus CSV oder Excel */
  const SPALTEN = {
    mitgliedsnr: ["nr", "mitgliedsnr", "mitgliedsnummer", "nummer", "mitgliednr"], vorname: ["vorname", "firstname"], nachname: ["nachname", "familienname", "lastname", "zuname"],
    name: ["name", "vornamename", "namevorname", "vollername"], strasse: ["strasse", "strassehausnummer", "strassenr", "adresse", "anschrift", "str"], plz: ["plz", "postleitzahl"],
    ort: ["ort", "wohnort", "stadt", "plzort"], email: ["email", "emailadresse", "mail"], telefon: ["telefon", "tel", "handy", "mobil", "telefonnummer", "mobilnummer"],
    kind: ["kind", "kinder", "gruppe", "kindgruppe", "namedeskindes"], beitrag: ["beitrag", "jahresbeitrag", "betrag", "mitgliedsbeitrag", "beitrageuro"], newsletter: ["newsletter", "emailnewsletter"],
    kontoinhaber: ["kontoinhaber", "inhaber", "kontoinhaberin"], iban: ["iban"], bic: ["bic"], bank: ["bank", "kreditinstitut", "geldinstitut"], mandatsreferenz: ["mandatsreferenz", "mandat", "mandatsref"],
    eintritt: ["eintritt", "eintrittsdatum", "mitgliedseit", "beitritt", "beitrittsdatum", "datum"], austritt: ["austritt", "austrittsdatum", "kuendigung"], status: ["status"], notiz: ["notiz", "bemerkung", "anmerkung", "hinweis", "bemerkungen"]
  };
  const norm = (t) => String(t || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
  function csvLesen(text) {
    text = text.replace(/^﻿/, "");
    const erste = text.split(/\r?\n/)[0] || "";
    const trenner = [";", ",", "\t"].sort((a, b) => erste.split(b).length - erste.split(a).length)[0];
    const zeilen = []; let z = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === trenner) { z.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; z.push(f); zeilen.push(z); z = []; f = ""; }
      else f += c;
    }
    if (f || z.length) { z.push(f); zeilen.push(z); }
    return zeilen.filter(r => r.some(x => String(x).trim()));
  }
  function ladeSkript(src) { return new Promise((ok, bad) => { if (window.XLSX) return ok(); const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("Excel-Leser konnte nicht geladen werden.")); document.head.appendChild(s); }); }
  async function dateiLesen(datei) {
    if (/\.(xlsx|xlsm|xls|ods)$/i.test(datei.name)) {
      await ladeSkript("vendor/xlsx.mini.min.js");
      const wb = window.XLSX.read(await datei.arrayBuffer(), { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" }).filter(r => r.some(x => String(x).trim()));
    }
    const buf = await datei.arrayBuffer();
    let text = new TextDecoder("utf-8").decode(buf);
    if (text.includes("�")) text = new TextDecoder("windows-1252").decode(buf); // ältere Excel-CSV
    return csvLesen(text);
  }
  function wertDatum(v) {
    if (!v) return null;
    if (v instanceof Date && !isNaN(v)) return new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const s = String(v).trim(); let m;
    if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/))) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return m[0];
    if (/^\d{5}$/.test(s)) { const d = new Date(Date.UTC(1899, 11, 30) + +s * 86400000); return d.toISOString().slice(0, 10); }
    return null;
  }
  function zeilenZuMitgliedern(zeilen) {
    const kopfzeile = zeilen[0].map(norm);
    const zuordnung = {}; const unbekannt = [];
    kopfzeile.forEach((h, i) => { const k = Object.keys(SPALTEN).find(k => SPALTEN[k].includes(h)); if (k && zuordnung[k] === undefined) zuordnung[k] = i; else if (h) unbekannt.push(zeilen[0][i]); });
    if (zuordnung.name !== undefined && zuordnung.nachname === undefined && zuordnung.vorname !== undefined) { zuordnung.nachname = zuordnung.name; delete zuordnung.name; }
    const liste = zeilen.slice(1).map(r => {
      const g = (k) => zuordnung[k] === undefined ? "" : r[zuordnung[k]];
      const s = (k) => String(g(k) ?? "").trim();
      const m = {};
      ["mitgliedsnr", "vorname", "nachname", "strasse", "plz", "ort", "email", "telefon", "kind", "kontoinhaber", "bic", "bank", "mandatsreferenz", "notiz"].forEach(k => m[k] = s(k));
      if (zuordnung.name !== undefined && !m.vorname && !m.nachname) {
        const n = s("name");
        if (n.includes(",")) { const [a, b] = n.split(","); m.nachname = a.trim(); m.vorname = (b || "").trim(); }
        else { const t = n.split(/\s+/); m.nachname = t.pop() || ""; m.vorname = t.join(" "); }
      }
      if (zuordnung.ort !== undefined && !m.plz) { const t = m.ort.match(/^(\d{5})\s+(.*)$/); if (t) { m.plz = t[1]; m.ort = t[2]; } }
      m.plz = m.plz.replace(/\.0$/, "");
      m.iban = s("iban").replace(/\s+/g, "").toUpperCase(); m.bic = m.bic.toUpperCase();
      const b = g("beitrag"); m.beitrag = b === "" || b == null ? null : (typeof b === "number" ? b : parseFloat(String(b).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")));
      if (isNaN(m.beitrag)) m.beitrag = null;
      m.newsletter = /^(ja|j|x|1|true|yes|wahr)$/i.test(s("newsletter"));
      m.eintritt = wertDatum(g("eintritt")); m.austritt = wertDatum(g("austritt"));
      m.status = /aus|gek|inaktiv/i.test(s("status")) || m.austritt ? "ausgetreten" : "aktiv";
      return m;
    }).filter(m => m.vorname || m.nachname);
    return { liste, zuordnung, unbekannt };
  }
  function importDialog(vorhanden) {
    const NAMEN = { mitgliedsnr: "Nr.", vorname: "Vorname", nachname: "Nachname", name: "Name", strasse: "Straße", plz: "PLZ", ort: "Ort", email: "E-Mail", telefon: "Telefon", kind: "Kind/Gruppe", beitrag: "Beitrag", newsletter: "Newsletter", kontoinhaber: "Kontoinhaber", iban: "IBAN", bic: "BIC", bank: "Bank", mandatsreferenz: "Mandatsreferenz", eintritt: "Eintritt", austritt: "Austritt", status: "Status", notiz: "Notiz" };
    sheet(`<h2>Mitgliederliste importieren</h2>
      <div class="stack" style="--gap:12px;margin-top:12px">
        <p class="mute small">Excel-Datei (.xlsx) oder CSV. Die erste Zeile muss Spaltenüberschriften enthalten, z. B. <b>Vorname, Nachname, Straße, PLZ, Ort, E-Mail, Beitrag, IBAN, Eintritt</b>. Die Reihenfolge ist egal, fehlende Spalten bleiben leer.</p>
        <div class="field"><label for="imp_datei">Datei auswählen</label><input id="imp_datei" type="file" accept=".xlsx,.xlsm,.xls,.ods,.csv,.txt,text/csv"></div>
        <div id="imp_vorschau"></div></div>`, (bg, zu) => {
      $("#imp_datei", bg).onchange = async (e) => {
        const datei = e.target.files[0]; if (!datei) return;
        const ziel = $("#imp_vorschau", bg); ziel.innerHTML = `<p class="mute">Lese Datei …</p>`;
        try {
          const zeilen = await dateiLesen(datei);
          if (zeilen.length < 2) throw new Error("Die Datei enthält keine Datenzeilen.");
          const { liste, zuordnung, unbekannt } = zeilenZuMitgliedern(zeilen);
          if (!liste.length) throw new Error("Keine Namen gefunden. Heißen die Spalten „Vorname“ und „Nachname“ bzw. „Name“?");
          const schluessel = (m) => (m.vorname + "|" + m.nachname + "|" + (m.email || "")).toLowerCase();
          const da = new Set(vorhanden.map(schluessel));
          const neu = liste.filter(m => !da.has(schluessel(m))), doppelt = liste.length - neu.length;
          const ohneIban = neu.filter(m => !m.iban).length;
          ziel.innerHTML = `<div class="notice">${ICON.info}<div class="stack" style="--gap:6px"><p><b>${neu.length} neue Mitglieder</b> erkannt${doppelt ? `, ${doppelt} sind schon vorhanden und werden übersprungen` : ""}.</p>
              <p class="small">Erkannte Spalten: ${Object.keys(zuordnung).map(k => NAMEN[k]).join(", ")}${unbekannt.length ? `<br>Nicht übernommen: ${unbekannt.map(esc).join(", ")}` : ""}${ohneIban ? `<br>${ohneIban} ohne IBAN` : ""}</p></div></div>
            <div class="tablewrap" style="margin-top:10px"><table><thead><tr><th>Name</th><th>Ort</th><th>E-Mail</th><th>Beitrag</th><th>IBAN</th><th>Eintritt</th></tr></thead><tbody>
              ${neu.slice(0, 8).map(m => `<tr><td>${esc(m.nachname)}, ${esc(m.vorname)}</td><td>${esc(m.plz)} ${esc(m.ort)}</td><td>${esc(m.email)}</td><td class="tnum">${m.beitrag != null ? euro(m.beitrag) : "–"}</td><td class="tnum">${m.iban ? esc(m.iban.slice(0, 4) + " … " + m.iban.slice(-4)) : "–"}</td><td class="tnum">${datumDE(m.eintritt)}</td></tr>`).join("")}
            </tbody></table></div>${neu.length > 8 ? `<p class="mute small" style="margin-top:6px">… und ${neu.length - 8} weitere</p>` : ""}
            <div class="row" style="margin-top:12px"><button class="btn green" id="imp_los" ${neu.length ? "" : "disabled"}>${neu.length} Mitglieder importieren</button><button class="btn sec" data-zu>Abbrechen</button></div>`;
          $("#imp_los", bg).onclick = async (ev) => {
            ev.target.disabled = true; ev.target.textContent = "Importiere …";
            try { const n = await D.mitgliederImport(neu); zu(); toast(n + " Mitglieder importiert"); A.render(); }
            catch (ex) { toast(ex.message); ev.target.disabled = false; ev.target.textContent = "Erneut versuchen"; }
          };
        } catch (ex) { ziel.innerHTML = `<p class="err">${esc(ex.message)}</p>`; }
      };
    });
  }

  /* ---------- Eintragelisten ---------- */
  TAB.listen = async (box, bearbeiten) => {
    const listen = await D.listen({ alle: true });
    if (bearbeiten !== undefined) return listeEditor(box, listen.find(l => l.id === bearbeiten) || null);
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="font-size:1.6rem">Eintragelisten</h1>
        <button class="btn small" id="neuBtn">${ICON.plus}Neue Liste</button></div>
      <div class="list">${listen.map(l => `<div class="card"><div class="row" style="justify-content:space-between"><div style="min-width:0"><h3>${esc(l.titel)}</h3>
          <p class="mute small">${l.datum ? datumLang(l.datum) + " · " : ""}${gesamt(l) - frei(l)} von ${gesamt(l)} Plätzen belegt · ${l.aktiv ? "offen" : "geschlossen"}</p></div>
          <div class="row"><button class="btn sec small" data-ed="${esc(l.id)}">Bearbeiten</button><button class="btn sec small" data-ei="${esc(l.id)}">Einträge</button><a class="btn ghost small" href="#aushang-${esc(l.id)}">Aushang</a></div></div>
          <div data-eibox="${esc(l.id)}"></div></div>`).join("") || `<div class="card"><p class="mute">Noch keine Listen. Legt die erste an.</p></div>`}</div>`;
    $("#neuBtn", box).onclick = () => TAB.listen(box, null);
    $$("[data-ed]", box).forEach(b => b.onclick = () => TAB.listen(box, b.dataset.ed));
    $$("[data-ei]", box).forEach(b => b.onclick = async () => {
      const l = listen.find(x => x.id === b.dataset.ei); const ziel = $$("[data-eibox]", box).find(x => x.dataset.eibox === l.id);
      if (ziel.innerHTML) { ziel.innerHTML = ""; return; }
      const e = await D.eintraegeVoll(l.id);
      ziel.innerHTML = `<div class="tablewrap" style="margin-top:12px"><table><thead><tr><th>Aufgabe</th><th>Name</th><th>Kontakt</th><th></th></tr></thead><tbody>
        ${l.plaetze.flatMap(p => e.filter(x => x.platz_id === p.id).map(x => `<tr><td>${esc(p.bezeichnung)} <span class="mute small">${esc(p.zeit || "")}</span></td><td>${esc(x.name)}</td><td>${esc(x.kontakt || "")}</td><td><button class="btn ghost small" data-del="${esc(x.id)}">Entfernen</button></td></tr>`)).join("") || `<tr><td colspan="4" class="mute">Noch niemand eingetragen.</td></tr>`}
        </tbody></table></div>`;
      $$("[data-del]", ziel).forEach(d => d.onclick = async () => { await D.eintragLoeschen(d.dataset.del); toast("Eintrag entfernt"); ziel.innerHTML = ""; b.click(); });
    });
  };

  function listeEditor(box, l) {
    const neu = !l;
    l = l || { titel: "", datum: "", beschreibung: "", aktiv: true, plaetze: [{ bezeichnung: "", zeit: "", anzahl: 2 }] };
    const plaetze = l.plaetze.map(p => ({ id: p.id, bezeichnung: p.bezeichnung, zeit: p.zeit, anzahl: p.anzahl }));
    const zeilen = () => plaetze.map((p, i) => `<div class="slot-edit">
        <div class="field"><label for="p_b${i}">Aufgabe</label><input id="p_b${i}" type="text" value="${esc(p.bezeichnung)}" data-i="${i}" data-f="bezeichnung" placeholder="z. B. Aufsicht Hof"></div>
        <div class="field"><label for="p_z${i}">Zeit</label><input id="p_z${i}" type="text" value="${esc(p.zeit)}" data-i="${i}" data-f="zeit" placeholder="14–16 Uhr"></div>
        <div class="field"><label for="p_a${i}">Plätze</label><input id="p_a${i}" type="number" min="1" max="99" value="${p.anzahl}" data-i="${i}" data-f="anzahl"></div>
        <button type="button" class="iconbtn" data-rm="${i}" aria-label="Aufgabe entfernen" ${plaetze.length < 2 ? "disabled" : ""}>${ICON.x}</button></div>`).join("");
    box.innerHTML = `<button class="btn ghost" id="zur">${ICON.zurueck}Alle Listen</button>
      <form id="lf" class="card" style="margin-top:8px" novalidate><h1 style="font-size:1.5rem">${neu ? "Neue Liste" : "Liste bearbeiten"}</h1>
        <div class="cols">${feld("l_t", "Titel", l.titel, { ph: "z. B. Sommerfest" })}${feld("l_d", "Datum", l.datum || "", { type: "date" })}</div>
        ${feld("l_b", "Hinweis für die Eltern", l.beschreibung, { type: "textarea" })}
        ${haken("l_a", "Liste ist offen zum Eintragen", l.aktiv)}
        <fieldset><legend>Aufgaben</legend><div id="pz" class="stack" style="--gap:10px">${zeilen()}</div>
          <div><button type="button" class="btn sec small" id="plus">${ICON.plus}Aufgabe hinzufügen</button></div></fieldset>
        <p class="mute small">Wird eine Aufgabe entfernt, werden auch die Eintragungen darin gelöscht.</p>
        <p class="err" id="lf_err" hidden></p>
        <div class="row"><button class="btn" type="submit">Speichern</button>${neu ? "" : `<button class="btn sec" type="button" id="loeschen" style="color:var(--err)">Liste löschen</button>`}</div>
        <div id="sicher"></div></form>`;
    const pz = $("#pz", box);
    const binden = () => {
      $$("[data-f]", pz).forEach(inp => inp.oninput = () => { plaetze[+inp.dataset.i][inp.dataset.f] = inp.dataset.f === "anzahl" ? +inp.value : inp.value; });
      $$("[data-rm]", pz).forEach(b => b.onclick = () => { plaetze.splice(+b.dataset.rm, 1); pz.innerHTML = zeilen(); binden(); });
    };
    binden();
    $("#plus", box).onclick = () => { plaetze.push({ bezeichnung: "", zeit: "", anzahl: 1 }); pz.innerHTML = zeilen(); binden(); $(`#p_b${plaetze.length - 1}`, box).focus(); };
    $("#zur", box).onclick = () => TAB.listen(box);
    const lb = $("#loeschen", box);
    if (lb) lb.onclick = () => sicherheitsfrage($("#sicher", box), "<b>Liste wirklich löschen?</b> Alle Eintragungen gehen verloren.", "Endgültig löschen",
      async () => { await D.listeLoeschen(l.id); toast("Liste gelöscht"); TAB.listen(box); });
    $("#lf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#lf_err", box);
      const titel = $("#l_t", box).value.trim();
      const ps = plaetze.filter(p => String(p.bezeichnung).trim());
      if (titel.length < 2) { er.textContent = "Bitte einen Titel eingeben."; er.hidden = false; return; }
      if (!ps.length) { er.textContent = "Mindestens eine Aufgabe eintragen."; er.hidden = false; return; }
      try {
        await D.listeSpeichern({ id: l.id, titel, datum: $("#l_d", box).value, beschreibung: $("#l_b", box).value.trim(), aktiv: $("#l_a", box).checked,
          plaetze: ps.map(p => ({ id: p.id, bezeichnung: p.bezeichnung.trim(), zeit: String(p.zeit || "").trim(), anzahl: Math.max(1, Math.min(99, +p.anzahl || 1)) })) });
        toast("Liste gespeichert"); TAB.listen(box);
      } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  }

  /* ---------- Termine ---------- */
  TAB.termine = async (box, bearbeiten) => {
    const termine = (IN().termine || []).slice().sort((a, b) => String(a.datum).localeCompare(String(b.datum)));
    if (bearbeiten !== undefined) return terminEditor(box, termine.find(t => t.id === bearbeiten) || null);
    const h = A.heute();
    const zeile = (t) => `<div class="card row" style="justify-content:space-between;--dot:var(--${t.farbe || "blue"})"><div style="min-width:0"><span class="eyebrow">${esc(datumLang(t.datum))}${t.von ? ", " + esc(t.von) + " Uhr" : ""}</span><h3>${esc(t.titel)}</h3><p class="mute small">${esc(t.ort || "")}</p></div>
      <button class="btn sec small" data-ed="${esc(t.id)}">Bearbeiten</button></div>`;
    const kommend = termine.filter(t => A.dt(t.datum) >= h), alt = termine.filter(t => A.dt(t.datum) < h);
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="font-size:1.6rem">Termine</h1><button class="btn small" id="tNeu">${ICON.plus}Neuer Termin</button></div>
      <div class="list">${kommend.map(zeile).join("") || `<div class="card"><p class="mute">Keine kommenden Termine.</p></div>`}</div>
      ${alt.length ? `<h2 class="month">Vergangen</h2><div class="list past">${alt.reverse().map(zeile).join("")}</div>` : ""}`;
    $("#tNeu", box).onclick = () => TAB.termine(box, null);
    $$("[data-ed]", box).forEach(b => b.onclick = () => TAB.termine(box, b.dataset.ed));
  };
  async function terminEditor(box, t) {
    const neu = !t; t = t || { titel: "", datum: "", von: "", bis: "", ort: "", text: "", farbe: "orange", liste: "" };
    let listen = []; try { listen = await D.listen({ alle: true }); } catch (e) {}
    box.innerHTML = `<button class="btn ghost" id="zur">${ICON.zurueck}Alle Termine</button>
      <form id="tf" class="card" style="margin-top:8px" novalidate><h1 style="font-size:1.5rem">${neu ? "Neuer Termin" : "Termin bearbeiten"}</h1>
        ${feld("t_titel", "Titel", t.titel, { k: "titel", ph: "z. B. Sommerfest" })}
        <div class="cols">${feld("t_datum", "Datum", t.datum, { k: "datum", type: "date" })}${feld("t_ort", "Ort", t.ort, { k: "ort", ph: "z. B. Kita St. Lucia" })}</div>
        <div class="cols">${feld("t_von", "Beginn", t.von, { k: "von", type: "time" })}${feld("t_bis", "Ende (freiwillig)", t.bis, { k: "bis", type: "time" })}</div>
        ${feld("t_text", "Beschreibung", t.text, { k: "text", type: "textarea" })}
        <div class="cols">${feld("t_farbe", "Farbe", t.farbe, { k: "farbe", type: "select", opts: FARBEN })}
          ${feld("t_liste", "Eintrageliste dazu", t.liste || "", { k: "liste", type: "select", opts: [["", "– keine –"], ...listen.map(l => [l.id, l.titel + (l.datum ? " (" + datumLang(l.datum) + ")" : "")])], hint: "Zeigt beim Termin einen Knopf „Helfen“." })}</div>
        <p class="err" id="tf_err" hidden></p>
        <div class="row"><button class="btn" type="submit">Speichern</button>${neu ? "" : `<button class="btn sec" type="button" id="tDel" style="color:var(--err)">Termin löschen</button>`}</div>
        <div id="sicher"></div></form>`;
    $("#zur", box).onclick = () => TAB.termine(box);
    const speichern = async (arr) => { await D.inhaltSpeichern("termine", arr); A.aktualisieren({ termine: arr }); };
    const del = $("#tDel", box);
    if (del) del.onclick = () => sicherheitsfrage($("#sicher", box), "<b>Termin wirklich löschen?</b>", "Löschen", async () => { await speichern(IN().termine.filter(x => x.id !== t.id)); toast("Termin gelöscht"); });
    $("#tf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#tf_err", box); er.hidden = true;
      const d = datenSammeln($("#tf", box));
      if (d.titel.length < 2 || !d.datum) { er.textContent = "Bitte Titel und Datum eintragen."; er.hidden = false; return; }
      const arr = (IN().termine || []).slice();
      if (neu) arr.push({ ...d, id: eindeutig(slug(d.titel) + "-" + d.datum.slice(0, 4), arr.map(x => x.id)) });
      else { const i = arr.findIndex(x => x.id === t.id); arr[i] = { ...arr[i], ...d }; }
      try { await speichern(arr); toast("Termin gespeichert"); } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  }

  /* ---------- Projekte ---------- */
  TAB.projekte = async (box, bearbeiten) => {
    const projekte = IN().projekte || [];
    if (bearbeiten !== undefined) return projektEditor(box, projekte.find(p => p.id === bearbeiten) || null);
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="font-size:1.6rem">Projekte</h1><button class="btn small" id="pNeu">${ICON.plus}Neues Projekt</button></div>
      <p class="mute small" style="margin-bottom:12px">Die Reihenfolge hier ist auch die Reihenfolge auf der Seite. Die ersten beiden erscheinen auf der Startseite.</p>
      <div class="list">${projekte.map((p, i) => `<div class="card row" style="justify-content:space-between;--dot:var(--${p.farbe || "blue"});--tint:var(--tint-${p.farbe || "blue"})">
          <div class="row" style="min-width:0;flex:1 1 220px;flex-wrap:nowrap">${p.bild ? `<img src="${esc(p.bild)}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:12px;flex:none">` : `<span class="badge" style="width:52px;height:52px;border-radius:12px;background:var(--tint);color:var(--dot);display:grid;place-items:center;flex:none">${ICON[p.symbol] || ICON.stern}</span>`}
            <div style="min-width:0"><h3>${esc(p.titel)}</h3><p class="mute small">${[p.jahr, p.betrag ? euro(+p.betrag) : ""].filter(Boolean).join(" · ") || "ohne Jahr und Betrag"}</p></div></div>
          <div class="row"><button class="iconbtn" data-up="${i}" aria-label="Nach oben" ${i ? "" : "disabled"}>▲</button><button class="iconbtn" data-down="${i}" aria-label="Nach unten" ${i < projekte.length - 1 ? "" : "disabled"}>▼</button><button class="btn sec small" data-ed="${esc(p.id)}">Bearbeiten</button></div></div>`).join("") || `<div class="card"><p class="mute">Noch keine Projekte.</p></div>`}</div>`;
    $("#pNeu", box).onclick = () => TAB.projekte(box, null);
    $$("[data-ed]", box).forEach(b => b.onclick = () => TAB.projekte(box, b.dataset.ed));
    const schieben = async (i, d) => { const arr = projekte.slice(); [arr[i], arr[i + d]] = [arr[i + d], arr[i]]; try { await D.inhaltSpeichern("projekte", arr); A.aktualisieren({ projekte: arr }); } catch (e) { toast(e.message); } };
    $$("[data-up]", box).forEach(b => b.onclick = () => schieben(+b.dataset.up, -1));
    $$("[data-down]", box).forEach(b => b.onclick = () => schieben(+b.dataset.down, 1));
  };
  function projektEditor(box, p) {
    const neu = !p; p = p || { titel: "", jahr: "", betrag: "", farbe: "pink", symbol: "stern", kurz: "", text: [], partner: "", bild: "" };
    let bild = p.bild || "";
    box.innerHTML = `<button class="btn ghost" id="zur">${ICON.zurueck}Alle Projekte</button>
      <form id="pf" class="card" style="margin-top:8px" novalidate><h1 style="font-size:1.5rem">${neu ? "Neues Projekt" : "Projekt bearbeiten"}</h1>
        ${feld("p_titel", "Titel", p.titel, { k: "titel", ph: "z. B. Neue Fahrzeuge für den Hof" })}
        ${feld("p_kurz", "Kurzbeschreibung (ein Satz)", p.kurz, { k: "kurz" })}
        ${feld("p_text", "Ausführlicher Text", (p.text || []).join("\n\n"), { k: "text", type: "textarea", rows: 5, hint: "Leerzeile = neuer Absatz." })}
        <div class="cols">${feld("p_jahr", "Jahr (freiwillig)", p.jahr || "", { k: "jahr", attrs: 'inputmode="numeric" maxlength="4"' })}${feld("p_betrag", "Betrag in € (freiwillig)", p.betrag || "", { k: "betrag", attrs: 'inputmode="decimal"' })}</div>
        ${feld("p_partner", "Mit Hilfe von (freiwillig)", p.partner, { k: "partner" })}
        <div class="cols">${feld("p_farbe", "Farbe", p.farbe, { k: "farbe", type: "select", opts: FARBEN })}${feld("p_symbol", "Symbol (wenn kein Foto)", p.symbol, { k: "symbol", type: "select", opts: SYMBOLE })}</div>
        <fieldset><legend>Foto</legend>
          <div id="bildVorschau">${bild ? `<img src="${esc(bild)}" alt="" style="max-height:200px;border-radius:12px">` : `<p class="mute small">Noch kein Foto.</p>`}</div>
          <div class="row"><label class="btn sec small" for="p_datei" style="cursor:pointer">${bild ? "Foto ersetzen" : "Foto auswählen"}</label><input id="p_datei" type="file" accept="image/*" class="sr">
            <button type="button" class="btn ghost small" id="bildWeg" ${bild ? "" : "hidden"}>Foto entfernen</button></div>
          <p class="hint small mute">Fotos, auf denen Kinder zu erkennen sind, nur mit schriftlicher Einwilligung der Eltern veröffentlichen. Große Fotos werden automatisch verkleinert.</p>
        </fieldset>
        <p class="err" id="pf_err" hidden></p>
        <div class="row"><button class="btn" type="submit">Speichern</button>${neu ? "" : `<button class="btn sec" type="button" id="pDel" style="color:var(--err)">Projekt löschen</button>`}</div>
        <div id="sicher"></div></form>`;
    const vorschau = () => { $("#bildVorschau", box).innerHTML = bild ? `<img src="${esc(bild)}" alt="" style="max-height:200px;border-radius:12px">` : `<p class="mute small">Noch kein Foto.</p>`; $("#bildWeg", box).hidden = !bild; };
    $("#zur", box).onclick = () => TAB.projekte(box);
    $("#bildWeg", box).onclick = () => { bild = ""; vorschau(); };
    $("#p_datei", box).onchange = async (e) => {
      const datei = e.target.files[0]; if (!datei) return;
      $("#bildVorschau", box).innerHTML = `<p class="mute small">Foto wird hochgeladen …</p>`;
      try { const blob = await verkleinern(datei, D.live ? 1600 : 800); bild = await D.bildHochladen(blob, datei.name); vorschau(); toast("Foto hochgeladen, bitte noch speichern"); }
      catch (ex) { $("#bildVorschau", box).innerHTML = `<p class="err">${esc(ex.message)}</p>`; }
    };
    const speichern = async (arr) => { await D.inhaltSpeichern("projekte", arr); A.aktualisieren({ projekte: arr }); };
    const del = $("#pDel", box);
    if (del) del.onclick = () => sicherheitsfrage($("#sicher", box), "<b>Projekt wirklich löschen?</b>", "Löschen", async () => { await speichern(IN().projekte.filter(x => x.id !== p.id)); toast("Projekt gelöscht"); });
    $("#pf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#pf_err", box); er.hidden = true;
      const d = datenSammeln($("#pf", box));
      if (d.titel.length < 2) { er.textContent = "Bitte einen Titel eingeben."; er.hidden = false; return; }
      const obj = { titel: d.titel, kurz: d.kurz, text: d.text.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean), jahr: d.jahr ? parseInt(d.jahr, 10) || null : null,
        betrag: d.betrag ? parseFloat(String(d.betrag).replace(/\./g, "").replace(",", ".")) || null : null, partner: d.partner, farbe: d.farbe, symbol: d.symbol, bild };
      const arr = (IN().projekte || []).slice();
      if (neu) arr.unshift({ id: eindeutig(slug(d.titel), arr.map(x => x.id)), ...obj });
      else { const i = arr.findIndex(x => x.id === p.id); arr[i] = { ...arr[i], ...obj }; }
      try { await speichern(arr); toast("Projekt gespeichert"); } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  }

  /* ---------- Vereinsdaten ---------- */
  TAB.verein = async (box) => {
    const V = IN().verein; const b = V.bank || {}, k = V.kontakt || {}, ki = V.kitaInfo || {};
    let vorstand = (V.vorstand || []).map(x => ({ ...x }));
    const vZeilen = () => vorstand.map((m, i) => `<div class="slot-edit" style="grid-template-columns:1fr 1fr 44px">
        <div class="field"><label for="vs_r${i}">Amt</label><input id="vs_r${i}" type="text" value="${esc(m.rolle)}" data-vi="${i}" data-vf="rolle" placeholder="z. B. Kassiererin"></div>
        <div class="field"><label for="vs_n${i}">Name</label><input id="vs_n${i}" type="text" value="${esc(m.name)}" data-vi="${i}" data-vf="name"></div>
        <button type="button" class="iconbtn" data-vrm="${i}" aria-label="Entfernen">${ICON.x}</button></div>`).join("");
    box.innerHTML = `<h1 style="font-size:1.6rem;margin-bottom:6px">Vereinsdaten</h1><p class="mute" style="margin-bottom:12px">Alles, was hier steht, erscheint auf der Seite (Startseite, Über uns, Spenden, Kontakt, Impressum, Mitgliedsantrag).</p>
      <form id="vf" class="stack" style="--gap:16px" novalidate>
        <div class="card stack" style="--gap:14px"><h2>Allgemein</h2>
          ${feld("v_name", "Name des Vereins", V.name, { k: "name" })}
          <div class="cols">${feld("v_ort", "Ort (Kurzform)", V.ort, { k: "ort" })}${feld("v_kita", "Name der Kita", V.kita, { k: "kita" })}</div>
          ${feld("v_zweck", "Kurzbeschreibung (Startseite und Über uns)", V.zweck, { k: "zweck", type: "textarea" })}
          <div class="cols">${feld("v_z1", "Zitat, erste Zeile", (V.zitat || [])[0], { k: "zitat1" })}${feld("v_z2", "Zitat, zweite Zeile", (V.zitat || [])[1], { k: "zitat2" })}</div></div>
        <div class="card stack" style="--gap:14px"><h2>Vorstand</h2><div id="vsz" class="stack" style="--gap:10px">${vZeilen()}</div>
          <div><button type="button" class="btn sec small" id="vsPlus">${ICON.plus}Amt hinzufügen</button></div>
          <p class="mute small">Die ersten beiden Einträge erscheinen im Impressum als Vertretung nach § 26 BGB, der erste als verantwortlich für den Inhalt.</p></div>
        <div class="card stack" style="--gap:14px"><h2>Kontakt</h2>
          ${feld("v_mail", "E-Mail", k.email, { k: "kontakt.email", type: "email" })}
          ${feld("v_adr", "Anschrift (auch fürs Impressum)", k.adresse, { k: "kontakt.adresse" })}
          ${feld("v_papier", "Hinweis zum Papierantrag", V.papierAntrag, { k: "papierAntrag", type: "textarea", rows: 2 })}</div>
        <div class="card stack" style="--gap:14px"><h2>Bankverbindung</h2>
          ${feld("v_inh", "Kontoinhaber", b.inhaber, { k: "bank.inhaber" })}
          ${feld("v_iban", "IBAN", b.iban, { k: "bank.iban" })}
          <div class="cols">${feld("v_bic", "BIC", b.bic, { k: "bank.bic" })}${feld("v_inst", "Bank", b.institut, { k: "bank.institut" })}</div></div>
        <div class="card stack" style="--gap:14px"><h2>Mitgliedschaft</h2>
          <div class="cols">${feld("v_beitr", "Beiträge zur Auswahl in €", (V.beitraege || []).join(", "), { k: "beitraege", hint: "Mit Komma getrennt, z. B. 12, 24, 48" })}${feld("v_min", "Mindestbetrag bei „eigener Betrag“", V.mindestbeitrag, { k: "mindestbeitrag", attrs: 'inputmode="decimal"' })}</div>
          <div class="cols">${feld("v_zeit", "Zeitraum", V.beitragZeitraum, { k: "beitragZeitraum", ph: "pro Kindergartenjahr" })}${feld("v_glid", "Gläubiger-ID (SEPA)", V.glaeubigerId, { k: "glaeubigerId", hint: "Leer lassen, solange keine vorhanden ist." })}</div></div>
        <div class="card stack" style="--gap:14px"><h2>Rechtliches</h2>
          ${feld("v_reg", "Registergericht und Nummer", V.registergericht, { k: "registergericht", ph: "z. B. Amtsgericht Kleve, VR 1234" })}
          ${haken("v_gem", "Der Verein ist als gemeinnützig anerkannt (ändert den Text zur Spendenquittung)", V.gemeinnuetzig, "gemeinnuetzig")}</div>
        <div class="card stack" style="--gap:14px"><h2>Kita</h2>
          ${feld("v_kadr", "Adresse der Kita", ki.adresse, { k: "kitaInfo.adresse" })}
          ${feld("v_ktext", "Text über die Kita", ki.text, { k: "kitaInfo.text", type: "textarea" })}
          ${feld("v_klink", "Link zur Kita bzw. Pfarrei", ki.link, { k: "kitaInfo.link", type: "url" })}</div>
        <p class="err" id="vf_err" hidden></p>
        <div class="row" style="position:sticky;bottom:calc(var(--tab-h) + env(safe-area-inset-bottom,0px));background:var(--bg);padding-block:10px"><button class="btn" type="submit">Vereinsdaten speichern</button></div>
      </form>`;
    const vsz = $("#vsz", box);
    const vb = () => {
      $$("[data-vf]", vsz).forEach(inp => inp.oninput = () => { vorstand[+inp.dataset.vi][inp.dataset.vf] = inp.value; });
      $$("[data-vrm]", vsz).forEach(btn => btn.onclick = () => { vorstand.splice(+btn.dataset.vrm, 1); vsz.innerHTML = vZeilen(); vb(); });
    };
    vb();
    $("#vsPlus", box).onclick = () => { vorstand.push({ rolle: "", name: "" }); vsz.innerHTML = vZeilen(); vb(); };
    $("#vf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#vf_err", box); er.hidden = true;
      const d = datenSammeln($("#vf", box));
      const beitraege = String(d.beitraege).split(/[;,\s]+/).map(x => parseFloat(x.replace(",", "."))).filter(x => x > 0);
      if (!d.name) { er.textContent = "Bitte den Vereinsnamen eintragen."; er.hidden = false; return; }
      if (!beitraege.length) { er.textContent = "Bitte mindestens einen Beitrag eintragen."; er.hidden = false; return; }
      const neu = { ...V, name: d.name, ort: d.ort, kita: d.kita, zweck: d.zweck, zitat: d.zitat1 || d.zitat2 ? [d.zitat1, d.zitat2] : null,
        vorstand: vorstand.filter(m => m.rolle.trim() || m.name.trim()).map(m => ({ rolle: m.rolle.trim(), name: m.name.trim() })),
        kontakt: { ...V.kontakt, ...d.kontakt }, papierAntrag: d.papierAntrag, bank: { ...V.bank, ...d.bank }, beitraege,
        mindestbeitrag: parseFloat(String(d.mindestbeitrag).replace(",", ".")) || Math.min(...beitraege), beitragZeitraum: d.beitragZeitraum || "pro Jahr",
        glaeubigerId: d.glaeubigerId, registergericht: d.registergericht, gemeinnuetzig: !!d.gemeinnuetzig, kitaInfo: { ...V.kitaInfo, ...d.kitaInfo } };
      delete neu.demoListen;
      try { await D.inhaltSpeichern("verein", neu); A.aktualisieren({ verein: neu }); toast("Vereinsdaten gespeichert"); }
      catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  };

  /* ---------- Zugänge & Sicherung ---------- */
  const AEMTER = ["1. Vorsitz", "2. Vorsitz", "Kassierer/in", "Schriftführer/in", "Beisitzer/in", "Kassenprüfer/in", "Admin (ohne Amt)"];
  TAB.zugaenge = async (box) => {
    const [liste, anfragen] = await Promise.all([D.vorstandListe(), D.zugangAnfragen()]);
    const link = A.linkZu("registrieren");
    const amtFeld = (id, wert) => `<input id="${id}" type="text" list="aemter" value="${esc(wert || "")}" placeholder="z. B. Kassierer/in">`;
    box.innerHTML = `<h1 style="font-size:1.6rem;margin-bottom:12px">Zugänge für den Vorstand</h1>
      <datalist id="aemter">${AEMTER.map(x => `<option value="${esc(x)}">`).join("")}</datalist>

      <section style="margin-top:0"><h2 style="margin-bottom:8px">Offene Anfragen ${anfragen.length ? `<span class="chip c" style="--dot:var(--orange);--tint:var(--tint-orange)">${anfragen.length}</span>` : ""}</h2>
        <div class="list">${anfragen.map(x => `<div class="card stack" style="--gap:10px" data-anf="${esc(x.user_id)}">
            <div><h3>${esc(x.name || "ohne Namen")}</h3><p class="mute small">${esc(x.email)} · beantragt am ${new Date(x.erstellt).toLocaleDateString("de-DE")}</p></div>
            <div class="cols"><div class="field"><label for="an_${esc(x.user_id)}">Name</label><input id="an_${esc(x.user_id)}" type="text" value="${esc(x.name || "")}"></div>
              <div class="field"><label for="aa_${esc(x.user_id)}">Amt</label>${amtFeld("aa_" + x.user_id, "")}</div></div>
            <label class="check"><input type="checkbox" id="as_${esc(x.user_id)}" checked><span>Auf der Seite unter „Vorstand“ anzeigen</span></label>
            <div class="row"><button class="btn green small" data-frei="${esc(x.user_id)}">Freischalten</button><button class="btn sec small" data-ab="${esc(x.user_id)}">Ablehnen</button></div>
            <div data-abbox="${esc(x.user_id)}"></div></div>`).join("") || `<div class="card"><p class="mute">Keine offenen Anfragen.</p></div>`}</div>
        <p class="mute small" style="margin-top:8px">Bitte nur Personen freischalten, die ihr kennt, und kurz persönlich nachfragen, ob die Anfrage wirklich von ihnen stammt.</p></section>

      <section><h2 style="margin-bottom:8px">Freigeschaltet</h2>
        <div class="list">${liste.map(m => `<div class="card stack" style="--gap:10px"><div class="row" style="justify-content:space-between"><div style="min-width:0"><h3>${esc(m.name || "–")}${m.ich ? ` <span class="chip c" style="--dot:var(--green);--tint:var(--tint-green)">Ihr</span>` : ""}</h3><p class="mute small">${esc(m.amt || "kein Amt")} · ${esc(m.email)}</p></div>
            <div class="row"><button class="btn sec small" data-amt="${esc(m.user_id)}">Amt ändern</button>${m.ich ? "" : `<button class="btn ghost small" data-rm="${esc(m.user_id)}" data-n="${esc(m.name || m.email)}" style="color:var(--err)">Zugang entfernen</button>`}</div></div>
            <div data-mbox="${esc(m.user_id)}"></div></div>`).join("")}</div></section>

      <section><div class="card stack" style="--gap:12px"><h2>Link für neue Vorstandsmitglieder</h2>
        <p class="mute small">Über diesen Link legen neue Vorstandsmitglieder selbst einen Zugang mit Name, E-Mail und eigenem Passwort an. Danach erscheint die Anfrage oben und muss freigeschaltet werden.</p>
        <div class="row" style="flex-wrap:nowrap;align-items:center"><div style="width:120px;flex:none;background:#fff;border-radius:8px;padding:4px">${A.qrSvg(link)}</div>
          <div class="stack" style="--gap:8px;min-width:0"><p class="tnum small" style="word-break:break-all" id="regLink">${esc(link)}</p>
            <div class="row"><button class="btn sec small" id="regKopie">Link kopieren</button>${navigator.share ? `<button class="btn sec small" id="regTeilen">${ICON.teilen}Teilen</button>` : ""}</div></div></div></div></section>

      <section><form id="pwf" class="card stack" style="--gap:12px" novalidate><h2>Eigenes Passwort ändern</h2>
        <div class="cols">${feld("pw1", "Neues Passwort", "", { type: "password", attrs: 'autocomplete="new-password"' })}${feld("pw2", "Wiederholen", "", { type: "password", attrs: 'autocomplete="new-password"' })}</div>
        <p class="err" id="pw_err" hidden></p><div><button class="btn sec" type="submit">Passwort ändern</button></div></form></section>

      <section><div class="card stack" style="--gap:10px"><h2>Datensicherung und Übergabe</h2>
        <p class="mute small">Lädt alle Inhalte, Termine, Projekte, Listen, Anträge und die Mitgliederliste als eine Datei herunter. Sicher aufbewahren, sie enthält Bankdaten.</p>
        <div><button class="btn sec" id="sicherung">${ICON.install}Gesamtsicherung herunterladen</button></div>
        <p class="mute small">Bei einem Wechsel im Vorsitz: Nachfolger über den Link oben einen Zugang beantragen lassen und freischalten, Zugangsdaten von GitHub, Supabase und dem Vereins-Postfach übergeben, danach den eigenen Zugang durch den Nachfolger entfernen lassen.</p></div></section>`;

    const aufSeite = async (name, amt) => {
      const V = IN().verein; const vs = (V.vorstand || []).filter(m => (m.name || "").trim() && !/^name folgt$/i.test(m.name.trim()));
      const i = vs.findIndex(m => m.name.trim().toLowerCase() === name.trim().toLowerCase());
      if (i >= 0) vs[i] = { rolle: amt || vs[i].rolle, name }; else vs.push({ rolle: amt, name });
      const neu = { ...V, vorstand: vs }; await D.inhaltSpeichern("verein", neu); A.aktualisieren({ verein: neu });
    };
    $$("[data-frei]", box).forEach(b => b.onclick = async () => {
      const id = b.dataset.frei, name = $("#an_" + CSS.escape(id), box).value.trim(), amt = $("#aa_" + CSS.escape(id), box).value.trim();
      if (!name) { toast("Bitte einen Namen eintragen."); return; }
      b.disabled = true;
      try { await D.zugangFreischalten(id, name, amt); if ($("#as_" + CSS.escape(id), box).checked && amt && !/admin/i.test(amt)) await aufSeite(name, amt); toast(name + " ist freigeschaltet"); A.render(); }
      catch (e) { toast(e.message); b.disabled = false; }
    });
    $$("[data-ab]", box).forEach(b => b.onclick = () => sicherheitsfrage($$("[data-abbox]", box).find(x => x.dataset.abbox === b.dataset.ab), "<b>Anfrage ablehnen?</b> Das Konto wird gelöscht.", "Ablehnen",
      async () => { await D.zugangAblehnen(b.dataset.ab); toast("Anfrage abgelehnt"); A.render(); }));
    $$("[data-amt]", box).forEach(b => b.onclick = () => {
      const m = liste.find(x => x.user_id === b.dataset.amt); const ziel = $$("[data-mbox]", box).find(x => x.dataset.mbox === m.user_id);
      ziel.innerHTML = `<div class="cols"><div class="field"><label for="mn_${esc(m.user_id)}">Name</label><input id="mn_${esc(m.user_id)}" type="text" value="${esc(m.name || "")}"></div>
        <div class="field"><label for="ma_${esc(m.user_id)}">Amt</label>${amtFeld("ma_" + m.user_id, m.amt)}</div></div>
        <label class="check"><input type="checkbox" id="ms_${esc(m.user_id)}"><span>Auch auf der Seite unter „Vorstand“ eintragen bzw. aktualisieren</span></label>
        <div class="row"><button class="btn small" data-ok>Speichern</button><button class="btn sec small" data-x>Abbrechen</button></div>`;
      $("[data-x]", ziel).onclick = () => ziel.innerHTML = "";
      $("[data-ok]", ziel).onclick = async () => {
        const name = $("#mn_" + CSS.escape(m.user_id), ziel).value.trim(), amt = $("#ma_" + CSS.escape(m.user_id), ziel).value.trim();
        try { await D.zugangFreischalten(m.user_id, name, amt); if ($("#ms_" + CSS.escape(m.user_id), ziel).checked && amt) await aufSeite(name, amt); toast("Gespeichert"); A.render(); } catch (e) { toast(e.message); }
      };
    });
    $$("[data-rm]", box).forEach(b => b.onclick = () => sicherheitsfrage($$("[data-mbox]", box).find(x => x.dataset.mbox === b.dataset.rm), `<b>Zugang von ${esc(b.dataset.n)} entfernen?</b> Die Person kann dann nichts mehr in der Verwaltung sehen oder ändern. Den Eintrag unter „Vorstand“ auf der Seite ändert ihr in den Vereinsdaten.`, "Entfernen",
      async () => { await D.vorstandEntfernen(b.dataset.rm); toast("Zugang entfernt"); A.render(); }));
    $("#regKopie", box).onclick = async () => { try { await navigator.clipboard.writeText(link); toast("Link kopiert"); } catch (e) { const r = document.createRange(); r.selectNodeContents($("#regLink", box)); getSelection().removeAllRanges(); getSelection().addRange(r); } };
    const rt = $("#regTeilen", box); if (rt) rt.onclick = () => navigator.share({ title: "Zugang zur Verwaltung des Fördervereins", url: link }).catch(() => {});
    $("#pwf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#pw_err", box); er.hidden = true;
      const a = $("#pw1", box).value, b = $("#pw2", box).value;
      if (a.length < 10) { er.textContent = "Bitte mindestens 10 Zeichen verwenden."; er.hidden = false; return; }
      if (a !== b) { er.textContent = "Die beiden Eingaben stimmen nicht überein."; er.hidden = false; return; }
      try { await D.passwortAendern(a); $("#pw1", box).value = $("#pw2", box).value = ""; toast("Passwort geändert"); } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
    $("#sicherung", box).onclick = async (e) => {
      e.target.disabled = true;
      try {
        const [mitglieder, antraege, listen] = await Promise.all([D.mitglieder(), D.antraege(), D.listen({ alle: true })]);
        const eintraege = {}; for (const l of listen) eintraege[l.id] = await D.eintraegeVoll(l.id);
        const daten = { erstellt: new Date().toISOString(), verein: IN().verein, termine: IN().termine, projekte: IN().projekte, listen, eintraege, antraege, mitglieder };
        herunterladen("foerderverein-sicherung-" + heuteISO() + ".json", JSON.stringify(daten, null, 2), "application/json");
      } catch (ex) { toast(ex.message); }
      e.target.disabled = false;
    };
  };

  /* ---------- Zugang beantragen (#registrieren) ---------- */
  A.SEITEN.registrieren = (v) => {
    v.innerHTML = kopf("teal", "Für den Vorstand", "Zugang beantragen", "Neu im Vorstand? Legt hier euren Zugang zur Verwaltung an. Danach prüft ein Vorstandsmitglied die Anfrage und schaltet euch mit eurem Amt frei.") +
      `<form id="reg" class="card" style="max-width:460px" novalidate>
        ${feld("r_name", "Vor- und Nachname", "", { attrs: 'autocomplete="name" maxlength="80"' })}
        ${feld("r_mail", "E-Mail", "", { type: "email", attrs: 'autocomplete="email"' })}
        ${feld("r_pw1", "Eigenes Passwort", "", { type: "password", attrs: 'autocomplete="new-password"', hint: "Mindestens 10 Zeichen." })}
        ${feld("r_pw2", "Passwort wiederholen", "", { type: "password", attrs: 'autocomplete="new-password"' })}
        <input class="hp" type="text" id="r_web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="err" id="r_err" hidden></p>
        <button class="btn block" type="submit">Zugang beantragen</button>
        <p class="mute small">Ihr seht die Verwaltung erst, wenn ihr freigeschaltet seid. Gebt am besten kurz im Vorstand Bescheid, dass ihr euch eingetragen habt.</p>
      </form>`;
    $("#reg").onsubmit = async (e) => {
      e.preventDefault(); const er = $("#r_err"); er.hidden = true;
      if ($("#r_web").value) return;
      const name = $("#r_name").value.trim(), mail = $("#r_mail").value.trim(), a = $("#r_pw1").value, b = $("#r_pw2").value;
      const fehler = name.length < 3 ? "Bitte Vor- und Nachnamen eintragen." : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail) ? "Bitte eine gültige E-Mail-Adresse eintragen." : a.length < 10 ? "Das Passwort braucht mindestens 10 Zeichen." : a !== b ? "Die beiden Passwörter stimmen nicht überein." : "";
      if (fehler) { er.textContent = fehler; er.hidden = false; return; }
      const btn = $("#reg [type=submit]"); btn.disabled = true; btn.textContent = "Wird gesendet …";
      try {
        await D.registrieren(name, mail, a);
        v.innerHTML = kopf("green", "Anfrage gesendet", "Danke, " + esc(name.split(" ")[0]) + "!", "Eure Anfrage ist beim Vorstand angekommen. Sobald ihr freigeschaltet seid, meldet ihr euch unter Mehr → Verwaltung mit " + esc(mail) + " und eurem Passwort an.") +
          `<p><a class="btn" href="#start">Zur Startseite</a></p>`;
      } catch (ex) { er.textContent = ex.message; er.hidden = false; btn.disabled = false; btn.textContent = "Zugang beantragen"; }
    };
  };
})();
