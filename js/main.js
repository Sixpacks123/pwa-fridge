document.addEventListener('DOMContentLoaded', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker Registered', registration);
        }).catch(function(err) {
            console.log('Service Worker Failed to Register', err);
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
