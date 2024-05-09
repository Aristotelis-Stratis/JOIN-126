// const STORAGE_TOKEN = 'H2YEPL3CRQ3H8CVECOHS7P5ERQPV02FEGTI9XIH6';
// const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

// async function setItem(key, value) {
//     const payload = { key: key, value: value, token: STORAGE_TOKEN };
//     return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
//         .then(res => res.json());
// }


// async function getItem(key) {
//     const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
//     return await fetch(url)
//         .then((response) => response.json())
//         .then((response) => response.data.value);
// }

const BASE_URL = 'https://join-537dc-default-rtdb.europe-west1.firebasedatabase.app/';


//GET (Daten runterladen)
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return await response.json();
}


//POST (Daten hochladen)
async function postData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}


//PUT (Daten aktualisieren)
async function updateData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}


//DELETE (Daten löschen)
async function deleteData(path = "") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE"
    });
    return await response.json();
}