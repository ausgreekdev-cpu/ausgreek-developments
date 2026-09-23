const CACHE = 'ausgreek-v1';
const ASSETS = ['/', '/index.html', '/css/style.css', '/js/main.js', '/manifest.json', '/404.html', '/thanks.html', '/privacy.html', '/terms.html', '/assets/icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
