document.addEventListener('DOMContentLoaded', function() {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('Service Worker Registered', registration);
            setupPeriodicSync(registration);
        }).catch(err => {
            console.error('Service Worker Failed to Register', err);
        });
    }

    // Notification Permission Request
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            console.log(permission === "granted" ? "Notification permission granted." : "Notification permission not granted.");
        });
    }

    // Form Submission Handling
    const form = document.getElementById('productForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('productName').value;
        const date = document.getElementById('expirationDate').value;
        addProduct(name, date);
        form.reset(); // Reset form fields after submission
    });
});

async function addProduct(name, date) {
    if (typeof addProductToDB === 'function') {
        await addProductToDB(name, date);
        console.log('Product added to local database');
    }
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
