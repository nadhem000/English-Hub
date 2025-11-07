// Service Worker for English Hub - Enhanced cache management
const VERSION = 'v1.0.7'; // Increment version
const STATIC_CACHE = `static-cache-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${VERSION}`;

// Assets to cache during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/Communication-Skills-Enhancement.html',
  '/Eh-general-reading-adventures.html',
  '/EH-reading-workplace.html',
  '/manifest.json',
  '/styles/common.css',
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
  console.log('Service Worker: Installing version', VERSION);
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

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL caches that don't match current version
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activate completed - all old caches deleted');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first strategy for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML pages, use network first strategy
  if (event.request.destination === 'document' || 
      event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
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
          // If network fails, try cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, return offline page or index
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // For other resources (JS, CSS, images), use cache first
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(event.request, response);
                  });
              }
            })
            .catch(() => {
              // Ignore fetch errors for background updates
            });
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache the response
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Return appropriate fallback for different file types
            if (event.request.url.endsWith('.js')) {
              return new Response('// Network error', {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
            if (event.request.url.endsWith('.css')) {
              return new Response('/* Network error */', {
                headers: { 'Content-Type': 'text/css' }
              });
            }
            return new Response('Network error', {
              status: 408
            });
          });
      })
  );
});