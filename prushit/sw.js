const CACHE="prushit-2026-10-20.7fc9e5.6984";
const CORE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","schriften/NotoSerifHebrew-Regular.ttf","schriften/NotoSansHebrew-Regular.ttf","schriften/PlaypenSansHebrew-Regular.ttf","schriften/NotoRashiHebrew-Regular.ttf","schriften/FrankRuhlLibre-Regular.ttf","schriften/DavidLibre-Regular.ttf","schriften/AtkinsonHyperlegible-Regular.ttf","schriften/AtkinsonHyperlegible-Bold.ttf","schriften/NotoSans-Regular-Umschrift.ttf","schriften/NotoSans-Bold-Umschrift.ttf","schriften/CrimsonPro-Italic-VF.ttf"];
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
