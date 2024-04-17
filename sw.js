const cacheName = 'my-fridge-v8';
const filesToCache = [
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/db.js',
  '/icons/frigo-64.png',
  '/icons/frigo-512x512.png',
];

self.addEventListener("insall", (e) => {
    console.log("[SW] install");
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log("[SW] Caching files");
        await cache.addAll(filesToCache);
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cache) => cache !== cacheName)
                    .map(cache => caches.delete(cache))
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request).then((response) => {
                    let responseClone = response.clone();
                    caches.open(cacheName).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                });
            })
    );
});


if (periodicSyncPermission.state == 'granted') {
    await registration.periodicSync.register('check-expiration', {
        minInterval: 24 * 60 * 60 * 1000
    });
}


self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-expiration') {
        event.waitUntil(checkForExpiringProducts());
    }
});

async function checkForExpiringProducts() {
    // Assuming openDatabase is a function that opens IndexedDB
    const db = await openDatabase();
    const now = new Date();
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const index = store.index('expirationDate');

    return index.openCursor().then(function cursorIterate(cursor) {
        if (!cursor) return;
        const { name, expirationDate } = cursor.value;
        const expDate = new Date(expirationDate);
        const daysToExpire = (expDate - now) / (1000 * 3600 * 24);

        if (daysToExpire < 1) {
            self.registration.showNotification("Product Expiring Soon", {
                body: `${name} expires within 24 hours.`,
                icon: '/icons/frigo-64.png'
            });
        }
        return cursor.continue().then(cursorIterate);
    });
}
