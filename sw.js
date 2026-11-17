const SHELL='radio-shell-v6',DATA='radio-data-v6';
const FILES=['./','index.html','manifest.json','icon.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==DATA).map(k=>caches.delete(k)))).then(()=>clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  // station data: cache first, refresh in background
  if(u.hostname==='raw.githubusercontent.com'||u.pathname.endsWith('/stations.json')){
    e.respondWith(caches.open(DATA).then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res.ok) c.put(r,res.clone());return res}).catch(()=>hit);
      return hit||net;
    }));
    return;
  }
  // app shell: network first, offline fallback. Audio streams are never touched.
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(SHELL).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true})));
  }
});
