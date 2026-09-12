// KetikLab service worker — offline app shell + data caching.
const VERSION = "kl-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations: network-first, fall back to cached shell offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      // this worker's bytes never change between deploys, so the install-time copy
      // would stay frozen; ok only, or a 404 could become the page everyone sees offline
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put("./index.html", copy));
      }
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // Hashed build assets are immutable: cache-first
  if (url.pathname.includes("/assets/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy));
      return res;
    })));
    return;
  }
  // a cache-busting query wants the network copy; caching each would store a fresh ~1MB words.json
  if (url.pathname.includes("/data/") && url.search) return;
  // Content JSON: stale-while-revalidate (instant + refreshes in background)
  if (url.pathname.includes("/data/")) {
    e.respondWith(caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // Everything else: network, fall back to cache
  e.respondWith(fetch(req).then((res) => {
    const copy = res.clone();
    caches.open(VERSION).then((c) => c.put(req, copy));
    return res;
  }).catch(() => caches.match(req)));
});
