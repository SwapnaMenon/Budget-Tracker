let db;
const request = indexedDB.open('budget', 1);
request.onupgradeneeded = function (event) {
   
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};


request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log("Oops!" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetStore = transaction.objectStore('new_transaction');
    budgetStore.add(record);
}
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetStore = transaction.objectStore('new_transaction');
    const getAll = budgetStore.getAll();
getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_transaction'], 'readwrite');
          // access the new_transaction object store
          const budgetStore = transaction.objectStore('new_transaction');
          // clear all items in your store
          budgetStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}
// listen for app coming back online
window.addEventListener('online', uploadTransaction);