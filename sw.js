/* ============================================================
   SERVICE WORKER — TERENA OIL
   Cache-first pour les assets statiques, network-first pour HTML
   ============================================================ */

const CACHE = 'terena-v1';
const STATIC = [
  '/',
  '/index.html',
  '/carwash.html',
  '/supermarche.html',
  '/entreprises.html',
  '/contact.html',
  '/css/base.css',
  '/css/components.css',
  '/css/layouts.css',
  '/js/main.js',
  '/images/logo.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.hostname === 'images.unsplash.com' || url.hostname.includes('fonts.')) {
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })
    );
    return;
  }

  if (url.origin === self.location.origin && request.destination === 'document') {
    e.respondWith(
      fetch(request)
        .then(res => { caches.open(CACHE).then(c => c.put(request, res.clone())); return res; })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
