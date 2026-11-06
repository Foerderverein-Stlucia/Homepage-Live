/* ============================================================
   Förderverein Kita St. Lucia Walbeck – App
   Seiten werden über den Teil hinter # in der Adresse gewählt:
   #start #termine #mithelfen #liste-<id> #aushang-<id> #mitglied
   #projekte #projekt-<id> #verein #spenden #kontakt #impressum
   #datenschutz #verwaltung
   ============================================================ */
(function () {
  "use strict";
  const C = window.FV_CONFIG || {};
  const I = window.FV_INHALT;
  const D = window.FV_DATEN;
  const V = I.verein;
  const PREVIEW = !!window.FV_PREVIEW;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const euro = (n) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const MONL = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const WTL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const dt = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
  const heute = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const datumLang = (s) => { const d = dt(s); return WTL[d.getDay()] + ", " + d.getDate() + ". " + MONL[d.getMonth()] + " " + d.getFullYear(); };
  const datumKurz = (s) => { const d = dt(s); return d.getDate() + ". " + MONL[d.getMonth()]; };
  const farbe = (f) => `--dot:var(--${f || "blue"});--tint:var(--tint-${f || "blue"})`;

  /* ---------- Symbole (eigene Strichzeichnungen) ---------- */
  const svg = (p, vb = "0 0 24 24") => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    start: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    termine: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="8.5" cy="15" r="1.2" fill="currentColor"/>'),
    mithelfen: svg('<path d="M7 11V6.5a1.5 1.5 0 013 0V11"/><path d="M10 10V5a1.5 1.5 0 013 0v6"/><path d="M13 10.5V6.5a1.5 1.5 0 013 0V14"/><path d="M7 11a1.5 1.5 0 00-3 0v2c0 4.4 3 8 7.5 8S16 18 16 14"/>'),
    mitglied: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M15 10h3M15 13.5h3"/>'),
    mehr: svg('<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    kal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>'),
    druck: svg('<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),
    qr: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h7v-4M17.5 17.5h.01"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'),
    teilen: svg('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    zurueck: svg('<path d="M15 5l-7 7 7 7"/>'),
    install: svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>'),
    mond: svg('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),
    // Projektsymbole
    rutsche: svg('<path d="M5 21V6h4v15M5 10h4M5 14h4"/><path d="M9 6c3 0 4 3 6 8s3 7 6 7"/><path d="M3 21h18"/>'),
    buch: svg('<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 014 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 001.5-1.5z"/>'),
    theater: svg('<path d="M4 4h10v6a5 5 0 01-10 0z"/><path d="M7 8h.01M11 8h.01M7.5 11.5c1 .8 2 .8 3 0"/><path d="M14 9h6v5a5 5 0 01-7.6 4.3"/><path d="M16 12h.01M19 12h.01"/>'),
    musik: svg('<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
    baum: svg('<path d="M12 21v-5"/><path d="M12 3c-4 0-6 3-6 6 0 2.5 1.5 4.5 3 5.5h6c1.5-1 3-3 3-5.5 0-3-2-6-6-6z"/>'),
    kueche: svg('<path d="M4 11h16v3a6 6 0 01-6 6h-4a6 6 0 01-6-6z"/><path d="M9 7c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5M2 11h2M20 11h2"/>'),
    ausflug: svg('<rect x="3" y="7" width="18" height="10" rx="3"/><path d="M3 12h18M8 7v5M14 7v5"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>'),
    stern: svg('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
    herz: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>')
  };

  /* ---------- Hilfen ---------- */
  function toast(t) {
    $$(".toast").forEach(t => t.remove()); const el = document.createElement("div"); el.className = "toast"; el.role = "status"; el.textContent = t;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3200);
  }
  function seitenBasis() {
    if (C.seitenUrl) return C.seitenUrl.replace(/#.*$/, "");
    return location.href.replace(/#.*$/, "");
  }
  const linkZu = (hash) => seitenBasis() + "#" + hash;
  function qrSvg(text, px) {
    if (typeof window.qrcode !== "function") return '<p class="mute small">QR-Code konnte nicht erzeugt werden.</p>';
    const q = window.qrcode(0, "M"); q.addData(text); q.make();
    const n = q.getModuleCount(), b = 2; let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + b} ${r + b}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n + 2 * b} ${n + 2 * b}" ${px ? `width="${px}" height="${px}"` : ""} shape-rendering="crispEdges" role="img" aria-label="QR-Code zu ${esc(text)}"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
  }
  async function teilen(titel, hash) {
    const url = linkZu(hash);
    if (navigator.share) { try { await navigator.share({ title: titel, url }); return; } catch (e) { if (e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); toast("Link kopiert"); } catch (e) { toast(url); }
  }
  function ics(t) {
    const z = (s) => s.replace(/[-:]/g, "");
    const start = t.datum + "T" + (t.von || "00:00") + ":00", ende = t.datum + "T" + (t.bis || t.von || "23:59") + ":00";
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Foerderverein St. Lucia//DE", "BEGIN:VEVENT",
      "UID:" + t.id + "@foerderverein-st-lucia", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART;TZID=Europe/Berlin:" + z(start), "DTEND;TZID=Europe/Berlin:" + z(ende),
      "SUMMARY:" + t.titel, "LOCATION:" + (t.ort || ""), "DESCRIPTION:" + (t.text || "").replace(/\n/g, " "), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = t.titel.replace(/[^\wäöüÄÖÜß-]+/g, "_") + ".ics"; a.click();
  }
  function ibanOk(iban) {
    const s = iban.replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
    if (s.startsWith("DE") && s.length !== 22) return false;
    const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
    let m = 0; for (const ch of r) m = (m * 10 + +ch) % 97; return m === 1;
  }
  const termineKommend = () => I.termine.filter(t => dt(t.datum) >= heute()).sort((a, b) => a.datum.localeCompare(b.datum));
  const termineVorbei = () => I.termine.filter(t => dt(t.datum) < heute()).sort((a, b) => b.datum.localeCompare(a.datum));

  /* ---------- Navigation ---------- */
  const TABS = [
    { id: "start", t: "Start", f: "pink" },
    { id: "termine", t: "Termine", f: "orange" },
    { id: "mithelfen", t: "Mithelfen", f: "green" },
    { id: "mitglied", t: "Mitglied", f: "blue" }
  ];
  const MEHR = [
    { id: "projekte", t: "Unsere Projekte", s: "Was wir schon geschafft haben", f: "pink" },
    { id: "verein", t: "Über den Verein", s: "Ziele, Vorstand, Satzung", f: "purple" },
    { id: "spenden", t: "Spenden", s: "Bankverbindung und Spendenquittung", f: "yellow" },
    { id: "kontakt", t: "Kontakt", s: "So erreicht ihr uns", f: "teal" },
    { id: "aushang-mitglied", t: "Aushänge drucken", s: "QR-Codes für die Pinnwand", f: "red" }
  ];
  const TOPNAV = [["start", "Start"], ["termine", "Termine"], ["mithelfen", "Mithelfen"], ["projekte", "Projekte"], ["verein", "Verein"], ["mitglied", "Mitglied werden"]];

  function shell() {
    let root = document.getElementById("fv-app");
    if (!root) { root = document.createElement("div"); root.id = "fv-app"; document.body.appendChild(root); }
    root.innerHTML = `
      <a class="sr" href="#inhalt">Zum Inhalt springen</a>
      ${D.live ? "" : `<div class="modebar noprint">Vorschau: Eingaben werden nur auf diesem Gerät gespeichert.</div>`}
      <header class="top"><div class="wrap">
        <a class="brand" href="#start" aria-label="Startseite"><img src="${window.FV_LOGO || "img/logo.png"}" alt="" width="60" height="40"><span>Förderverein<small>Kita St. Lucia · ${esc(V.ort)}</small></span></a>
        <nav class="topnav" aria-label="Hauptnavigation">${TOPNAV.map(([h, t]) => `<a href="#${h}" data-nav="${h}">${t}</a>`).join("")}</nav>
        <button class="iconbtn menu-btn" id="menuBtn" aria-label="Menü öffnen">${ICON.menu}</button>
      </div></header>
      <main id="inhalt" tabindex="-1"><div class="wrap" id="view"></div></main>
      <nav class="tabbar" aria-label="Schnellnavigation">
        ${TABS.map(x => `<a href="#${x.id}" data-nav="${x.id}" style="--tab-c:var(--${x.f})"><span class="ico">${ICON[x.id]}</span>${x.t}</a>`).join("")}
        <button id="mehrBtn" style="--tab-c:var(--purple)"><span class="ico">${ICON.mehr}</span>Mehr</button>
      </nav>`;
    $("#mehrBtn").onclick = mehrMenue;
    $("#menuBtn").onclick = mehrMenue;
  }

  function sheet(html, onOpen) {
    const bg = document.createElement("div"); bg.className = "sheet-bg";
    bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
    const zu = () => { bg.remove(); document.removeEventListener("keydown", esc_); };
    const esc_ = (e) => { if (e.key === "Escape") zu(); };
    bg.addEventListener("click", e => { if (e.target === bg || e.target.closest("[data-zu]")) zu(); });
    document.addEventListener("keydown", esc_);
    document.body.appendChild(bg);
    const f = bg.querySelector("a,button,input"); if (f) f.focus();
    if (onOpen) onOpen(bg, zu);
    return zu;
  }

  function mehrMenue() {
    const theme = document.documentElement.dataset.theme || "";
    sheet(`<nav class="menu" aria-label="Weitere Seiten">
      ${MEHR.map(m => `<a href="#${m.id}" data-zu style="--dot:var(--${m.f})"><span class="d"></span><span>${m.t}<small>${m.s}</small></span></a>`).join("")}
      <hr>
      ${installierbar() ? `<button id="instBtn"><span class="d" style="--dot:var(--green)"></span><span>App installieren<small>Auf den Startbildschirm legen</small></span></button>` : ""}
      <button id="themeBtn"><span class="d" style="--dot:var(--ink)"></span><span>Darstellung: ${theme === "dark" ? "dunkel" : theme === "light" ? "hell" : "wie Gerät"}<small>Antippen zum Wechseln</small></span></button>
      <a href="#impressum" data-zu><span class="d" style="--dot:var(--line)"></span>Impressum</a>
      <a href="#datenschutz" data-zu><span class="d" style="--dot:var(--line)"></span>Datenschutz</a>
      <a href="#verwaltung" data-zu><span class="d" style="--dot:var(--line)"></span><span>Verwaltung<small>Nur für den Vorstand</small></span></a>
    </nav>`, (bg, zu) => {
      const ib = $("#instBtn", bg); if (ib) ib.onclick = () => { zu(); installieren(); };
      $("#themeBtn", bg).onclick = () => {
        const next = theme === "" ? "light" : theme === "light" ? "dark" : "";
        if (next) document.documentElement.dataset.theme = next; else delete document.documentElement.dataset.theme;
        try { localStorage.setItem("fv_theme", next); } catch (e) {}
        zu(); mehrMenue();
      };
    });
  }

  /* ---------- Installieren (PWA) ---------- */
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; if (aktuell() === "start") render(); });
  const istIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const installierbar = () => !PREVIEW && !standalone() && (installEvt || istIOS);
  async function installieren() {
    if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome === "accepted") toast("Wird installiert"); render(); return; }
    sheet(`<h2>App auf das iPhone holen</h2>
      <ol class="stack" style="--gap:10px;padding-left:1.2em;margin:16px 0">
        <li>Unten in Safari auf <b>Teilen</b> tippen (Quadrat mit Pfeil nach oben).</li>
        <li><b>Zum Home-Bildschirm</b> wählen.</li>
        <li>Mit <b>Hinzufügen</b> bestätigen.</li></ol>
      <button class="btn block" data-zu>Verstanden</button>`);
  }

  /* ---------- Router ---------- */
  const aktuell = () => decodeURIComponent(location.hash.slice(1)) || "start";
  const SEITEN = {};
  async function render() {
    const h = aktuell();
    const [name, ...rest] = h.split("-");
    const arg = rest.join("-");
    const fn = SEITEN[h] || SEITEN[name] || SEITEN.nichtgefunden;
    const nav = SEITEN[h] ? h : name;
    $$("[data-nav]").forEach(a => a.toggleAttribute("aria-current", false));
    $$(`[data-nav="${nav}"]`).forEach(a => a.setAttribute("aria-current", "page"));
    if (["projekt"].includes(name)) $$(`[data-nav="projekte"]`).forEach(a => a.setAttribute("aria-current", "page"));
    if (["liste", "aushang"].includes(name)) $$(`[data-nav="mithelfen"]`).forEach(a => a.setAttribute("aria-current", "page"));
    const view = $("#view");
    try { await fn(view, arg); } catch (e) { console.error(e); view.innerHTML = `<div class="card"><h2>Das hat nicht geklappt</h2><p class="mute">${esc(e.message)}</p><p style="margin-top:12px"><button class="btn" onclick="location.reload()">Neu laden</button></p></div>`; }
    const titel = $("h1", view); document.title = (titel ? titel.textContent + " · " : "") + "Förderverein St. Lucia";
  }
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); $("#inhalt").focus({ preventScroll: true }); });

  const kopf = (f, eyebrow, h1, lead) => `<header class="page-head" style="${farbe(f)}"><span class="eyebrow">${eyebrow}</span><h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</header>`;
  const zurueck = (hash, t) => `<a class="btn ghost noprint" href="#${hash}" style="margin:-8px 0 8px -8px">${ICON.zurueck}${t}</a>`;

  /* ---------- Bausteine ---------- */
  function terminKarte(t, { kompakt = false } = {}) {
    const d = dt(t.datum);
    return `<article class="card event" style="${farbe(t.farbe)}">
      <div class="datebox tnum"><span>${WT[d.getDay()]}</span><b>${d.getDate()}</b><span>${MON[d.getMonth()]}</span></div>
      <div style="min-width:0"><h3>${esc(t.titel)}</h3>
        <p class="meta tnum">${t.von ? esc(t.von) + (t.bis ? "–" + esc(t.bis) : "") + " Uhr · " : ""}${esc(t.ort || "")}</p>
        ${kompakt ? "" : `<p style="margin-top:6px">${esc(t.text || "")}</p>`}
        <div class="acts noprint">
          ${t.liste ? `<a class="btn small green" href="#liste-${esc(t.liste)}">${ICON.mithelfen}Helfen</a>` : ""}
          ${kompakt || PREVIEW ? "" : `<button class="btn small sec" data-ics="${esc(t.id)}">${ICON.kal}In den Kalender</button>`}
        </div></div></article>`;
  }
  function projektKarte(p) {
    return `<a class="card link proj" href="#projekt-${esc(p.id)}" style="${farbe(p.farbe)}">
      <span class="badge">${ICON[p.symbol] || ICON.stern}</span>
      <span style="min-width:0"><h3>${esc(p.titel)}</h3><p>${esc(p.kurz)}</p>
      <span class="chips"><span class="chip c tnum">${p.jahr}</span><span class="chip tnum">${euro(p.betrag)}</span></span></span></a>`;
  }
  function andere(belegt, meineHier) {
    const rest = belegt.slice();
    meineHier.forEach(m => { let i = rest.findIndex(b => b.token && b.token === m.token); if (i < 0) i = rest.findIndex(b => !b.token && b.name === m.name); if (i >= 0) rest.splice(i, 1); });
    return rest;
  }
  function frei(l) { return l.plaetze.reduce((s, p) => s + Math.max(0, p.anzahl - p.belegt.length), 0); }
  function gesamt(l) { return l.plaetze.reduce((s, p) => s + p.anzahl, 0); }
  function bindIcs(root) { $$("[data-ics]", root).forEach(b => b.onclick = () => ics(I.termine.find(t => t.id === b.dataset.ics))); }

  /* ================= SEITEN ================= */

  SEITEN.start = async (v) => {
    const naechste = termineKommend().slice(0, 2);
    let listen = []; try { listen = await D.listen(); } catch (e) {}
    const offen = listen.filter(l => frei(l) > 0 && (!l.datum || dt(l.datum) >= heute()));
    const summe = I.projekte.reduce((s, p) => s + p.betrag, 0);
    const dots = [["pink", 0, 22, 22], ["teal", 78, 0, 22], ["blue", 50, 30, 22], ["green", 30, 52, 22], ["orange", 72, 50, 22], ["purple", 92, 76, 22], ["yellow", 0, 66, 30], ["red", 30, 84, 22]];
    v.innerHTML = `
      <section class="hero">
        <div class="dots" aria-hidden="true">${dots.map(([c, x, y, s]) => `<i style="background:var(--${c});left:${x}%;top:${y}%;width:${s}%;aspect-ratio:1"></i>`).join("")}</div>
        <span class="eyebrow" style="--dot:var(--pink)">Kita St. Lucia · ${esc(V.ort)}</span>
        <h1>Gemeinsam für unsere <em>Kita-Kinder</em></h1>
        <p class="lead">${esc(V.zweck)}</p>
        <div class="hero-actions"><a class="btn" href="#mitglied">Mitglied werden</a><a class="btn sec" href="#mithelfen">Beim nächsten Fest helfen</a></div>
      </section>
      ${installierbar() ? `<section><div class="notice">${ICON.install}<div class="stack" style="--gap:8px"><p><b>Als App aufs Handy legen.</b> Dann habt ihr Termine und Listen mit einem Tipp.</p><div><button class="btn small" id="instStart">App installieren</button></div></div></div></section>` : ""}
      <section>
        <div class="sec-head"><h2>Als Nächstes</h2><a href="#termine">Alle Termine</a></div>
        <div class="list">${naechste.map(t => terminKarte(t, { kompakt: true })).join("") || `<p class="mute">Gerade stehen keine Termine an.</p>`}</div>
      </section>
      <section>
        <div class="sec-head"><h2>Helfer gesucht</h2><a href="#mithelfen">Alle Listen</a></div>
        <div class="list">${offen.slice(0, 2).map(l => listeKarte(l)).join("") || `<p class="mute">Im Moment sind alle Plätze vergeben. Danke!</p>`}</div>
      </section>
      <section>
        <div class="sec-head"><h2>Das haben wir geschafft</h2><a href="#projekte">Alle Projekte</a></div>
        <div class="total"><b class="tnum">${euro(summe)}</b><span class="mute">für ${I.projekte.length} Projekte seit ${Math.min(...I.projekte.map(p => p.jahr))}</span></div>
        <div class="grid2">${I.projekte.slice(0, 2).map(projektKarte).join("")}</div>
      </section>`;
    const ib = $("#instStart"); if (ib) ib.onclick = installieren;
  };

  SEITEN.termine = (v) => {
    const k = termineKommend(), alt = termineVorbei();
    let html = kopf("orange", "Termine", "Was steht an?", "Feste, Aktionen und Versammlungen des Fördervereins. Mit einem Tipp landet ein Termin in eurem Kalender.");
    let monat = "";
    html += `<div class="list">`;
    k.forEach(t => { const d = dt(t.datum); const m = MONL[d.getMonth()] + " " + d.getFullYear(); if (m !== monat) { html += `<h2 class="month">${m}</h2>`; monat = m; } html += terminKarte(t); });
    if (!k.length) html += `<p class="mute">Gerade stehen keine Termine an.</p>`;
    html += `</div>`;
    if (alt.length) html += `<section><h2 class="month">Rückblick</h2><div class="list past">${alt.slice(0, 5).map(t => terminKarte(t, { kompakt: true })).join("")}</div></section>`;
    v.innerHTML = html; bindIcs(v);
  };

  function listeKarte(l) {
    const f = frei(l), g = gesamt(l);
    return `<a class="card link" href="#liste-${esc(l.id)}" style="--dot:var(--green)">
      <div class="row" style="justify-content:space-between"><h3>${esc(l.titel)}</h3><span class="cap ${f ? "free" : "full"} tnum">${f ? f + " von " + g + " frei" : "voll"}</span></div>
      ${l.datum ? `<p class="mute small">${datumLang(l.datum)}</p>` : ""}
      <div class="meter" aria-hidden="true"><i style="width:${g ? Math.round((g - f) / g * 100) : 0}%"></i></div></a>`;
  }

  SEITEN.mithelfen = async (v) => {
    v.innerHTML = kopf("green", "Mithelfen", "Tragt euch ein", "Aufsicht, Kuchen, Auf- und Abbau: Sucht euch einen freien Platz aus. Sichtbar ist nur euer Vorname mit Anfangsbuchstaben.") + `<p class="mute">Listen werden geladen …</p>`;
    const listen = await D.listen();
    const kommend = listen.filter(l => !l.datum || dt(l.datum) >= heute());
    const mein = D.meine.alle();
    v.innerHTML = kopf("green", "Mithelfen", "Tragt euch ein", "Aufsicht, Kuchen, Auf- und Abbau: Sucht euch einen freien Platz aus. Sichtbar ist nur euer Vorname mit Anfangsbuchstaben.") +
      (mein.length ? `<div class="notice" style="margin-bottom:16px">${ICON.info}<p>Ihr seid für <b>${mein.length} ${mein.length === 1 ? "Platz" : "Plätze"}</b> eingetragen. Ihr findet sie grün markiert in den Listen.</p></div>` : "") +
      `<div class="list">${kommend.map(listeKarte).join("") || `<p class="mute">Gerade gibt es keine offenen Listen.</p>`}</div>
      <section><div class="card row" style="justify-content:space-between"><div style="min-width:0;flex:1 1 240px"><h3>Listen für die Pinnwand</h3><p class="mute small">Zu jeder Liste gibt es einen Aushang mit QR-Code. Eltern scannen ihn und tragen sich direkt ein.</p></div>
      <a class="btn sec small" href="#aushang-mithelfen">${ICON.qr}Aushang öffnen</a></div></section>`;
  };

  SEITEN.liste = async (v, id) => {
    const listen = await D.listen();
    const l = listen.find(x => String(x.id) === id);
    if (!l) { v.innerHTML = zurueck("mithelfen", "Alle Listen") + `<div class="card"><h2>Liste nicht gefunden</h2><p class="mute">Vielleicht wurde sie schon geschlossen.</p></div>`; return; }
    const mein = D.meine.alle();
    const termin = I.termine.find(t => t.liste === l.id);
    v.innerHTML = zurueck("mithelfen", "Alle Listen") + kopf("green", "Eintrageliste", esc(l.titel), l.datum ? datumLang(l.datum) + (termin && termin.von ? ", " + termin.von + " Uhr" : "") : "") +
      (l.beschreibung ? `<div class="notice" style="margin-bottom:16px">${ICON.info}<p>${esc(l.beschreibung)}</p></div>` : "") +
      `<div class="card">${l.plaetze.map(p => {
        const f = p.anzahl - p.belegt.length;
        const meineHier = mein.filter(m => m.platz_id === p.id);
        return `<div class="slot"><div style="min-width:0"><b>${esc(p.bezeichnung)}</b>${p.zeit ? `<div class="mute small tnum">${esc(p.zeit)}</div>` : ""}
          <div class="who">${andere(p.belegt, meineHier).map(b => `<span class="chip">${esc(b.name)}</span>`).join("")}${meineHier.map(m => `<span class="chip mine">Ihr: ${esc(m.name)}</span>`).join("")}</div></div>
          <div class="stack" style="--gap:6px;align-items:flex-end">
            <span class="cap ${f > 0 ? "free" : "full"} tnum">${f > 0 ? f + " frei" : "voll"}</span>
            ${f > 0 ? `<button class="btn small green" data-platz="${esc(p.id)}">Eintragen</button>` : ""}
            ${meineHier.map(m => `<button class="btn ghost small" data-aus="${esc(m.token)}">Austragen</button>`).join("")}
          </div></div>`;
      }).join("")}</div>
      <div class="row noprint" style="margin-top:16px">
        <a class="btn sec small" href="#aushang-${esc(l.id)}">${ICON.qr}Aushang mit QR-Code</a>
        <button class="btn sec small" id="teilenBtn">${ICON.teilen}Liste teilen</button></div>`;
    $("#teilenBtn").onclick = () => teilen(l.titel, "liste-" + l.id);
    $$("[data-platz]", v).forEach(b => b.onclick = () => eintragDialog(l, l.plaetze.find(p => String(p.id) === b.dataset.platz)));
    $$("[data-aus]", v).forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await D.austragen(b.dataset.aus); D.meine.weg(b.dataset.aus); toast("Ausgetragen"); render(); } catch (e) { toast(e.message); b.disabled = false; }
    });
  };

  function eintragDialog(l, p) {
    const gemerkt = (() => { try { return localStorage.getItem("fv_name") || ""; } catch (e) { return ""; } })();
    sheet(`<h2>${esc(p.bezeichnung)}</h2><p class="mute">${esc(l.titel)}${p.zeit ? " · " + esc(p.zeit) : ""}</p>
      <form id="eintragForm" style="margin-top:16px" novalidate>
        <div class="field"><label for="e_name">Euer Name</label><input id="e_name" type="text" autocomplete="name" required minlength="2" maxlength="60" value="${esc(gemerkt)}" placeholder="z. B. Anna Krüger">
          <span class="hint">In der Liste erscheint nur „Anna K.“.</span></div>
        <div class="field"><label for="e_kontakt">Telefon oder E-Mail (freiwillig)</label><input id="e_kontakt" type="text" maxlength="100" placeholder="Falls wir euch kurzfristig erreichen müssen">
          <span class="hint">Sieht nur der Vorstand.</span></div>
        <input class="hp" type="text" id="e_web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="err" id="e_err" hidden></p>
        <button class="btn green block" type="submit">Verbindlich eintragen</button>
        <button class="btn sec block" type="button" data-zu>Abbrechen</button>
      </form>`, (bg, zu) => {
      const f = $("#eintragForm", bg); $("#e_name", bg).focus();
      f.onsubmit = async (e) => {
        e.preventDefault();
        const name = $("#e_name", bg).value.trim(), kontakt = $("#e_kontakt", bg).value.trim();
        const err = $("#e_err", bg);
        if ($("#e_web", bg).value) return zu();
        if (name.length < 2) { err.textContent = "Bitte gebt euren Namen ein."; err.hidden = false; return; }
        const btn = f.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Wird eingetragen …";
        try {
          const token = await D.eintragen(p.id, name, kontakt);
          D.meine.add({ token, platz_id: p.id, liste_id: l.id, name: D.anzeigename(name) });
          try { localStorage.setItem("fv_name", name); } catch (e) {}
          zu(); toast("Danke! Ihr seid eingetragen."); render();
        } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = "Verbindlich eintragen"; }
      };
    });
  }

  /* Aushänge: aushang-mitglied, aushang-mithelfen, aushang-<listenId> */
  SEITEN.aushang = async (v, id) => {
    let titel, text, ziel, tabelle = "", farbeA = "green";
    if (id === "mitglied") { titel = "Werdet Mitglied im Förderverein!"; text = "Ab " + euro(V.mindestbeitrag) + " im Jahr helft ihr, dass Ausflüge, Spielgeräte und Feste für unsere Kinder möglich werden. Den Antrag könnt ihr direkt am Handy ausfüllen."; ziel = "mitglied"; farbeA = "blue"; }
    else if (id === "mithelfen") { titel = "Helferinnen und Helfer gesucht"; text = "Für Feste und Aktionen brauchen wir eure Unterstützung. Scannt den Code, sucht euch einen freien Platz aus und tragt euch ein."; ziel = "mithelfen"; }
    else if (id === "termine") { titel = "Unsere Termine"; text = "Alle Feste und Aktionen des Fördervereins. Mit einem Tipp im eigenen Kalender."; ziel = "termine"; farbeA = "orange"; }
    else {
      const l = (await D.listen()).find(x => String(x.id) === id);
      if (!l) { v.innerHTML = zurueck("mithelfen", "Alle Listen") + `<div class="card"><h2>Liste nicht gefunden</h2></div>`; return; }
      titel = l.titel + (l.datum ? " am " + datumKurz(l.datum) : ""); text = "Wir suchen Unterstützung! Scannt den Code und tragt euch ein. Wer kein Handy dabei hat, schreibt sich einfach unten in die Liste.";
      ziel = "liste-" + l.id;
      tabelle = `<h2 style="margin-top:8px">Zum Eintragen auf Papier</h2><div class="tablewrap" style="margin-top:10px;border-color:#ccc;background:#fff"><table><thead><tr><th>Aufgabe</th><th>Zeit</th><th style="width:45%">Name</th></tr></thead><tbody>
        ${l.plaetze.flatMap(p => Array.from({ length: p.anzahl }, (_, i) => `<tr><td>${i ? "" : esc(p.bezeichnung)}</td><td class="tnum">${i ? "" : esc(p.zeit || "")}</td><td>${p.belegt[i] ? esc(p.belegt[i].name) : ""}</td></tr>`)).join("")}
        </tbody></table></div>`;
    }
    const url = linkZu(ziel);
    const auswahl = [["mitglied", "Mitglied werden"], ["mithelfen", "Alle Listen"], ["termine", "Termine"]];
    v.innerHTML = `<div class="noprint">${zurueck(id === "mitglied" || id === "termine" ? "start" : "mithelfen", "Zurück")}
        ${kopf("red", "Aushang", "Für die Pinnwand", "Ausdrucken und in der Kita aufhängen. Der QR-Code führt direkt zur passenden Seite.")}
        <div class="tabs" role="tablist">${auswahl.map(([k, t]) => `<button role="tab" aria-selected="${k === id}" data-a="${k}">${t}</button>`).join("")}</div>
        <div class="row" style="margin-bottom:16px">${PREVIEW ? `<p class="mute small">In der fertigen App steht hier ein Knopf zum Drucken.</p>` : `<button class="btn" id="druckBtn">${ICON.druck}Drucken</button>`}</div></div>
      <article class="poster">
        <img class="logo" src="${window.FV_LOGO || "img/logo.png"}" alt="Kath. Kindertageseinrichtung St. Lucia">
        <h1 style="margin-top:16px">${esc(titel)}</h1>
        <div class="qrbox">${qrSvg(url)}<div class="stack" style="--gap:10px"><p style="font-size:1.15rem">${esc(text)}</p><p class="url">${esc(url)}</p></div></div>
        ${tabelle}
        <p style="margin-top:16px;color:#444">${esc(V.name)}</p>
        <div class="bar">${["pink", "blue", "green", "orange", "purple", "yellow", "red", "teal"].map(c => `<i style="background:var(--${c})"></i>`).join("")}</div>
      </article>`;
    $$("[data-a]", v).forEach(b => b.onclick = () => location.hash = "aushang-" + b.dataset.a);
    const db = $("#druckBtn"); if (db) db.onclick = () => window.print();
  };

  SEITEN.projekte = (v) => {
    const summe = I.projekte.reduce((s, p) => s + p.betrag, 0);
    const jahre = [...new Set(I.projekte.map(p => p.jahr))].sort((a, b) => b - a);
    v.innerHTML = kopf("pink", "Projekte", "Das haben wir geschafft", "Mit Mitgliedsbeiträgen, Spenden und den Erlösen unserer Feste finanzieren wir, was im Kita-Alltag fehlt.") +
      `<div class="total"><b class="tnum">${euro(summe)}</b><span class="mute">für ${I.projekte.length} abgeschlossene Projekte</span></div>` +
      jahre.map(j => `<h2 class="month">${j}</h2><div class="grid2">${I.projekte.filter(p => p.jahr === j).map(projektKarte).join("")}</div>`).join("") +
      `<section><div class="card"><h3>Ihr habt eine Idee?</h3><p class="mute" style="margin-top:4px">Vorschläge für neue Projekte nehmen wir gern entgegen, zum Beispiel bei der Mitgliederversammlung oder per E-Mail.</p><p style="margin-top:12px"><a class="btn sec small" href="#kontakt">Kontakt aufnehmen</a></p></div></section>`;
  };

  SEITEN.projekt = (v, id) => {
    const p = I.projekte.find(x => x.id === id);
    if (!p) { v.innerHTML = zurueck("projekte", "Alle Projekte") + `<div class="card"><h2>Projekt nicht gefunden</h2></div>`; return; }
    v.innerHTML = zurueck("projekte", "Alle Projekte") +
      `<div class="proj-hero" style="${farbe(p.farbe)}">${ICON[p.symbol] || ICON.stern}</div>` +
      kopf(p.farbe, "Abgeschlossen " + p.jahr, esc(p.titel), esc(p.kurz)) +
      `<dl class="facts"><div><dt>Förderung</dt><dd class="tnum">${euro(p.betrag)}</dd></div><div><dt>Jahr</dt><dd class="tnum">${p.jahr}</dd></div>${p.partner ? `<div><dt>Mit Hilfe von</dt><dd style="font-size:1rem">${esc(p.partner)}</dd></div>` : ""}</dl>
      <div class="prose">${(p.text || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>
      <div class="row noprint" style="margin-top:20px"><button class="btn sec small" id="teilenBtn">${ICON.teilen}Projekt teilen</button></div>`;
    $("#teilenBtn").onclick = () => teilen(p.titel, "projekt-" + p.id);
  };

  SEITEN.verein = (v) => {
    v.innerHTML = kopf("purple", "Über uns", "Der Förderverein", esc(V.zweck)) +
      `<section><h2>Was wir tun</h2><div class="prose" style="margin-top:10px"><ul>
        <li>Anschaffungen, die über das Kita-Budget hinausgehen: Spielgeräte, Bücher, Musikinstrumente</li>
        <li>Zuschüsse zu Ausflügen und Projekten, damit alle Kinder mitmachen können</li>
        <li>Organisation von St.-Martins-Zug, Adventsbasar und Sommerfest gemeinsam mit dem Kita-Team</li></ul></div></section>
      <section><h2>Vorstand</h2><div class="grid2" style="margin-top:10px">${V.vorstand.map(m => `<div class="card"><p class="mute small">${esc(m.rolle)}</p><p style="font-weight:700">${esc(m.name)}</p></div>`).join("")}</div></section>
      <section><h2>Gemeinsam mit der Kita</h2><p class="prose" style="margin-top:10px">Über jedes Projekt sprechen wir vorher mit der Kita-Leitung. So kommt das Geld dort an, wo es im Alltag wirklich gebraucht wird.</p></section>
      <section><div class="card row" style="justify-content:space-between"><div style="flex:1 1 240px;min-width:0"><h3>Mitglied werden</h3><p class="mute small">Ab ${euro(V.mindestbeitrag)} im Jahr, jederzeit kündbar zum Jahresende.</p></div><a class="btn" href="#mitglied">Zum Antrag</a></div></section>`;
  };

  SEITEN.spenden = (v) => {
    const b = V.bank;
    v.innerHTML = kopf("yellow", "Spenden", "Jeder Betrag hilft", "Ob 5 Euro oder eine größere Summe: Eure Spende fließt vollständig in Projekte für die Kinder.") +
      `<div class="card stack" style="--gap:10px">
        <div><p class="mute small">Kontoinhaber</p><p style="font-weight:700">${esc(b.inhaber)}</p></div>
        <div><p class="mute small">IBAN</p><p class="tnum" style="font-weight:700;font-size:1.15rem;letter-spacing:.02em" id="ibanTxt">${esc(b.iban)}</p></div>
        <div class="cols"><div><p class="mute small">BIC</p><p style="font-weight:700">${esc(b.bic)}</p></div><div><p class="mute small">Bank</p><p style="font-weight:700">${esc(b.institut)}</p></div></div>
        <div><button class="btn sec small" id="kopierBtn">IBAN kopieren</button></div></div>
      <section><h2>Spendenquittung</h2><p class="prose" style="margin-top:8px">${V.gemeinnuetzig ? "Der Verein ist als gemeinnützig anerkannt. Bis 300 Euro reicht dem Finanzamt der Kontoauszug als Nachweis. Für höhere Beträge stellen wir gern eine Zuwendungsbestätigung aus; gebt dafür bei der Überweisung eure Adresse an." : ""}</p></section>`;
    $("#kopierBtn").onclick = async () => { try { await navigator.clipboard.writeText(b.iban.replace(/\s/g, "")); toast("IBAN kopiert"); } catch (e) { const r = document.createRange(); r.selectNodeContents($("#ibanTxt")); getSelection().removeAllRanges(); getSelection().addRange(r); } };
  };

  SEITEN.kontakt = (v) => {
    v.innerHTML = kopf("teal", "Kontakt", "Schreibt uns", "Fragen zur Mitgliedschaft, Ideen für Projekte oder Lust, im Vorstand mitzumachen?") +
      `<div class="card stack" style="--gap:12px"><div><p class="mute small">E-Mail</p><p style="font-weight:700"><a href="mailto:${esc(V.kontakt.email)}">${esc(V.kontakt.email)}</a></p></div>
       <div><p class="mute small">Post</p><p>${esc(V.kontakt.adresse)}</p></div>
       <div><p class="mute small">Persönlich</p><p>Sprecht uns beim Bringen und Abholen an, oder werft einen Zettel in den Förderverein-Briefkasten im Eingangsbereich.</p></div></div>`;
  };

  SEITEN.impressum = (v) => {
    v.innerHTML = kopf("teal", "Rechtliches", "Impressum", "") + `<div class="card prose">
      <p><b>${esc(V.name)}</b><br>${esc(V.kontakt.adresse)}</p>
      <p>Vertreten durch den Vorstand nach § 26 BGB: ${V.vorstand.slice(0, 2).map(m => esc(m.rolle + " " + m.name)).join(", ")}</p>
      <p>${esc(V.registergericht)}</p><p>E-Mail: ${esc(V.kontakt.email)}</p>
      <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: ${esc(V.vorstand[0].name)}, Anschrift wie oben</p>
      <p class="mute small">Vorlage – vor Veröffentlichung mit den echten Vereinsdaten füllen und prüfen lassen.</p></div>`;
  };

  SEITEN.datenschutz = (v) => {
    v.innerHTML = kopf("teal", "Rechtliches", "Datenschutz", "") + `<div class="prose">
      <p><b>Verantwortlich</b><br>${esc(V.name)}, ${esc(V.kontakt.adresse)}, ${esc(V.kontakt.email)}</p>
      <h3>Welche Daten wir verarbeiten</h3>
      <ul><li><b>Mitgliedsantrag:</b> Name, Anschrift, E-Mail, Telefon (freiwillig), Bankverbindung und Beitrag. Zweck: Mitgliederverwaltung und Beitragseinzug (Art. 6 Abs. 1 lit. b DSGVO). Löschung spätestens zehn Jahre nach Austritt wegen steuerlicher Aufbewahrungspflichten.</li>
      <li><b>Eintragelisten:</b> Name und freiwillig eine Kontaktmöglichkeit. Öffentlich sichtbar ist nur der Vorname mit Anfangsbuchstaben des Nachnamens. Löschung nach der Veranstaltung.</li>
      <li><b>Auf eurem Gerät</b> speichert die App, für welche Plätze ihr euch eingetragen habt, damit ihr euch wieder austragen könnt. Das bleibt auf eurem Gerät.</li></ul>
      <h3>Hosting und Datenbank</h3><p>[Hoster und Datenbankanbieter mit Serverstandort eintragen, z. B. Supabase, Region Frankfurt. Mit beiden einen Vertrag zur Auftragsverarbeitung abschließen.]</p>
      <h3>Keine Tracker</h3><p>Die Seite nutzt keine Analyse-Werkzeuge, keine Cookies zu Werbezwecken und lädt keine Schriften oder Skripte von fremden Servern.</p>
      <h3>Eure Rechte</h3><p>Ihr habt das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Widerspruch sowie auf Beschwerde bei der Landesbeauftragten für Datenschutz NRW.</p>
      <p class="mute small">Vorlage – vor Veröffentlichung prüfen lassen.</p></div>`;
  };

  /* ---------- Mitgliedsantrag ---------- */
  SEITEN.mitglied = (v) => {
    const opts = V.beitraege.map((b, i) => `<label><input type="radio" name="beitrag" value="${b}" ${i === 1 ? "checked" : ""}><span class="tnum">${euro(b)}</span></label>`).join("");
    v.innerHTML = kopf("blue", "Mitglied werden", "Mitgliedsantrag", "Füllt den Antrag in zwei Minuten aus. Der Beitrag wird einmal im Jahr per Lastschrift eingezogen, kündbar zum Jahresende.") +
      `<form id="antrag" class="card" novalidate>
        <fieldset><legend>Zu eurer Person</legend>
          <div class="cols"><div class="field"><label for="a_vorname">Vorname</label><input id="a_vorname" type="text" autocomplete="given-name" required maxlength="60"></div>
            <div class="field"><label for="a_nachname">Nachname</label><input id="a_nachname" type="text" autocomplete="family-name" required maxlength="60"></div></div>
          <div class="field"><label for="a_strasse">Straße und Hausnummer</label><input id="a_strasse" type="text" autocomplete="street-address" required maxlength="120"></div>
          <div class="cols plz"><div class="field"><label for="a_plz">PLZ</label><input id="a_plz" type="text" inputmode="numeric" autocomplete="postal-code" required pattern="\\d{5}" maxlength="5" placeholder="47608"></div>
            <div class="field"><label for="a_ort">Ort</label><input id="a_ort" type="text" autocomplete="address-level2" required maxlength="80" placeholder="Geldern-Walbeck"></div></div>
          <div class="cols"><div class="field"><label for="a_email">E-Mail</label><input id="a_email" type="email" autocomplete="email" required maxlength="120"></div>
            <div class="field"><label for="a_tel">Telefon <span class="mute">(freiwillig)</span></label><input id="a_tel" type="tel" autocomplete="tel" maxlength="40"></div></div>
          <div class="field"><label for="a_kind">Kind in der Kita, Gruppe <span class="mute">(freiwillig)</span></label><input id="a_kind" type="text" maxlength="120" placeholder="z. B. Mia, Gruppe Sonnenblume"></div>
        </fieldset>
        <fieldset><legend>Jahresbeitrag</legend>
          <div class="choice" role="radiogroup" aria-label="Jahresbeitrag">${opts}<label><input type="radio" name="beitrag" value="eigen"><span>Eigener Betrag</span></label></div>
          <div class="field" id="eigenFeld" hidden><label for="a_eigen">Betrag in Euro pro Jahr (mindestens ${euro(V.mindestbeitrag)})</label><input id="a_eigen" type="number" inputmode="decimal" min="${V.mindestbeitrag}" step="1"></div>
        </fieldset>
        <fieldset><legend>SEPA-Lastschriftmandat</legend>
          <div class="field"><label for="a_inhaber">Kontoinhaber/in</label><input id="a_inhaber" type="text" autocomplete="cc-name" required maxlength="120"></div>
          <div class="field"><label for="a_iban">IBAN</label><input id="a_iban" type="text" autocomplete="off" required maxlength="42" placeholder="DE.. .... .... .... .... .." spellcheck="false" style="font-variant-numeric:tabular-nums;letter-spacing:.03em"></div>
          <p class="mandate">Ich ermächtige den ${esc(V.name)} (Gläubiger-ID ${esc(V.glaeubigerId)}), den Mitgliedsbeitrag jährlich von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die Lastschriften einzulösen. Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten die mit meinem Kreditinstitut vereinbarten Bedingungen. Die Mandatsreferenz wird mir separat mitgeteilt.</p>
          <label class="check"><input type="checkbox" id="a_sepa" required><span>Ich erteile das SEPA-Lastschriftmandat.</span></label>
          <label class="check"><input type="checkbox" id="a_ds" required><span>Ich habe die <a href="#datenschutz">Datenschutzhinweise</a> gelesen und bin mit der Speicherung meiner Daten für die Mitgliederverwaltung einverstanden.</span></label>
        </fieldset>
        <input class="hp" type="text" id="a_web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="err" id="a_err" hidden></p>
        <button class="btn block" type="submit">Antrag abschicken</button>
        <p class="mute small">Nach dem Abschicken bestätigt der Vorstand eure Mitgliedschaft per E-Mail.</p>
      </form>
      <section class="noprint"><div class="card row" style="justify-content:space-between"><div style="flex:1 1 240px;min-width:0"><h3>Lieber auf Papier werben?</h3><p class="mute small">Aushang mit QR-Code zum Antrag für die Kita-Pinnwand.</p></div><a class="btn sec small" href="#aushang-mitglied">${ICON.qr}Aushang</a></div></section>`;
    const f = $("#antrag");
    const eigen = $("#eigenFeld");
    $$('input[name="beitrag"]', f).forEach(r => r.onchange = () => { eigen.hidden = r.value !== "eigen" || !r.checked; if (!eigen.hidden) $("#a_eigen").focus(); });
    $("#a_iban").addEventListener("input", e => { const el = e.target, pos = el.selectionStart === el.value.length; el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})/g, "$1 ").trim(); if (pos) el.selectionStart = el.selectionEnd = el.value.length; });
    const inhaberVorschlag = () => { const i = $("#a_inhaber"); if (!i.value || i.dataset.auto) { i.value = ($("#a_vorname").value + " " + $("#a_nachname").value).trim(); i.dataset.auto = 1; } };
    $("#a_vorname").addEventListener("input", inhaberVorschlag); $("#a_nachname").addEventListener("input", inhaberVorschlag);
    $("#a_inhaber").addEventListener("input", e => { delete e.target.dataset.auto; });
    f.onsubmit = async (e) => {
      e.preventDefault();
      $$(".field.bad", f).forEach(x => x.classList.remove("bad")); $$(".field .err", f).forEach(x => x.remove());
      const err = $("#a_err"); err.hidden = true;
      if ($("#a_web").value) return;
      const fehler = [];
      const pruef = (id, ok, text) => { if (!ok) { const fl = $("#" + id).closest(".field"); if (fl) { fl.classList.add("bad"); fl.insertAdjacentHTML("beforeend", `<span class="err">${text}</span>`); } fehler.push(id); } };
      const val = (id) => $("#" + id).value.trim();
      pruef("a_vorname", val("a_vorname"), "Bitte Vornamen eintragen.");
      pruef("a_nachname", val("a_nachname"), "Bitte Nachnamen eintragen.");
      pruef("a_strasse", val("a_strasse"), "Bitte Straße und Hausnummer eintragen.");
      pruef("a_plz", /^\d{5}$/.test(val("a_plz")), "Fünf Ziffern, z. B. 47608.");
      pruef("a_ort", val("a_ort"), "Bitte Ort eintragen.");
      pruef("a_email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val("a_email")), "Bitte eine gültige E-Mail-Adresse eintragen.");
      pruef("a_inhaber", val("a_inhaber"), "Bitte Kontoinhaber/in eintragen.");
      pruef("a_iban", ibanOk(val("a_iban")), "Diese IBAN stimmt nicht. Bitte noch einmal vergleichen.");
      const wahl = $('input[name="beitrag"]:checked', f).value;
      const beitrag = wahl === "eigen" ? parseFloat(String($("#a_eigen").value).replace(",", ".")) : +wahl;
      if (wahl === "eigen") pruef("a_eigen", beitrag >= V.mindestbeitrag, "Mindestens " + euro(V.mindestbeitrag) + ".");
      if (!$("#a_sepa").checked) fehler.push("a_sepa");
      if (!$("#a_ds").checked) fehler.push("a_ds");
      if (fehler.length) {
        err.textContent = fehler.some(x => x === "a_sepa" || x === "a_ds") && fehler.length <= 2 && fehler.every(x => x === "a_sepa" || x === "a_ds")
          ? "Bitte die beiden Häkchen beim Lastschriftmandat und beim Datenschutz setzen." : "Bitte die markierten Felder prüfen.";
        err.hidden = false; const first = $("#" + fehler[0]); if (first) first.focus(); return;
      }
      const daten = { vorname: val("a_vorname"), nachname: val("a_nachname"), strasse: val("a_strasse"), plz: val("a_plz"), ort: val("a_ort"),
        email: val("a_email"), telefon: val("a_tel"), kind: val("a_kind"), beitrag, kontoinhaber: val("a_inhaber"),
        iban: val("a_iban").replace(/\s/g, ""), sepa_mandat: true, datenschutz: true };
      const btn = f.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Wird gesendet …";
      try { await D.antrag(daten); bestaetigung(v, daten); window.scrollTo(0, 0); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = "Antrag abschicken"; }
    };
  };

  function bestaetigung(v, a) {
    const iban = a.iban.replace(/(.{4})/g, "$1 ").trim();
    const maskiert = iban.slice(0, 4) + " •••• •••• •••• " + iban.slice(-7);
    v.innerHTML = kopf("green", "Geschafft", "Danke, " + esc(a.vorname) + "!", "Euer Antrag ist beim Vorstand angekommen. Ihr bekommt eine Bestätigung per E-Mail an " + esc(a.email) + ".") +
      `<div class="card stack" style="--gap:8px"><h3>Eure Angaben</h3>
        <p>${esc(a.vorname)} ${esc(a.nachname)}<br>${esc(a.strasse)}<br>${esc(a.plz)} ${esc(a.ort)}</p>
        <p>Jahresbeitrag: <b class="tnum">${euro(a.beitrag)}</b></p>
        <p>Lastschrift von: ${esc(a.kontoinhaber)}, <span class="tnum">${maskiert}</span></p>
        <p class="mute small">Gläubiger-ID ${esc(V.glaeubigerId)} · eingegangen am ${new Date().toLocaleDateString("de-DE")}</p></div>
      <div class="row noprint" style="margin-top:16px">${PREVIEW ? "" : `<button class="btn sec" onclick="window.print()">${ICON.druck}Kopie drucken</button>`}<a class="btn" href="#start">Zur Startseite</a></div>`;
  }

  /* ---------- Verwaltung ---------- */
  let vTab = "antraege";
  SEITEN.verwaltung = async (v) => {
    if (!D.angemeldet()) {
      v.innerHTML = kopf("teal", "Nur für den Vorstand", "Verwaltung", D.live ? "Meldet euch mit eurem Vorstandskonto an." : "Im Vorschau-Modus lautet das Passwort „" + esc(C.demoPasswort || "demo") + "“.") +
        `<form id="login" class="card" style="max-width:420px" novalidate>
          <div class="field"><label for="l_mail">E-Mail</label><input id="l_mail" type="email" autocomplete="username" ${D.live ? "required" : `value="vorstand@beispiel.de"`}></div>
          <div class="field"><label for="l_pw">Passwort</label><input id="l_pw" type="password" autocomplete="current-password" required></div>
          <p class="err" id="l_err" hidden></p><button class="btn block" type="submit">Anmelden</button></form>`;
      $("#login").onsubmit = async (e) => {
        e.preventDefault(); const er = $("#l_err");
        try { await D.anmelden($("#l_mail").value.trim(), $("#l_pw").value); render(); } catch (ex) { er.textContent = ex.message; er.hidden = false; }
      };
      return;
    }
    const tabs = [["antraege", "Mitgliedsanträge"], ["listen", "Eintragelisten"]];
    v.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="eyebrow" style="--dot:var(--teal)">Verwaltung</span><button class="btn ghost small" id="abmelden">Abmelden</button></div>
      <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" aria-selected="${k === vTab}" data-t="${k}">${t}</button>`).join("")}</div><div id="vInhalt"><p class="mute">Lädt …</p></div>`;
    $("#abmelden").onclick = async () => { await D.abmelden(); render(); };
    $$("[data-t]", v).forEach(b => b.onclick = () => { vTab = b.dataset.t; render(); });
    const box = $("#vInhalt");
    if (vTab === "antraege") await verwaltungAntraege(box); else await verwaltungListen(box);
  };

  async function verwaltungAntraege(box) {
    const a = await D.antraege();
    const neu = a.filter(x => x.status === "neu").length;
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="font-size:1.6rem">Mitgliedsanträge</h1>
        ${PREVIEW ? "" : `<button class="btn sec small" id="csvBtn" ${a.length ? "" : "disabled"}>${ICON.install}Als Tabelle (CSV)</button>`}</div>
      <p class="mute" style="margin-bottom:12px">${a.length} Anträge, davon ${neu} neu. Nach dem Übertragen in die Mitgliederverwaltung auf „angenommen“ setzen.</p>
      ${a.length ? `<div class="tablewrap"><table><thead><tr><th>Eingang</th><th>Name</th><th>Ort</th><th>E-Mail</th><th>Beitrag</th><th>IBAN</th><th>Status</th></tr></thead><tbody>
        ${a.map(x => `<tr><td class="tnum">${new Date(x.erstellt).toLocaleDateString("de-DE")}</td><td>${esc(x.vorname)} ${esc(x.nachname)}${x.kind ? `<br><span class="mute small">${esc(x.kind)}</span>` : ""}</td>
          <td>${esc(x.plz)} ${esc(x.ort)}</td><td>${esc(x.email)}</td><td class="tnum">${euro(+x.beitrag)}</td><td class="tnum">${esc(String(x.iban).replace(/(.{4})/g, "$1 "))}</td>
          <td><select data-st="${esc(x.id)}" aria-label="Status">${["neu", "angenommen", "abgelehnt"].map(s => `<option ${s === x.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card"><p class="mute">Noch keine Anträge eingegangen.</p></div>`}`;
    $$("[data-st]", box).forEach(s => s.onchange = async () => { try { await D.antragStatus(s.dataset.st, s.value); toast("Status gespeichert"); } catch (e) { toast(e.message); } });
    const cb = $("#csvBtn"); if (cb) cb.onclick = () => {
      const cols = ["erstellt", "vorname", "nachname", "strasse", "plz", "ort", "email", "telefon", "kind", "beitrag", "kontoinhaber", "iban", "status"];
      const csv = "﻿" + [cols.join(";"), ...a.map(x => cols.map(c => '"' + String(x[c] ?? "").replace(/"/g, '""') + '"').join(";"))].join("\r\n");
      const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      l.download = "mitgliedsantraege_" + new Date().toISOString().slice(0, 10) + ".csv"; l.click();
    };
  }

  async function verwaltungListen(box, bearbeiten) {
    const listen = await D.listen({ alle: true });
    if (bearbeiten !== undefined) return listeEditor(box, listen.find(l => l.id === bearbeiten) || null);
    box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h1 style="font-size:1.6rem">Eintragelisten</h1>
        <button class="btn small" id="neuBtn">${ICON.plus}Neue Liste</button></div>
      <div class="list">${listen.map(l => `<div class="card"><div class="row" style="justify-content:space-between"><div style="min-width:0"><h3>${esc(l.titel)}</h3>
          <p class="mute small">${l.datum ? datumLang(l.datum) + " · " : ""}${gesamt(l) - frei(l)} von ${gesamt(l)} Plätzen belegt · ${l.aktiv ? "offen" : "geschlossen"}</p></div>
          <div class="row"><button class="btn sec small" data-ed="${esc(l.id)}">Bearbeiten</button><button class="btn sec small" data-ei="${esc(l.id)}">Einträge</button><a class="btn ghost small" href="#aushang-${esc(l.id)}">Aushang</a></div></div>
          <div id="ei-${esc(l.id)}"></div></div>`).join("") || `<div class="card"><p class="mute">Noch keine Listen. Legt die erste an.</p></div>`}</div>`;
    $("#neuBtn").onclick = () => verwaltungListen(box, null);
    $$("[data-ed]", box).forEach(b => b.onclick = () => verwaltungListen(box, b.dataset.ed));
    $$("[data-ei]", box).forEach(b => b.onclick = async () => {
      const l = listen.find(x => x.id === b.dataset.ei); const ziel = $("#ei-" + CSS.escape(l.id));
      if (ziel.innerHTML) { ziel.innerHTML = ""; return; }
      const e = await D.eintraegeVoll(l.id);
      ziel.innerHTML = `<div class="tablewrap" style="margin-top:12px"><table><thead><tr><th>Aufgabe</th><th>Name</th><th>Kontakt</th><th></th></tr></thead><tbody>
        ${l.plaetze.flatMap(p => e.filter(x => x.platz_id === p.id).map(x => `<tr><td>${esc(p.bezeichnung)} <span class="mute small">${esc(p.zeit || "")}</span></td><td>${esc(x.name)}</td><td>${esc(x.kontakt || "")}</td><td><button class="btn ghost small" data-del="${esc(x.id)}">Entfernen</button></td></tr>`)).join("") || `<tr><td colspan="4" class="mute">Noch niemand eingetragen.</td></tr>`}
        </tbody></table></div>`;
      $$("[data-del]", ziel).forEach(d => d.onclick = async () => { await D.eintragLoeschen(d.dataset.del); toast("Eintrag entfernt"); ziel.innerHTML = ""; b.click(); });
    });
  }

  function listeEditor(box, l) {
    const neu = !l;
    l = l || { titel: "", datum: "", beschreibung: "", aktiv: true, plaetze: [{ bezeichnung: "", zeit: "", anzahl: 2 }] };
    let plaetze = l.plaetze.map(p => ({ id: p.id, bezeichnung: p.bezeichnung, zeit: p.zeit, anzahl: p.anzahl, belegt: (p.belegt || []).length }));
    const zeilen = () => plaetze.map((p, i) => `<div class="slot-edit">
        <div class="field"><label for="p_b${i}">Aufgabe</label><input id="p_b${i}" type="text" value="${esc(p.bezeichnung)}" data-i="${i}" data-k="bezeichnung" placeholder="z. B. Aufsicht Hof"></div>
        <div class="field"><label for="p_z${i}">Zeit</label><input id="p_z${i}" type="text" value="${esc(p.zeit)}" data-i="${i}" data-k="zeit" placeholder="14–16 Uhr"></div>
        <div class="field"><label for="p_a${i}">Plätze</label><input id="p_a${i}" type="number" min="1" max="99" value="${p.anzahl}" data-i="${i}" data-k="anzahl"></div>
        <button type="button" class="iconbtn" data-rm="${i}" aria-label="Aufgabe entfernen" ${plaetze.length < 2 ? "disabled" : ""}>${ICON.x}</button></div>`).join("");
    box.innerHTML = `<button class="btn ghost" id="zur">${ICON.zurueck}Alle Listen</button>
      <form id="lf" class="card" style="margin-top:8px" novalidate><h1 style="font-size:1.5rem">${neu ? "Neue Liste" : "Liste bearbeiten"}</h1>
        <div class="cols"><div class="field"><label for="l_t">Titel</label><input id="l_t" type="text" required value="${esc(l.titel)}" placeholder="z. B. Sommerfest"></div>
          <div class="field"><label for="l_d">Datum</label><input id="l_d" type="date" value="${esc(l.datum || "")}"></div></div>
        <div class="field"><label for="l_b">Hinweis für die Eltern</label><textarea id="l_b" maxlength="1000">${esc(l.beschreibung || "")}</textarea></div>
        <label class="check"><input type="checkbox" id="l_a" ${l.aktiv ? "checked" : ""}><span>Liste ist offen zum Eintragen</span></label>
        <fieldset><legend>Aufgaben</legend><div id="pz" class="stack" style="--gap:10px">${zeilen()}</div>
          <div><button type="button" class="btn sec small" id="plus">${ICON.plus}Aufgabe hinzufügen</button></div></fieldset>
        <p class="mute small">Wird eine Aufgabe entfernt, werden auch die Eintragungen darin gelöscht.</p>
        <p class="err" id="lf_err" hidden></p>
        <div class="row"><button class="btn" type="submit">Speichern</button>${neu ? "" : `<button class="btn sec" type="button" id="loeschen" style="color:var(--err)">Liste löschen</button>`}</div>
        <div id="sicher"></div></form>`;
    const pz = $("#pz", box);
    const neuZeichnen = () => { pz.innerHTML = zeilen(); binden(); };
    const binden = () => {
      $$("[data-k]", pz).forEach(inp => inp.oninput = () => { plaetze[+inp.dataset.i][inp.dataset.k] = inp.dataset.k === "anzahl" ? +inp.value : inp.value; });
      $$("[data-rm]", pz).forEach(b => b.onclick = () => { plaetze.splice(+b.dataset.rm, 1); neuZeichnen(); });
    };
    binden();
    $("#plus", box).onclick = () => { plaetze.push({ bezeichnung: "", zeit: "", anzahl: 1 }); neuZeichnen(); $(`#p_b${plaetze.length - 1}`, box).focus(); };
    $("#zur", box).onclick = () => verwaltungListen(box);
    const lb = $("#loeschen", box);
    if (lb) lb.onclick = () => {
      $("#sicher", box).innerHTML = `<div class="notice" style="margin-top:12px;background:var(--tint-red)"><div class="stack" style="--gap:8px"><p><b>Liste wirklich löschen?</b> Alle Eintragungen gehen verloren.</p>
        <div class="row"><button type="button" class="btn small" style="background:var(--err)" id="jaLoeschen">Endgültig löschen</button><button type="button" class="btn sec small" id="neinLoeschen">Abbrechen</button></div></div></div>`;
      $("#neinLoeschen", box).onclick = () => $("#sicher", box).innerHTML = "";
      $("#jaLoeschen", box).onclick = async () => { await D.listeLoeschen(l.id); toast("Liste gelöscht"); verwaltungListen(box); };
    };
    $("#lf", box).onsubmit = async (e) => {
      e.preventDefault(); const er = $("#lf_err", box);
      const titel = $("#l_t", box).value.trim();
      const ps = plaetze.filter(p => String(p.bezeichnung).trim());
      if (titel.length < 2) { er.textContent = "Bitte einen Titel eingeben."; er.hidden = false; return; }
      if (!ps.length) { er.textContent = "Mindestens eine Aufgabe eintragen."; er.hidden = false; return; }
      try {
        await D.listeSpeichern({ id: l.id, titel, datum: $("#l_d", box).value, beschreibung: $("#l_b", box).value.trim(), aktiv: $("#l_a", box).checked,
          plaetze: ps.map(p => ({ id: p.id, bezeichnung: p.bezeichnung.trim(), zeit: String(p.zeit || "").trim(), anzahl: Math.max(1, Math.min(99, +p.anzahl || 1)) })) });
        toast("Liste gespeichert"); verwaltungListen(box);
      } catch (ex) { er.textContent = ex.message; er.hidden = false; }
    };
  }

  SEITEN.nichtgefunden = (v) => { v.innerHTML = `<div class="card"><h1>Seite nicht gefunden</h1><p class="mute" style="margin-top:8px">Diese Adresse gibt es nicht (mehr).</p><p style="margin-top:12px"><a class="btn" href="#start">Zur Startseite</a></p></div>`; };

  /* ---------- Start ---------- */
  try { const t = localStorage.getItem("fv_theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  shell();
  render();
  if (!PREVIEW && "serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
