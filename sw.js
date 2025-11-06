// Service Worker for English Hub
const CACHE_NAME = 'english-hub-v1.0.1';
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
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((fetchResponse) => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response because it can only be used once
            const responseToCache = fetchResponse.clone();

            // Cache the response for HTML, CSS, JS files
            if (event.request.url.indexOf('/assets/') === -1 && 
                (event.request.destination === 'document' || 
                 event.request.destination === 'script' ||
                 event.request.destination === 'style')) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return fetchResponse;
          })
          .catch(() => {
            // Fallback for HTML pages - return index.html for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
  }
});