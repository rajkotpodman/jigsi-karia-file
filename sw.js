/* ============================================================
   CyberDork OSINT Suite v7.0
   sw.js - Service Worker (offline PWA caching)
   ============================================================ */

const CACHE_NAME = 'cyberdork-v7-0-0';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './dorks.js',
    './extensions.js',
    './tools.js',
    './auth.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    if (response.ok && !url.pathname.includes('sw.js')) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match('./index.html'));
        })
    );
});
