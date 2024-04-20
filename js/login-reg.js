let allUsers = [];
const guestUser = {
    id: 'guest',
    name: 'Guest User',
    email: 'guest@example.com',
    password: '',
    data: {
        contacts: [],
        tasks: [],
        board: {},
        summary: {}
    }
};

// Datenstruktur der Benutzerdaten
// {
//     'id': 'unique-user-id',  // Eindeutige ID für den Benutzer
//     'name': 'Sofia Müller',
//     'email': 'sofiam@gmail.com',
//     'password': 'hashedPassword',  // Das Passwort sollte gehasht gespeichert werden
//     'contacts': [],  // Liste der Kontakte dieses Benutzers
//     'tasks': [],  // Liste der Tasks dieses Benutzers
//     'summary': {},  // Summary-Daten für den Benutzer
//     'board': {}  // Daten für das Board
// }

let currentUser;


// Initialisierungsfunktion, die den Gastbenutzer sicherstellt
async function initializeUsers() {
    await loadAllUserFromStorage();
    if (allUsers.length === 0 || !allUsers.some(user => user.id === 'guest')) {
        allUsers.unshift(guestUser); // Fügt den Gastbenutzer am Anfang des Arrays hinzu
        await setItem('allUsers', JSON.stringify(allUsers)); // Speichert das aktualisierte Array
    }
}

async function init() {
    await initializeUsers(); // Stelle sicher, dass Gastbenutzer vorhanden ist
    console.log('allUsers: ', allUsers);
    const inputs = document.querySelectorAll('input');
    startEventlistener(inputs);
}

function startEventlistener(inputs) {
    inputs.forEach((input) => {
        input.addEventListener('invalid', (evt) => {
            let inputId = evt.target.attributes.id.value;
            let messageFieldId = inputId + 'ErrorField';
            let errorMessage = evt.target.attributes.data.value;
            inputValidation(inputId, messageFieldId, errorMessage);
        });
    });
}


async function initRegistry() {
    let username = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let userExists = await getUserByEmail(email);

    if (!userExists) {
        let newUser = createUser(username, email, password);
        await saveUserToStorage(newUser);
        console.log('Du hast dich erfolgreich registriert!');
        window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
    } else {
        console.log('Die Emailadresse existiert bereits!');
    }
}

function createUser(username, email, password) {
    return {
        id: generateUniqueId(),  // Generiere eine eindeutige Benutzer-ID
        name: username,
        email: email,
        password: password,  // Das Passwort sollte sicher gespeichert werden (Hash)
        data: {
            contacts: [],
            tasks: [],
            board: {},
            summary: {}
        }
    };
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getUserByEmail(email) {
    await loadAllUserFromStorage();  // Stelle sicher, dass die neuesten Benutzer geladen sind
    return allUsers.find(user => user.email === email);
}

async function saveUserToStorage(user) {
    try {
        await loadAllUserFromStorage();  // Stelle sicher, dass die neuesten Benutzer geladen sind
        allUsers.push(user);  // Füge den neuen Benutzer hinzu
        await setItem('allUsers', JSON.stringify(allUsers));
    } catch (error) {
        console.error('Failed to save users:', error);
    }
}



async function initLogin() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;  // Sollte mit einem Hash verglichen werden

    let user = await getUserByEmail(email);
    if (user && user.password === password) {  // Stelle sicher, dass die Passwortprüfung sicher ist
        console.log('Login erfolgreich!');
        setCurrentUser(user);  // Setze den aktuellen Benutzer lokal oder in einer Session
        window.location.href = 'summary.html';
    } else {
        console.log('Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten und versuche es erneut.');
    }
}


async function setCurrentUser(user) {
    try {
        // Speichere nur die notwendigen Daten des Benutzers für die Sitzung
        const minimalUserData = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        await setItem('currentUser', JSON.stringify(minimalUserData));
        console.log('Current user set successfully.');
    } catch (error) {
        console.error('Failed to set current user:', error);
    }
}

