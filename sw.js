const cacheName = 'my-fridge-v7';
const filesToCache = [
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/db.js',
  '/icons/frigo-64.png',
  '/icons/frigo-512x512.png',
];

self.addEventListener("install", (e) => {
    console.log("[SW] Install");
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            const cachePromises = filesToCache.map(url => {
                return cache.add(url).catch(err => console.error(`Caching failed for ${url}: ${err}`));
            });
            return Promise.all(cachePromises).then(() => {
                console.log("[SW] All specified resources have been cached.");
                return self.skipWaiting(); 
            });
        }).catch(err => console.error("Failed to open cache", err))
    );
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

self.addEventListener('periodicsync', function(e) {
    if(e.tag === 'content-sync') {
        e.waitUntil(
            syncContent().then(()=>self.registration.showNotification('Content Synced!')
        ))
    }
});

