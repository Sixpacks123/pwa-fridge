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

    // Clear existing content
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    // Create table and header row
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ["Product Name", "Expiration Date", "Status"];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    // Add table to the DOM
    productList.appendChild(table);

    // Process each product
    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            const { name, expirationDate } = cursor.value;
            displayProductItem(table, name, expirationDate, now);
            cursor.continue();
        }
    };
}

function displayProductItem(table, name, expirationDate, now) {
    const expDate = new Date(expirationDate);
    const row = document.createElement('tr');
    const daysToExpire = (expDate - now) / (1000 * 3600 * 24);
    let status = "Valid";

    // Create cells for name, expiration date, and status
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    const dateCell = document.createElement('td');
    dateCell.textContent = expirationDate;

    const statusCell = document.createElement('td');
    if (daysToExpire < 0) {
        statusCell.textContent = "Expired";
        statusCell.style.color = 'red';
    } else if (daysToExpire <= 3) {
        statusCell.textContent = "Expiring Soon";
        statusCell.style.color = 'orange';
    } else {
        statusCell.textContent = "Valid";
    }

    // Append cells to the row
    row.appendChild(nameCell);
    row.appendChild(dateCell);
    row.appendChild(statusCell);

    // Append row to the table
    table.appendChild(row);
}

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
