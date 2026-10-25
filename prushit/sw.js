const CACHE="prushit-2026-10-25.c3b77f.9fb0-sw42", PREFIX="prushit-", NAV_TIMEOUT=4000;
const CORE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","schriften/NotoSerifHebrew-Regular.ttf","schriften/NotoSansHebrew-Regular.ttf","schriften/PlaypenSansHebrew-Regular.ttf","schriften/NotoRashiHebrew-Regular.ttf","schriften/FrankRuhlLibre-Regular.ttf","schriften/DavidLibre-Regular.ttf","schriften/AtkinsonHyperlegible-Regular.ttf","schriften/AtkinsonHyperlegible-Bold.ttf","schriften/NotoSans-Regular-Umschrift.ttf","schriften/NotoSans-Bold-Umschrift.ttf","schriften/CrimsonPro-Italic-VF.ttf"];
// Nur echte Erfolgsantworten dürfen in den Cache (keine 404/500, keine Weiterleitung auf eine WLAN-Anmeldeseite).
const good=res=>!!res && res.ok && (res.type==="basic" || res.type==="cors");
const withTimeout=(p,ms)=>new Promise((ok,no)=>{ const t=setTimeout(()=>no(new Error("timeout")),ms); p.then(v=>{clearTimeout(t);ok(v);},e=>{clearTimeout(t);no(e);}); });
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"}))))); });   // kein skipWaiting: eine neue Fassung wartet, bis die Seite sie übernimmt (Nachricht, "Jetzt laden") oder alle Fenster geschlossen sind (nächster kalter Start)
self.addEventListener("message",e=>{ if(e.data && e.data.typ==="SKIP_WAITING") self.skipWaiting(); });
// Alte Caches dieser App löschen, fremde Apps auf demselben Server (andere Namen) nicht anfassen
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX) && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  if(r.mode==="navigate"){ // zuerst der Cache dieses Workers (dieselbe Version wie Stile und Module); das Netz nur ohne Treffer
    // Mit Treffer fragt eine Anfrage im Hintergrund nur die Zugangssperre ab (401/403: Cache der App löschen); ihre Antwort wird nicht gespeichert (sonst gemischte Versionen)
    const start=/(\/|\/index\.html)$/.test(new URL(r.url).pathname);
    const alt=()=>caches.match(r).then(hit=>hit||(start? caches.match("./") : undefined));
    const netz=()=>fetch(r).then(res=>{ if(good(res) && /html/.test(res.headers.get("content-type")||"")){ const cp=res.clone(), cp2=start? res.clone() : null; caches.open(CACHE).then(c=>{ c.put(r,cp); if(cp2) c.put("./",cp2); }); } return res; });
    e.respondWith(alt().then(hit=>{
      if(hit){ return hit; }
      return withTimeout(netz(),NAV_TIMEOUT).catch(err=>caches.match("./").then(h=>{ if(h) return h; throw err; }));   // unbekannte Unterseite ohne Netz: die App statt Browserfehler
    }));
    return;
  }
  // Fremde Adressen (Google Fonts): mit CORS holen, damit res.ok prüfbar ist (sonst undurchsichtige Antworten)
  const fremd=new URL(r.url).origin!==self.location.origin;
  const rq=(fremd && r.mode==="no-cors")? new Request(r.url,{mode:"cors",credentials:"omit"}) : r;
  e.respondWith(caches.match(r).then(hit=>hit||fetch(rq).then(res=>{ if(good(res)){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));   // Treffer ohne Nachladen: eine Version je Auslieferung
});
