/* Service Worker: macht die App installierbar und offline lesbar.
   Bei jeder Änderung an Dateien VERSION hochzählen. */
const VERSION = "fv-4";
const DATEIEN = ["./", "index.html", "css/app.css?v=4", "js/config.js?v=4", "js/inhalte.js?v=4", "js/daten.js?v=4", "js/app.js?v=4",
  "vendor/qrcode.js", "fonts/fredoka.woff2", "fonts/source-sans-3.woff2",
  "img/logo.png", "img/icon-192.png", "img/icon-512.png", "img/favicon.png", "manifest.webmanifest"];

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
