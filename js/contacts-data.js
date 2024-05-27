let i;
let currentEditingId = null;

/**
 * Initializes the contacts by including HTML, loading the current user's data, and loading all contacts.
 * @returns {Promise<void>}
 */
async function initContacts() {
    await includeHTML();
    await loadCurrentUser();
    await loadAllContacts();
}

/**
 * Creates a new contact and adds it to the current user's contacts.
 * @async
 * @function createContact
 */
async function createContact() {
    let nameInput = document.getElementById('inputName');
    let emailInput = document.getElementById('inputEmail');
    let numberInput = document.getElementById('inputNumber');

    if (areInputsValid([nameInput, emailInput, numberInput])) {
        let contact = createContactObject(nameInput.value, emailInput.value, numberInput.value);
        if (currentUser && currentUser.data) {
            currentUser.data.contacts.push(contact);
            const newContactIndex = currentUser.data.contacts.length - 1;
            const cleanedEmail = localStorage.getItem('cleanedEmail');
            const userId = localStorage.getItem('currentUserId');
            const basePath = `users/${cleanedEmail}/${userId}`;
            const contactPath = `${basePath}/contacts/${newContactIndex}`;
            await updateData(contactPath, contact);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            renderContacts();
            showCreationConfirmation();
        }
    }
}


/**
 * Creates a contact object with a unique ID, name, email, number, initials, and color.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} number - The phone number of the contact.
 * @returns {Object} The contact object.
 */
function createContactObject(name, email, number) {
    return {
        id: generateUniqueId(),
        name,
        email,
        number,
        initials: getInitials(name),
        color: randomColor()
    };
}


/**
 * Checks if all input elements in the provided array are valid.
 * @param {HTMLInputElement[]} inputs - An array of input elements to be validated.
 * @returns {boolean} True if all inputs are valid, otherwise false.
 */
function areInputsValid(inputs) {
    for (const input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }
    }
    return true;
}


/**
 * Saves the current user's contacts and all users' data to storage.
 * @async
 * @returns {Promise<void>} A promise that resolves when the data is successfully saved.
 */
async function saveToStorage() {
    currentUser.data.contacts = allContacts;
    await setItem('currentUserData', JSON.stringify(currentUser.data));
    await setItem('allUsers', JSON.stringify(allUsers));
}


/**
 * Loads contacts from Firebase and updates the current user's data.
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const contactsPath = `users/${cleanedEmail}/${userId}/contacts`;
    try {
        const contactsData = await loadData(contactsPath);
        currentUser.data.contacts = contactsData ? Object.values(contactsData) : [];
        renderContacts();
    } catch (error) {
        currentUser.data.contacts = [];
    }
}


/**
 * Loads all contacts for the current user from Firebase and renders them.
 * @returns {Promise<void>}
 */
async function loadAllContacts() {
    await loadContactsFromFirebase();
    if (currentUser && currentUser.data && currentUser.data.contacts) {
        allContacts = currentUser.data.contacts;
        renderContacts();
    }
}


/**
 * Saves the current user's data to the server.
 * @returns {Promise<void>}
 */
async function saveCurrentUser() {
    const userId = localStorage.getItem('currentUserId');
    const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    if (userId && currentUserData) {
        await postData(`users/${userId}`, currentUserData);
    }
}


/**
 * Renders the contacts of the current user in the contact list container.
 * The contacts are sorted alphabetically by last name, and grouped by the first letter of the last name.
 */
function renderContacts() {
    const contacts = currentUser.data.contacts;
    const contactListContainer = document.getElementById('contact-container');
    contactListContainer.innerHTML = '';
    let currentInitial = '';

    contacts.sort((a, b) => {
        const lastNameA = a.name.split(' ').pop();
        const lastNameB = b.name.split(' ').pop();
        if (lastNameA === lastNameB) {
            return a.name.localeCompare(b.name);
        }
        return lastNameA.localeCompare(lastNameB);
    });

    contacts.forEach((contact, index) => {
        const lastNameInitial = contact.name.split(' ').pop().charAt(0).toUpperCase();
        if (lastNameInitial !== currentInitial) {
            contactListContainer.innerHTML += createLetterContainerHTML(lastNameInitial);
            currentInitial = lastNameInitial;
        }
        contactListContainer.innerHTML += createNewContactHTML(contact, index);
    });
}


