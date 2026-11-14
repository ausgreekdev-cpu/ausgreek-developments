const VERSION = 'v28';
const PAGES_CACHE = 'ausgreek-pages-' + VERSION;
const STATIC_CACHE = 'ausgreek-static-' + VERSION;
const CURRENT_CACHES = [PAGES_CACHE, STATIC_CACHE];

const PRECACHE_PAGES = [
  '/',
  '/index.html',
  '/404.html',
  '/offline.html',
  '/thanks.html',
  '/privacy.html',
  '/terms.html'
];
const PRECACHE_STATIC = [
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/assets/icon.svg',
  '/assets/icon-32.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const pages = await caches.open(PAGES_CACHE);
    await pages.addAll(PRECACHE_PAGES);
    const stat = await caches.open(STATIC_CACHE);
    await stat.addAll(PRECACHE_STATIC);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => !CURRENT_CACHES.includes(k)).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(networkFirstPage(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirstPage(req) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    const fallback = await cache.match('/offline.html') || await cache.match('/index.html');
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  const refresh = fetch(req)
    .then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (cached) return cached;
  const res = await refresh;
  if (res) return res;
  throw new Error('offline and not cached: ' + req.url);
}
