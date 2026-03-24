var TILE_CACHE = 'goldsucher-tiles-v1';
var APP_CACHE = 'goldsucher-app-v2';
var MAX_TILE_CACHE_ITEMS = 8000;

var TILE_URL_PATTERNS = [
  'mt0.google.com/vt/',
  'mt1.google.com/vt/',
  'mt2.google.com/vt/',
  'mt3.google.com/vt/',
  'tile.opentopomap.org/',
  'tile.openstreetmap.org/',
  'server.arcgisonline.com/',
];

var CDN_PATTERNS = [
  'cdn.tailwindcss.com',
  'unpkg.com/leaflet',
  'esm.sh/',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

function isTileRequest(url) {
  return TILE_URL_PATTERNS.some(function(p) { return url.includes(p); });
}

function isCdnRequest(url) {
  return CDN_PATTERNS.some(function(p) { return url.includes(p); });
}

function isAppAsset(url) {
  var path = new URL(url).pathname;
  return path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') ||
         path.endsWith('.jpg') || path.endsWith('.svg') || path.endsWith('.woff2') ||
         path.endsWith('.woff') || path.endsWith('.json');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
}

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(function(cache) {
    cache.keys().then(function(keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(function() {
          if (keys.length - 1 > maxItems) trimCache(cacheName, maxItems);
        });
      }
    });
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(APP_CACHE).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.css',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ]).catch(function() {});
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== TILE_CACHE && n !== APP_CACHE; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  if (event.request.method !== 'GET') return;

  // --- Map tiles: Cache-first ---
  if (isTileRequest(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          if (cached) return cached;
          return fetch(event.request).then(function(response) {
            if (response.ok || response.type === 'opaque') {
              cache.put(event.request, response.clone());
              trimCache(TILE_CACHE, MAX_TILE_CACHE_ITEMS);
            }
            return response;
          }).catch(function() {
            return new Response('', { status: 408, statusText: 'Tile unavailable' });
          });
        });
      })
    );
    return;
  }

  // --- CDN resources (Tailwind, Leaflet, ESM imports, Firebase): Stale-while-revalidate ---
  if (isCdnRequest(url)) {
    event.respondWith(
      caches.open(APP_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fetchPromise = fetch(event.request).then(function(response) {
            if (response.ok || response.type === 'opaque') {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(function() {
            return cached || new Response('', { status: 503 });
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // --- Navigation requests (HTML): Network-first, cache fallback ---
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(APP_CACHE).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('/');
        });
      })
    );
    return;
  }

  // --- App assets (JS, CSS, images, JSON): Stale-while-revalidate ---
  if (isAppAsset(url)) {
    event.respondWith(
      caches.open(APP_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fetchPromise = fetch(event.request).then(function(response) {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(function() {
            return cached || new Response('', { status: 503 });
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }
});