/**
 * Opens the contact details view for the specified contact.
 * @param {number} index - The index of the contact in the allContacts array.
 */
function openContactDetails(index) {
    let contact = allContacts[index];
    let contactContent = document.getElementById('contact-details');
    contactContent.innerHTML = contactDetailsHTML(contact, index);
    responsiveContactContent();

    // Entfernt das Highlighting von allen Kontakten
    let contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => item.classList.remove('highlighted-contact'));

    // Fügt das Highlighting dem ausgewählten Kontakt hinzu
    let selectedContact = document.getElementById(`contact-item-${index}`);
    selectedContact.classList.add('highlighted-contact');
}


/**
 * Closes the contact details view and returns to the contact list view.
 */
function closeContactDetails() {
    let contactContent = document.getElementById('text-content');
    let contactList = document.getElementById('contact-list');
    contactContent.style.display = 'none';
    contactList.style.display = 'flex';

    // Entfernt das Highlighting von allen Kontakten
    let contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => item.classList.remove('highlighted-contact'));
}


/**
 * Toggles the display of the edit sub-menu in the mobile view.
 */
function openEditMobileMenu() {
    let editSubMenu = document.getElementById('edit-sub-menu');
    if (editSubMenu.style.display === 'flex') {
        editSubMenu.style.display = 'none';
    } else {
        editSubMenu.style.display = 'flex';
    }
}


/**
 * Prepares and displays the form to add a new contact.
 */
function addNewContact() {
    clearInputFields();
    document.getElementById('aco').style.display = 'flex';
    document.getElementById('aco-icon').innerHTML = '<img src="assets/img/icons/aco_person.png" alt="Avatar">'
    addContactContent();
}


/**
 * Closes the contact overlay with an animation.
 */
function closeContactOverlay() {
    let overlay = document.getElementById('aco');
    let flyInOverlay = document.getElementById('fly-in-overlay');

    flyInOverlay.classList.add('closing');
    flyInOverlay.addEventListener('animationend', function () {
        overlay.style.display = 'none';
        flyInOverlay.classList.remove('closing');
    }, { once: true });
}


/**
 * Retrieves contact data from the UI elements based on the given contact index.
 * @param {number} contactIndex - The index of the contact.
 * @returns {Object} An object containing the contact's name, email, and number.
 */
function getContactDataFromUI(contactIndex) {
    return {
        name: document.getElementById(`contact-name-${contactIndex}`).innerHTML,
        email: document.getElementById(`contact-email-${contactIndex}`).innerHTML,
        number: document.getElementById(`contact-number-${contactIndex}`).innerHTML
    };
}


/**
 * Sets the provided contact data to the input fields in the UI.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} number - The phone number of the contact.
 */
function setContactDataToUI(name, email, number) {
    document.getElementById('inputName').value = name;
    document.getElementById('inputEmail').value = email;
    document.getElementById('inputNumber').value = number;
}

/**
 * Edits the contact with the given contact ID.
 * Retrieves the contact data from the UI and sets it to the form for editing.
 * @param {string} contactId - The ID of the contact to be edited.
 * @returns {Promise<void>} A promise that resolves when the contact data is set to the form.
 */
async function editContact(contactId) {
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === contactId);
    const contact = currentUser.data.contacts[contactIndex];
    currentEditingId = contact.id;
    const { name, email, number } = getContactDataFromUI(contactIndex);
    setContactDataToUI(name, email, number);
    document.getElementById('aco').style.display = 'flex';
    const acoIcon = document.getElementById('aco-icon');
    acoIcon.innerHTML = `
    <div class="details-1-icon" id="details-1-icon" style="background-color:${contact.color}">
        <span>${getInitials(name)}</span>
    </div>`;
    editContactContent();
}


