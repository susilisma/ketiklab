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
      // Keep the offline shell in step with what the network last served: this
      // worker's bytes never change between deploys, so it never reinstalls and
      // the install-time copy would otherwise stay frozen forever. Only a real
      // page counts — a 404 or a captive portal must not become what everyone
      // sees offline.
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
  // A cache-busting query on data is an explicit request for the network copy —
  // the ops dashboard sends one on every refresh. Caching those would store a
  // fresh ~1MB words.json per refresh under a URL nothing ever asks for again.
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
