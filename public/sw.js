const TILE_CACHE = 'goldsucher-tiles-v1';
const MAX_TILE_CACHE_ITEMS = 8000;

const TILE_URL_PATTERNS = [
  'mt0.google.com/vt/',
  'mt1.google.com/vt/',
  'mt2.google.com/vt/',
  'mt3.google.com/vt/',
  'tile.opentopomap.org/',
  'tile.openstreetmap.org/',
  'server.arcgisonline.com/',
];

function isTileRequest(url) {
  return TILE_URL_PATTERNS.some(function(pattern) { return url.includes(pattern); });
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

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== TILE_CACHE; })
             .map(function(name) { return caches.delete(name); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  if (!isTileRequest(url)) return;

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
});
