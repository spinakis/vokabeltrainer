const CACHE="spinakis-2026-10-22.6d71ab-sw3", PREFIX="spinakis-", NAV_TIMEOUT=4000;
const CORE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","schriften/NotoSans-Regular-Umschrift.ttf","schriften/NotoSans-Bold-Umschrift.ttf","schriften/CrimsonPro-VF.ttf","schriften/CrimsonPro-Italic-VF.ttf","schriften/NotoSansMath-Symbole.ttf"];
// Nur echte Erfolgsantworten dürfen in den Cache (keine 404/500, keine Weiterleitung auf eine WLAN-Anmeldeseite).
const good=res=>!!res && res.ok && (res.type==="basic" || res.type==="cors");
const withTimeout=(p,ms)=>new Promise((ok,no)=>{ const t=setTimeout(()=>no(new Error("timeout")),ms); p.then(v=>{clearTimeout(t);ok(v);},e=>{clearTimeout(t);no(e);}); });
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
// Alte Caches dieser App löschen, fremde Apps auf demselben Server (andere Namen) nicht anfassen
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX) && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  if(r.mode==="navigate"){ // online: neueste Fassung; Fehler, Anmeldeseite oder Timeout: die gespeicherte
    // Antwort unter der tatsächlichen Adresse ablegen (hilfe.html bleibt hilfe.html); nur die Startseite zusätzlich unter "./"
    const start=/(\/|\/index\.html)$/.test(new URL(r.url).pathname);
    const net=fetch(r).then(res=>{ if(good(res) && /html/.test(res.headers.get("content-type")||"")){ const cp=res.clone(), cp2=start? res.clone() : null; caches.open(CACHE).then(c=>{ c.put(r,cp); if(cp2) c.put("./",cp2); }); } return res; });
    net.catch(()=>{});
    const alt=()=>caches.match(r).then(hit=>hit||caches.match("./"));
    e.respondWith(withTimeout(net,NAV_TIMEOUT)
      .then(res=>(good(res) && /html/.test(res.headers.get("content-type")||""))? res : alt().then(hit=>hit||res))
      .catch(()=>alt().then(hit=>hit||net)));
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
