const CACHE_NAME = 'space-shooter-v1.0.1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// Network-first for HTML; cache-first for others
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass for cross-origin non-GET
  if (req.method !== 'GET') return;

  if (req.destination === 'document' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    // Network-first to avoid "blauer Bildschirm" durch alte Caches
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        });
      })
    );
  }
});

// Optional: Push (Icons angepasst)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Updates verfügbar!',
    icon: './icon-192.png',
    badge: './icon-192.png'
  };
  event.waitUntil(self.registration.showNotification('Space Shooter PWA', options));
});
