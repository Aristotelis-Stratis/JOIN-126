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
    animationValidation();
}


function startEventlistener(inputs) {
    inputs.forEach((input) => {
        input.addEventListener('invalid', (evt) => {
            let inputId = evt.target.attributes.id.value;
            let messageFieldId = inputId + 'ErrorField';
            let errorMessage = evt.target.attributes.data.value;
            evt.preventDefault();
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
        id: generateUniqueId(),
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
    await loadAllUserFromStorage();
    return allUsers.find(user => user.email === email);
}


async function saveUserToStorage(user) {
    try {
        await loadAllUserFromStorage();
        allUsers.push(user);
        await setItem('allUsers', JSON.stringify(allUsers));
    } catch (error) {
        console.error('Failed to save users:', error);
    }
}


// Logik für reguläres Login
async function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    const inputs = document.querySelectorAll('input');

    let user = await getUserByEmail(email);
    if (user && user.password === password) {
        console.log('Login erfolgreich!');
        setCurrentUser(user);
        window.location.href = 'summary.html';
    } else {
        inputValidation('email', 'emailErrorField', ' ');
        inputValidation('password', 'passwordErrorField', 'Invalid email or password.');
        console.log('Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten und versuche es erneut.');
    }
}

// Funktion für den Gästelogin
function loginAsGuest() {
    setCurrentUser(allUsers[0]);
    console.log('Logged in as guest:', currentUser);
    window.location.href = 'contacts.html';
}


async function setCurrentUser(user) {
    currentUser = user;
    await setItem('currentUser', JSON.stringify(currentUser));
    console.log('Current user set successfully:', currentUser);
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
    } else {
        document.getElementById(messageFieldId).innerHTML = errorMessage;
        input.parentNode.classList.add('error-div');
    }
}


function checkPassword() {
    let passwordInput = document.getElementById('password').value;
    let confirmInput = document.getElementById('confirmPassword').value;

    if (passwordInput != confirmInput || passwordInput === '') {
        inputValidation('confirmPassword', 'confirmPasswordErrorField', "Ups! Your password don't match.");
    } else {
        document.getElementById('confirmPasswordErrorField').innerHTML = '';
        document.getElementById('confirmPassword').parentNode.classList.remove('error-div');
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

function animationValidation() {   
    if(document.getElementById('overlay')){
        removeOverlay();
    } else {
        return false;
    }
}

function removeOverlay() {
    let overlay = document.getElementById('overlay');
    let logo = document.getElementById('main-logo');

    setTimeout(() => {
        overlay.classList.add('d-none');
        logo.classList.remove('d-none');
    }, 2000);
}