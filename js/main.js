document.addEventListener('DOMContentLoaded', function() {
    // Service Worker Registration
    if ('serviceWorker' in navigator && 'serviceWorker' in navigator) {
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
    try {

        await registration.periodicSync.register('check-expiration', {
            // 1 minute minimum interval
            minInterval: 60000
        });
        console.log('Periodic Sync registered');
    } catch (error) {
        console.error('Failed to register periodic sync:', error);
    }
}


