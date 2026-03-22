var CACHE_NAME = 'lysardiere-22032026';
var urlsToCache = [
  '/lysardiere/index.html',
  '/lysardiere/manifest.json',
  '/lysardiere/icon-192.png',
  '/lysardiere/icon-512.png'
];

// Install: cache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Don't cache API calls
  if (event.request.url.indexOf('supabase.co') >= 0 ||
      event.request.url.indexOf('googleapis.com') >= 0 ||
      event.request.url.indexOf('economie.gouv.fr') >= 0 ||
      event.request.url.indexOf('qrserver.com') >= 0) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
