const CACHE_NAME = 'weltraum-shooter-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-256.svg',
  './icons/icon-384.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // runtime cache GET requests
      if (req.method === 'GET' && resp.status === 200) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
