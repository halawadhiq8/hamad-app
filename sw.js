const CACHE_NAME = 'rihala-cache-v11';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png', './favicon-16.png', './favicon.ico'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){ /* ignore individual failures */ });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Network-first for same-origin requests (always fresh when online),
// falling back to the cache (or the app shell) when there is no connection.
// Cross-origin requests (Google Maps tiles, Nominatim search, etc.) are left
// untouched — those genuinely need the internet and should not be cached.
self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch(e){ return; }
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(function(networkResp){
      if(networkResp && networkResp.status === 200){
        const clone = networkResp.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(req, clone); });
      }
      return networkResp;
    }).catch(function(){
      return caches.match(req).then(function(cached){
        return cached || caches.match('./index.html');
      });
    })
  );
});
