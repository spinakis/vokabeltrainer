const CACHE="spinakis-2026-10-21.57a453-sw2", PREFIX="spinakis-", NAV_TIMEOUT=4000;
const CORE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
// Nur echte Erfolgsantworten dürfen in den Cache (keine 404/500, keine Weiterleitung auf eine WLAN-Anmeldeseite).
const good=res=>!!res && res.ok && (res.type==="basic" || res.type==="cors");
const withTimeout=(p,ms)=>new Promise((ok,no)=>{ const t=setTimeout(()=>no(new Error("timeout")),ms); p.then(v=>{clearTimeout(t);ok(v);},e=>{clearTimeout(t);no(e);}); });
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
// Alte Caches dieser App löschen, fremde Apps auf demselben Server (andere Namen) nicht anfassen
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX) && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  if(r.mode==="navigate"){ // online: neueste Fassung; Fehler, Anmeldeseite oder Timeout: die gespeicherte
    const net=fetch(r).then(res=>{ if(good(res) && /html/.test(res.headers.get("content-type")||"")){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put("./",cp)); } return res; });
    net.catch(()=>{});
    e.respondWith(withTimeout(net,NAV_TIMEOUT)
      .then(res=>(good(res) && /html/.test(res.headers.get("content-type")||""))? res : caches.match("./").then(hit=>hit||res))
      .catch(()=>caches.match("./").then(hit=>hit||net)));
    return;
  }
  // Fremde Adressen (Google Fonts): mit CORS holen, damit res.ok prüfbar ist (sonst undurchsichtige Antworten)
  const fremd=new URL(r.url).origin!==self.location.origin;
  const rq=(fremd && r.mode==="no-cors")? new Request(r.url,{mode:"cors",credentials:"omit"}) : r;
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(rq).then(res=>{ if(good(res)){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; }).catch(()=>hit);
    return hit||net;
  }));
});
