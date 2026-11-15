// MindMirror Live 2026 - Production Service Worker (2026 High-Performance Standard)
const CACHE_VERSION = 'mindmirror-2026-v32';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-maskable-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/icon.svg',
  '/screenshot-mobile.jpg',
  '/screenshot-desktop.jpg'
];

// 1. Install & Pre-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW 2026] Pre-caching core application shell & PWA assets...');
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) => 
          cache.add(asset).catch((err) => console.warn(`[SW 2026] Warning caching asset ${asset}:`, err))
        )
      );
    })
  );
});

// 2. Activate & Purge Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[SW 2026] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Skip Waiting Message Handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Resilient Fetch Strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass API routes, WebSockets (/live), and non-GET calls
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/live') || request.method !== 'GET') {
    return;
  }

  // A. Navigation requests (HTML SPA Shell) - Network First with rapid fallback to cache
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      (async () => {
        const cachedResponse = (await caches.match(request)) || (await caches.match('/')) || (await caches.match('/index.html'));
        
        const networkPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
                cache.put('/', responseClone.clone());
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[SW 2026] Network fetch failed, using cached shell:', err);
            return null;
          });

        if (cachedResponse) {
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1200));
          const fastNetwork = await Promise.race([networkPromise, timeoutPromise]);
          if (fastNetwork) return fastNetwork;
          return cachedResponse;
        }

        const networkRes = await networkPromise;
        if (networkRes) return networkRes;

        return new Response('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>MindMirror Live 2026</title></head><body style="background:#02040a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>محراب العقول 2026</h2><p>يرجى تحديث الصفحة للبدء.</p></div></body></html>', {
          status: 200, 
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // B. Static Assets & Fonts - Cache First with dynamic population
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        return Response.error();
      });
    })
  );
});
