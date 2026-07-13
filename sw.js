const CACHE="ready-coast-v8";
const CORE=["./","index.html","styles.css?v=8","app.js?v=8","manifest.webmanifest?v=8","icon.svg?v=8","favicon-32.png?v=8","icon-192.png?v=8","icon-512.png?v=8"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(CORE.map(x=>c.add(x)))))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.hostname==="api.weather.gov")return;
 if(e.request.mode==="navigate"){
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put("index.html",x));return r}).catch(()=>caches.match("index.html")));
  return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});