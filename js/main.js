document.addEventListener('DOMContentLoaded', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('Service Worker Registered', registration);
        }).catch(function(err) {
            console.log('Service Worker Failed to Register', err);
        });
    }
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
            } else {
                console.log("Notification permission not granted.");
            }
        });
    }

    document.getElementById('productForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('productName').value;
        const date = document.getElementById('expirationDate').value;
        addProduct(name, date);
        document.getElementById('productForm').reset(); // Reset form fields after submission
    });
});

function notifyUser(message) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            const options = {
                body: 'Check your fridge! ' + message,
                icon: '/icons/frigo-64.png',
                badge: '/icons/frigo-64.png',
                vibrate: [200, 100, 200],
                tag: 'expiry-notification'  // Tag to stack notifications or replace old ones with the same tag
            };
            registration.showNotification('Food Expiry Alert', options);
        });
    }
}
