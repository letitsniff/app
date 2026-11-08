/* Let It Sniff — Service Worker for First-Visit Offline Capabilities */

const CACHE_VERSION = 'letitsniff-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_ASSETS = [
  '/',
  '/offline/',
  '/o-alexandros/',
  '/ypiresies/',
  '/blog/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

const MAX_IMAGE_CACHE_ENTRIES = 100;

// Install: precache critical assets and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Use allSettled so one missing non-critical asset doesn't abort precaching
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' }))
        )
      );
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          console.warn('[SW] Failed to precache:', PRECACHE_ASSETS[idx], res.reason);
        }
      });
    })
  );
});

// Activate: claim all open clients immediately & clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

// Helper: match URL in caches with trailing slash and index.html awareness
async function matchCacheFlexible(request) {
  let response = await caches.match(request);
  if (response) return response;

  const url = new URL(request.url);
  const pathname = url.pathname;

  const candidates = [
    pathname,
    pathname.endsWith('/') ? pathname.slice(0, -1) : `${pathname}/`,
    pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`,
  ];

  for (const candidate of candidates) {
    response = await caches.match(candidate);
    if (response) return response;
  }

  return null;
}

// Helper: limit cache size
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch {
    // ignore
  }
}

// Fetch routing
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // 1. Navigation requests (HTML pages) -> Network-first with cache fallback & offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(req, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check if already in cache
          const cached = await matchCacheFlexible(req);
          if (cached) return cached;

          // Fallback to the dedicated offline page
          const offlinePage = await matchCacheFlexible(new Request('/offline/'));
          if (offlinePage) return offlinePage;

          return new Response(
            '<!DOCTYPE html><html lang="el"><body><h1>Εκτός σύνδεσης</h1><p>Η σελίδα δεν είναι διαθέσιμη εκτός σύνδεσης.</p></body></html>',
            {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 2. Next.js content-hashed immutable bundles -> Cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Images -> Cache-first with network fallback and size limiting
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(req, clone);
                trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_ENTRIES);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return an inline SVG placeholder for missing offline images
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect width="100%" height="100%" fill="#F0E8D5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6E5941" font-family="system-ui, sans-serif" font-size="14">🐾 Εικόνα εκτός σύνδεσης</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
      })
    );
    return;
  }

  // 4. Other static assets (icons, manifest, web fonts) -> Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
