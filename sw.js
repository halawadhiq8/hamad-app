const CACHE_NAME = 'rihala-cache-v25';
// كاشات ثابتة ما تنمسح مع تحديث التطبيق عشان كل شي يشتغل بدون نت:
//  kashkoli-models-v1: إزالة الخلفية ونماذجها ومكتبات CDN · kashkoli-assets-v1: ملفات التطبيق اللي تتحمل مسبقاً
//  kashkoli-live-v1: آخر بيانات طقس وخرائط (تنعرض بدون نت لين يرجع)
const MODELS_CACHE = 'kashkoli-models-v1', LIVE_CACHE = 'kashkoli-live-v1';
// ملفات ثابتة بالإصدار: من الجهاز أول، وأول مرة من النت
const STATIC_HOSTS = ['cdn.jsdelivr.net', 'staticimgly.com', 'cdnjs.cloudflare.com', 'fonts.gstatic.com'];
// تتغير أحياناً: نعرض المحفوظ فوراً ونحدّثه بالخلفية
const SWR_HOSTS = ['fonts.googleapis.com', 'tiles.openfreemap.org', 'server.arcgisonline.com'];
// بيانات حية: من النت أول، ولو ما فيه نت آخر نسخة محفوظة
const LIVE_HOSTS = ['api.open-meteo.com', 'air-quality-api.open-meteo.com', 'api.bigdatacloud.net', 'api.rainviewer.com', 'tilecache.rainviewer.com', 'gibs.earthdata.nasa.gov'];
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png', './favicon-16.png', './favicon.ico'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(APP_SHELL).catch(function(){}); }));
});

self.addEventListener('activate', function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME && k.indexOf('kashkoli-') !== 0; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

const okResp = function(r){ return r && (r.status === 200 || r.type === 'opaque'); };

self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  let url; try { url = new URL(req.url); } catch(e){ return; }
  const h = url.hostname;

  if(STATIC_HOSTS.indexOf(h) !== -1){
    event.respondWith(caches.match(req, {ignoreVary:true}).then(function(hit){
      return hit || fetch(req).then(function(resp){ if(okResp(resp)){ const c = resp.clone(); caches.open(MODELS_CACHE).then(function(cache){ cache.put(req, c); }); } return resp; });
    }));
    return;
  }
  if(SWR_HOSTS.indexOf(h) !== -1){
    event.respondWith(caches.match(req, {ignoreVary:true}).then(function(hit){
      const net = fetch(req).then(function(resp){ if(okResp(resp)){ const c = resp.clone(); caches.open(LIVE_CACHE).then(function(cache){ cache.put(req, c); }); } return resp; }).catch(function(){ return hit; });
      return hit || net;
    }));
    return;
  }
  if(LIVE_HOSTS.indexOf(h) !== -1){
    event.respondWith(fetch(req).then(function(resp){ if(okResp(resp)){ const c = resp.clone(); caches.open(LIVE_CACHE).then(function(cache){ cache.put(req, c); }); } return resp; })
      .catch(function(){ return caches.match(req, {ignoreVary:true}).then(function(hit){ return hit || Response.error(); }); }));
    return;
  }
  if(url.origin !== self.location.origin) return;

  // ملفات التطبيق: من النت أول (عشان التحديثات)، ولو ما فيه نت من الجهاز
  event.respondWith(
    fetch(req).then(function(networkResp){
      if(networkResp && networkResp.status === 200){ const clone = networkResp.clone(); caches.open(CACHE_NAME).then(function(cache){ cache.put(req, clone); }); }
      return networkResp;
    }).catch(function(){
      return caches.match(req, {ignoreVary:true}).then(function(cached){ return cached || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()); });
    })
  );
});
