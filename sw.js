const CACHE="ready-coast-v5";
const CORE=["./","index.html","styles.css?v=5","app.js?v=5","manifest.webmanifest?v=5","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener("install",event=>{
 self.skipWaiting();
 event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url)))));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(url.hostname==="api.weather.gov")return;
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{
   const copy=response.clone();caches.open(CACHE).then(cache=>cache.put("index.html",copy));return response;
  }).catch(()=>caches.match("index.html")));
  return;
 }
 event.respondWith(fetch(event.request).then(response=>{
  const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
 }).catch(()=>caches.match(event.request)));
});