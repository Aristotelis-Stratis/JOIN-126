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


async function saveCurrentUser() {
    if (currentUser) {
        const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            allUsers[userIndex] = currentUser;
        } else {
            allUsers.push(currentUser);  // Handle cases where currentUser is not found (unusual case)
        }
        await setItem('allUsers', JSON.stringify(allUsers)); // Save the complete set of user data
        console.log("User data saved successfully.");
    } else {
        console.error("No current user to save.");
    }
}


async function loadCurrentUser() {
    try {
        const userString = await getItem('currentUser');
        if (userString) {
            currentUser = JSON.parse(userString);
            console.log("Aktueller Benutzer geladen:", currentUser);
            if (!currentUser.data) {
                currentUser.data = { contacts: [], tasks: [], board: {}, summary: {} };
                console.log("Keine Daten gefunden, Initialisierung leerer Datenstrukturen.");
            }
        } else {
            console.log("Keine aktuellen Benutzerdaten gefunden.");
            currentUser = null;
        }
    } catch (error) {
        console.error("Fehler beim Laden des aktuellen Benutzers:", error);
        currentUser = null;
    }
}


async function setCurrentUser(user) {
    try {
        currentUser = allUsers.find(u => u.id === user.id) || user; // Ensure full data load
        await setItem('currentUser', JSON.stringify(currentUser));
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
        console.log("Preparing to log out current user. Current allUsers state:", JSON.stringify(allUsers));

        // Only attempt to save to storage if the array is not empty
        if (allUsers.length > 0) {
            await setItem('allUsers', JSON.stringify(allUsers));
        } else {
            console.error("Attempting to save an empty allUsers array.");
        }
        console.log("Logging out current user.");

        // Instead of setting to null, use an empty string or placeholder object
        await setItem('currentUser', JSON.stringify("")); // Use empty string

        console.log('User has been logged out.');

        // Set a delay before redirecting to the login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 10000); // Delay of 10000 milliseconds (10 seconds)

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


async function saveToStorage() {
    await setItem('allUsers', JSON.stringify(allUsers));
}


async function loadAllUserFromStorage() {
    try {
        const response = await getItem('allUsers');
        if (response && response.length > 0) {
            allUsers = JSON.parse(response);
        } else {
            console.log('No users found in storage, using default array.');
            allUsers = [guestUser];  // Reset to default with guest user
        }
    } catch (error) {
        console.error('Failed to load users from storage:', error);
        allUsers = [guestUser]; // Fallback to default on error
    }
}


function deleteStorage() {
    allUsers = [];
    setItem('allUsers', JSON.stringify(allUsers));
}


// function rebuildStorage() {
//     allUsers = [{
//         'users': [
//             {
//                 'name': 'Sofia Müller',
//                 'email': 'sofiam@gmail.com',
//                 'password': 'mypassword123',
//                 'data': []
//             },
//             {
//                 'name': 'Iv',
//                 'email': 'a@a',
//                 'password': '111QQQwwweee',
//                 'data': []
//             }
//         ]
//     },
//     { 'guest': [] },
//     { 'currentUser': [] }
//     ];
//     setItem('allUsers', JSON.stringify(allUsers));
// }


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