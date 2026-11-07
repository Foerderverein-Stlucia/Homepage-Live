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
  let V = I.verein;
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
    insta: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>'),
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
    herz: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
    wasser: svg('<path d="M12 3s-6 6.5-6 11a6 6 0 0012 0c0-4.5-6-11-6-11z"/><path d="M9 15a3 3 0 003 3"/>'),
    reck: svg('<path d="M4 21V6M20 21V6M4 8h16"/><path d="M10 8v4l-2 4M10 12l2 4M10 12h-1.5"/><circle cx="10" cy="10.2" r=".1"/>'),
    steine: svg('<ellipse cx="12" cy="18" rx="8" ry="2.5"/><ellipse cx="12" cy="12.5" rx="6" ry="2.2"/><ellipse cx="12" cy="7.5" rx="4" ry="1.8"/>'),
    wippe: svg('<path d="M6 21h12M12 21v-3"/><path d="M10 18c-1-1-1-2 0-3s1-2 0-3"/><path d="M5 11h10l2-3h2M7 11V8h5v3"/><circle cx="7" cy="12.5" r="1.5"/><circle cx="15" cy="12.5" r="1.5"/>'),
    luft: svg('<rect x="7" y="4" width="10" height="16" rx="2"/><path d="M10 8h4M10 11h4M10 14h4M2 9c1.5-1 2.5 1 4 0M2 14c1.5-1 2.5 1 4 0M18 9c1.5-1 2.5 1 4 0M18 14c1.5-1 2.5 1 4 0"/>')
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
    const ie = (x) => String(x).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
    const z = (s) => s.replace(/[-:]/g, "");
    const start = t.datum + "T" + (t.von || "00:00") + ":00", ende = t.datum + "T" + (t.bis || t.von || "23:59") + ":00";
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Foerderverein St. Lucia//DE", "BEGIN:VEVENT",
      "UID:" + t.id + "@foerderverein-st-lucia", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART;TZID=Europe/Berlin:" + z(start), "DTEND;TZID=Europe/Berlin:" + z(ende),
      "SUMMARY:" + ie(t.titel), "LOCATION:" + ie(t.ort || ""), "DESCRIPTION:" + ie(t.text || ""), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
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
    { id: "start", t: "Startseite", s: "Zurück zum Anfang", f: "pink" },
    { id: "galerie", t: "Eindrücke", s: "Fotos von Festen und Aktionen", f: "orange" },
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
        <a class="brand" href="#start" aria-label="Startseite"><img src="${window.FV_LOGO_PUNKTE || "img/logo-punkte.png"}" alt="" width="40" height="40"><span>Förderverein<small>Kita St. Lucia · ${esc(V.ort)}</small></span></a>
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
      ${MEHR.filter(m => m.id !== "galerie" || (I.galerie || []).length).map(m => `<a href="#${m.id}" data-zu style="--dot:var(--${m.f})"><span class="d"></span><span>${m.t}<small>${m.s}</small></span></a>`).join("")}
      ${igName() ? `<a href="https://www.instagram.com/${esc(igName())}/" target="_blank" rel="noopener noreferrer"><span class="ig">${ICON.insta}</span><span>Instagram<small>@${esc(igName())}</small></span></a>` : ""}
      <hr>
      ${installierbar() && installEvt ? `<button id="instBtn"><span class="d" style="--dot:var(--green)"></span><span>App installieren<small>Auf den Startbildschirm legen</small></span></button>` : ""}
      ${Push.moeglich() ? `<button id="pushHilfe"><span class="d" style="--dot:var(--pink)"></span><span>Benachrichtigungen<small>Hinweise und Erinnerungen aufs Handy</small></span></button>` : ""}
      ${!PREVIEW ? `<button id="instHilfe"><span class="d" style="--dot:var(--green)"></span><span>App aufs Handy holen<small>Kurze Anleitung für iPhone und Android</small></span></button>` : ""}
      <button id="themeBtn"><span class="d" style="--dot:var(--ink)"></span><span>Darstellung: ${theme === "dark" ? "dunkel" : theme === "light" ? "hell" : "wie Gerät"}<small>Antippen zum Wechseln</small></span></button>
      <a href="#impressum" data-zu><span class="d" style="--dot:var(--line)"></span>Impressum</a>
      <a href="#datenschutz" data-zu><span class="d" style="--dot:var(--line)"></span>Datenschutz</a>
      <a href="#verwaltung" data-zu><span class="d" style="--dot:var(--line)"></span><span>Verwaltung<small>Nur für den Vorstand</small></span></a>
    </nav>`, (bg, zu) => {
      const ib = $("#instBtn", bg); if (ib) ib.onclick = () => { zu(); installieren(); };
      const ph = $("#pushHilfe", bg); if (ph) ph.onclick = () => { zu(); pushDialog(); };
      const ih = $("#instHilfe", bg); if (ih) ih.onclick = () => { zu(); installAnleitung(istIOS ? "ios" : "android"); };
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
  const installierbar = () => !PREVIEW && !standalone() && (installEvt || istIOS || matchMedia("(pointer:coarse)").matches);
  async function installieren() {
    if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome === "accepted") toast("Wird installiert"); render(); return; }
    installAnleitung(istIOS ? "ios" : "android");
  }
  function installAnleitung(wahl) {
    const ios = `<ol class="stack" style="--gap:8px;padding-left:1.2em;margin:10px 0 0"><li>Die Seite in <b>Safari</b> öffnen.</li><li>Unten auf <b>Teilen</b> tippen (Quadrat mit Pfeil nach oben).</li><li>Nach unten wischen und <b>Zum Home-Bildschirm</b> wählen.</li><li>Oben rechts auf <b>Hinzufügen</b> tippen.</li></ol>`;
    const and = `<ol class="stack" style="--gap:8px;padding-left:1.2em;margin:10px 0 0"><li>Die Seite in <b>Chrome</b> öffnen.</li><li>Oben rechts auf die <b>drei Punkte</b> tippen.</li><li><b>App installieren</b> bzw. <b>Zum Startbildschirm hinzufügen</b> wählen.</li><li>Mit <b>Installieren</b> bestätigen.</li></ol>`;
    sheet(`<h2>Als App aufs Handy</h2><p class="mute" style="margin-top:4px">Dann liegt das Symbol auf dem Startbildschirm und die Seite öffnet sich wie eine App.</p>
      <div class="stack" style="--gap:16px;margin:16px 0">
        <div class="card" style="box-shadow:none"><h3>iPhone und iPad</h3>${ios}</div>
        <div class="card" style="box-shadow:none"><h3>Android</h3>${and}<p class="mute small" style="margin-top:8px">Bei Samsung Internet oder Firefox heißt der Punkt ähnlich, meist im Menü unter „Hinzufügen zu“.</p></div>
      </div><button class="btn block" data-zu>Verstanden</button>`);
  }

  /* ---------- Benachrichtigungen (Web Push) ---------- */
  const Push = {
    moeglich() { return !PREVIEW && D.live && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && location.protocol === "https:"; },
    brauchtApp() { return istIOS && !standalone(); },
    async abo() { try { const r = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(no, 2500))]); return await r.pushManager.getSubscription(); } catch (e) { return null; } },
    tokens() { return D.meine.alle().map(m => m.token).filter(Boolean); },
    async sync() { try { const a = await Push.abo(); if (a && Notification.permission === "granted") await D.pushAnmelden(a.toJSON(), Push.tokens()); } catch (e) {} },
    async an() {
      const erlaubnis = await Notification.requestPermission();
      if (erlaubnis !== "granted") throw new Error("Benachrichtigungen sind für diese Seite blockiert. Das lässt sich in den Einstellungen des Geräts oder Browsers ändern.");
      const key = await D.pushSchluessel(); if (!key) throw new Error("Benachrichtigungen sind noch nicht eingerichtet. Bitte später noch einmal versuchen.");
      const pad = "=".repeat((4 - key.length % 4) % 4), raw = atob((key + pad).replace(/-/g, "+").replace(/_/g, "/"));
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, c => c.charCodeAt(0)) });
      await D.pushAnmelden(sub.toJSON(), Push.tokens());
    },
    async aus() { const a = await Push.abo(); if (a) { const e = a.endpoint; await a.unsubscribe(); try { await D.pushAbmelden(e); } catch (x) {} } }
  };
  /* Einmaliger Hinweis in der installierten App; bei "Nicht jetzt" frühestens nach 30 Tagen wieder */
  async function pushEinladung() {
    if (!Push.moeglich() || !standalone() || Notification.permission !== "default") return;
    let zuletzt = 0; try { zuletzt = +localStorage.getItem("fv_push_gefragt") || 0; } catch (e) {}
    if (zuletzt && Date.now() - zuletzt < 30 * 864e5) return;
    if (await Push.abo()) return;
    if (document.querySelector(".sheet-bg")) return;
    try { localStorage.setItem("fv_push_gefragt", String(Date.now())); } catch (e) {}
    sheet(`<h2>Nichts verpassen?</h2>
      <p class="mute" style="margin-top:6px">Schaltet Benachrichtigungen ein, dann meldet sich die App bei euch:</p>
      <ul style="margin:10px 0 12px;padding-left:1.2em"><li>bei wichtigen Mitteilungen des Vorstands</li><li>wenn ihr von der Warteliste nachrückt</li><li>am Vortag eures Helferdienstes</li></ul>
      <p class="mute small">Keine Werbung. Ihr könnt es jederzeit im Menü unter „Benachrichtigungen“ ausschalten.</p>
      <p class="err" id="pushErr" hidden></p>
      <button class="btn green block" id="pushJa" style="margin-top:12px">Benachrichtigungen einschalten</button>
      <button class="btn ghost block" data-zu style="margin-top:6px">Nicht jetzt</button>`, (bg, zu) => {
      $("#pushJa", bg).onclick = async (e) => {
        e.target.disabled = true;
        try { await Push.an(); zu(); toast("Benachrichtigungen sind an"); }
        catch (ex) { const er = $("#pushErr", bg); er.textContent = ex.message; er.hidden = false; e.target.disabled = false; }
      };
    });
  }
  /* Im Browser auf dem Handy: einmalig zur Installation als App einladen (danach frühestens nach 30 Tagen wieder) */
  function installEinladung() {
    if (PREVIEW || standalone() || !matchMedia("(pointer:coarse)").matches || document.querySelector(".sheet-bg")) return;
    let zuletzt = 0; try { zuletzt = +localStorage.getItem("fv_inst_gefragt") || 0; } catch (e) {}
    if (zuletzt && Date.now() - zuletzt < 30 * 864e5) return;
    try { localStorage.setItem("fv_inst_gefragt", String(Date.now())); } catch (e) {}
    sheet(`<h2>Als App aufs Handy?</h2>
      <p class="mute" style="margin-top:6px">Mit dem Symbol auf dem Startbildschirm öffnet sich die Seite wie eine App, und ihr könnt Benachrichtigungen einschalten:</p>
      <ul style="margin:10px 0 12px;padding-left:1.2em"><li>Hinweise vom Vorstand zu Festen und Aktionen</li><li>Erinnerung am Vortag eures Helferdienstes</li><li>Bescheid, wenn ihr von der Warteliste nachrückt</li></ul>
      <button class="btn green block" id="instJa" style="margin-top:12px">${installEvt ? "App installieren" : "So geht’s"}</button>
      <button class="btn ghost block" data-zu style="margin-top:6px">Nicht jetzt</button>`, (bg, zu) => {
      $("#instJa", bg).onclick = () => { zu(); installieren(); };
    });
  }
  async function pushDialog() {
    const abo = Push.moeglich() ? await Push.abo() : null, an = !!abo && Notification.permission === "granted";
    const nein = !Push.moeglich() ? "Benachrichtigungen sind in dieser Ansicht nicht verfügbar." : Push.brauchtApp() ? "Auf dem iPhone und iPad gehen Benachrichtigungen nur, wenn die Seite als App auf dem Home-Bildschirm liegt. Legt sie zuerst dort ab und öffnet sie dann von dort." : "";
    sheet(`<h2>Benachrichtigungen</h2>
      <p class="mute" style="margin-top:4px">Wir schicken euch nur, was wirklich wichtig ist:</p>
      <ul style="margin:10px 0 12px;padding-left:1.2em"><li>Mitteilungen des Vorstands, zum Beispiel zu Festen und Aktionen</li><li>Ein Hinweis, wenn ihr von der Warteliste nachgerückt seid</li><li>Eine Erinnerung am Vortag eures Helferdienstes</li></ul>
      <p class="mute small">Gespeichert wird nur eine anonyme Adresse eures Geräts und die geheime Kennung eurer Einträge, keine Namen und keine E-Mail-Adressen. Ihr könnt es jederzeit wieder ausschalten.</p>
      ${nein ? `<div class="notice" style="margin:12px 0">${ICON.info}<p>${nein}</p></div>${Push.moeglich() && Push.brauchtApp() ? `<button class="btn sec block" data-anl>So legt ihr die App auf den Home-Bildschirm</button>` : ""}` : `<p class="err" id="pushErr" hidden></p>
      <button class="btn ${an ? "sec" : "green"} block" id="pushBtn" style="margin-top:12px">${an ? "Benachrichtigungen ausschalten" : "Benachrichtigungen einschalten"}</button>`}
      <button class="btn ghost block" data-zu style="margin-top:6px">Schließen</button>`, (bg, zu) => {
      const al = $("[data-anl]", bg); if (al) al.onclick = () => { zu(); installAnleitung("ios"); };
      const b = $("#pushBtn", bg); if (!b) return;
      b.onclick = async () => {
        b.disabled = true;
        try { if (an) { await Push.aus(); toast("Benachrichtigungen aus"); } else { await Push.an(); toast("Benachrichtigungen sind an"); } zu(); }
        catch (e) { const er = $("#pushErr", bg); er.textContent = e.message; er.hidden = false; b.disabled = false; }
      };
    });
  }

  /* ---------- Router ---------- */
  const aktuell = () => decodeURIComponent(location.hash.slice(1)) || "start";
  const SEITEN = {};
  /* Anonymer Seitenzähler: nur Seite, Gerätetyp und App/Browser, keine Cookies, keine Kennung, keine IP-Speicherung */
  let zuletztGezaehlt = "";
  function zaehlen(h, name, arg) {
    if (PREVIEW || !D.aufruf || zuletztGezaehlt === h) return;
    if (["verwaltung", "registrieren", "nichtgefunden"].includes(name) || D.angemeldet() || navigator.webdriver || /bot|crawl|spider|preview/i.test(navigator.userAgent)) return;
    zuletztGezaehlt = h;
    const seite = (["projekt", "liste", "aushang"].includes(name) ? name + "-" + arg : h).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "start";
    D.aufruf(seite, matchMedia("(pointer:coarse)").matches ? "handy" : "computer", !!standalone());
  }
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
    zaehlen(h, name, arg);
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
          ${t.spende ? `<a class="btn small" href="#spenden">Spenden</a>` : ""}
          ${kompakt || PREVIEW ? "" : `<button class="btn small sec" data-ics="${esc(t.id)}">${ICON.kal}In den Kalender</button>`}
        </div></div></article>`;
  }
  const istGeplant = (p) => p.status === "geplant";
  const fertige = () => I.projekte.filter(p => !istGeplant(p));
  const geplante = () => I.projekte.filter(istGeplant);
  const fortschritt = (p) => (+p.ziel > 0 && +p.gesammelt >= 0 && p.gesammelt !== "" && p.gesammelt != null) ? `<span class="fort" role="img" aria-label="${euro(+p.gesammelt)} von ${euro(+p.ziel)} gesammelt"><i style="width:${Math.min(100, Math.round(+p.gesammelt / +p.ziel * 100))}%"></i></span><span class="fortz tnum">${euro(+p.gesammelt)} von ${euro(+p.ziel)} gesammelt</span>` : (+p.ziel > 0 ? `<span class="fortz tnum">Ziel: ${euro(+p.ziel)}</span>` : "");
  const projSumme = () => fertige().reduce((s, p) => s + (+p.betrag || 0), 0);
  const projJahre = () => fertige().map(p => p.jahr).filter(Boolean);
  const jahresSumme = (j) => fertige().filter(p => (p.jahr || 0) === j).reduce((t, p) => t + (+p.betrag || 0), 0);
  function summenZeile() {
    const jj = projJahre(); const neu = jj.length ? Math.max(...jj) : 0, sum = neu ? jahresSumme(neu) : 0;
    return sum ? `<div class="total"><b class="tnum">${euro(sum)}</b><span class="mute">haben wir ${neu} für die Kita-Kinder eingesetzt</span></div>`
               : `<div class="total"><b class="tnum">${fertige().length} Projekte</b><span class="mute">dank eurer Beiträge und Spenden verwirklicht</span></div>`;
  }
  function projektKarte(p) {
    return `<a class="card link proj" href="#projekt-${esc(p.id)}" style="${farbe(p.farbe)}">
      ${p.bild ? `<img class="badge photo" src="${esc(p.bild)}" alt="" loading="lazy">` : `<span class="badge">${ICON[p.symbol] || ICON.stern}</span>`}
      <span style="min-width:0"><h3>${esc(p.titel)}</h3><p>${esc(p.kurz)}</p>
      ${istGeplant(p) ? `<span class="chips"><span class="chip c">Geplant</span></span>${fortschritt(p)}` : ""}
      ${!istGeplant(p) && (p.jahr || p.betrag) ? `<span class="chips">${p.jahr ? `<span class="chip c tnum">${p.jahr}</span>` : ""}${p.betrag ? `<span class="chip tnum">${euro(p.betrag)}</span>` : ""}</span>` : ""}</span></a>`;
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

  function neuigkeitenHtml() {
    const n = (I.neuigkeiten || []).slice().sort((a, b) => String(b.datum).localeCompare(String(a.datum))).slice(0, 3);
    if (!n.length) return "";
    return `<section><div class="sec-head"><h2>Neuigkeiten</h2></div><div class="list">${n.map(x => `<article class="card" style="--dot:var(--pink)"><span class="eyebrow">${esc(datumKurz(x.datum))} ${dt(x.datum).getFullYear()}</span><h3>${esc(x.titel)}</h3>${x.text ? `<p class="prose" style="margin-top:6px;white-space:pre-line">${esc(x.text)}</p>` : ""}</article>`).join("")}</div></section>`;
  }

  SEITEN.galerie = (v) => {
    const g = (I.galerie || []).slice().sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || "")));
    v.innerHTML = kopf("orange", "Eindrücke", "Unsere Feste und Aktionen", "Ein paar Bilder aus dem Vereinsleben.") +
      (g.length ? `<div class="grid2">${g.map(x => `<figure class="card" style="padding:0;overflow:hidden;margin:0"><img src="${esc(x.bild)}" alt="${esc(x.text || "")}" loading="lazy" style="width:100%;display:block;aspect-ratio:4/3;object-fit:cover">${x.text || x.datum ? `<figcaption style="padding:10px 14px"><b>${esc(x.text || "")}</b>${x.datum ? `<div class="mute small">${datumKurz(x.datum)} ${dt(x.datum).getFullYear()}</div>` : ""}</figcaption>` : ""}</figure>`).join("")}</div>` : `<div class="card"><p class="mute">Noch keine Bilder.</p></div>`);
  };

  SEITEN.start = async (v) => {
    const naechste = termineKommend().slice(0, 2);
    let listen = []; try { listen = await D.listen(); } catch (e) {}
    const offen = listen.filter(l => frei(l) > 0 && (!l.datum || dt(l.datum) >= heute()));
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
      ${neuigkeitenHtml()}
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
        ${summenZeile()}
        <div class="grid2">${fertige().slice(0, 2).map(projektKarte).join("")}</div>
      </section>
      ${geplante().length ? `<section><div class="sec-head"><h2>Dafür sammeln wir gerade</h2><a href="#projekte">Alle Projekte</a></div><div class="grid2">${geplante().slice(0, 2).map(projektKarte).join("")}</div></section>` : ""}
      ${igName() ? `<section><div class="card"><h3 class="igkopf">${ICON.insta}Folgt uns auf Instagram</h3><p class="mute" style="margin-top:4px">Aktuelle Bilder und Neuigkeiten aus dem Vereinsleben.</p><p style="margin-top:10px"><a class="btn sec" href="https://www.instagram.com/${esc(igName())}/" target="_blank" rel="noopener noreferrer">${ICON.insta}@${esc(igName())}</a></p></div></section>` : ""}
      ${V.zitat ? `<section><blockquote class="zitat"><p>„${esc(V.zitat[0])}</p><p>${esc(V.zitat[1])}“</p></blockquote></section>` : ""}`;
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
    const st = await D.status(mein.filter(m => m.liste_id === l.id).map(m => m.token)).catch(() => ({}));
    mein.forEach(m => { const x = st[m.token]; if (x && m.warte && !x.warte) { m.warte = false; D.meine.weg(m.token); D.meine.add(m); toast("Gute Nachricht: Ihr seid für „" + (l.plaetze.find(p => p.id === m.platz_id) || {}).bezeichnung + "“ nachgerückt!"); } });
    const termin = I.termine.find(t => t.liste === l.id);
    const hatPlatz = termin && l.plaetze.some(p => mein.some(m => m.platz_id === p.id && !(st[m.token] && st[m.token].warte)));
    v.innerHTML = zurueck("mithelfen", "Alle Listen") + kopf("green", "Eintrageliste", esc(l.titel), l.datum ? datumLang(l.datum) + (termin && termin.von ? ", " + termin.von + " Uhr" : "") : "") +
      (l.beschreibung ? `<div class="notice" style="margin-bottom:16px">${ICON.info}<p>${esc(l.beschreibung)}</p></div>` : "") +
      `<div class="card">${l.plaetze.map(p => {
        const f = p.anzahl - p.belegt.length;
        const meineHier = mein.filter(m => m.platz_id === p.id);
        return `<div class="slot"><div style="min-width:0"><b>${esc(p.bezeichnung)}</b>${p.zeit ? `<div class="mute small tnum">${esc(p.zeit)}</div>` : ""}
          <div class="who">${andere(p.belegt, meineHier).map(b => `<span class="chip">${esc(b.name)}</span>`).join("")}${meineHier.map(m => { const x = st[m.token]; return `<span class="chip mine">Ihr: ${esc(m.name)}${x && x.warte ? " (Warteliste, Platz " + x.platz + ")" : ""}</span>`; }).join("")}</div>
          ${(p.warte || []).length ? `<div class="mute small" style="margin-top:4px">Warteliste: ${(p.warte || []).length} ${(p.warte || []).length === 1 ? "Person" : "Personen"}</div>` : ""}</div>
          <div class="stack" style="--gap:6px;align-items:flex-end">
            <span class="cap ${f > 0 ? "free" : "full"} tnum">${f > 0 ? f + " frei" : "voll"}</span>
            ${f > 0 ? `<button class="btn small green" data-platz="${esc(p.id)}">Eintragen</button>` : meineHier.length ? "" : `<button class="btn small sec" data-warte="${esc(p.id)}">Auf die Warteliste</button>`}
            ${meineHier.map(m => `<button class="btn ghost small" data-aus="${esc(m.token)}">Austragen</button>`).join("")}
          </div></div>`;
      }).join("")}</div>
      ${Push.moeglich() && l.plaetze.some(p => mein.some(m => m.platz_id === p.id)) && Notification.permission !== "denied" && !(await Push.abo()) ? `<div class="card row noprint" style="margin-top:16px;justify-content:space-between"><div style="flex:1 1 220px;min-width:0"><b>Erinnerung aufs Handy?</b><div class="mute small">Am Vortag und falls ihr nachrückt.</div></div><button class="btn small" id="pushAnbieten">Einschalten</button></div>` : ""}
      <div class="row noprint" style="margin-top:16px">
        <a class="btn sec small" href="#aushang-${esc(l.id)}">${ICON.qr}Aushang mit QR-Code</a>
        <button class="btn sec small" id="teilenBtn">${ICON.teilen}Liste teilen</button>
        ${hatPlatz && !PREVIEW ? `<button class="btn small" id="kalBtn">${ICON.kal}Termin in meinen Kalender</button>` : ""}</div>`;
    $("#teilenBtn").onclick = () => teilen(l.titel, "liste-" + l.id);
    const kb = $("#kalBtn"); if (kb) kb.onclick = () => ics(termin);
    const pa = $("#pushAnbieten", v); if (pa) pa.onclick = () => pushDialog();
    $$("[data-platz]", v).forEach(b => b.onclick = () => eintragDialog(l, l.plaetze.find(p => String(p.id) === b.dataset.platz)));
    $$("[data-warte]", v).forEach(b => b.onclick = () => eintragDialog(l, l.plaetze.find(p => String(p.id) === b.dataset.warte), true));
    $$("[data-aus]", v).forEach(b => b.onclick = async () => {
      b.disabled = true;
      try { await D.austragen(b.dataset.aus); D.meine.weg(b.dataset.aus); toast("Ausgetragen"); render(); } catch (e) { toast(e.message); b.disabled = false; }
    });
  };

  function eintragDialog(l, p, warte) {
    const gemerkt = (() => { try { return localStorage.getItem("fv_name") || ""; } catch (e) { return ""; } })();
    sheet(`<h2>${esc(p.bezeichnung)}</h2><p class="mute">${esc(l.titel)}${p.zeit ? " · " + esc(p.zeit) : ""}</p>
      ${warte ? `<div class="notice" style="margin-top:12px">${ICON.info}<p>Dieser Platz ist voll. Mit eurem Eintrag steht ihr auf der Warteliste und rückt automatisch nach, sobald jemand absagt. Schaut dann hier auf der Seite nach. Gebt am besten eine Telefonnummer oder E-Mail an, dann kann der Vorstand euch Bescheid geben.</p></div>` : ""}
      <form id="eintragForm" style="margin-top:16px" novalidate>
        <div class="field"><label for="e_name">Euer Name</label><input id="e_name" type="text" autocomplete="name" required minlength="2" maxlength="60" value="${esc(gemerkt)}" placeholder="z. B. Anna Krüger">
          <span class="hint">In der Liste erscheint nur „Anna K.“.</span></div>
        <div class="field"><label for="e_kontakt">Telefon oder E-Mail (freiwillig)</label><input id="e_kontakt" type="text" maxlength="100" placeholder="Falls wir euch kurzfristig erreichen müssen">
          <span class="hint">Sieht nur der Vorstand.</span></div>
        <input class="hp" type="text" id="e_web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="err" id="e_err" hidden></p>
        <button class="btn green block" type="submit">${warte ? "Auf die Warteliste" : "Verbindlich eintragen"}</button>
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
          const token = await D.eintragen(p.id, name, kontakt, warte);
          D.meine.add({ token, platz_id: p.id, liste_id: l.id, name: D.anzeigename(name), warte: !!warte });
          if (Push.moeglich()) Push.sync();
          try { localStorage.setItem("fv_name", name); } catch (e) {}
          zu(); toast(warte ? "Ihr steht auf der Warteliste. Wird ein Platz frei, rückt ihr automatisch nach." : I.termine.some(t => t.liste === l.id) && !PREVIEW ? "Danke! Ihr seid eingetragen. Den Termin könnt ihr unten in den Kalender legen." : "Danke! Ihr seid eingetragen."); render();
        } catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = warte ? "Auf die Warteliste" : "Verbindlich eintragen"; }
      };
    });
  }

  /* Aushänge: aushang-mitglied, aushang-mithelfen, aushang-<listenId> */
  SEITEN.aushang = async (v, id) => {
    let titel, text, ziel, tabelle = "", farbeA = "green";
    if (id === "mitglied") { titel = "Werdet Mitglied im Förderverein!"; text = "Ab " + euro(V.mindestbeitrag) + " " + (V.beitragZeitraum || "im Jahr") + " helft ihr, dass Ausflüge, Spielgeräte und Feste für unsere Kinder möglich werden. Den Antrag könnt ihr direkt am Handy ausfüllen."; ziel = "mitglied"; farbeA = "blue"; }
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
        ${igName() ? `<div class="igbox">${qrSvg("https://www.instagram.com/" + igName() + "/")}<p>${ICON.insta}<b>Folgt uns auf Instagram</b><br>@${esc(igName())}</p></div>` : ""}
        <div class="bar">${["pink", "blue", "green", "orange", "purple", "yellow", "red", "teal"].map(c => `<i style="background:var(--${c})"></i>`).join("")}</div>
      </article>`;
    $$("[data-a]", v).forEach(b => b.onclick = () => location.hash = "aushang-" + b.dataset.a);
    const db = $("#druckBtn"); if (db) db.onclick = () => window.print();
  };

  SEITEN.projekte = (v) => {
    const jahre = [...new Set(fertige().map(p => p.jahr || 0))].sort((a, b) => b - a);
    v.innerHTML = kopf("pink", "Projekte", "Unsere Projekte", "Mit Mitgliedsbeiträgen, Spenden und den Erlösen unserer Feste finanzieren wir, was im Kita-Alltag fehlt.") +
      (geplante().length ? `<section><h2 class="month" style="margin-top:0">Geplant</h2><p class="mute" style="margin:2px 0 10px">Dafür sammeln wir gerade. Jede Spende hilft, diese Wünsche zu erfüllen.</p><div class="grid2">${geplante().map(projektKarte).join("")}</div><p style="margin-top:12px"><a class="btn small" href="#spenden">Jetzt spenden</a></p></section>` : "") +
      (fertige().length ? `<h2 style="margin:28px 0 4px">Das haben wir geschafft</h2>` : "") +
      jahre.map(j => { const sum = j ? jahresSumme(j) : 0; return `<div class="jahrkopf"><h2 class="month">${j || "Früher umgesetzt"}</h2>${sum ? `<span class="jahrsumme tnum">${euro(sum)} eingesetzt</span>` : ""}</div><div class="grid2">${fertige().filter(p => (p.jahr || 0) === j).map(projektKarte).join("")}</div>`; }).join("") +
      `<section><div class="card"><h3>Ihr habt eine Idee?</h3><p class="mute" style="margin-top:4px">Vorschläge für neue Projekte nehmen wir gern entgegen, zum Beispiel bei der Mitgliederversammlung oder per E-Mail.</p><p style="margin-top:12px"><a class="btn sec small" href="#kontakt">Kontakt aufnehmen</a></p></div></section>`;
  };

  function lightbox(liste, start, titel) {
    let i = start; const el = document.createElement("div"); el.className = "lightbox"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Fotos: " + titel);
    const zu = () => { el.remove(); document.removeEventListener("keydown", taste); };
    const zeig = () => { el.innerHTML = `<img src="${esc(liste[i])}" alt="${esc(titel)}"><button type="button" class="lb-x" aria-label="Schließen">${ICON.x}</button>${liste.length > 1 ? `<button type="button" class="lb-p" aria-label="Voriges Foto">‹</button><button type="button" class="lb-n" aria-label="Nächstes Foto">›</button><span class="lb-z">${i + 1} / ${liste.length}</span>` : ""}`;
      $(".lb-x", el).onclick = zu; const pr = $(".lb-p", el), nx = $(".lb-n", el);
      if (pr) { pr.onclick = (e) => { e.stopPropagation(); i = (i + liste.length - 1) % liste.length; zeig(); }; nx.onclick = (e) => { e.stopPropagation(); i = (i + 1) % liste.length; zeig(); }; } };
    const taste = (e) => { if (e.key === "Escape") zu(); else if (e.key === "ArrowLeft" && liste.length > 1) { i = (i + liste.length - 1) % liste.length; zeig(); } else if (e.key === "ArrowRight" && liste.length > 1) { i = (i + 1) % liste.length; zeig(); } };
    el.onclick = (e) => { if (e.target === el) zu(); };
    document.addEventListener("keydown", taste); zeig(); document.body.appendChild(el);
  }

  SEITEN.projekt = (v, id) => {
    const p = I.projekte.find(x => x.id === id);
    if (!p) { v.innerHTML = zurueck("projekte", "Alle Projekte") + `<div class="card"><h2>Projekt nicht gefunden</h2></div>`; return; }
    const fotos = (p.fotos || []).filter(Boolean);
    v.innerHTML = zurueck("projekte", "Alle Projekte") +
      (fotos.length ? `<img class="proj-foto" src="${esc(fotos[0])}" alt="${esc(p.titel)}" data-fo="0" style="cursor:zoom-in">` : p.bild ? `<img class="proj-foto" src="${esc(p.bild)}" alt="${esc(p.titel)}">` : `<div class="proj-hero" style="${farbe(p.farbe)}">${ICON[p.symbol] || ICON.stern}</div>`) +
      kopf(p.farbe, istGeplant(p) ? "Geplant" : p.jahr ? "Umgesetzt " + p.jahr : "Umgesetzt", esc(p.titel), esc(p.kurz)) +
      (istGeplant(p) ? `<div class="card" style="margin-bottom:16px;--dot:var(--${p.farbe || "yellow"})"><h3>Dafür sammeln wir gerade</h3><div style="margin-top:8px">${fortschritt(p)}</div><p class="mute small" style="margin-top:8px">Schreibt bei der Überweisung „Spende ${esc(p.titel)}“ in den Verwendungszweck.</p><p style="margin-top:12px"><a class="btn small" href="#spenden">Jetzt spenden</a></p></div>` : "") +
      (!istGeplant(p) && (p.betrag || p.jahr || p.partner) || istGeplant(p) && p.partner ? `<dl class="facts">${!istGeplant(p) && p.betrag ? `<div><dt>Förderung</dt><dd class="tnum">${euro(p.betrag)}</dd></div>` : ""}${!istGeplant(p) && p.jahr ? `<div><dt>Jahr</dt><dd class="tnum">${p.jahr}</dd></div>` : ""}${p.partner ? `<div><dt>Mit Hilfe von</dt><dd style="font-size:1rem">${esc(p.partner)}</dd></div>` : ""}</dl>` : "") +
      `<div class="prose">${(p.text || []).map(t => `<p>${esc(t)}</p>`).join("")}</div>
      ${fotos.length > 1 ? `<section style="margin-top:24px"><h2>Fotos</h2><div class="fotogitter">${fotos.map((u, i) => `<button type="button" data-fo="${i}" aria-label="Foto ${i + 1} vergrößern"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div></section>` : ""}
      <div class="row noprint" style="margin-top:20px"><button class="btn sec small" id="teilenBtn">${ICON.teilen}Projekt teilen</button></div>`;
    $$("[data-fo]", v).forEach(b => b.onclick = () => lightbox(fotos, +b.dataset.fo, p.titel));
    $("#teilenBtn").onclick = () => teilen(p.titel, "projekt-" + p.id);
  };

  SEITEN.verein = (v) => {
    v.innerHTML = kopf("purple", "Über uns", "Der Förderverein", esc(V.zweck)) +
      (V.zitat ? `<blockquote class="zitat"><p>„${esc(V.zitat[0])}</p><p>${esc(V.zitat[1])}“</p></blockquote>` : "") +
      `<section><h2>Was wir tun</h2><div class="prose" style="margin-top:10px"><ul>
        <li>Anschaffungen, die über das Kita-Budget hinausgehen: Spielgeräte, Bücher, Musikinstrumente</li>
        <li>Zuschüsse zu Ausflügen und Projekten, damit alle Kinder mitmachen können</li>
        <li>Organisation von St.-Martins-Zug, Adventsbasar und Sommerfest gemeinsam mit dem Kita-Team</li></ul></div></section>
      <section><h2>Vorstand</h2><div class="grid2" style="margin-top:10px">${V.vorstand.map(m => `<div class="card"><p class="mute small">${esc(m.rolle)}</p><p style="font-weight:700">${esc(m.name)}</p></div>`).join("")}</div></section>
      <section><h2>Gemeinsam mit der Kita</h2><div class="prose" style="margin-top:10px">${V.kitaInfo ? `<p>${esc(V.kitaInfo.text)}</p>` : ""}<p>Über jedes Projekt sprechen wir vorher mit der Kita-Leitung. So kommt das Geld dort an, wo es im Alltag wirklich gebraucht wird.</p>
        ${V.kitaInfo ? `<div class="card stack" style="--gap:6px"><p class="mute small">Kath. Kita St. Lucia</p><p>${esc(V.kitaInfo.adresse)}</p><p><a href="${esc(V.kitaInfo.link)}" target="_blank" rel="noopener">Zur Seite der Pfarrei St. Maria Magdalena</a></p></div>` : ""}</div></section>
      <section id="unterstuetzer" hidden><h2>Firmen, die uns unterstützen</h2><p class="mute" style="margin-top:4px">Danke an unsere Firmenmitglieder!</p><div class="chips" id="unterstuetzerListe" style="margin-top:10px"></div></section>
      <section><div class="card row" style="justify-content:space-between"><div style="flex:1 1 240px;min-width:0"><h3>Firmen als Mitglied</h3><p class="mute small">Auch Unternehmen aus Walbeck und Umgebung können Mitglied werden${V.beitraegeFirma && V.beitraegeFirma.length ? ", ab " + euro(+V.mindestbeitragFirma || Math.min(...V.beitraegeFirma)) + " " + esc(V.beitragZeitraum || "im Jahr") : ""}.</p></div><a class="btn sec" href="#mitglied-firma">Firmenantrag</a></div></section>
      <section><div class="card row" style="justify-content:space-between"><div style="flex:1 1 240px;min-width:0"><h3>Mitglied werden</h3><p class="mute small">Ab ${euro(V.mindestbeitrag)} ${esc(V.beitragZeitraum || "im Jahr")}.</p></div><a class="btn" href="#mitglied">Zum Antrag</a></div></section>`;
    unterstuetzerLaden();
  };

  async function unterstuetzerLaden() {
    try { const u = await D.unterstuetzer(); const sec = $("#unterstuetzer"); if (!sec || !u.length) return;
      $("#unterstuetzerListe").innerHTML = u.map(x => `<span class="chip" style="font-size:.95rem;padding:6px 14px">${esc(x)}</span>`).join(""); sec.hidden = false; } catch (e) {}
  }
  SEITEN.spenden = (v) => {
    const b = V.bank;
    v.innerHTML = kopf("yellow", "Spenden", "Jeder Betrag hilft", "Ob 5 Euro oder eine größere Summe: Eure Spende fließt vollständig in Projekte für die Kinder.") +
      `<div class="card stack" style="--gap:10px">
        <div><p class="mute small">Kontoinhaber</p><p style="font-weight:700">${esc(b.inhaber)}</p></div>
        <div><p class="mute small">IBAN</p><p class="tnum" style="font-weight:700;font-size:1.15rem;letter-spacing:.02em" id="ibanTxt">${esc(b.iban)}</p></div>
        <div class="cols"><div><p class="mute small">BIC</p><p style="font-weight:700">${esc(b.bic)}</p></div><div><p class="mute small">Bank</p><p style="font-weight:700">${esc(b.institut)}</p></div></div>
        <div><button class="btn sec small" id="kopierBtn">IBAN kopieren</button></div></div>
      <section><h2>Spendenquittung</h2><p class="prose" style="margin-top:8px">${V.gemeinnuetzig ? "Der Verein ist als gemeinnützig anerkannt. Bis 300 Euro reicht dem Finanzamt der Kontoauszug als Nachweis. Für höhere Beträge stellen wir gern eine Zuwendungsbestätigung aus; gebt dafür bei der Überweisung eure Adresse an." : "Ihr braucht eine Spendenbescheinigung? Schreibt uns an " + esc(V.kontakt.email) + "."}</p></section>`;
    $("#kopierBtn").onclick = async () => { try { await navigator.clipboard.writeText(b.iban.replace(/\s/g, "")); toast("IBAN kopiert"); } catch (e) { const r = document.createRange(); r.selectNodeContents($("#ibanTxt")); getSelection().removeAllRanges(); getSelection().addRange(r); } };
  };

  const IG_STANDARD = "foerdervereinkitastlucia";
  const igName = () => { const k = V.kontakt || {}; return String(k.instagram === undefined ? IG_STANDARD : k.instagram).replace(/^.*instagram\.com\//i, "").replace(/[@\/?].*$/, "").trim(); };
  SEITEN.kontakt = (v) => {
    v.innerHTML = kopf("teal", "Kontakt", "Schreibt uns", "Fragen zur Mitgliedschaft, Ideen für Projekte oder Lust, im Vorstand mitzumachen?") +
      `<div class="card stack" style="--gap:12px"><div><p class="mute small">E-Mail</p><p style="font-weight:700"><a href="mailto:${esc(V.kontakt.email)}">${esc(V.kontakt.email)}</a></p></div>
       ${igName() ? `<div><p class="mute small">Instagram</p><p style="font-weight:700" class="iglink">${ICON.insta}<a href="https://www.instagram.com/${esc(igName())}/" target="_blank" rel="noopener noreferrer">@${esc(igName())}</a></p></div>` : ""}
       <div><p class="mute small">Post</p><p>${esc(V.kontakt.adresse)}</p></div>
       <div><p class="mute small">Persönlich</p><p>Sprecht uns beim Bringen und Abholen an, oder werft einen Zettel in den Förderverein-Briefkasten im Eingangsbereich.</p></div></div>`;
  };

  const vertretung = () => { const vs = V.vorstand || []; const vors = vs.filter(m => /vorsitz/i.test(m.rolle || "")); return (vors.length ? vors : vs).slice(0, 2); };
  SEITEN.impressum = (v) => {
    v.innerHTML = kopf("teal", "Rechtliches", "Impressum", "") + `<div class="card prose">
      <p><b>${esc(V.name)}</b><br>${esc(V.kontakt.adresse)}</p>
      <p>Vertreten durch den Vorstand nach § 26 BGB: ${vertretung().map(m => esc(m.rolle + " " + m.name)).join(", ")}</p>
      <p>${esc(V.registergericht)}</p><p>E-Mail: ${esc(V.kontakt.email)}</p>
      <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: ${esc((vertretung()[0] || {}).name || "")}, Anschrift wie oben</p>
      <p class="mute small">Vorlage – vor Veröffentlichung mit den echten Vereinsdaten füllen und prüfen lassen.</p></div>`;
  };

  SEITEN.datenschutz = (v) => {
    const dsb = V.datenschutz || {};
    v.innerHTML = kopf("teal", "Rechtliches", "Datenschutz", "Informationen nach Artikel 13 DSGVO") + `<div class="prose">
      <h3>Name und Anschrift des Verantwortlichen</h3>
      <p>${esc(V.name)}<br>${esc(V.kontakt.adresse)}<br>E-Mail: ${esc(V.kontakt.email)}</p>
      ${dsb.name || dsb.email ? `<h3>Kontaktdaten des Datenschutzbeauftragten</h3><p>${esc(dsb.name || "")}${dsb.name ? "<br>" : ""}Postanschrift wie oben${dsb.email ? `<br>E-Mail: ${esc(dsb.email)}` : ""}</p>` : ""}
      <h3>Zwecke und Rechtsgrundlage der Datenverarbeitung</h3>
      <p>Im Zusammenhang mit der Mitgliedschaft in unserem Förderverein verarbeiten wir eure personenbezogenen Daten auf der Grundlage vertraglicher Verpflichtungen, gemäß Artikel 6 Absatz 1 Buchstabe b DSGVO, sowie in unserem berechtigten Interesse, gemäß Artikel 6 Absatz 1 Buchstabe f DSGVO. Wenn ihr euch für den Empfang unseres E-Mail-Newsletters angemeldet habt, verarbeiten wir diese Daten auf Grundlage eurer Einwilligung, gemäß Artikel 6 Absatz 1 Buchstabe a DSGVO. Abmelden geht jederzeit per E-Mail.</p>
      <p><b>Welche Daten:</b> Mitgliedsantrag: Name, Anschrift, E-Mail, Telefon (freiwillig), Bankverbindung und Beitrag, bei Firmen zusätzlich der Firmenname. Eintragelisten: Name und freiwillig eine Kontaktmöglichkeit. Öffentlich sichtbar ist dort nur der Vorname mit Anfangsbuchstaben des Nachnamens. Die Angaben aus den Listen löschen wir nach der Veranstaltung.</p>
      <h3>Empfänger der Daten</h3>
      <p>Wenn ihr uns eine Einzugsermächtigung zur Abbuchung der Mitgliedsbeiträge erteilt habt, leiten wir eure Bankdaten an unsere Hausbank weiter. Im Übrigen erhalten eure Daten unser Vereinsvorstand sowie unser Steuerberater. Die Daten liegen in einer Datenbank beim Anbieter Supabase auf Servern in Frankfurt am Main. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung.</p>
      <h3>Übermittlung in Drittländer</h3>
      <p>Eure Angaben aus Antrag und Listen werden nicht in Drittländer übermittelt. Die Seite selbst wird über GitHub Pages ausgeliefert (GitHub, USA). Beim Aufruf der Seite kann dabei eure IP-Adresse an GitHub übertragen werden. Daten aus Formularen gehen nicht an GitHub.</p>
      <h3>Speicherdauer der Daten</h3>
      <p>Daten und Unterlagen, die mit eurer Mitgliedschaft in Zusammenhang stehen, müssen wir bis zu zehn Jahre aufbewahren. Die Aufbewahrungsdauer ist gesetzlich vorgeschrieben und dient vor allem der Erfüllung steuerrechtlicher Verpflichtungen.</p>
      <h3>Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung</h3>
      <p>Ihr habt das Recht auf Auskunft, welche persönlichen Daten bei uns gespeichert sind, auf Berichtigung, auf Löschung und auf Einschränkung der Verarbeitung. Löschen können wir die Daten nur, wenn wir sie nicht mehr aufbewahren müssen. Solange wir die Daten aufbewahren müssen, nehmen wir stattdessen eine Einschränkung der Verarbeitung vor.</p>
      <h3>Recht auf Widerspruch, Datenübertragbarkeit und Widerruf einer Einwilligung</h3>
      <p>Ihr habt außerdem das Recht auf Widerspruch gegen die Verarbeitung persönlicher Daten und auf Datenübertragbarkeit. Wenn für eine Verarbeitung eine Einwilligung erteilt wurde, könnt ihr sie mit Wirkung für die Zukunft jederzeit widerrufen. Die Rechtmäßigkeit der Verarbeitung bis zum Widerruf bleibt davon unberührt.</p>
      <h3>Beschwerderecht bei der Aufsichtsbehörde</h3>
      <p>Ihr habt das Recht, euch bei der Aufsichtsbehörde zu beschweren: Der Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Postfach 200444, 40102 Düsseldorf, Telefon 0211 / 38424-0, poststelle@ldi.nrw.de.</p>
      <h3>Erforderlichkeit der Datenbereitstellung</h3>
      <p>Um die Mitgliedschaft in unserem Förderverein durchführen zu können, benötigen wir eure persönlichen Daten. Ohne diese Daten kann unser Förderverein seinen gesetzlichen Verpflichtungen nicht nachkommen. Wir verwenden die im Rahmen der Mitgliedschaft bereitgestellten Daten nur zu den oben beschriebenen Zwecken. Auf keinen Fall werden sie für eine automatisierte Entscheidung im Einzelfall oder ein Profiling verwendet.</p>
      <h3>Benachrichtigungen (Push)</h3>
      <p>Wenn ihr Benachrichtigungen einschaltet, speichern wir eine anonyme Adresse eures Geräts, die euer Browser oder Betriebssystem erzeugt, sowie die geheime Kennung eurer Eintragungen in den Helferlisten. Name, E-Mail-Adresse oder Telefonnummer werden dafür nicht gespeichert. Wir nutzen das für Mitteilungen des Vorstands, für den Hinweis beim Nachrücken von der Warteliste und für die Erinnerung am Vortag eures Helferdienstes (Art. 6 Abs. 1 lit. a DSGVO, Einwilligung). Die Nachrichten werden über den Push-Dienst des Geräteherstellers zugestellt (Apple oder Google, USA; bei Firefox Mozilla). Ihr könnt die Einwilligung jederzeit im Menü unter „Benachrichtigungen“ oder in den Geräteeinstellungen widerrufen.</p>
      <h3>Diese Webseite</h3>
      <p><b>Auf eurem Gerät</b> speichert die App, für welche Plätze ihr euch eingetragen habt, damit ihr euch wieder austragen könnt. Das bleibt auf eurem Gerät.</p>
      <p><b>Keine Tracker, anonyme Zählung:</b> Die Seite nutzt keine Analyse-Werkzeuge von Dritten, keine Cookies und lädt keine Schriften oder Skripte von fremden Servern. Um zu sehen, ob die Seite genutzt wird, zählen wir auf unserem eigenen Server nur, wie oft welche Seite aufgerufen wurde, getrennt nach Handy oder Computer und App oder Browser. Dabei wird keine Kennung gesetzt und nichts auf eurem Gerät gespeichert, und die Zahlen lassen sich keiner Person zuordnen (Art. 6 Abs. 1 lit. f DSGVO, Interesse am Betrieb und an der Verbesserung der Seite).</p>
      ${igName() ? `<p>Auf unserer Kontaktseite verlinken wir unser Instagram-Profil. Beim Anklicken verlasst ihr diese App; für die Datenverarbeitung auf Instagram ist Meta verantwortlich. Ohne Klick werden keine Daten an Instagram übertragen.</p>` : ""}<p>Bei Fragen zu diesen Informationen und zum Datenschutz wendet euch an uns unter ${esc(V.kontakt.email)}.</p></div>`;
  };

  /* ---------- Mitgliedsantrag ---------- */
  SEITEN.mitglied = (v, arg) => {
    let art = arg === "firma" ? "firma" : "person";
    const zeit = esc(V.beitragZeitraum || "pro Jahr");
    const stufen = () => art === "firma" ? (V.beitraegeFirma && V.beitraegeFirma.length ? V.beitraegeFirma : [50, 100, 250]) : V.beitraege;
    const minimum = () => art === "firma" ? (+V.mindestbeitragFirma || Math.min(...stufen())) : V.mindestbeitrag;
    const beitragHtml = () => stufen().map((b, i) => `<label><input type="radio" name="beitrag" value="${b}" ${i === Math.min(1, stufen().length - 1) ? "checked" : ""}><span class="tnum">${euro(b)}</span></label>`).join("") +
      `<label><input type="radio" name="beitrag" value="eigen"><span>Eigener Betrag</span></label>`;
    v.innerHTML = kopf("blue", "Mitglied werden", "Mitgliedsantrag", "Füllt den Antrag in zwei Minuten aus. Der Beitrag wird " + zeit + " per Lastschrift eingezogen.") +
      `<div class="choice" role="radiogroup" aria-label="Art der Mitgliedschaft" style="margin-bottom:14px">
        <label><input type="radio" name="art" value="person" ${art === "person" ? "checked" : ""}><span>Als Privatperson</span></label>
        <label><input type="radio" name="art" value="firma" ${art === "firma" ? "checked" : ""}><span>Als Firma</span></label></div>
      <form id="antrag" class="card" novalidate>
        <fieldset><legend id="lgPerson">Zu eurer Person</legend>
          <div class="field" id="firmaFeld" hidden><label for="a_firma">Name der Firma</label><input id="a_firma" type="text" autocomplete="organization" maxlength="120"></div>
          <p class="mute small" id="ansprechHinweis" hidden>Ansprechpartner/in</p>
          <div class="cols"><div class="field"><label for="a_vorname">Vorname</label><input id="a_vorname" type="text" autocomplete="given-name" required maxlength="60"></div>
            <div class="field"><label for="a_nachname">Nachname</label><input id="a_nachname" type="text" autocomplete="family-name" required maxlength="60"></div></div>
          <div class="field"><label for="a_strasse">Straße und Hausnummer</label><input id="a_strasse" type="text" autocomplete="street-address" required maxlength="120"></div>
          <div class="cols plz"><div class="field"><label for="a_plz">PLZ</label><input id="a_plz" type="text" inputmode="numeric" autocomplete="postal-code" required pattern="\\d{5}" maxlength="5" placeholder="47608"></div>
            <div class="field"><label for="a_ort">Ort</label><input id="a_ort" type="text" autocomplete="address-level2" required maxlength="80" placeholder="Geldern-Walbeck"></div></div>
          <div class="cols"><div class="field"><label for="a_email">E-Mail</label><input id="a_email" type="email" autocomplete="email" required maxlength="120"></div>
            <div class="field"><label for="a_tel">Telefon <span class="mute">(freiwillig)</span></label><input id="a_tel" type="tel" autocomplete="tel" maxlength="40"></div></div>
          <div class="field" id="kindFeld"><label for="a_kind">Kind in der Kita, Gruppe <span class="mute">(freiwillig)</span></label><input id="a_kind" type="text" maxlength="120" placeholder="z. B. Mia, Gruppe Sonnenblume"></div>
          <label class="check" id="nennungFeld" hidden><input type="checkbox" id="a_nennung"><span>Unsere Firma darf auf der Seite des Fördervereins als Unterstützer genannt werden (nur der Firmenname).</span></label>
        </fieldset>
        <fieldset><legend>Beitrag <span class="mute" style="font-size:.9rem">${zeit}</span></legend>
          <div class="choice" role="radiogroup" aria-label="Beitrag" id="beitragWahl">${beitragHtml()}</div>
          <div class="field" id="eigenFeld" hidden><label for="a_eigen" id="eigenLabel"></label><input id="a_eigen" type="number" inputmode="decimal" step="1"></div>
        </fieldset>
        <fieldset><legend>SEPA-Lastschriftmandat</legend>
          <div class="field"><label for="a_inhaber">Kontoinhaber/in</label><input id="a_inhaber" type="text" autocomplete="cc-name" required maxlength="120"></div>
          <div class="field"><label for="a_iban">IBAN</label><input id="a_iban" type="text" autocomplete="off" required maxlength="42" placeholder="DE.. .... .... .... .... .." spellcheck="false" style="font-variant-numeric:tabular-nums;letter-spacing:.03em"></div>
          <p class="mandate">Ich ermächtige den ${esc(V.name)}${V.glaeubigerId ? " (Gläubiger-ID " + esc(V.glaeubigerId) + ")" : ""} widerruflich, den Mitgliedsbeitrag ${zeit} von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die Lastschriften einzulösen. Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten die mit meinem Kreditinstitut vereinbarten Bedingungen. Die Mandatsreferenz wird mir separat mitgeteilt.</p>
          <label class="check"><input type="checkbox" id="a_sepa" required><span>Ich erteile das SEPA-Lastschriftmandat.</span></label>
          <label class="check"><input type="checkbox" id="a_nl"><span>Ja, ich möchte den E-Mail-Newsletter mit Informationen zu Veranstaltungen und Aktionen des Vereins erhalten. Abmelden geht jederzeit per E-Mail an ${esc(V.kontakt.email)}.</span></label>
          <label class="check"><input type="checkbox" id="a_ds" required><span>Ich habe die <a href="#datenschutz">Datenschutzhinweise nach Art. 13 DSGVO</a> gelesen und bin mit der Speicherung meiner Daten für die Mitgliederverwaltung einverstanden.</span></label>
        </fieldset>
        <input class="hp" type="text" id="a_web" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="err" id="a_err" hidden></p>
        <button class="btn block" type="submit">Antrag abschicken</button>
        <p class="mute small">Nach dem Abschicken bestätigt der Vorstand eure Mitgliedschaft per E-Mail.</p>
      </form>
      <section class="noprint"><div class="card row" style="justify-content:space-between"><div style="flex:1 1 240px;min-width:0"><h3>Lieber auf Papier?</h3><p class="mute small">${esc(V.papierAntrag || "")} Für die Pinnwand gibt es außerdem einen Aushang mit QR-Code zum Online-Antrag.</p></div><div class="stack" style="--gap:6px">${PREVIEW ? "" : `<button class="btn sec small" id="leerAntrag">${ICON.druck}Formular drucken</button>`}<a class="btn sec small" href="#aushang-mitglied">${ICON.qr}Aushang</a></div></div></section>`;
    const la = $("#leerAntrag", v); if (la) la.onclick = () => antragDrucken(null);
    const f = $("#antrag");
    const eigen = $("#eigenFeld");
    const beitragBinden = () => $$('input[name="beitrag"]', f).forEach(r => r.onchange = () => { eigen.hidden = r.value !== "eigen" || !r.checked; if (!eigen.hidden) $("#a_eigen").focus(); });
    const artSetzen = () => {
      const firma = art === "firma";
      $("#firmaFeld").hidden = !firma; $("#ansprechHinweis").hidden = !firma; $("#nennungFeld").hidden = !firma; $("#kindFeld").hidden = firma;
      $("#lgPerson").textContent = firma ? "Zur Firma" : "Zu eurer Person";
      $("#beitragWahl").innerHTML = beitragHtml(); eigen.hidden = true; beitragBinden();
      $("#eigenLabel").textContent = "Betrag in Euro " + (V.beitragZeitraum || "pro Jahr") + " (mindestens " + euro(minimum()) + ")";
      $("#a_eigen").min = minimum();
      inhaberVorschlag(true);
    };
    $$('input[name="art"]').forEach(r => r.onchange = () => { art = r.value; artSetzen(); });
    $("#a_iban").addEventListener("input", e => { const el = e.target, pos = el.selectionStart === el.value.length; el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})/g, "$1 ").trim(); if (pos) el.selectionStart = el.selectionEnd = el.value.length; });
    function inhaberVorschlag() { const i = $("#a_inhaber"); if (!i.value || i.dataset.auto) { i.value = art === "firma" && $("#a_firma").value.trim() ? $("#a_firma").value.trim() : ($("#a_vorname").value + " " + $("#a_nachname").value).trim(); i.dataset.auto = 1; } }
    ["#a_vorname", "#a_nachname", "#a_firma"].forEach(id => $(id).addEventListener("input", () => inhaberVorschlag()));
    $("#a_inhaber").addEventListener("input", e => { delete e.target.dataset.auto; });
    artSetzen();
    f.onsubmit = async (e) => {
      e.preventDefault();
      $$(".field.bad", f).forEach(x => x.classList.remove("bad")); $$(".field .err", f).forEach(x => x.remove());
      const err = $("#a_err"); err.hidden = true;
      if ($("#a_web").value) return;
      const fehler = [];
      const pruef = (id, ok, text) => { if (!ok) { const fl = $("#" + id).closest(".field"); if (fl) { fl.classList.add("bad"); fl.insertAdjacentHTML("beforeend", `<span class="err">${text}</span>`); } fehler.push(id); } };
      const val = (id) => $("#" + id).value.trim();
      if (art === "firma") pruef("a_firma", val("a_firma").length >= 2, "Bitte den Namen der Firma eintragen.");
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
      if (wahl === "eigen") pruef("a_eigen", beitrag >= minimum(), "Mindestens " + euro(minimum()) + ".");
      if (!$("#a_sepa").checked) fehler.push("a_sepa");
      if (!$("#a_ds").checked) fehler.push("a_ds");
      if (fehler.length) {
        err.textContent = fehler.every(x => x === "a_sepa" || x === "a_ds")
          ? "Bitte die beiden Häkchen beim Lastschriftmandat und beim Datenschutz setzen." : "Bitte die markierten Felder prüfen.";
        err.hidden = false; const first = $("#" + fehler[0]); if (first) first.focus(); return;
      }
      const daten = { art, firma: art === "firma" ? val("a_firma") : "", nennung: art === "firma" && $("#a_nennung").checked,
        vorname: val("a_vorname"), nachname: val("a_nachname"), strasse: val("a_strasse"), plz: val("a_plz"), ort: val("a_ort"),
        email: val("a_email"), telefon: val("a_tel"), kind: art === "firma" ? "" : val("a_kind"), beitrag, kontoinhaber: val("a_inhaber"),
        iban: val("a_iban").replace(/\s/g, ""), sepa_mandat: true, datenschutz: true, newsletter: $("#a_nl").checked };
      const btn = f.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Wird gesendet …";
      try { await D.antrag(daten); bestaetigung(v, daten); window.scrollTo(0, 0); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = "Antrag abschicken"; }
    };
  };

  /* Antrag zum Ausdrucken oder als PDF sichern (a = ausgefüllt, null = leeres Formular) */
  function antragDrucken(a) {
    const firma = !!(a && a.art === "firma"), leer = !a, E = esc;
    const zeile = (l, w, breit) => `<tr><td class="l">${l}</td><td${breit ? ' colspan="3"' : ""}>${w ? "<b>" + E(w) + "</b>" : "&nbsp;"}</td></tr>`;
    const iban = a ? a.iban.replace(/(.{4})/g, "$1 ").trim() : "";
    const zeit = E(V.beitragZeitraum || "pro Jahr");
    const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mitgliedsantrag ${E(V.name)}</title>
<style>body{font:11.5pt/1.4 Arial,Helvetica,sans-serif;color:#000;margin:16mm 18mm}h1{font-size:16pt;margin:6pt 0 10pt}h2{font-size:12pt;margin:14pt 0 4pt;border-bottom:1px solid #000;padding-bottom:2pt}table{border-collapse:collapse;width:100%}td{padding:5pt 4pt 5pt 0;vertical-align:bottom;border-bottom:1px dotted #777}td.l{width:34%;white-space:nowrap}.s{font-size:9.5pt}.sig{display:flex;gap:30pt;margin-top:34pt}.sig div{flex:1;border-top:1px solid #000;padding-top:3pt;font-size:9.5pt}@media print{.np{display:none}}</style></head><body>
<p class="np"><button onclick="print()" style="font-size:14pt;padding:6pt 14pt">Drucken oder als PDF speichern</button></p>
<b>${E(V.name)}</b><br>${E(V.kontakt.adresse || "")}
<h1>Mitgliedsantrag${firma ? " für Firmen" : ""}</h1>
<p>Hiermit beantrage${firma ? " ich für die unten genannte Firma" : " ich"} die Mitgliedschaft im ${E(V.name)}${/\.$/.test(V.name) ? "" : "."}</p>
<h2>${firma ? "Firma und Ansprechpartner/in" : "Angaben zur Person"}</h2>
<table>${firma || leer ? zeile("Firma (nur Firmen)", a && a.firma) : ""}${zeile("Vorname", a && a.vorname)}${zeile("Nachname", a && a.nachname)}${zeile("Straße, Hausnummer", a && a.strasse)}${zeile("PLZ, Ort", a ? (a.plz + " " + a.ort).trim() : "")}${zeile("E-Mail", a && a.email)}${zeile("Telefon (freiwillig)", a && a.telefon)}${!firma ? zeile("Kind / Gruppe (freiwillig)", a && a.kind) : ""}</table>
<h2>Beitrag</h2>
<p>Jahresbeitrag ${zeit}: ${a ? "<b>" + E(euro(a.beitrag)) + "</b>" : "______ € &nbsp;(Mindestbeitrag " + E(euro(firma ? (V.mindestbeitragFirma || 50) : V.mindestbeitrag)) + ")"}</p>
<p>${a && a.newsletter ? "☒" : "☐"} Ich möchte den Newsletter des Vereins erhalten (freiwillig, jederzeit widerrufbar).${firma || leer ? `<br>${a && a.nennung ? "☒" : "☐"} Firmen: Der Firmenname darf auf der Homepage als Unterstützer genannt werden.` : ""}</p>
<h2>SEPA-Lastschriftmandat</h2>
<p class="s">Ich ermächtige den ${E(V.name)}${V.glaeubigerId ? " (Gläubiger-ID " + E(V.glaeubigerId) + ")" : ""} widerruflich, den Mitgliedsbeitrag ${zeit} von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die Lastschriften einzulösen. Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten die mit meinem Kreditinstitut vereinbarten Bedingungen. Die Mandatsreferenz wird mir separat mitgeteilt.</p>
<table>${zeile("Kontoinhaber/in", a && a.kontoinhaber)}${zeile("IBAN", iban)}${zeile("Bank / BIC", "")}</table>
<h2>Datenschutz</h2>
<p class="s">Die Informationen nach Art. 13 DSGVO habe ich zur Kenntnis genommen (Homepage des Vereins unter „Datenschutz“ oder beim Vorstand erhältlich).</p>
<div class="sig"><div>Ort, Datum</div><div>Unterschrift${firma ? " (für die Firma)" : ""}</div></div>
<p class="s" style="margin-top:14pt">${E(V.papierAntrag || "")}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast("Bitte Pop-ups für diese Seite erlauben."); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  function bestaetigung(v, a) {
    const iban = a.iban.replace(/(.{4})/g, "$1 ").trim();
    const maskiert = iban.slice(0, 4) + " •••• •••• •••• " + iban.slice(-7);
    const firma = a.art === "firma";
    v.innerHTML = kopf("green", "Geschafft", "Danke" + (firma ? "" : ", " + esc(a.vorname)) + "!", (firma ? "Der Antrag für " + esc(a.firma) + " ist beim Vorstand angekommen." : "Euer Antrag ist beim Vorstand angekommen.") + " Ihr bekommt eine Bestätigung per E-Mail an " + esc(a.email) + ".") +
      `<div class="card stack" style="--gap:8px"><h3>Eure Angaben</h3>
        <p>${firma ? `<b>${esc(a.firma)}</b><br>z. Hd. ` : ""}${esc(a.vorname)} ${esc(a.nachname)}<br>${esc(a.strasse)}<br>${esc(a.plz)} ${esc(a.ort)}</p>
        <p>Beitrag: <b class="tnum">${euro(a.beitrag)}</b> ${esc(V.beitragZeitraum || "pro Jahr")}</p>${a.newsletter ? `<p>Newsletter: ja</p>` : ""}${firma ? `<p>Nennung als Unterstützer: ${a.nennung ? "ja" : "nein"}</p>` : ""}
        <p>Lastschrift von: ${esc(a.kontoinhaber)}, <span class="tnum">${maskiert}</span></p>
        <p class="mute small">${V.glaeubigerId ? "Gläubiger-ID " + esc(V.glaeubigerId) + " · " : ""}eingegangen am ${new Date().toLocaleDateString("de-DE")}</p></div>
      <div class="row noprint" style="margin-top:16px">${PREVIEW ? "" : `<button class="btn sec" id="antragDruck">${ICON.druck}Antrag zum Unterschreiben drucken</button>`}<a class="btn" href="#start">Zur Startseite</a></div>`;
    const ad = $("#antragDruck", v); if (ad) ad.onclick = () => antragDrucken(a);
  }

  SEITEN.nichtgefunden = (v) => { v.innerHTML = `<div class="card"><h1>Seite nicht gefunden</h1><p class="mute" style="margin-top:8px">Diese Adresse gibt es nicht (mehr).</p><p style="margin-top:12px"><a class="btn" href="#start">Zur Startseite</a></p></div>`; };

  /* ---------- Schnittstelle für verwaltung.js ---------- */
  window.FV_APP = { SEITEN, ICON, esc, euro, toast, sheet, render, kopf, datumLang, frei, gesamt, dt, heute, farbe, qrSvg, linkZu,
    aktualisieren(x) { uebernehmen(x); render(); } };

  function uebernehmen(x) {
    if (!x) return;
    if (x.verein && typeof x.verein === "object") I.verein = Object.assign({}, I.verein, x.verein);
    if (Array.isArray(x.projekte)) I.projekte = x.projekte;
    if (Array.isArray(x.termine)) I.termine = x.termine;
    if (Array.isArray(x.neuigkeiten)) I.neuigkeiten = x.neuigkeiten;
    if (Array.isArray(x.galerie)) I.galerie = x.galerie;
    V = I.verein;
  }

  /* ---------- Start ---------- */
  try { const t = localStorage.getItem("fv_theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  async function boot() {
    try { uebernehmen(await D.inhalteLaden()); } catch (e) { console.warn(e); }
    shell();
    render();
    if (Push.moeglich()) { setTimeout(() => Push.sync(), 3000); setTimeout(pushEinladung, 5000); }
    setTimeout(installEinladung, 7000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  if (!PREVIEW && "serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
