const STORAGE_TOKEN = 'H2YEPL3CRQ3H8CVECOHS7P5ERQPV02FEGTI9XIH6';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';


let allUsers = [
    {
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


let currentUser; 


async function init() {
    await loadAllUserFromStorage();
    console.log('allUsers: ', allUsers);
    const inputs = document.querySelectorAll('input');
    startEventlistener(inputs);
}

function startEventlistener(inputs) {
    inputs.forEach((input) => {
        input.addEventListener('invalid', (evt) => {
            let inputId = evt.target.attributes.id.value;
            let messageFieldId =  evt.target.attributes.id.value + 'ErrorField';
            let errorMessage = evt.target.attributes.data.value;
            console.log(inputId);
            console.log(messageFieldId);
            console.log(errorMessage);
            inputValidation(inputId, messageFieldId, errorMessage);
        });
    });
}


function initRegistry() {
    checkPassword();
    let username = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let user = allUsers[0]['users'].find(u => u.email == email);

    if (!user) {
        allUsers[0]['users'].push(
            {
                name: username,
                email: email,
                password: password,
                data: []
            }
        );
        saveToStorage();
        console.log('Du hast dich erfolgreich registriert!');
        window.setTimeout('window.location = "login.html"',5000);
    } else if (user) {
        inputValidation('email', 'emailErrorField', 'Provide a valid email address.');
        console.log('Die Emailadresse existiert bereits!');
    }

    let button = document.getElementById('register');
    // document.getElementById('myForm').reset();
    button.disabled = true;
    console.log(allUsers);
}


function initLogin() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let user = allUsers[0]['users'].find(u => u.email == email && u.password == password);

    if (user) {
        allUsers[2]['currentUser'].push(user);
        setItem('allUsers', JSON.stringify(allUsers));
        // window.location = 'summary.html'; // Weiterleitung zu Summary!
        console.log('Du wurdest eingeloggt');
        console.log('Das ist  der aktuelle User: ', allUsers[2]['currentUser']);
    } else if (!user) {
        inputValidation('password', 'passwordErrorField', 'Wrong password Ups! Try again.');
        console.log('E-mail oder Password passen nicht!');
    } else {
        console.log('Etwas ist schiefgelaufen!!!');
    }
}


function loginAsGuest() {
    allUsers[2]['currentUser'].push(allUsers[1]);
    console.log('Das ist  der aktuelle User: ', allUsers);
    window.location = '/summary.html'; // Weiterleitung zu Summary!
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
            const users = JSON.parse(usersString);
            allUsers = users;
        } else {
            console.log('No Users found.');
        }
    } catch (e) {
        console.warn('No Users found:', e);
    }
}


function deleteStorage() {
    allUsers = [];
    setItem('allUsers', JSON.stringify(allUsers));
}


function rebuildStorage() {
    allUsers = [    {
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