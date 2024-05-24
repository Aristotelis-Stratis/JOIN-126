/**
 * Initializes the application by setting up event listeners, validating animations, ensuring the guest user exists,
 * and loading remembered user data.
 */
async function init() {
    console.log('Initialization complete');
    const inputs = document.querySelectorAll('input');
    startEventlistener(inputs);
    animationValidation();
    eventListenerKeyup(inputs);
    ensureGuestUserExists();
    loadRememberData();
}


/**
 * Adds 'invalid' event listeners to input elements to handle validation errors.
 * @param {NodeList} inputs - List of input elements to attach event listeners to.
 */
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


/**
 * Adds 'keyup' event listeners to input elements to check the state of a button if a specific checkbox is present.
 * @param {NodeList} inputs - List of input elements to attach event listeners to.
 * @returns {boolean} - Returns false if the checkbox is not found.
 */
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


/**
 * Enables or disables the register button based on input validation.
 */
function checkButton() {
    if (enableButtonRequirement()) {
        document.getElementById('register').disabled = false;
    } else {
        document.getElementById('register').disabled = true;
    }
}


/**
 * Checks if all requirements to enable the button are met.
 * @returns {boolean} - True if all requirements are met, otherwise false.
 */
function enableButtonRequirement() {
    let requirement = getById('checkbox').checked && getValue('name') !== '' && getValue('email') !== '' && getValue('password') !== '' && getValue('confirmPassword') !== '';
    return requirement;
}


/**
 * Gets the value of an input element by its ID.
 * @param {string} id - The ID of the input element.
 * @returns {string} - The value of the input element.
 */
function getValue(id) {
    let element = document.getElementById(id).value;
    return element;
}


/**
 * Gets an element by its ID.
 * @param {string} id - The ID of the element.
 * @returns {HTMLElement} - The DOM element with the specified ID.
 */
function getById(id) {
    let element = document.getElementById(id);
    return element;
}


/**
 * Initializes the registry process for a new user. Checks if the user already exists,
 * creates a new user if not, and redirects to the login page after a short animation.
 */
async function initRegistry() {
    let username = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let cleanedEmail = email.replace(/[^\w\s]/gi, '');
    let userExists = await loadData(`users/${btoa(email)}`);

    if (!userExists) {
        const initials = getInitials(username);

        let newUser = {
            name: username,
            email: email,
            password: password,
            contacts: [{
                id: generateUniqueId(),
                color: randomColor(),
                name: username,
                email: email,
                number: "",
                initials: initials
            }],
            board: {
                todo: [
                    {
                        id: generateUniqueId(),
                        title: "TestTask",
                        description: "TestDescription",
                        dueDate: "2012-12-12",
                        priority: "urgent",
                        contacts: [],
                        subtasks: [
                            { text: "TestSubtask", completed: false }
                        ],
                        status: "todo",
                        category: "User Story"
                    }
                ],
                inProgress: [],
                awaitFeedback: [],
                done: []
            },
            summary: {}
        };

        await postData(`users/${cleanedEmail}`, newUser);
        startSlideInUpAnim();
        window.setTimeout(() => { window.location.href = "login.html"; }, 2500);
    } else {
        console.log('Die Emailadresse existiert bereits!');
    }
}


