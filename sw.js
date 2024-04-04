const CACHE_NAME = 'my-fridge-v1';
const urlsToCache = [
  '/index.html',
  '/styles.css',
  '/main.js',
];
self.addEventListener("insall", (e) => {
    console.log("[SW] install");
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log("[SW] Caching files");
        await cache.addAll(filesToCache);
    })());
});


self.addEventListener("fetch", (e) => {
    console.log("[SW] Fetching url: ", e.request.url);
    e.respondWith((async () => {

        const match = await caches.match(e.request);
        if (match) return match;

        const response = await fetch(e.request);

        if (e.request.method === "GET" && !(e.request.headers.get("Cache-Control") === "no-cache" || e.request.headers.get("Cache-Control") === "no-store")) {
            const cache = await caches.open(cacheName);
            console.log("[SW] Caching new resource: ", e.request.url);
            cache.put(e.request, response.clone());
        }

        return response;
    })())
});

