const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/app.js',
  '/server.js',
  '/index.html',
  '/styles.css',
  '/icon.png',
  '/time-in-a-bottle.mp3',
  '/manifest.json'  // Ensure this file is locally hosted and accessible
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache files:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
      })
  );
});
