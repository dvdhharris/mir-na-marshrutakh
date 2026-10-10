const CACHE = 'mir-na-marshrutakh-v7';
const APP_SHELL = ['./','./index.html','./manifest.webmanifest','./blank-world-map.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
    return response;
  })).catch(() => request.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('Offline asset unavailable'))));
});
