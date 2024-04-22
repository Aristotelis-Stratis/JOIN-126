let i;
let currentEditingId = null;

/**
 * Initializes the application by loading all contacts.
 */
async function initContacts() {
    await includeHTML();  // Stellen Sie sicher, dass dies abgeschlossen ist, falls asynchron
    setProfileInitials();
    await loadTasksFromStorage();  // Reihenfolge geändert für bessere Logik
    await loadAllContacts();
    console.log("Aufgaben geladen:", allTasks);
}


/**
 * Validates inputs and creates a new contact if valid, then updates the UI and storage.
 */
async function createContact() {
    let nameInput = document.getElementById('inputName');
    let emailInput = document.getElementById('inputEmail');
    let numberInput = document.getElementById('inputNumber');

    if (areInputsValid([nameInput, emailInput, numberInput])) {
        let contact = createContactObject(nameInput.value, emailInput.value, numberInput.value);
        if (currentUser && currentUser.data && currentUser.data.contacts) {
            currentUser.data.contacts.push(contact);
            await saveCurrentUser();
            renderContacts();
            showCreationConfirmation();
        } else {
            console.error('Fehler: Kein gültiger aktueller Benutzer oder Kontaktliste nicht verfügbar.');
        }
    }
}


/**
 * Generates a contact object with unique ID, name, email, number, initials, and color.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} number - The phone number of the contact.
 * @returns {Object} The contact object with generated fields.
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
 * Returns true if all provided input elements are valid according to HTML5 validation.
 * @param {HTMLInputElement[]} inputs - An array of input elements to validate.
 * @returns {boolean} True if all inputs are valid, false otherwise.
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
 * Saves the current state of `allContacts` array to storage.
 */
async function saveToStorage() {
    if (currentUser && currentUser.data) {
        console.log("Speichere aktuelle Benutzerdaten: ", JSON.stringify(currentUser.data));
        await setItem('currentUserData', JSON.stringify(currentUser.data));
    } else {
        console.error("Kein aktueller Benutzer oder keine Daten zum Speichern.");
    }
}

/**
 * Loads all contacts from storage and updates the `allContacts` array. Logs a message if no contacts are found.
 */
async function loadAllContacts() {
    try {
        if (currentUser && currentUser.data.contacts) {
            allContacts = currentUser.data.contacts;
            console.log("Kontakte geladen:", allContacts);
            renderContacts();
        } else {
            console.error("Keine Kontaktdaten verfügbar für den aktuellen Benutzer.");
        }
    } catch (e) {
        console.error("Fehler beim Laden der Kontakte:", e);
    }
}


/**
 * Renders the contacts by sorting them and then displaying each in the designated container with separators for each letter.
 */
function renderContacts() {
    if (!currentUser || !currentUser.data) {
        console.error("Kein aktueller Benutzer oder keine Benutzerdaten geladen.");
        return;
    }

    const contacts = currentUser.data.contacts;
    const contactListContainer = document.getElementById('contact-container');
    contactListContainer.innerHTML = '';
    let currentInitial = '';

    contacts.forEach((contact, i) => {
        const lastNameInitial = contact.name.split(' ').pop().charAt(0).toUpperCase();
        if (lastNameInitial !== currentInitial) {
            contactListContainer.innerHTML += createLetterContainerHTML(lastNameInitial);
            currentInitial = lastNameInitial;
        }
        contactListContainer.innerHTML += createNewContactHTML(contact, i);
    });
}

/**
 * Opens the details of a contact in a dedicated section of the UI.
 * @param {number} index - The index of the contact in the allContacts array.
 */
function openContactDetails(index) {
    let contact = allContacts[index];
    let contactContent = document.getElementById('contact-details');
    contactContent.innerHTML = contactDetailsHTML(contact, index);
    responsiveContactContent();
}


/**
 * Hides the contact details UI.
 */
function closeContactDetails() {
    let contactContent = document.getElementById('text-content');
    let contactList = document.getElementById('contact-list');

    contactContent.style.display = 'none';
    contactList.style.display = 'flex';
}


/**
 * Toggles the edit menu in mobile view.
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
 * Displays the overlay for adding a new contact.
 */
function addNewContact() {
    clearInputFields();
    document.getElementById('aco').style.display = 'flex';
    document.getElementById('aco-icon').innerHTML = '<img src="assets/img/icons/aco_person.png" alt="Avatar">'
    addContactContent();
}


/**
 * Hides the contact overlay after use.
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
 * Extracts contact data from the UI based on the contact index.
 * @param {number} contactIndex - The index of the contact in the UI elements' IDs.
 * @returns {Object} An object containing the name, email, and number of the contact.
 */
function getContactDataFromUI(contactIndex) {
    return {
        name: document.getElementById(`contact-name-${contactIndex}`).innerHTML,
        email: document.getElementById(`contact-email-${contactIndex}`).innerHTML,
        number: document.getElementById(`contact-number-${contactIndex}`).innerHTML
    };
}

/**
 * Sets the contact data in the UI, particularly in the contact editing interface.
 * @param {string} name - The contact's name.
 * @param {string} email - The contact's email address.
 * @param {string} number - The contact's phone number.
 */
function setContactDataToUI(name, email, number) {
    document.getElementById('inputName').value = name;
    document.getElementById('inputEmail').value = email;
    document.getElementById('inputNumber').value = number;
}


/**
 * Prepares the UI for editing a contact by displaying the contact overlay and filling in the contact's current data.
 * @param {number} i - The index of the contact to edit.
 */
