const CACHE="ready-coast-v4";
const ASSETS=[
  "./","index.html","styles.css?v=4","app.js?v=4","manifest.webmanifest?v=4",
  "logo-shield.svg?v=4","logo-wordmark.svg?v=4","icon-192.png","icon-512.png"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.hostname==="api.weather.gov")return;
 if(e.request.mode==="navigate"){
   e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("index.html",c));return r}).catch(()=>caches.match("index.html")));
   return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const c=resp.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return resp})));
});