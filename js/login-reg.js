async function init() {
    console.log('Initialization complete');
    const inputs = document.querySelectorAll('input');
    startEventlistener(inputs);
    animationValidation();
    eventListenerKeyup(inputs);
    ensureGuestUserExists();
    loadRememberData();
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

function eventListenerKeyup(inputs) {
    if (getById('checkbox')) {
        inputs.forEach((input) => {
            input.addEventListener('keyup', (evt) => {
                console.log('Event funktioniert on keyup!');
                checkButton();
            });
        });
    } else {
        return false;
    }
}

function checkButton() {
    if (enableButtonRequirement()) {
        document.getElementById('register').disabled = false;
    } else {
        document.getElementById('register').disabled = true;
    }
}

function enableButtonRequirement() {
    let requirement = getById('checkbox').checked && getValue('name') !== '' && getValue('email') !== '' && getValue('password') !== '' && getValue('confirmPassword') !== '';
    return requirement;
}

function getValue(id) {
    let element = document.getElementById(id).value;
    return element;
}

function getById(id) {
    let element = document.getElementById(id);
    return element;
}



async function initRegistry() {
    let username = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    // Entferne Sonderzeichen aus der E-Mail-Adresse
    let cleanedEmail = email.replace(/[^\w\s]/gi, ''); // Entfernt alle Sonderzeichen
    let userExists = await loadData(`users/${btoa(email)}`);

    if (!userExists) {
        // Generiere Initialen für den Benutzer
        const initials = getInitials(username);

        let newUser = {
            name: username,
            email: email,
            password: password,
            contacts: [{
                id: generateUniqueId(),  // Generiere eine eindeutige ID für den Kontakt
                color: randomColor(),
                name: username,
                email: email,
                number: "",
                initials: initials // Initialen hinzufügen
            }],
            tasks: [
                {
                    title: "TestTask",
                    description: "TestDescription",
                    dueDate: "12.12.12",
                    priority: "urgent",
                    contacts: [],  // Leeres Array für Kontakte
                    subtasks: [],  // Leeres Array für Unteraufgaben
                    status: "toDo",
                    category: "User Story"
                }
            ],
            board: {
                todo: [
                    {
                        title: "Standard Task",
                        description: "Dies ist eine Standardaufgabe.",
                        dueDate: "12.12.12",
                        priority: "normal",
                        contacts: [],
                        subtasks: [],
                        status: "toDo",
                        category: "General"
                    }
                ],
                inProgress: [],
                awaitFeedback: [],
                done: []
            },
            summary: {}
        };

        await postData(`users/${cleanedEmail}`, newUser);
        console.log('Du hast dich erfolgreich registriert!');
        startSlideInUpAnim();
        window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
    } else {
        console.log('Die Emailadresse existiert bereits!');
    }
}




async function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    // Entferne Sonderzeichen aus der E-Mail-Adresse
    let cleanedEmail = email.replace(/[^\w\s]/gi, '');

    let usersData = await loadData(`users/${cleanedEmail}`);
    console.log("Geladene Benutzerdaten:", usersData);

    if (usersData) {
        // Zugriff auf das erste Element im usersData Objekt
        let userKey = Object.keys(usersData)[0];
        let user = usersData[userKey];

        if (user && user.password === password) {
            rememberCheck();
            console.log('Login erfolgreich!');
            await setCurrentUser(user, userKey, cleanedEmail); // cleanedEmail als Argument übergeben

            // Verzögere die Weiterleitung um 5000 Millisekunden (5 Sekunden)
            setTimeout(() => {
                window.location.href = 'contacts.html';
            }, 5000);
        } else {
            inputValidation('email', 'emailErrorField', ' ');
            inputValidation('password', 'passwordErrorField', 'Invalid email or password.');
            console.log('Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten und versuche es erneut.');
        }
    } else {
        inputValidation('email', 'emailErrorField', ' ');
        console.log('Benutzer nicht gefunden. Bitte überprüfe deine Anmeldedaten und versuche es erneut.');
    }
}



async function loginAsGuest() {
    try {
        // Konvertiere die E-Mail des Gastbenutzers in eine cleanedEmail
        let guestEmail = "guest@example.com";
        let cleanedEmail = guestEmail.replace(/[^\w\s]/gi, ''); // Entfernt alle Sonderzeichen
        let guestUserId = "guest";

        // Verwende den neuen Pfad, der cleanedEmail und userId einschließt
        let guestUser = await loadData(`users/${cleanedEmail}/${guestUserId}`);
        if (guestUser) {
            console.log('Logged in as guest:', guestUser);

            // Setze die Standardwerte für den Gastbenutzer
            localStorage.setItem('currentUserId', guestUserId);
            localStorage.setItem('cleanedEmail', cleanedEmail);

            // Setze den Gastbenutzer als aktuellen Benutzer
            await setCurrentUser(guestUser, guestUserId, cleanedEmail);
            setTimeout(() => {
                window.location.href = 'contacts.html';
            }, 5000); // Kurze Verzögerung für die Demonstration
        } else {
            console.log('Guest user not found. Please check the database setup.');
        }
    } catch (error) {
        console.error('Error logging in as guest:', error);
    }
}

