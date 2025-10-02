const CACHE='ws-noicons-v5';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin) return;
  e.respondWith(caches.match(r).then(res=>res||fetch(r)));
});