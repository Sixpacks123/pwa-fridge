document.addEventListener('DOMContentLoaded', function() {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('Service Worker Registered', registration);
        }).catch(function(err) {
            console.log('Service Worker Failed to Register', err);
        });
    }

    // Notification Permission Request
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
            } else {
                console.log("Notification permission not granted.");
            }
        });
    }

    navigator.serviceWorker.ready.then(function(registration) {
        if ('periodicSync' in registration) {
            try {
                registration.periodicSync.register('content-sync', {
                    minInterval: 60 * 1000,
                });
            } catch (error) {
                console.error(`Periodic Sync could not be registered!`, error);
            }
        }
    });
    // Form Submission Handling
    document.getElementById('productForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('productName').value;
        const date = document.getElementById('expirationDate').value;
        addProduct(name, date);
        document.getElementById('productForm').reset(); // Reset form fields after submission
    });
});


function addProduct(name, date) {
    addProductToDB(name, date).then(() => {
        console.log('Product added to local database');
    });
}

async function setupPeriodicSync(registration) {
    if ('periodicSync' in registration) {
        try {
            await registration.periodicSync.register('check-expiration', {
                minInterval: 24 * 60 * 60 * 1000, // 24 hours
            });
            console.log('Periodic Sync registered for product expiration checks');
        } catch (error) {
            console.error('Periodic Sync could not be registered!', error);
        }
    }
}
