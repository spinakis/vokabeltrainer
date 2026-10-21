// Service Worker des Provenienz-Notizbuchs (Bauplan 9). Vorlage: das Vite-Plugin scripts/sw-plugin.mjs
// ersetzt beim Build die beiden Platzhalter unten durch die Version und die Dateiliste und schreibt dist/sw.js.
// Im Dev-Server wird er nie registriert.

const VERSION = "7a2d471bd1";
const DATEIEN = ["./","./index.html","./assets/index-DPqYhaJE.css","./assets/index-pjpOMlh5.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./icons/icon.svg","./manifest.webmanifest"];
const CACHE = "provenienz-" + VERSION;

// Installieren: alle Dateien des Builds in den Cache dieser Version laden (relative Adressen, auch unter einem Unterordner).
self.addEventListener("install", (ereignis) => {
  ereignis.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(DATEIEN)));
});

// Aktivieren: Caches alter Versionen löschen und offene Seiten übernehmen.
self.addEventListener("activate", (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((name) => name.startsWith("provenienz-") && name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// Abrufen: Seitenaufrufe liefern index.html aus dem Cache, alles andere erst aus dem Cache, dann aus dem Netz.
self.addEventListener("fetch", (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== "GET") return;
  if (anfrage.mode === "navigate") {
    ereignis.respondWith(caches.match("./index.html").then((treffer) => treffer || fetch(anfrage)));
    return;
  }
  ereignis.respondWith(caches.match(anfrage).then((treffer) => treffer || fetch(anfrage)));
});

// Eine wartende neue Version übernimmt auf Wunsch der App sofort.
self.addEventListener("message", (ereignis) => {
  if (ereignis.data && ereignis.data.typ === "skipWaiting") self.skipWaiting();
});
