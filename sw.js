/* Boîte à outils — service worker. Version : ffa053a75d
   Page : réseau d'abord (la dernière version quand il y a du réseau), cache sinon.
   Icônes et manifeste : cache d'abord. */
var CACHE='outils-fsi-ffa053a75d';
var FILES=['./','./index.html','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k.indexOf('outils-fsi-')===0&&k!==CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
function timeout(ms,p){ return new Promise(function(res,rej){ var t=setTimeout(function(){ rej(new Error('timeout')); },ms); p.then(function(r){ clearTimeout(t); res(r); },function(err){ clearTimeout(t); rej(err); }); }); }
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==self.location.origin) return;
  if(req.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')){
    e.respondWith(timeout(4000,fetch(req,{cache:'no-cache'})).then(function(r){
      if(r&&r.ok){ var cp=r.clone(); caches.open(CACHE).then(function(c){ c.put('./index.html',cp); }); }
      return r;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){ return r||fetch(req); }));
});
