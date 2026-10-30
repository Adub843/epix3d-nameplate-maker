// Nameplate Maker service worker: the app works offline after the first visit.
// Paths are relative to this file, so the site runs from any folder (GitHub Pages serves it from
// /epix3d-nameplate-maker/). The build stamps the cache name, so each deploy replaces the old files.
const CACHE = "nameplate-maker-__BUILD__";
const SHELL = ["./", "index.html", "css/app.css", "js/engine.js", "js/jobs.js", "js/worker.js", "js/app.js", "js/library.js", "js/layout.js", "js/install.js", "vendor/three.min.js",
  "manifest.webmanifest", "img/brand/c3d-logo.png", "icons/icon-192.png", "icons/icon-512.png"].map((p) => new URL(p, self.location).href);
const RUNTIME = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const index = new URL("index.html", self.location).href;
  // pages: network first so new versions arrive, cache as the offline fallback
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(index, copy)); return res; })
      .catch(() => caches.match(index)));
    return;
  }
  // the app's own files and the web fonts: cache first, filled on first use.
  // Image library files come from another origin and are left to the browser cache.
  if (url.origin === location.origin || RUNTIME.includes(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
  }
});
