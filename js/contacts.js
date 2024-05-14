let i;
let currentEditingId = null;


async function initContacts() {
    await includeHTML();  // Falls asynchron
    setProfileInitials();
    await loadCurrentUser();  // Lädt den aktuellen Benutzer korrekt
    //console.log("Aufgaben geladen:", currentUser.data.tasks);
}


async function createContact() {
    let nameInput = document.getElementById('inputName');
    let emailInput = document.getElementById('inputEmail');
    let numberInput = document.getElementById('inputNumber');

    if (areInputsValid([nameInput, emailInput, numberInput])) {
        let contact = createContactObject(nameInput.value, emailInput.value, numberInput.value);
        if (currentUser && currentUser.data) {
            currentUser.data.contacts.push(contact);
            const newContactIndex = currentUser.data.contacts.length - 1;  // Index des neuen Kontakts

            // Verwenden der cleanedEmail aus dem LocalStorage, unabhängig davon, ob es sich um einen Gast oder regulären Benutzer handelt
            const cleanedEmail = localStorage.getItem('cleanedEmail');
            const userId = localStorage.getItem('currentUserId');
            const basePath = `users/${cleanedEmail}/${userId}`;
            const contactPath = `${basePath}/contacts/${newContactIndex}`;

            try {
                await updateData(contactPath, contact);
                localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Aktualisieren des currentUser im Local Storage
                renderContacts(); // UI aktualisieren
                showCreationConfirmation(); // Bestätigung der Kontakterstellung anzeigen
            } catch (error) {
                console.error('Fehler beim Hinzufügen des Kontakts zu Firebase:', error);
            }
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
        currentUser.data.contacts = allContacts;  // Aktualisieren der Kontakte im currentUser
        console.log("Speichere aktuelle Benutzerdaten: ", JSON.stringify(currentUser.data));
        await setItem('currentUserData', JSON.stringify(currentUser.data));
        await setItem('allUsers', JSON.stringify(allUsers)); // Stellen Sie sicher, dass allUsers auch aktualisiert wird
    } else {
        console.error("Kein aktueller Benutzer oder keine Daten zum Speichern.");
    }
}


async function loadAllContacts() {
    if (currentUser && currentUser.data && currentUser.data.contacts) {
        allContacts = currentUser.data.contacts;
        console.log("Kontakte geladen:", allContacts);
        renderContacts();
    } else {
        console.error("Keine Kontaktdaten verfügbar für den aktuellen Benutzer.");
    }
}

async function saveCurrentUser() {
    try {
        const userId = localStorage.getItem('currentUserId');
        const currentUserData = JSON.parse(localStorage.getItem('currentUser'));

        if (userId && currentUserData) {
            await postData(`users/${userId}`, currentUserData);
            console.log('Benutzerdaten erfolgreich aktualisiert:', currentUserData);
        } else {
            console.error('Fehler: Keine Benutzer-ID oder Benutzerdaten im Local Storage gefunden.');
        }
    } catch (error) {
        console.error('Fehler beim Speichern des aktuellen Benutzers:', error);
    }
}




function renderContacts() {
    const contacts = currentUser.data.contacts;
    const contactListContainer = document.getElementById('contact-container');
    contactListContainer.innerHTML = '';
    let currentInitial = '';

    // Erweiterte Sortierfunktion, die erst nach dem Nachnamen und dann nach dem Vornamen sortiert
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
async function editContact(contactId) {
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === contactId);

    if (contactIndex === -1) {
        console.error("Kontakt nicht gefunden.");
        return;
    }

    // Zugriff auf den Kontakt im currentUser basierend auf dem gefundenen Index
    const contact = currentUser.data.contacts[contactIndex];
    currentEditingId = contact.id;

    // Holen der Daten aus dem UI
    const { name, email, number } = getContactDataFromUI(contactIndex);
    setContactDataToUI(name, email, number);

    // Kontaktaktualisierungs-Overlay anzeigen
    document.getElementById('aco').style.display = 'flex';
    const acoIcon = document.getElementById('aco-icon');
    acoIcon.innerHTML = `
    <div class="details-1-icon" id="details-1-icon" style="background-color:${contact.color}">
        <span>${getInitials(name)}</span>
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
    if (currentUser) {
        currentUser.data.contacts = allContacts;
        saveCurrentUser();
    }
}


/**
 * Main function to save the updated contact information and refresh the UI to reflect these changes.
 */
async function saveUpdatedContact() {
    const updatedName = document.getElementById('inputName').value;
    const updatedEmail = document.getElementById('inputEmail').value;
    const updatedNumber = document.getElementById('inputNumber').value;

    // Index des bearbeiteten Kontakts im currentUser finden
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === currentEditingId);

    if (contactIndex !== -1) {
        // Aktualisierte Daten für den Kontakt erstellen
        const updatedContact = {
            ...currentUser.data.contacts[contactIndex],
            name: updatedName,
            email: updatedEmail,
            number: updatedNumber,
            initials: getInitials(updatedName)  // Stellen Sie sicher, dass die Initialen auch aktualisiert werden
        };

        // Update currentUser's contacts locally before pushing to Firebase
        currentUser.data.contacts[contactIndex] = updatedContact;

        // Konstruktion des Pfades für die spezifische Kontaktaktualisierung
        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');
        const basePath = `users/${cleanedEmail}/${userId}`;
        const contactsPath = `${basePath}/contacts`;

        console.log('Aktualisiere Kontakt:', updatedContact);
        console.log('Kontakte Pfad:', contactsPath);

        try {
            // Update the contacts list in Firebase
            await updateData(contactsPath, currentUser.data.contacts);
            console.log('Kontaktdaten erfolgreich aktualisiert:', updatedContact);

            // Aktualisieren des currentUser im localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // UI aktualisieren
            updateContactUI(contactIndex, updatedName, updatedEmail, updatedNumber);
            renderContacts();
            openContactDetails(contactIndex);
            showEditConfirmation();
        } catch (error) {
            console.error('Fehler beim Speichern der aktualisierten Kontaktdaten:', error);
        }
    } else {
        console.error('Kontaktindex nicht gefunden.');
    }
}


/**
 * Deletes the selected contact from the array and refreshes the contact list display.
 * Also removes the contact from all tasks.
 * @param {number} contactIndex - The index of the contact to be deleted.
 */
async function deleteContact(contactId) {
    // Loggt die ID des zu löschenden Kontakts
    console.log("Gewünschte zu löschende Kontakt-ID:", contactId);

    // Überprüft, ob aktuelle Benutzerdaten vorhanden und korrekt geladen sind
    if (!currentUser || !currentUser.data || !currentUser.data.contacts) {
        console.error("Keine gültigen Kontaktinformationen verfügbar.");
        return;
    }

    // Loggt alle IDs der Kontakte des aktuellen Benutzers
    console.log("Aktuelle Kontakt-IDs im currentUser:", currentUser.data.contacts.map(c => c.id));

    // Sucht den Index des zu löschenden Kontakts anhand der ID
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === contactId);
    console.log("Gefundener Index für Kontakt-ID", contactId, "ist", contactIndex);

    // Prüft, ob der Kontakt gefunden wurde
    if (contactIndex === -1) {
        console.error("Kontakt nicht gefunden.");
        return;
    }

    // Entfernt den Kontakt aus dem lokalen Speicher (Array)
    currentUser.data.contacts.splice(contactIndex, 1);
    // Aktualisiert die lokale Speicherung der Nutzerdaten
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Bereitet den Pfad zur Kontaktliste in Firebase vor
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const basePath = `users/${cleanedEmail}/${userId}`;

    try {
        // Aktualisiert die gesamte Kontaktliste in Firebase
        await updateData(`${basePath}/contacts`, currentUser.data.contacts);
        console.log('Kontakt erfolgreich gelöscht und Kontaktliste aktualisiert');
        // Aktualisiert die Benutzeroberfläche
        renderContacts();
        // Zeigt eine Bestätigungsnachricht an
        showDeleteConfirmation();
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts:", error);
    }
    document.getElementById('contact-overview').innerHTML = '';
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
 * Updates the initials displayed for a contact in the contact list.
 * @param {number} contactIndex - The index of the contact whose initials are to be updated.
 * @param {string} updatedName - The updated name of the contact, from which new initials are generated.
 */
async function updateInitials(contactIndex, updatedName) {
    let newInitials = getInitials(updatedName);
    let contactIconDiv = document.querySelector(`#contact-item-${contactIndex} .contact-icon`);
    contactIconDiv.innerHTML = `<span>${newInitials.charAt(0)}</span>` + (newInitials.length > 1 ? `<span>${newInitials.charAt(1)}</span>` : '');

    // Benutzerdaten auf Firebase aktualisieren
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const updatedContacts = [...currentUser.data.contacts]; // Kopie der Kontaktliste erstellen
    updatedContacts[contactIndex].initials = newInitials; // Aktualisierte Initialen für den Kontakt einfügen
    await updateData(`users/${cleanedEmail}/${userId}`, { contacts: updatedContacts });
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
 * Clears the input fields for name, email, and phone number in the form.
 * It is typically called after a contact has been successfully added or edited to reset the form.
 */
function clearInputFields() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputNumber').value = '';
}


//OLD

/**
 * Renders the contacts by sorting them and then displaying each in the designated container with separators for each letter.
 */
// function renderContacts() {
//     if (!currentUser || !currentUser.data) {
//         console.error("Kein aktueller Benutzer oder keine Benutzerdaten geladen.");
//         return;
//     }

//     const contacts = currentUser.data.contacts;
//     const contactListContainer = document.getElementById('contact-container');
//     contactListContainer.innerHTML = '';
//     let currentInitial = '';

//     contacts.forEach((contact, i) => {
//         const lastNameInitial = contact.name.split(' ').pop().charAt(0).toUpperCase();
//         if (lastNameInitial !== currentInitial) {
//             contactListContainer.innerHTML += createLetterContainerHTML(lastNameInitial);
//             currentInitial = lastNameInitial;
//         }
//         contactListContainer.innerHTML += createNewContactHTML(contact, i);
//     });
// }

/**
 * Initializes the application by loading all contacts.
 */
// async function initContacts() {
//     await includeHTML();  // Stellen Sie sicher, dass dies abgeschlossen ist, falls asynchron
//     setProfileInitials();
//    // await loadTasksFromStorage();  // Reihenfolge geändert für bessere Logik
//     await loadAllContacts();
//     console.log("Aufgaben geladen:", currentUser.data.tasks);
// }

/**
 * Validates inputs and creates a new contact if valid, then updates the UI and storage.
 */
// async function createContact() {
//     let nameInput = document.getElementById('inputName');
//     let emailInput = document.getElementById('inputEmail');
//     let numberInput = document.getElementById('inputNumber');

//     if (areInputsValid([nameInput, emailInput, numberInput])) {
//         let contact = createContactObject(nameInput.value, emailInput.value, numberInput.value);
//         if (currentUser && currentUser.data && currentUser.data.contacts) {
//             currentUser.data.contacts.push(contact);
//             await saveCurrentUser();
//             renderContacts();
//             showCreationConfirmation();
//         } else {
//             console.error('Fehler: Kein gültiger aktueller Benutzer oder Kontaktliste nicht verfügbar.');
//         }
//     }
// }

/**
 * Loads all contacts from storage and updates the `allContacts` array. Logs a message if no contacts are found.
 */
// async function loadAllContacts() {
//     try {
//         if (currentUser && currentUser.data.contacts) {
//             allContacts = currentUser.data.contacts;
//             console.log("Kontakte geladen:", allContacts);
//             renderContacts();
//         } else {
//             console.error("Keine Kontaktdaten verfügbar für den aktuellen Benutzer.");
//         }
//     } catch (e) {
//         console.error("Fehler beim Laden der Kontakte:", e);
//     }
// }