async function ensureGuestUserExists() {
    let guestEmail = "guest@example.com";
    let cleanedEmail = guestEmail.replace(/[^\w\s]/gi, ''); // Entfernt alle Sonderzeichen
    let guestUserId = "guest"; // Optional: Kann eine spezifische ID sein, wenn notwendig

    let path = `users/${cleanedEmail}/${guestUserId}`;
    let guestUser = await loadData(path);

    if (!guestUser || !guestUser.contacts) {
        // Definieren Sie den Gastbenutzer mit der vollständigen Struktur
        let newUser = {
            name: "Guest",
            email: guestEmail,
            password: "", // Optional: Passwort, falls benötigt
            contacts: [{
                id: generateUniqueId(),  // Generiere eine eindeutige ID für den Kontakt
                color: randomColor(),
                name: "Max Mustermann",
                email: "max@mustermann.com",
                number: "1234567890",
                initials: "MM"
            }],
            tasks: [
                {
                    title: "TestTask",
                    description: "TestDescription",
                    dueDate: "12.12.12",
                    priority: "urgent",
                    contacts: [],  // Leeres Array für Kontakte
                    subtasks: [],  // Leeres Array für Unteraufgaben
                    status: "toDo",
                    category: "User Story"
                }
            ],
            board: [{
                todo: [],
                inProgress: [],
                awaitFeedback: [],
                done: []
            }],
            summary: {}
        };
        let response = await updateData(path, newUser);
        console.log('Attempt to create/update guest user:', response);
    } else {
        console.log('Guest user already exists and is fully initialized:', guestUser);
    }
}




async function setCurrentUser(user, userId, cleanedEmail) {
    localStorage.setItem('currentUserId', userId);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('cleanedEmail', cleanedEmail); // Speichere den cleanedEmail im localStorage
    console.log('Current user set successfully:', user);
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

    checkCheckbox(checkbox);
    checkButton();
}

function checkCheckbox(checkbox) {
    if (!checkbox.checked) {
        checkbox.checked = true;
    } else if (checkbox.checked) {
        checkbox.checked = false;
    }
}

