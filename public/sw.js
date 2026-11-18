const CACHE_NAME = 'kasku-idaido-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Hanya tangani GET requests
  if (req.method !== 'GET') return;

  // Navigasi HTML: Network-first, fallback ke cache atau offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResp = await cache.match(req);
        if (cachedResp) return cachedResp;
        return cache.match('/offline.html');
      })
    );
    return;
  }

  // Aset statis & gambar: Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cachedResp) => {
      const fetchPromise = fetch(req)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const respClone = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, respClone);
            });
          }
          return networkResp;
        })
        .catch(() => cachedResp);

      return cachedResp || fetchPromise;
    })
  );
});
