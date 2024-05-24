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
}


/**
 * Closes the contact details view and returns to the contact list view.
 */
function closeContactDetails() {
    let contactContent = document.getElementById('text-content');
    let contactList = document.getElementById('contact-list');
    contactContent.style.display = 'none';
    contactList.style.display = 'flex';
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



async function saveUpdatedContact() {
    const updatedName = document.getElementById('inputName').value;
    const updatedEmail = document.getElementById('inputEmail').value;
    const updatedNumber = document.getElementById('inputNumber').value;

    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === currentEditingId);

    if (contactIndex !== -1) {
        const updatedContact = {
            ...currentUser.data.contacts[contactIndex],
            name: updatedName,
            email: updatedEmail,
            number: updatedNumber,
            initials: getInitials(updatedName)
        };

        currentUser.data.contacts[contactIndex] = updatedContact;

        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');
        const basePath = `users/${cleanedEmail}/${userId}`;
        const contactsPath = `${basePath}/contacts`;

        await updateData(contactsPath, currentUser.data.contacts);
        await updateContactInTasks(currentEditingId, updatedContact);

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateContactUI(contactIndex, updatedName, updatedEmail, updatedNumber);
        renderContacts();
        openContactDetails(contactIndex);
        showEditConfirmation();
    }
}



async function updateContactInTasks(contactId, updatedContact) {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;


    const boardData = await loadData(boardPath);
    if (boardData) {
        const statuses = ['todo', 'inProgress', 'awaitFeedback', 'done'];

        for (const status of statuses) {
            const tasks = boardData[status] || [];
            tasks.forEach((task, taskIndex) => {
                if (task.contacts) {
                    const contactIndex = task.contacts.findIndex(contact => contact.id === contactId);
                    if (contactIndex !== -1) {
                        task.contacts[contactIndex] = updatedContact;
                    }
                }
            });
            await updateData(`${boardPath}/${status}`, tasks);
        }
    }
}



async function deleteContact(contactId) {
    if (!currentUser || !currentUser.data || !currentUser.data.contacts) {
        console.error("Keine gültigen Kontaktinformationen verfügbar.");
        return;
    }
    console.log("Aktuelle Kontakt-IDs im currentUser:", currentUser.data.contacts.map(c => c.id));
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === contactId);
    console.log("Gefundener Index für Kontakt-ID", contactId, "ist", contactIndex);

    if (contactIndex === -1) {
        console.error("Kontakt nicht gefunden.");
        return;
    }

    currentUser.data.contacts.splice(contactIndex, 1);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const basePath = `users/${cleanedEmail}/${userId}`;

    try {

        await removeContactFromTasks(contactId);

        await updateData(`${basePath}/contacts`, currentUser.data.contacts);
        console.log('Kontakt erfolgreich gelöscht und Kontaktliste aktualisiert');

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderContacts();
        showDeleteConfirmation();
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts:", error);
    }
    document.getElementById('contact-overview').innerHTML = '';
}


