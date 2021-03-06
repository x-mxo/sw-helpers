importScripts('/__test/bundle/sw-runtime-caching');
importScripts('/__test/bundle/sw-cache-expiration');

self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const cacheExpirationPlugin= new goog.cacheExpiration.CacheExpirationPlugin({
  maxEntries: 5,
});
const requestWrapper = new goog.runtimeCaching.RequestWrapper({
  cacheName: 'cache-expiration',
  plugins: [cacheExpirationPlugin],
});
const handler = new goog.runtimeCaching.CacheFirst({
  requestWrapper,
  waitOnCache: true,
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/__echo/counter')) {
    event.respondWith(handler.handle({event}));
  }
});
