// KetikLab service worker — offline app shell + data caching.
// VERSION and ASSETS are stamped per build by the sw-version plugin in
// vite.config.ts: activate drops every other cache, and that is the only way an
// entry stored under old rules ever goes away.
const VERSION = "kl-v2";
// the hashed bundle files of this build, filled in at build time
const ASSETS = [];
// The language landing pages are shells too (they carry <base href="/"> and load the
// same bundle), so they are precached: served the root shell instead, /zh/ resolved
// the bundle's relative asset URLs under /zh/assets/ and the app never mounted.
const CORE = ["./", "./index.html", "./zh/", "./id/", "./en/", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./maskable-512.png"];
// the content the app fetches at start-up: without it an offline shell shows no words
const DATA_CORE = ["./data/words.json", "./data/readings.json", "./data/manifest.json", "./data/zh-pinyin.json"];
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
  // "reload": the shell must come from the network, not from an HTTP cache that
  // may still hold the previous deploy's index.html (and its asset names)
  const fresh = (u) => new Request(u, { cache: "reload" });
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE.concat(ASSETS).map(fresh))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // the page that installed this worker was still served by the previous one,
    // so the content JSON it fetched went into the previous cache; carry it over
    // before that cache goes, or the next offline open has a shell with no words
    // (the bundle files of this build are precached above; older ones are not kept)
    const mine = await caches.open(VERSION);
    const keys = await caches.keys();
    for (const k of keys) {
      if (k === VERSION) continue;
      const old = await caches.open(k);
      for (const req of await old.keys()) {
        if (!new URL(req.url).pathname.includes("/data/")) continue;
        if (await mine.match(req)) continue;
        const res = await old.match(req);
        if (res) await mine.put(req, res);
      }
      await caches.delete(k);
    }
    // a first visit fetched the content JSON before any worker was in charge, so nothing
    // carried it over: an offline reopen then had the shell and "content failed to load".
    // Fetch what the app needs at start-up now, best effort, if it is not cached yet.
    for (const u of DATA_CORE) {
      if (await mine.match(u)) continue;
      // bounded: the page this worker just took over queues every fetch until activate
      // settles, so a stalled download here must not hold the app for minutes
      try { const res = await fetch(u, { signal: AbortSignal.timeout(8000) }); if (res.ok) await mine.put(u, res); } catch { /* offline already: the next online open fills it */ }
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations: network-first, fall back to cached shell offline. The
  // language landing pages load the same bundle, so they are shells too.
  if (req.mode === "navigate") {
    const isShell = url.pathname === SHELL || url.pathname === SHELL + "index.html";
    const landing = url.pathname.match(/^\/(zh|id|en)\/(index\.html)?$/);
    // "no-cache": a shell is revalidated with the server rather than taken from the HTTP
    // cache, which for ten minutes after a deploy still holds the previous HTML — and
    // that HTML names bundle files this worker's activate has just dropped
    const shellReq = isShell || landing ? new Request(req.url, { cache: "no-cache", credentials: "same-origin" }) : req;
    // a landing page is cached under its bare path: stored under the full URL, a visit
    // with ?utm_source=… never served the plain /id/ offline, and each query made a copy
    const landingKey = landing ? `./${landing[1]}/` : null;
    // a generated page (/zh/lib/en-core/, /id/readings/ …) is a plain document: kept
    // once seen, so a page read online opens offline instead of failing to load
    const generated = !isShell && !landing && /^\/(zh|id|en)\//.test(url.pathname);
    // keyed by path like a landing page: stored under the full URL, a page opened from a
    // shared link with ?utm_… never served its plain address offline, and each query made a copy
    const pageKey = landingKey || (generated ? url.pathname : null);
    e.respondWith(fetch(shellReq).then((res) => {
      if (isShell) store("./index.html", res);
      else if (pageKey) store(pageKey, res);
      return res;
    // a landing page never visited before this worker installed: send the browser to the
    // root shell in that language rather than serving it under /zh/, where it cannot mount
    }).catch(() => (isShell ? caches.match("./index.html") : caches.match(pageKey || req).then((hit) => hit || (landing ? Response.redirect(new URL(`./?ui=${landing[1]}`, self.location).href, 302) : undefined)))));
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
