// KetikLab service worker — offline app shell + data caching.
// Bump VERSION whenever the caching rules change: activate drops every other
// cache, and that is the only way an entry stored under old rules ever goes away.
const VERSION = "kl-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./maskable-512.png"];
// The worker's scope covers the whole origin, but only the app's own document may
// become the offline shell — never /ops/, sitemap.xml or a JSON file opened in a tab.
const SHELL = new URL("./", self.location).pathname;

// Error and redirect responses are never stored: with cache-first assets a cached
// 404/503 would blank the site until the next code deploy.
const store = (key, res) => {
  if (!res.ok) return;
  const copy = res.clone();
  caches.open(VERSION).then((c) => c.put(key, copy));
};

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
    const isShell = url.pathname === SHELL || url.pathname === SHELL + "index.html";
    e.respondWith(fetch(req).then((res) => {
      if (isShell) store("./index.html", res);
      return res;
    }).catch(() => (isShell ? caches.match("./index.html") : caches.match(req))));
    return;
  }
  // Hashed build assets are immutable: cache-first
  if (url.pathname.includes("/assets/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      store(req, res);
      return res;
    })));
    return;
  }
  // Payment details are edited in place between deploys and must never be served
  // stale, so they skip the worker entirely (the page fetches them with no-store)
  if (url.pathname.endsWith("/pay.json")) return;
  // a cache-busting query wants the network copy; caching each would store a fresh ~1MB words.json
  if (url.pathname.includes("/data/") && url.search) return;
  // Content JSON: stale-while-revalidate (instant + refreshes in background)
  if (url.pathname.includes("/data/")) {
    e.respondWith(caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        store(req, res);
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  // Everything else: network, fall back to cache
  e.respondWith(fetch(req).then((res) => {
    store(req, res);
    return res;
  }).catch(() => caches.match(req)));
});
