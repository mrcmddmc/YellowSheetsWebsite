const dbName = "stuDatabase";
const rw = "readwrite";
let db;

const request = indexedDB.open(dbName, 1);

request.onerror = (event) => { // Handle errors.
    console.error(event);
};

request.onupgradeneeded = (event) => {
  db = event.target.result;

  // Create an objectStore to hold information about our customers. We're
  // going to use "ssn" as our key path because it's guaranteed to be
  // unique - or at least that's what I was told during the kickoff meeting.
  const objectStore = db.createObjectStore("students", { keyPath: "ID" });
  objectStore.createIndex("firstName", "firstName", { unique: false });
  objectStore.createIndex("lastName", "lastName", { unique: false });

  // Use transaction oncomplete to make sure the objectStore creation is
  // finished before adding data into it.
//   objectStore.transaction.oncomplete = (event) => {
//     // Store values in the newly created objectStore.
//     const customerObjectStore = db
//       .transaction("customers", "readwrite")
//       .objectStore("customers");
//     customerData.forEach((customer) => {
//       customerObjectStore.add(customer);
//     });
//   };
};



function saveToDB(stuList) {
    const stuObjStore = db
        .transaction("students", "readwrite")
        .objectStore("students");

    stuList.forEach((currStu) => {
        stuObjStore.put(currStu);
    });
};

function loadFromDB() {
    let ret;
    const stuObjStore = db
        .transaction("students")
        .objectStore("students");

    stuObjStore.getAll().onsuccess = (event) => {
        ret = event.target.result;
    }
    return ret;
}


