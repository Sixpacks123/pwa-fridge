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
    let objectStore = db.transaction('products').objectStore('products');
    document.getElementById('productList').innerHTML = ''; 
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            const { name, expirationDate } = cursor.value;
            const listItem = document.createElement('li');
            listItem.innerHTML = `Product: ${name}, Expiration Date: ${expirationDate}`;
            document.getElementById('productList').appendChild(listItem);
            cursor.continue();
        }
    };
}
