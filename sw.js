// Service Worker for English Hub
const CACHE_NAME = 'english-hub-v1.0.0';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/Communication-Skills-Enhancement.html',
  '/Eh-general-reading-adventures.html',
  '/EH-reading-workplace.html',
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

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activate completed');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache dynamic requests
            if (event.request.url.startsWith('http') && 
                (event.request.destination === 'document' || 
                 event.request.destination === 'script' ||
                 event.request.destination === 'style')) {
              return caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request.url, fetchResponse.clone());
                  return fetchResponse;
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Fallback for HTML pages
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // You can add background sync logic here for future features
  }
});