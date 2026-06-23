const CACHE_NAME = "elo-jovem-v7";
const HTML_CACHE = "elo-jovem-html-v5";
const API_CACHE = "elo-jovem-api-v1";
const CACHE_PREFIX = "elo-jovem-";

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  return (
    p.startsWith("/_next/image") ||
    p.startsWith("/icons/") ||
    p === "/manifest.webmanifest" ||
    p === "/sw.js" ||
    /\.(woff2?|png|ico|webp|svg)$/i.test(p)
  );
}

function isCacheableApiRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  
  // Cache de APIs específicas
  return (
    p.startsWith("/api/bible/") ||
    p.startsWith("/api/dashboard/") ||
    p.startsWith("/api/chat/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.addAll([
            "/manifest.webmanifest",
          ])
        ),
      caches.open(HTML_CACHE),
      caches.open(API_CACHE),
    ])
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX))
          .filter((k) => k !== CACHE_NAME && k !== HTML_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Assets cacheáveis
  if (isCacheableRequest(request)) {
    return event.respondWith(
      (async () => {
        const req = event.request;
        const accept = req.headers.get("accept") || "";

        // Network-first para HTML
        if (accept.includes("text/html")) {
          const cache = await caches.open(HTML_CACHE);
          try {
            const res = await fetch(req);
            if (res.ok) cache.put(req, res.clone());
            return res;
          } catch {
            return (await cache.match(req)) || (await caches.match("/"));
          }
        }

        // Cache-first para assets
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
          const res = await fetch(req);
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        } catch {
          return cached || (await caches.match(req));
        }
      })()
    );
  }

  // API Responses com stale-while-revalidate
  if (isCacheableApiRequest(request)) {
    return event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(request);

        // Retornar cached imediatamente enquanto faz fetch em background
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached || new Response("Offline", { status: 503 }));

        return cached || fetchPromise;
      })()
    );
  }
});
