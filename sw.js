/* Service Worker: macht die App installierbar und offline lesbar.
   Bei jeder Änderung an Dateien VERSION hochzählen. */
const VERSION = "fv-33";
const DATEIEN = ["./", "index.html", "css/app.css?v=33", "js/config.js?v=33", "js/inhalte.js?v=33", "js/daten.js?v=33", "js/app.js?v=33", "js/verwaltung.js?v=33",
  "vendor/qrcode.js", "fonts/fredoka.woff2", "fonts/source-sans-3.woff2",
  "img/logo.png", "img/logo-punkte.png", "img/icon-192.png", "img/icon-512.png", "img/favicon.png", "manifest.webmanifest"];

self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Datenbank-Anfragen nie zwischenspeichern
  // Erst Netz, bei Funkloch der Zwischenspeicher – so sind Inhalte immer aktuell
  e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(VERSION).then(c => c.put(e.request, k)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});

/* Push-Benachrichtigungen */
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { titel: "Förderverein", text: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titel || "Förderverein", { body: d.text || "", icon: "img/icon-192.png", badge: "img/favicon.png", data: { url: d.url || "" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const ziel = new URL(e.notification.data && e.notification.data.url ? e.notification.data.url : "", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    for (const c of l) if (c.url.startsWith(self.registration.scope) && "focus" in c) { c.navigate(ziel).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(ziel);
  }));
});
