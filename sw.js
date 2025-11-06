// Service Worker for English Hub - Navigation Bypass
const CACHE_NAME = 'english-hub-v1.0.3';
const STATIC_CACHE = 'static-cache-v1';

// Only cache essential assets
const STATIC_ASSETS = [
  '/manifest.json',
  '/scripts/common-i18n.js',
  '/scripts/sound.js',
  '/scripts/translations/i18n_en.js',
  '/scripts/translations/i18n_fr.js',
  '/scripts/translations/i18n_ar.js',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// COMPLETELY bypass service worker for navigation requests
self.addEventListener('fetch', (event) => {
  // Bypass service worker for all HTML navigation
  if (event.request.mode === 'navigate') {
    return;
  }
  
  // Bypass service worker for HTML file requests
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('.html')) {
    return;
  }

  // Only handle non-HTML assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
