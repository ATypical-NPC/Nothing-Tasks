const CACHE = "nothing-tasks-v58";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/tasks-icon-1024.png"
];

self.addEventListener("install", (e) => {
  // cache:"reload" bypasses the browser's HTTP cache — otherwise a new SW version
  // can install a STALE index.html into its fresh cache and updates never land.
  //
  // Cache each asset INDIVIDUALLY, tolerating failures. cache.addAll() is atomic: a single 404
  // rejects the whole install, so skipWaiting() never runs and the new SW never activates —
  // silently killing offline support AND update delivery. That is a live hazard here because
  // index.html is a self-contained bundle, so styles.css / app.js are optional on the server and
  // may legitimately be absent. Missing extras now degrade offline coverage instead of breaking it.
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // cache-first ONLY for our own assets + fonts. Google OAuth/Drive (and any other
  // third-party API) must go straight to the network — a cached Drive response
  // would make sync silently return stale data forever.
  const url = new URL(e.request.url);
  const cacheable = url.origin === location.origin ||
    url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!cacheable) return;
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