async function login() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let cleanedEmail = email.replace(/[^\w\s]/gi, '');

    let usersData = await loadData(`users/${cleanedEmail}`);
    console.log("Geladene Benutzerdaten:", usersData);

    if (usersData) {
        let userKey = Object.keys(usersData)[0];
        let user = usersData[userKey];

        if (user && user.password === password) {
            rememberCheck();
            console.log('Login erfolgreich!');
            await setCurrentUser(user, userKey, cleanedEmail);
            setTimeout(() => {
                window.location.href = 'summary.html';
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
        let guestEmail = "guest@example.com";
        let cleanedEmail = guestEmail.replace(/[^\w\s]/gi, '');
        let guestUserId = "guest";

        let guestUser = await loadData(`users/${cleanedEmail}/${guestUserId}`);
        if (guestUser) {
            console.log('Logged in as guest:', guestUser);
            localStorage.setItem('currentUserId', guestUserId);
            localStorage.setItem('cleanedEmail', cleanedEmail);

            await setCurrentUser(guestUser, guestUserId, cleanedEmail);
            setTimeout(() => {
                window.location.href = 'contacts.html';
            }, 5000);
        } else {
            console.log('Guest user not found. Please check the database setup.');
        }
    } catch (error) {
        console.error('Error logging in as guest:', error);
    }
}



async function ensureGuestUserExists() {
    let guestEmail = "guest@example.com";
    let cleanedEmail = guestEmail.replace(/[^\w\s]/gi, '');
    let guestUserId = "guest";

    let path = `users/${cleanedEmail}/${guestUserId}`;
    let guestUser = await loadData(path);

    if (!guestUser || !guestUser.contacts) {
        let newUser = {
            name: "Guest",
            email: guestEmail,
            password: "",
            contacts: [{
                id: generateUniqueId(),
                color: randomColor(),
                name: "Max Mustermann",
                email: "max@mustermann.com",
                number: "1234567890",
                initials: "MM"
            }],
            board: {
                todo: [
                    {
                        id: generateUniqueId(),
                        title: "TestTask",
                        description: "TestDescription",
                        dueDate: "2012-12-12",
                        priority: "urgent",
                        contacts: [],
                        subtasks: [
                            { text: "TestSubtask", completed: false }
                        ],
                        status: "todo",
                        category: "User Story"
                    }
                ],
                inProgress: [],
                awaitFeedback: [],
                done: []
            },
            summary: {}
        };
        let response = await updateData(path, newUser);
        console.log('Attempt to create/update guest user:', response);
    } else {
        console.log('Guest user already exists and is fully initialized:', guestUser);
    }
}


/**
 * Sets the current user in the local storage.
 *
 * @param {object} user - The user object.
 * @param {string} userId - The user ID.
 * @param {string} cleanedEmail - The cleaned email of the user.
 */
async function setCurrentUser(user, userId, cleanedEmail) {
    localStorage.setItem('currentUserId', userId);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('cleanedEmail', cleanedEmail); // Speichere den cleanedEmail im localStorage
    console.log('Current user set successfully:', user);
}


/**
 * Changes the icon based on the input field's value and type.
 * @param {string} inputField - The ID of the input field.
 * @param {string} inputIcon - The ID of the icon element.
 */
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


/**
 * Toggles the visibility of the password in the input field.
 * @param {string} inputField - The ID of the input field.
 * @param {string} inputIcon - The ID of the icon element.
 */
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


/**
 * Validates the input field and displays an error message if the input is empty.
 * @param {string} inputId - The ID of the input field.
 * @param {string} messageFieldId - The ID of the field where the error message will be displayed.
 * @param {string} errorMessage - The error message to be displayed if the input is not empty.
 */
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


/**
 * Checks if the password and confirm password fields match and displays an error message if they don't.
 */
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


/**
 * Hides the error message and removes the error styling from the input field.
 * @param {string} messageFieldId - The ID of the field where the error message is displayed.
 * @param {string} inputId - The ID of the input field.
 */
function hideError(messageFieldId, inputId) {
    document.getElementById(messageFieldId).textContent = '';
    document.getElementById(inputId).parentNode.classList.remove('error-div');
}


/**
 * Checks the state of the privacy policy checkbox and updates the button state accordingly.
 */
function privacyPolicyCheck() {
    let checkbox = document.getElementById('checkbox');
    checkCheckbox(checkbox);
    checkButton();
}


/**
 * Toggles the checkbox state.
 * @param {HTMLInputElement} checkbox - The checkbox element.
 */
function checkCheckbox(checkbox) {
    if (!checkbox.checked) {
        checkbox.checked = true;
    } else if (checkbox.checked) {
        checkbox.checked = false;
    }
}


/**
 * Validates if the overlay exists and removes it. Returns false if the overlay doesn't exist.
 * @returns {boolean} - Returns false if the overlay doesn't exist.
 */
function animationValidation() {
    if (document.getElementById('overlay')) {
        removeOverlay();
    } else {
        return false;
    }
}


/**
 * Removes the overlay element after a delay and displays the main logo.
 */
function removeOverlay() {
    let overlay = document.getElementById('overlay');
    let logo = document.getElementById('main-logo');

    setTimeout(() => {
        overlay.classList.add('d-none');
        logo.classList.remove('d-none');
    }, 2000);
}


/**
 * Loads remembered user data (email and password) from localStorage and sets the input fields.
 * If the data is found, it updates the input fields and toggles the password icon.
 */
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


/**
 * Checks the state of the "remember me" checkbox and either saves or deletes the user data accordingly.
 */
function rememberCheck() {
    let checkbox = getById('rememberCheckbox');

    if (checkbox.checked) {
        saveUserData();
    } else if (!checkbox.checked) {
        deleteUserData();
    }
}


/**
 * Deletes the stored user data (email and password) from localStorage.
 */
function deleteUserData() {
    localStorage.setItem('email', '');
    localStorage.setItem('password', '');
}


/**
 * Saves the current user data (email and password) to localStorage.
 */
function saveUserData() {
    localStorage.setItem('email', `"${getValue('email')}"`);
    localStorage.setItem('password', `"${getValue('password')}"`);
}


/**
 * Starts the slide-in-up animation by removing the 'd-none' class from the registration overlay.
 */
function startSlideInUpAnim() {
    getById('reg-overlay').classList.remove('d-none');
}