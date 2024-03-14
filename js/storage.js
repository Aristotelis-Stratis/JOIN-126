const STORAGE_TOKEN = 'H2YEPL3CRQ3H8CVECOHS7P5ERQPV02FEGTI9XIH6';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

async function setItem(key, value) {
    const payload = { key: key, value: value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json());
}


async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return await fetch(url)
      .then((response) => response.json())
      .then((response) => response.data.value);
  }

