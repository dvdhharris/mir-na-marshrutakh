const CACHE_PREFIX = 'mir-na-marshrutakh-';
const CACHE = `${CACHE_PREFIX}v10`;
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './blank-world-map.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isPage = request.mode === 'navigate'
    || /\.html?$/i.test(url.pathname)
    || /\.webmanifest$/i.test(url.pathname);

  if (isPage) {
    // Check the origin on each page load and refresh the offline copy.
    event.respondWith(
      fetch(new Request(request, { cache: 'no-cache' }))
        .then(response => {
          if (!response.ok) return response;
          return caches.open(CACHE)
            .then(cache => cache.put(request, response.clone()))
            .then(() => response);
        })
        .catch(async () => (await caches.match(request)) || caches.match('./index.html'))
    );
    return;
  }

  // Keep app assets available offline; fetch uncached assets from the origin.
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (!response.ok) return response;
      return caches.open(CACHE)
        .then(cache => cache.put(request, response.clone()))
        .then(() => response);
    }))
  );
});
