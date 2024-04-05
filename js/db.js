let db;
const request = indexedDB.open('productsDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id', autoIncrement:true })
          .createIndex('expirationDate', 'expirationDate', { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('DB opened successfully');
    displayProducts();
};

function addProductToDB(name, date) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(['products'], 'readwrite');
        let store = transaction.objectStore('products');
        store.add({ name, expirationDate: date }).onsuccess = () => {
            console.log('Product added to database');
            displayProducts();
            resolve();
        };
    });
}

function displayProducts() {
    let now = new Date();
    let objectStore = db.transaction('products').objectStore('products');
    document.getElementById('productList').innerHTML = '';
    
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            const { name, expirationDate } = cursor.value;
            displayProductItem(name, expirationDate, now);
            cursor.continue();
        }
    };
}

function displayProductItem(name, expirationDate, now) {
    const expDate = new Date(expirationDate);
    const listItem = document.createElement('li');
    listItem.textContent = `Product: ${name}, Expiration Date: ${expirationDate}`;
    document.getElementById('productList').appendChild(listItem);

    const daysToExpire = (expDate - now) / (1000 * 3600 * 24);
    if (daysToExpire < 0) {
        notifyUser(`${name} has expired!`);
    } else if (daysToExpire <= 3) {
        notifyUser(`${name} will expire soon!`);
    }
}