/**
 * Updates the contact information displayed in the UI.
 * @param {number} contactIndex - The index of the contact in the contacts array.
 * @param {string} name - The updated name of the contact.
 * @param {string} email - The updated email address of the contact.
 * @param {string} number - The updated phone number of the contact.
 */
function updateContactUI(contactIndex, name, email, number) {
    document.getElementById(`contact-name-${contactIndex}`).innerHTML = name;
    document.getElementById(`contact-email-${contactIndex}`).innerHTML = email;
    document.getElementById(`contact-number-${contactIndex}`).innerHTML = number;
}


/**
 * Saves the updated contact information to the contacts array and updates the current user's contacts.
 * @param {number} contactIndex - The index of the contact in the contacts array.
 * @param {string} name - The updated name of the contact.
 * @param {string} email - The updated email address of the contact.
 * @param {string} number - The updated phone number of the contact.
 */
function saveContactUpdates(contactIndex, name, email, number) {
    allContacts[contactIndex].name = name;
    allContacts[contactIndex].email = email;
    allContacts[contactIndex].number = number;
    allContacts[contactIndex].initials = getInitials(name);
    if (currentUser) {
        currentUser.data.contacts = allContacts;
        saveCurrentUser();
    }
}


/**
 * Save the updated contact information.
 */
async function saveUpdatedContact() {
    const updatedContactDetails = getUpdatedContactDetails();
    const contactIndex = findContactIndex(currentEditingId);

    if (contactIndex !== -1) {
        const updatedContact = createUpdatedContact(currentUser.data.contacts[contactIndex], updatedContactDetails);
        currentUser.data.contacts[contactIndex] = updatedContact;

        const contactsPath = getContactsPath();
        await updateData(contactsPath, currentUser.data.contacts);
        await updateContactInTasks(currentEditingId, updatedContact);

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUI(contactIndex, updatedContactDetails);
    }
}


/**
 * Retrieve the updated contact details from the input fields.
 * @returns {Object} An object containing the updated contact details.
 */
function getUpdatedContactDetails() {
    return {
        name: document.getElementById('inputName').value,
        email: document.getElementById('inputEmail').value,
        number: document.getElementById('inputNumber').value,
    };
}


/**
 * Find the index of a contact by its ID.
 * @param {string} contactId - The ID of the contact to find.
 * @returns {number} The index of the contact, or -1 if not found.
 */
function findContactIndex(contactId) {
    return currentUser.data.contacts.findIndex(contact => contact.id === contactId);
}


/**
 * Create an updated contact object by merging original and updated details.
 * @param {Object} originalContact - The original contact object.
 * @param {Object} updatedDetails - The updated contact details.
 * @returns {Object} The updated contact object.
 */
function createUpdatedContact(originalContact, updatedDetails) {
    return {
        ...originalContact,
        name: updatedDetails.name,
        email: updatedDetails.email,
        number: updatedDetails.number,
        initials: getInitials(updatedDetails.name),
    };
}


/**
 * Get the path to the contacts data storage.
 * @returns {string} The path to the contacts data storage.
 */
function getContactsPath() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const basePath = `users/${cleanedEmail}/${userId}`;
    return `${basePath}/contacts`;
}


/**
 * Update the UI to reflect the updated contact details.
 * @param {number} contactIndex - The index of the updated contact.
 * @param {Object} updatedDetails - The updated contact details.
 */
function updateUI(contactIndex, updatedDetails) {
    updateContactUI(contactIndex, updatedDetails.name, updatedDetails.email, updatedDetails.number);
    renderContacts();
    openContactDetails(contactIndex);
    showEditConfirmation();
}


/**
 * Update the contact information in tasks.
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact information.
 */
async function updateContactInTasks(contactId, updatedContact) {
    const boardPath = getBoardPath();
    const boardData = await loadData(boardPath);

    if (boardData) {
        const statuses = ['todo', 'inProgress', 'awaitFeedback', 'done'];
        for (const status of statuses) {
            await updateTasksWithContact(boardData, status, contactId, updatedContact, boardPath);
        }
    }
}