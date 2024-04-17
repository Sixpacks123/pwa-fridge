const cacheName = 'my-fridge-v9';
const filesToCache = [
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/db.js',
    '/icons/frigo-64.png',
    '/icons/frigo-512x512.png',
];

self.addEventListener("install", (event) => {
    console.log("[SW] Install");
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("[SW] Caching files");
            return cache.addAll(filesToCache);
        }).catch(error => {
            console.error("[SW] Failed to open cache", error);
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("[SW] Activate");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== cacheName)
                    .map(cache => caches.delete(cache))
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log("[SW] Fetching:", event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(response => {
                let responseClone = response.clone();
                caches.open(cacheName).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            });
        })
    );
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-expiration') {
        console.log("[SW] Periodic Sync for Expiration Checks");
        event.waitUntil(checkForExpiringProducts());
    }
});

self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('[SW] Push Received:', data);
    const title = data.title || 'Push Notification';
    const options = {
        body: data.body,
        icon: 'icons/icon-192x192.png',
        badge: 'icons/badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click Received:', event.notification);
    event.notification.close();
    // Example: navigate to a specific page
    event.waitUntil(clients.openWindow('/'));
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