async function removeContactFromTasks(contactId) {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const tasksPath = `users/${cleanedEmail}/${userId}/board/todo`;

    try {
        const tasksData = await loadData(tasksPath);
        if (tasksData) {
            const tasks = Object.entries(tasksData);

            for (const [taskId, task] of tasks) {
                if (task && Array.isArray(task.contacts)) {
                    const filteredContacts = task.contacts.filter(contact => contact.id !== contactId);
                    task.contacts = filteredContacts;
                    currentUser.data.board.todo[taskId].contacts = filteredContacts;
                    await updateData(`${tasksPath}/${taskId}`, task);
                }
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log(`Contact with ID ${contactId} successfully removed from all tasks.`);
        } else {
            console.error('No tasks found for the current user.');
        }
    } catch (error) {
        console.error('Error removing contact from tasks in Firebase:', error);
    }
}


/**
 * Updates the UI content for editing a contact.
 * Changes the headline, subheadline, and button text to indicate editing mode.
 */
function editContactContent() {
    let headline = document.getElementById('headline');
    let subheadline = document.getElementById('sub-headline');
    let button = document.getElementById('rb');

    headline.innerHTML = 'Edit contact';
    subheadline.innerHTML = '';
    button.innerHTML = 'Save <img src="assets/img/icons/check.png" alt = "Save"> ';
    button.setAttribute("onClick", "javascript: saveUpdatedContact(); showEditConfirmation();");
}


/**
 * Updates the UI content for adding a new contact.
 * Changes the headline, subheadline, and button text to indicate adding mode.
 */
function addContactContent() {
    let headline = document.getElementById('headline');
    let subheadline = document.getElementById('sub-headline');
    let button = document.getElementById('rb');

    headline.innerHTML = 'Add Contact';
    subheadline.innerHTML = 'Tasks are better with a team!';
    button.setAttribute("onClick", "javascript: createContact();");
    button.innerHTML = 'Create contact <img src="assets/img/icons/check.png" alt = "Create Contact"> ';
}


/**
 * Displays a confirmation message indicating that a contact has been successfully created.
 * Clears the input fields and closes the contact overlay.
 */
function showCreationConfirmation() {
    initiateConfirmation('Contact successfully created');
    clearInputFields();
    closeContactOverlay();
}


/**
 * Displays a confirmation message indicating that a contact has been successfully edited.
 * Clears the input fields and closes the contact overlay.
 */
function showEditConfirmation() {
    initiateConfirmation('Contact successfully edited');
    clearInputFields();
    closeContactOverlay();
}


/**
 * Displays a confirmation message indicating that a contact has been successfully deleted.
 */
function showDeleteConfirmation() {
    initiateConfirmation('Contact successfully deleted');
}


/**
 * Initiates a confirmation message with an animation.
 * @param {string} message - The confirmation message to display.
 */
function initiateConfirmation(message) {
    const confirmation = document.getElementById('confirmation');
    confirmation.innerHTML = message;
    confirmation.style.display = 'flex';
    const animationName = window.innerWidth <= 820 ? 'slideInUp' : 'slideInRight';
    confirmation.style.animation = `${animationName} 0.5s ease`;
    setTimeout(() => {
        const animationNameOut = window.innerWidth <= 820 ? 'slideOutDown' : 'slideOutRight';
        confirmation.style.animation = `${animationNameOut} 0.5s ease forwards`;
        confirmation.addEventListener('animationend', () => {
            confirmation.style.display = 'none';
        }, { once: true });
    }, 2000);
}


/**
 * Updates the initials displayed for a contact based on the updated name.
 * @param {number} contactIndex - The index of the contact in the contacts array.
 * @param {string} updatedName - The updated name of the contact.
 * @returns {Promise<void>} A promise that resolves when the initials are updated in the data store.
 */
async function updateInitials(contactIndex, updatedName) {
    let newInitials = getInitials(updatedName);
    let contactIconDiv = document.querySelector(`#contact-item-${contactIndex} .contact-icon`);
    contactIconDiv.innerHTML = `<span>${newInitials.charAt(0)}</span>` + (newInitials.length > 1 ? `<span>${newInitials.charAt(1)}</span>` : '');
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const updatedContacts = [...currentUser.data.contacts];
    updatedContacts[contactIndex].initials = newInitials;
    await updateData(`users/${cleanedEmail}/${userId}`, { contacts: updatedContacts });
}


/**
 * Sorts the contacts by name.
 * Contacts are first sorted by the first three characters of their last names.
 * If the last names are the same, the contacts are then sorted by the first three characters of their first names.
 */
function sortContactsByName() {
    allContacts.sort((a, b) => {
        let lastNameA = a.name.split(' ').pop().toUpperCase().substring(0, 3);
        let lastNameB = b.name.split(' ').pop().toUpperCase().substring(0, 3);
        if (lastNameA !== lastNameB) {
            return lastNameA.localeCompare(lastNameB);
        }
        let firstNameA = a.name.split(' ')[0].toUpperCase().substring(0, 3);
        let firstNameB = b.name.split(' ')[0].toUpperCase().substring(0, 3);
        return firstNameA.localeCompare(firstNameB);
    });
}


/**
 * Adjusts contact content display for responsive design.
 */
function responsiveContactContent() {
    let contactList = document.getElementById('contact-list');
    let contactContent = document.getElementById('contact-details');
    let contactContainer = document.getElementById('text-content');

    if (window.innerWidth > 1366) {
        contactContent.style.display = 'flex';
    } else {
        contactContent.style.display = 'flex';
        contactContainer.style.display = 'flex';
        contactList.style.display = 'none';
    }
}


/**
 * Clears the input fields for name, email, and number in the form.
 */
function clearInputFields() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputNumber').value = '';
}