function animationValidation() {
    if (document.getElementById('overlay')) {
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


function loadRememberData() {
    try {
        let rememberEmail = JSON.parse(localStorage.getItem('email'));
        let rememberPassword = JSON.parse(localStorage.getItem('password'));

        if (rememberEmail != null && rememberPassword != null) {
            changeIcon('password', 'passwordIcon');
            getById('email').value = rememberEmail;
            getById('password').value = rememberPassword;
            getById('rememberCheckbox').checked = true;
            getById('passwordIcon').classList.add('enabled');
        }
    } catch (e) {
        return false;
    }
}

function rememberCheck() {
    let checkbox = getById('rememberCheckbox');

    if (checkbox.checked) {
        saveUserData();
    } else if (!checkbox.checked) {
        deleteUserData();
    }
}

function deleteUserData() {
    localStorage.setItem('email', '');
    localStorage.setItem('password', '');
}

function saveUserData() {
    localStorage.setItem('email', `"${getValue('email')}"`);
    localStorage.setItem('password', `"${getValue('password')}"`);
}

function startSlideInUpAnim() {
    getById('reg-overlay').classList.remove('d-none');
}



// OLD


// async function getCurrentUser() {
//     try {
//         const userString = await getItem('currentUser');
//         if (userString) {
//             const user = JSON.parse(userString);
//             console.log('Current user retrieved:', user);
//             return user;
//         } else {
//             console.log('No current user found.');
//             return null;
//         }
//     } catch (error) {
//         console.error('Failed to get current user:', error);
//         return null;
//     }
// }


// async function saveToStorage() {
//     await setItem('allUsers', JSON.stringify(allUsers));
// }


// async function loadAllUserFromStorage() {
//     try {
//         const response = await getItem('allUsers');
//         if (response && response.length > 0) {
//             allUsers = JSON.parse(response);
//         } else {
//             console.log('No users found in storage, using default array.');
//             allUsers = [guestUser];  // Reset to default with guest user
//         }
//     } catch (error) {
//         console.error('Failed to load users from storage:', error);
//         allUsers = [guestUser]; // Fallback to default on error
//     }
// }


// function deleteStorage() {
//     allUsers = [];
//     setItem('allUsers', JSON.stringify(allUsers));
// }

// async function setCurrentUser(user) {
//     currentUser = user;
//     await setItem('currentUser', JSON.stringify(currentUser));
//     console.log('Current user set successfully:', currentUser);
// }

// Funktion für den Gästelogin
// function loginAsGuest() {
//     setCurrentUser(allUsers[0]);
//     console.log('Logged in as guest:', currentUser);
//     window.location.href = 'contacts.html';
// }


// function createUser(username, email, password) {
//     return {
//         id: generateUniqueId(),
//         name: username,
//         email: email,
//         password: password,  // Das Passwort sollte sicher gespeichert werden (Hash)
//         data: {
//             contacts: [],
//             tasks: [],
//             board: {},
//             summary: {}
//         }
//     };
// }


// function generateUniqueId() {
//     return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }


// async function getUserByEmail(email) {
//     await loadAllUserFromStorage();
//     return allUsers.find(user => user.email === email);
// }


// async function saveUserToStorage(user) {
//     try {
//         await loadAllUserFromStorage();
//         allUsers.push(user);
//         await setItem('allUsers', JSON.stringify(allUsers));
//     } catch (error) {
//         console.error('Failed to save users:', error);
//     }
// }


// Logik für reguläres Login
// async function login() {
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;
//     const inputs = document.querySelectorAll('input');

//     let user = await getUserByEmail(email);
//     if (user && user.password === password) {
//         console.log('Login erfolgreich!');
//         setCurrentUser(user);
//         window.location.href = 'summary.html';
//     } else {
//         inputValidation('email', 'emailErrorField', ' ');
//         inputValidation('password', 'passwordErrorField', 'Invalid email or password.');
//         console.log('Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten und versuche es erneut.');
//     }
// }



// async function initRegistry() {
//     let username = document.getElementById('name').value;
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;
//     let userExists = await getUserByEmail(email);

//     if (!userExists) {
//         let newUser = createUser(username, email, password);
//         // Füge den Benutzer zu seinen eigenen Kontakten hinzu
//         let newContact = createContactObject(username, email, ''); // Hier kein Telefonnummer vorgegeben
//         newUser.data.contacts.push(newContact);
//         await saveUserToStorage(newUser);
//         console.log('Du hast dich erfolgreich registriert!');
//         window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
//     } else {
//         console.log('Die Emailadresse existiert bereits!');
//     }
// }


// Initialisierungsfunktion, die den Gastbenutzer sicherstellt
// async function initializeUsers() {
//     // await loadAllUserFromStorage();
//     if (allUsers.length === 0 || !allUsers.some(user => user.id === 'guest')) {
//         allUsers.unshift(guestUser); // Fügt den Gastbenutzer am Anfang des Arrays hinzu
//         // await setItem('allUsers', JSON.stringify(allUsers)); // Speichert das aktualisierte Array
//     }
// }


// async function init() {
//     //await initializeUsers(); // Stelle sicher, dass Gastbenutzer vorhanden ist
//     console.log('allUsers: ', allUsers);
//     const inputs = document.querySelectorAll('input');
//     startEventlistener(inputs);
//     animationValidation();
//     eventListenerKeyup(inputs);
// }










// BACKUP VON DER REGISTRIERUNGSFUNKTION BEVOR ALLES KAPUTT GEHT, LETZTE CHANCE BEVOR WIR DURCHDREHEN


// async function initRegistry() {
//     let username = document.getElementById('name').value;
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;
//     // Entferne Sonderzeichen aus der E-Mail-Adresse
//     let cleanedEmail = email.replace(/[^\w\s]/gi, ''); // Entfernt alle Sonderzeichen
//     let userExists = await loadData(`users/${btoa(email)}`);

//     if (!userExists) {
//         // Generiere Initialen für den Benutzer
//         const initials = getInitials(username);

//         let newUser = {
//             name: username,
//             email: email,
//             password: password,
//             contacts: [{
//                 name: username,
//                 email: email,
//                 number: "",
//                 initials: initials // Initialen hinzufügen
//             }],
//             tasks: [],
//             board: [{
//                 todo: "",
//                 inProgress: "",
//                 awaitFeedback: "",
//                 done:""
//             }],
//             summary: {}
//         };

//         await postData(`users/${cleanedEmail}`, newUser);
//         console.log('Du hast dich erfolgreich registriert!');
//         startSlideInUpAnim();
//         window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
//     } else {
//         console.log('Die Emailadresse existiert bereits!');
//     }
// }