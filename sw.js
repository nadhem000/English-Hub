// Service Worker for English Hub - Updated with better cache management
const CACHE_NAME = 'english-hub-v1.0.3'; // Increment version
const STATIC_CACHE = 'static-cache-v1.0.3';
const DYNAMIC_CACHE = 'dynamic-cache-v1.0.3';

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
  self.skipWaiting(); // Activate immediately
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
      })
  );
});

// Activate event - clean up old caches more aggressively
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Delete ALL caches that don't match current version
          if (!cache.includes('v1.0.3')) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activate completed');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache or network with cache-busting
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Add cache-busting for HTML files
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          // Cache the fresh version
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version but update in background
        if (response) {
          // Update cache in background
          fetch(event.request)
            .then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(event.request, fetchResponse);
                  });
              }
            });
          return response;
        }

        return fetch(event.request)
          .then((fetchResponse) => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200) {
              return fetchResponse;
            }

            // Clone the response because it can only be used once
            const responseToCache = fetchResponse.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(() => {
            // Fallback for HTML pages
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
