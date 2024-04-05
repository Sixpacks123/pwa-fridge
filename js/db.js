let db;
const request = indexedDB.open('productsDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('products')) {
        let store = db.createObjectStore('products', { keyPath: 'id', autoIncrement:true });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('expirationDate', 'expirationDate', { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('DB opened successfully');
    displayProducts();
};

request.onerror = function(event) {
    console.error('Error opening DB', event);
};

function addProduct(name, date) {
    let transaction = db.transaction(['products'], 'readwrite');
    let store = transaction.objectStore('products');
    let item = { name, expirationDate: date };
    store.add(item);

    transaction.oncomplete = () => {
        console.log('Product added');
        displayProducts();
    };
}

function displayProducts() {
    const now = new Date();
    let objectStore = db.transaction('products').objectStore('products');
    document.getElementById('productList').innerHTML = '';  
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            const { name, expirationDate } = cursor.value;
            const expDate = new Date(expirationDate);
            const listItem = document.createElement('li');
            listItem.textContent = `Product: ${name}, Expiration Date: ${expirationDate}`;
            document.getElementById('productList').appendChild(listItem);

            const timeDiff = expDate.getTime() - now.getTime();
            const daysToExpire = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysToExpire < 0) {
                notifyUser(`${name} has expired!`);
            } else if (daysToExpire <= 3) {
                notifyUser(`${name} will expire in ${daysToExpire} day(s)!`);
            }

            cursor.continue();
        } else {
            console.log('No more products to display.');
        }
    };
}

