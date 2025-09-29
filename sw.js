// Simple offline-first service worker
const CACHE_VERSION = 'space-shooter-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_VERSION ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first for Google Fonts, cache-first for same-origin game assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass non-GET and third-party POSTs etc.
  if (req.method !== 'GET') return;

  if (url.origin === location.origin) {
    // Cache-first for same-origin
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, respClone));
        return resp;
      }).catch(() => caches.match('./index.html')))
    );
  } else {
    // Network-first for cross-origin (e.g., Google Fonts)
    event.respondWith(
      fetch(req).then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        return resp;
      }).catch(() => caches.match(req))
    );
  }
});
