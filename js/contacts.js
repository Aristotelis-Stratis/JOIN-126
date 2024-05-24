let i;
let currentEditingId = null;


async function initContacts() {
    await includeHTML();
    await loadCurrentUser();
    await loadAllContacts();
}


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

            try {
                await updateData(contactPath, contact);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                renderContacts();
                showCreationConfirmation();
            } catch (error) {
                console.error('Fehler beim Hinzufügen des Kontakts zu Firebase:', error);
            }
        } else {
            console.error('Fehler: Kein gültiger aktueller Benutzer oder Kontaktliste nicht verfügbar.');
        }
    }
}


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


function areInputsValid(inputs) {
    for (const input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity();
            return false;
        }
    }
    return true;
}


async function saveToStorage() {
    if (currentUser && currentUser.data) {
        currentUser.data.contacts = allContacts;
        console.log("Speichere aktuelle Benutzerdaten: ", JSON.stringify(currentUser.data));
        await setItem('currentUserData', JSON.stringify(currentUser.data));
        await setItem('allUsers', JSON.stringify(allUsers));
    } else {
        console.error("Kein aktueller Benutzer oder keine Daten zum Speichern.");
    }
}


async function loadContactsFromFirebase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const contactsPath = `users/${cleanedEmail}/${userId}/contacts`;
    
    try {
        const contactsData = await loadData(contactsPath);
        if (contactsData) {
            currentUser.data.contacts = Object.values(contactsData);
        } else {
            currentUser.data.contacts = [];
        }
        console.log('Contacts successfully loaded from Firebase:', currentUser.data.contacts);
        renderContacts();
    } catch (error) {
        console.error('Error loading contacts from Firebase:', error);
        currentUser.data.contacts = [];
    }
}


async function loadAllContacts() {
    await loadContactsFromFirebase();
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


function openContactDetails(index) {
    let contact = allContacts[index];
    let contactContent = document.getElementById('contact-details');
    contactContent.innerHTML = contactDetailsHTML(contact, index);
    responsiveContactContent();
}



function closeContactDetails() {
    let contactContent = document.getElementById('text-content');
    let contactList = document.getElementById('contact-list');

    contactContent.style.display = 'none';
    contactList.style.display = 'flex';
}


function openEditMobileMenu() {
    let editSubMenu = document.getElementById('edit-sub-menu');
    if (editSubMenu.style.display === 'flex') {
        editSubMenu.style.display = 'none';
    } else {
        editSubMenu.style.display = 'flex';
    }
}


function addNewContact() {
    clearInputFields();
    document.getElementById('aco').style.display = 'flex';
    document.getElementById('aco-icon').innerHTML = '<img src="assets/img/icons/aco_person.png" alt="Avatar">'
    addContactContent();
}



function closeContactOverlay() {
    let overlay = document.getElementById('aco');
    let flyInOverlay = document.getElementById('fly-in-overlay');

    flyInOverlay.classList.add('closing');
    flyInOverlay.addEventListener('animationend', function () {
        overlay.style.display = 'none';
        flyInOverlay.classList.remove('closing');
    }, { once: true });
}


function getContactDataFromUI(contactIndex) {
    return {
        name: document.getElementById(`contact-name-${contactIndex}`).innerHTML,
        email: document.getElementById(`contact-email-${contactIndex}`).innerHTML,
        number: document.getElementById(`contact-number-${contactIndex}`).innerHTML
    };
}


function setContactDataToUI(name, email, number) {
    document.getElementById('inputName').value = name;
    document.getElementById('inputEmail').value = email;
    document.getElementById('inputNumber').value = number;
}


async function editContact(contactId) {
    const contactIndex = currentUser.data.contacts.findIndex(contact => contact.id === contactId);

    if (contactIndex === -1) {
        console.error("Kontakt nicht gefunden.");
        return;
    }

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


function updateContactUI(contactIndex, name, email, number) {
    document.getElementById(`contact-name-${contactIndex}`).innerHTML = name;
    document.getElementById(`contact-email-${contactIndex}`).innerHTML = email;
    document.getElementById(`contact-number-${contactIndex}`).innerHTML = number;
}


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

        console.log('Aktualisiere Kontakt:', updatedContact);
        console.log('Kontakte Pfad:', contactsPath);

        try {
         
            await updateData(contactsPath, currentUser.data.contacts);
            await updateContactInTasks(currentEditingId, updatedContact);

            console.log('Kontaktdaten erfolgreich aktualisiert:', updatedContact);

            localStorage.setItem('currentUser', JSON.stringify(currentUser));

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

async function updateContactInTasks(contactId, updatedContact) {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    try {
        const boardData = await loadData(boardPath);
        if (boardData) {
            const statuses = ['todo', 'inProgress', 'awaitFeedback', 'done'];

            for (const status of statuses) {
                const tasks = boardData[status] || [];
                tasks.forEach((task, taskIndex) => {
                    const contactIndex = task.contacts.findIndex(contact => contact.id === contactId);
                    if (contactIndex !== -1) {
                        task.contacts[contactIndex] = updatedContact;
                    }
                });
                await updateData(`${boardPath}/${status}`, tasks);
            }

            console.log(`Contact with ID ${contactId} successfully updated in all tasks.`);
        } else {
            console.error('No board data found for the current user.');
        }
    } catch (error) {
        console.error('Error updating contact in tasks in Firebase:', error);
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
                    await updateData(`${tasksPath}/${taskId}`, task);  // Speichern der aktualisierten Aufgabe in Firebase
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


function editContactContent() {
    let headline = document.getElementById('headline');
    let subheadline = document.getElementById('sub-headline');
    let button = document.getElementById('rb');

    headline.innerHTML = 'Edit contact';
    subheadline.innerHTML = '';
    button.innerHTML = 'Save <img src="assets/img/icons/check.png" alt = "Save"> ';
    button.setAttribute("onClick", "javascript: saveUpdatedContact(); showEditConfirmation();");
}


function addContactContent() {
    let headline = document.getElementById('headline');
    let subheadline = document.getElementById('sub-headline');
    let button = document.getElementById('rb');

    headline.innerHTML = 'Add Contact';
    subheadline.innerHTML = 'Tasks are better with a team!';
    button.setAttribute("onClick", "javascript: createContact();");
    button.innerHTML = 'Create contact <img src="assets/img/icons/check.png" alt = "Create Contact"> ';
}


function showCreationConfirmation() {
    initiateConfirmation('Contact successfully created');
    clearInputFields();
    closeContactOverlay();
}


function showEditConfirmation() {
    initiateConfirmation('Contact successfully edited');
    clearInputFields();
    closeContactOverlay();
}


function showDeleteConfirmation() {
    initiateConfirmation('Contact successfully deleted');
}


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


function clearInputFields() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputNumber').value = '';
}