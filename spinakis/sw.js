const CACHE="spinakis-2026-10-07.148903";
const CORE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  if(r.mode==="navigate"){ // online: immer die neueste Fassung, offline: die gespeicherte
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put("./",cp)); return res; }).catch(()=>caches.match("./")));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{ if(res && (res.ok||res.type==="opaque")){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }).catch(()=>hit);
    return hit||net;
  }));
});
