/**
 * Get the path to the board data storage.
 * @returns {string} The path to the board data storage.
 */
function getBoardPath() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    return `users/${cleanedEmail}/${userId}/board`;
}


/**
 * Updates tasks with the new contact information.
 * @param {Object} boardData - The board data.
 * @param {string} status - The task status category.
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact information.
 * @param {string} boardPath - The path to the board data storage.
 */
async function updateTasksWithContact(boardData, status, contactId, updatedContact, boardPath) {
    const tasks = boardData[status] || [];
    tasks.forEach((task, taskIndex) => {
        if (task.contacts) {
            updateContactInTask(task, contactId, updatedContact);
        }
    });
    await updateData(`${boardPath}/${status}`, tasks);
}


/**
 * Updates a contact within a task.
 * @param {Object} task - The task object.
 * @param {string} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact information.
 */
function updateContactInTask(task, contactId, updatedContact) {
    const contactIndex = task.contacts.findIndex(contact => contact.id === contactId);
    if (contactIndex !== -1) {
        task.contacts[contactIndex] = updatedContact;
    }
}


/**
 * Deletes a contact.
 * @param {string} contactId - The ID of the contact to delete.
 */
async function deleteContact(contactId) {
    if (!areContactInfosValid()) return;

    const contactIndex = findContactIndex(contactId);
    if (contactIndex === -1) return;

    removeContactFromUserData(contactIndex);
    await removeContactFromTasks(contactId);
    await updateContactsInDatabase();
    finalizeContactDeletion();

}


/**
 * Check if the contact information is valid.
 * @returns {boolean} True if the contact information is valid, otherwise false.
 */
function areContactInfosValid() {
    return currentUser && currentUser.data && currentUser.data.contacts;
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
 * Remove a contact from the user's data.
 * @param {number} contactIndex - The index of the contact to remove.
 */
function removeContactFromUserData(contactIndex) {
    currentUser.data.contacts.splice(contactIndex, 1);
}


/**
 * Update the contacts in the database.
 */
async function updateContactsInDatabase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const basePath = `users/${cleanedEmail}/${userId}`;
    await updateData(`${basePath}/contacts`, currentUser.data.contacts);
}


/**
 * Finalize the contact deletion process.
 */
function finalizeContactDeletion() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderContacts();
    showDeleteConfirmation();
    document.getElementById('contact-overview').innerHTML = '';
}



/**
 * Remove a contact from all tasks.
 * @param {string} contactId - The ID of the contact to remove.
 */
async function removeContactFromTasks(contactId) {
    const boardData = await loadBoardData();
    if (!boardData) return;

    const statuses = ['todo', 'inProgress', 'awaitFeedback', 'done'];
    for (const status of statuses) {
        const tasks = boardData[status] || [];
        filterContactsFromTasks(tasks, contactId);
        await updateTasksInDatabase(status, tasks);
    }
}


/**
 * Load the board data.
 * @returns {Object|null} The board data or null if loading fails.
 */
async function loadBoardData() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    try {
        const boardData = await loadData(boardPath);
        return boardData || null;
    } catch (error) {
        console.error('Error loading board data from Firebase:', error);
        return null;
    }
}


/**
 * Filter out a specific contact from tasks.
 * @param {Array} tasks - The array of tasks.
 * @param {string} contactId - The ID of the contact to remove.
 */
function filterContactsFromTasks(tasks, contactId) {
    tasks.forEach(task => {
        if (task.contacts) {
            task.contacts = task.contacts.filter(contact => contact.id !== contactId);
        }
    });
}


/**
 * Update tasks in the database.
 * @param {string} status - The task status category.
 * @param {Array} tasks - The array of tasks to update.
 */
async function updateTasksInDatabase(status, tasks) {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const statusPath = `users/${cleanedEmail}/${userId}/board/${status}`;
    await updateData(statusPath, tasks);
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