function editContact(i) {
    const contact = allContacts[i];
    currentEditingId = contact.id;
    document.getElementById('aco').style.display = 'flex';
    const { name, email, number } = getContactDataFromUI(i);
    setContactDataToUI(name, email, number);
    const acoIcon = document.getElementById('aco-icon');
    acoIcon.innerHTML = `
    <div class="details-1-icon" id="details-1-icon"style="background-color:${contact.color}">
        <span>${contact.initials.split("").join("</span><span>")}</span>
    </div>`;
    editContactContent();
}


/**
 * Updates a contact's display in the UI with new data.
 * @param {number} contactIndex - The index of the contact in the UI.
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
 * Saves updated contact information to the global contacts array.
 * @param {number} contactIndex - The index of the contact in the allContacts array.
 * @param {string} name - The contact's updated name.
 * @param {string} email - The contact's updated email address.
 * @param {string} number - The contact's updated phone number.
 */
function saveContactUpdates(contactIndex, name, email, number) {
    allContacts[contactIndex].name = name;
    allContacts[contactIndex].email = email;
    allContacts[contactIndex].number = number;
    allContacts[contactIndex].initials = getInitials(name);
}


/**
 * Main function to save the updated contact information and refresh the UI to reflect these changes.
 */
function saveUpdatedContact() {
    const updatedName = document.getElementById('inputName').value;
    const updatedEmail = document.getElementById('inputEmail').value;
    const updatedNumber = document.getElementById('inputNumber').value;
    const contactIndex = allContacts.findIndex(contact => contact.id === currentEditingId);

    if (contactIndex !== -1) {
        saveContactUpdates(contactIndex, updatedName, updatedEmail, updatedNumber);
        updateContactUI(contactIndex, updatedName, updatedEmail, updatedNumber);
        updateInitials(contactIndex, updatedName);
        saveToStorage();
        renderContacts();
        openContactDetails(contactIndex);
    }
}


/**
 * Deletes the selected contact from the array and refreshes the contact list display.
 * Also removes the contact from all tasks.
 * @param {number} contactIndex - The index of the contact to be deleted.
 */
function deleteContact(contactIndex) {
    const contactId = allContacts[contactIndex].id;
    allContacts.splice(contactIndex, 1);
    removeContactFromTasks(contactId);
    saveToStorage();  
    renderContacts(); 
    showDeleteConfirmation(); 
}

/**
 * Removes a contact from all tasks.
 * @param {string} contactId - The ID of the contact to remove.
 */
function removeContactFromTasks(contactId) {
    allTasks.forEach(task => {
        const filteredContacts = task.contacts.filter(contact => contact.id !== contactId);
        task.contacts = filteredContacts;
    });
    saveTasksToStorage();
}


/**
 * Saves the current state of `allTasks` array to storage.
 */
async function saveTasksToStorage() {
    await setItem('tasks', JSON.stringify(allTasks));
}

/**
 * Clears all contacts from remote storage.
 */
function deleteStorage() {
    allContacts = [];
    setItem('contacts', JSON.stringify(allContacts));
}


/**
 * Adjusts the UI content for the edit contact overlay.
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
 * Adjusts the UI content for the add contact overlay.
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
 * Shows a confirmation message upon successful contact creation.
 */
function showCreationConfirmation() {
    initiateConfirmation('Contact successfully created');
    clearInputFields();
    closeContactOverlay();
}

/**
 * Shows a confirmation message upon successful contact editing.
 */
function showEditConfirmation() {
    initiateConfirmation('Contact successfully edited');
    clearInputFields();
    closeContactOverlay();
}

/**
 * Shows a confirmation message upon successful contact deletion.
 */
function showDeleteConfirmation() {
    initiateConfirmation('Contact successfully deleted');
}


/**
 * Initiates and displays a confirmation window with a specified message.
 * @param {string} message - The message to be displayed in the confirmation window.
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
 * Generates initials from a given name. If the name consists of multiple parts, initials of the first and last parts are used.
 * @param {string} name - The full name from which to generate initials.
 * @return {string} The generated initials, in uppercase.
 */
function getInitials(name) {
    let parts = name.split(' ');
    if (parts.length > 1) {
        let initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
        return initials.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}


/**
 * Updates the initials displayed for a contact in the contact list.
 * @param {number} contactIndex - The index of the contact whose initials are to be updated.
 * @param {string} updatedName - The updated name of the contact, from which new initials are generated.
 */
function updateInitials(contactIndex, updatedName) {
    let newInitials = getInitials(updatedName);
    let contactIconDiv = document.querySelector(`#contact-item-${contactIndex} .contact-icon`);
    contactIconDiv.innerHTML = `<span>${newInitials.charAt(0)}</span>` + (newInitials.length > 1 ? `<span>${newInitials.charAt(1)}</span>` : '');
}


/**
 * Generates a random hex color code.
 * @return {string} The generated hex color code.
 */
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}


/**
 * Sorts the global contact array by last name, then by first name if the last names are identical. Only the first three letters are considered for comparison.
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
 * Adjusts the display of contact list and contact details for responsive layouts.
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
 * Generates a unique identifier using the current timestamp and a random string.
 * @return {string} The generated unique identifier.
 */
function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

/**
 * Clears the input fields for name, email, and phone number in the form.
 * It is typically called after a contact has been successfully added or edited to reset the form.
 */
function clearInputFields() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputNumber').value = '';
}