async function getCurrentUser() {
    try {
        const userString = await getItem('currentUser');
        if (userString) {
            const user = JSON.parse(userString);
            console.log('Current user retrieved:', user);
            return user;
        } else {
            console.log('No current user found.');
            return null;
        }
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
}


async function logoutCurrentUser() {
    try {
        await setItem('currentUser', null);  // Lösche den aktuellen Benutzer aus dem Remote Storage
        console.log('User has been logged out.');
        window.location.href = 'login.html';  // Optional: Leite den Benutzer zur Login-Seite um
    } catch (error) {
        console.error('Failed to logout current user:', error);
    }
}







function loginAsGuest() {
    const guestUser = allUsers.find(user => user.id === 'guest');
    if (guestUser) {
        setCurrentUser(guestUser);
        console.log('Das ist der aktuelle User: ', guestUser);
        window.location.href = '/summary.html'; // Weiterleitung zur Summary-Seite
    } else {
        console.error('Gastbenutzer nicht gefunden.');
    }
}


function resetCurrentUser() {
    allUsers[2]['currentUser'] = [];
    setItem('allUsers', JSON.stringify(allUsers));
}


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


async function saveToStorage() {
    await setItem('allUsers', JSON.stringify(allUsers));
}


async function loadAllUserFromStorage() {
    try {
        const usersString = await getItem('allUsers');
        if (usersString) {
            allUsers = JSON.parse(usersString);
            if (!Array.isArray(allUsers)) {  // Prüfe, ob allUsers tatsächlich ein Array ist
                allUsers = [];
            }
        } else {
            console.log('No Users found, initializing an empty array.');
            allUsers = [];  // Initialisiere als leeres Array, falls nichts gefunden wurde
        }
    } catch (e) {
        console.warn('Failed to load users:', e);
        allUsers = []; // Im Fehlerfall als leeres Array initialisieren
    }
}


function deleteStorage() {
    allUsers = [];
    setItem('allUsers', JSON.stringify(allUsers));
}


function rebuildStorage() {
    allUsers = [{
        'users': [
            {
                'name': 'Sofia Müller',
                'email': 'sofiam@gmail.com',
                'password': 'mypassword123',
                'data': []
            },
            {
                'name': 'Iv',
                'email': 'a@a',
                'password': '111QQQwwweee',
                'data': []
            }
        ]
    },
    { 'guest': [] },
    { 'currentUser': [] }
    ];
    setItem('allUsers', JSON.stringify(allUsers));
}


function changeIcon(inputField, inputIcon) {
    let input = document.getElementById(inputField);
    let icon = document.getElementById(inputIcon);

    if (input.value == '' && input.type === 'password') {
        icon.classList.add('disabled');
        icon.classList.toggle('password-v-off-img');
    } else if (input.value != 0 && input.type === 'password') {
        icon.classList.remove('disabled');
        icon.classList.toggle('password-def-img');
    } else if (input.value == '' && input.type === 'text') {
        icon.disabled = true;
        input.setAttribute('type', 'password');
        icon.classList.remove('password-def-imgt');
        icon.classList.remove('password-v-off-img');
        icon.classList.remove('password-v-on-img');
        icon.classList.add('password-def-img');
        icon.classList.add('disabled');
    }
}


function showPassword(inputField, inputIcon) {
    let input = document.getElementById(inputField);
    let icon = document.getElementById(inputIcon);

    if (input.type === 'password') {
        input.setAttribute('type', 'text');
        icon.classList.add('password-v-on-img');
    } else if (input.type === 'text') {
        input.setAttribute('type', 'password');
        icon.classList.toggle('password-v-on-img');
    }
}


function inputValidation(inputId, messageFieldId, errorMessage) {
    let input = document.getElementById(inputId);

    if (input.value === '') {
        document.getElementById(messageFieldId).innerHTML = 'This Field is required!';
        input.parentNode.classList.add('error-div');
        event.preventDefault();
    } else {
        document.getElementById(messageFieldId).innerHTML = errorMessage;
        input.parentNode.classList.add('error-div');
        event.preventDefault();
    }
}


function checkPassword() {
    let passwordInput = document.getElementById('password').value;
    let confirmInput = document.getElementById('confirmPassword').value;

    if (passwordInput != confirmInput || passwordInput === '') {
        inputValidation('confirmPassword', 'confirmPasswordErrorField', "Ups! Your password don't match.");
    } else {
        document.getElementById('confirmPasswordErrorField').innerHTML = '';
    }
}


function hideError(messageFieldId, inputId) {
    document.getElementById(messageFieldId).textContent = '';
    document.getElementById(inputId).parentNode.classList.remove('error-div');
}


function privacyPolicyCheck() {
    let checkbox = document.getElementById('checkbox');
    let button = document.getElementById('register');

    if (!checkbox.checked) {
        checkbox.checked = true;
        button.disabled = false;
    } else if (checkbox.checked) {
        checkbox.checked = false;
        button.disabled = true;
    }
}


// Testpassword:    111QQQwwweee