const BASE_URL = 'https://join-537dc-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * Loads data from the specified path using a GET request.
 * @param {string} path - The path to load data from.
 * @returns {Promise<Object>} A promise that resolves to the loaded data.
 */
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return await response.json();
}


/**
 * Posts data to the specified path using a POST request.
 * @param {string} path - The path to post data to.
 * @param {Object} data - The data to post.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 */
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


/**
 * Updates data at the specified path using a PUT request.
 * @param {string} path - The path to update data at.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 */
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


/**
 * Deletes data at the specified path using a DELETE request.
 * @param {string} path - The path to delete data from.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 */
async function deleteData(path = "") {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE"
    });
    return await response.json();
}