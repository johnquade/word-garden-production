const CACHE = "word-garden-v23";
const ASSETS = [
 "./",
 "index.html",
 "css/styles.css",
 "js/app.js",
 "js/content.js",
 "manifest.webmanifest",
 "assets/fonts/andika-400.woff2",
 "assets/fonts/andika-700.woff2",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "docs/image-review.html",
 "docs/images.csv",
 "audio/phonemes/a.wav",
 "audio/phonemes/air.wav",
 "audio/phonemes/ar.wav",
 "audio/phonemes/aw.wav",
 "audio/phonemes/ay.wav",
 "audio/phonemes/b.wav",
 "audio/phonemes/ch.wav",
 "audio/phonemes/d.wav",
 "audio/phonemes/e.wav",
 "audio/phonemes/ear.wav",
 "audio/phonemes/ee.wav",
 "audio/phonemes/er.wav",
 "audio/phonemes/f.wav",
 "audio/phonemes/g.wav",
 "audio/phonemes/h.wav",
 "audio/phonemes/i.wav",
 "audio/phonemes/ie.wav",
 "audio/phonemes/j.wav",
 "audio/phonemes/k.wav",
 "audio/phonemes/l.wav",
 "audio/phonemes/m.wav",
 "audio/phonemes/n.wav",
 "audio/phonemes/ng.wav",
 "audio/phonemes/o.wav",
 "audio/phonemes/oa.wav",
 "audio/phonemes/oi.wav",
 "audio/phonemes/oo.wav",
 "audio/phonemes/oo_short.wav",
 "audio/phonemes/or.wav",
 "audio/phonemes/ow.wav",
 "audio/phonemes/p.wav",
 "audio/phonemes/qu.wav",
 "audio/phonemes/r.wav",
 "audio/phonemes/s.wav",
 "audio/phonemes/sh.wav",
 "audio/phonemes/t.wav",
 "audio/phonemes/th.wav",
 "audio/phonemes/th_v.wav",
 "audio/phonemes/u.wav",
 "audio/phonemes/ue.wav",
 "audio/phonemes/v.wav",
 "audio/phonemes/w.wav",
 "audio/phonemes/x.wav",
 "audio/phonemes/y.wav",
 "audio/phonemes/z.wav"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) {
      const copy = res.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy));
    }
    return res;
  }).catch(()=>caches.match("index.html"))));
});
