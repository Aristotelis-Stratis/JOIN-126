/**
 * Initializes the application by loading contacts and rendering them.
 */
async function initTasks() {
    includeHTML();
    currentUser = await loadCurrentUser(); // Ersetze das direkte `currentUser`-Check mit einem Funktionsaufruf
    await loadContactsFromStorage();
    renderTaskContactList();
    console.warn('All tasks are loaded for the current user:', currentUser.data.tasks);
}

/**
 * Creates a new task and adds it to the task list if all input validations pass.
 * It saves the updated task list to storage and resets the user interface.
 * @async
 */
async function createTask() {
    if (validateTaskInputs()) {
        const newTask = constructNewTask();
        if (!currentUser) {
            console.error("No current user logged in. Task cannot be added.");
            return;
        }
        currentUser.data.tasks.push(newTask);
        await saveCurrentUser();  // Speichert den aktuellen Benutzer mit den neuen Aufgaben
        console.log('Task added to current user tasks:', currentUser.data.tasks);
        resetUI();
        initiateConfirmation('Task added to <img class="add-task-icon-board" src="assets/img/icons/board.png" alt="Board">');
        directToBoard();
    }
}

/**
 * Directs the user to the board page after a short delay once the task has been created.
 */
function directToBoard() {
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 2500);
}


/**
 * Constructs a new task object based on the user input from the form. It collects data from the title, description,
 * due date, priority, selected contacts, subtasks, and category fields.
 * @returns {Object} The new task object with properties: title, description, dueDate, priority, contacts, subtasks, and category.
 */
function constructNewTask() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let priority = selectedPriority[0];
    let category = document.getElementById('category-todo').value;

    return {
        title,
        description,
        dueDate,
        priority,
        contacts: selectedContacts,
        subtasks: subtasks,
        status: "toDo",
        category
    };
}


/**
 * Clears all tasks from remote storage.
 */
function deleteStorage() {
    allTasks = [];
    setItem('tasks', JSON.stringify(allTasks));
}


/**
 * Resets the user interface (UI) by clearing input fields, removing active classes from priority buttons,
 * and resetting selected contact, subtask, and priority arrays.
 */
function resetUI() {
    document.querySelectorAll('.priority-button.active').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('selected-option').textContent = 'Select task category';
    document.getElementById('dueDate').value = '';
    document.getElementById('subtaskContainer').innerHTML = '';
    document.getElementById('selected-contacts-list').innerHTML = '';
    const dropdownMenu = document.getElementById('assign-dropdown-menu');
    if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.classList.remove('visible');
    }
    selectedContacts = [];
    subtasks = [];
    selectedPriority = [];
}


/**
 * Loads contacts into the application from storage.
 */
async function loadContactsFromStorage() {
    let response = await getItem('contacts');
    allContacts = JSON.parse(response);
}


/**
 * Renders the list of contacts in the UI.
 */
function renderTaskContactList() {
    const contactListContainer = document.getElementById('task-contact-list');
    // contactListContainer.innerHTML = '';

    // Stelle sicher, dass currentUser definiert und contacts vorhanden ist
    if (currentUser && currentUser.data && Array.isArray(currentUser.data.contacts)) {
        for (let i = 0; i < currentUser.data.contacts.length; i++) {
            const contact = currentUser.data.contacts[i];
            const isChecked = isSelected(contact);
            contactListContainer.innerHTML += generateContactHTML(contact, i, isChecked);
        }
    } else {
        console.error('Cannot render contacts. currentUser or currentUser.data.contacts is not defined.');
    }
}


/**
 * Filters the contacts based on the user's input. 
 * It performs a case-insensitive search to find contacts whose names include the input string.
 * @param {string} input - The user's input used for filtering contacts by name.
 */
function filterContacts(input) {
    const filteredContacts = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(input.toLowerCase())
    );
    renderFilteredContactList(filteredContacts);
}


/**
 * Renders the filtered list of contacts in the UI. 
 * This function clears the existing list and repopulates it with only those contacts that match the filter criteria.
 * @param {Array} filteredContacts - An array of contact objects that have passed the filtering criteria.
 */
function renderFilteredContactList(filteredContacts) {
    const contactListContainer = document.getElementById('task-contact-list');
    contactListContainer.innerHTML = '';
    for (let i = 0; i < filteredContacts.length; i++) {
        const contact = filteredContacts[i];
        contactListContainer.innerHTML += generateContactHTML(contact, i);
    }
}


/**
 * Renders the selected contacts in the UI using the data from the selectedContacts array.
 */
function renderSelectedContacts() {
    const container = document.querySelector('.selected-contacts-container');
     // container.innerHTML = ''; Clear the container first

    // Iterate through the selected contacts and add them to the container
    selectedContacts.forEach(contact => {
        container.insertAdjacentHTML('beforeend', createContactIconHTML(contact));
    });
}


/**
 * Toggles the selection state of a contact.
 * @param {number} index - The index of the contact in the allContacts array.
 * @param {Element} element - The DOM element of the contact item.
 */
function toggleContactSelection(index) {
    event.stopPropagation();
    const contactItem = document.getElementById(`contact-item-${index}`);
    const contact = allContacts[index];
    if (isSelected(contact)) {
        removeContact(contact);
        setCheckboxImage(contactItem, false);
    } else {
        addContact(contact);
        setCheckboxImage(contactItem, true);
    }
    renderSelectedContacts();
}


/**
 * Checks if a contact is selected.
 * @param {Object} contact - The contact object.
 * @returns {boolean} - Returns true if the contact is selected, false otherwise.
 */
function isSelected(contact) {
    return selectedContacts.some(selectedContact => selectedContact.id === contact.id);
}


/**
 * Adds a contact to the selectedContacts array.
 * @param {Object} contact - The contact to add.
 */
function addContact(contact) {
    selectedContacts.push(contact);
}


/**
 * Removes a contact from the selectedContacts array.
 * @param {Object} contact - The contact to remove.
 */
function removeContact(contact) {
    selectedContacts = selectedContacts.filter(selected => selected.id !== contact.id);
}


/**
 * Sets the checkbox image based on the selection state.
 * @param {Element} element - The DOM element containing the checkbox.
 * @param {boolean} isChecked - The selection state of the checkbox.
 */
function setCheckboxImage(element, isChecked) {
    updateCheckboxImage(element, isChecked);
}


/**
 * Updates the source of the checkbox image.
 * @param {Element} element - The DOM element containing the checkbox.
 * @param {boolean} isChecked - The selection state of the checkbox.
 */
function updateCheckboxImage(element, isChecked) {
    const checkboxImg = element.querySelector('img');
    checkboxImg.src = isChecked ? "assets/img/icons/checkbox-checked-black-24.png" : "assets/img/icons/checkbox-empty-black-24.png";
}


/**
 * Toggles the visibility of the category dropdown menu and the rotation of the arrow icon.
 */
function toggleCategoryDropdownMenu() {
    let dropdownMenu = document.getElementById('category-dropdown-menu');
    let arrow = document.getElementById('arrow-category');

    if (dropdownMenu.style.display === 'flex') {
        dropdownMenu.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        dropdownMenu.style.display = 'flex';
        arrow.style.transform = 'rotate(180deg)';
    }
}


/**
 * Sets the selected task category based on the provided index. The function updates the text content of the "selected-option"
 * element and the value of the "category-todo" input field to match the selected category.
 * @param {number} index - The index of the selected category, starting from 1.
 */
function setSelectedCategory(index) {
    var categoryNames = ['Technical Task', 'User Story'];
    var selectedCategory = categoryNames[index - 1];
    document.getElementById("selected-option").innerText = selectedCategory;
    document.getElementById("category-todo").value = selectedCategory;

    let errorMessageElement = document.getElementById('category-error-message');
    let categoryDropdown = document.getElementById('select-dropdown');
    clearErrorMessage(errorMessageElement, categoryDropdown);
}


/**
 * Toggles the visibility of the assign dropdown menu and the rotation of the arrow icon.
 * Additionally, it renders the task contact list.
 */
function toggleAssignDropdownMenu() {
    let dropdownMenu = document.getElementById('assign-dropdown-menu');
    let arrow = document.getElementById('arrow-assign-to');
    if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.classList.remove('visible');
        arrow.style.transform = "rotate(0deg)";
    } else {
        dropdownMenu.classList.add('visible');
        arrow.style.transform = "rotate(180deg)";
    }
    renderTaskContactList();
}


/**
 * Adds a new subtask to the list of subtasks.
 */
function addSubtask() {
    let subtaskInput = document.getElementById('subTaskInput');
    let subtaskText = subtaskInput.value;
    if (subtaskText !== '') {
        subtasks.push(subtaskText);
        renderSubtasks();
        clearInputField();
    }
}


/**
 * Edits an existing subtask by index, setting its padding to 0 and replacing
 * its content with an editable input field.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 */
function editSubtask(subtaskIndex) {
    const subtaskItem = document.getElementById(`subtask_${subtaskIndex}`);
    subtaskItem.style.padding = '0';
    subtaskItem.innerHTML = createEditInputField(subtasks[subtaskIndex], subtaskIndex);
    focusAndSetCursorAtEnd(subtaskItem.querySelector('.edit-input-field'));
}


/**
 * Updates the subtask text at a given index or deletes it if the new text is empty.
 * @param {number} subtaskIndex - The index of the subtask to update.
 */
function updateSubtask(subtaskIndex) {
    const newText = getSubtaskInputValue(subtaskIndex);
    if (newText) {
        subtasks[subtaskIndex] = newText;
    } else {
        subtasks.splice(subtaskIndex, 1);
    }
    renderSubtasks();
}


/**
 * Sets the focus to the input field and positions the cursor at the end of its text content.
 * @param {HTMLInputElement} inputField - The input element to focus on.
 */
function focusAndSetCursorAtEnd(inputField) {
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
}


/**
 * Retrieves the trimmed value of the subtask's input field by index.
 * @param {number} subtaskIndex - The index of the subtask's input field to retrieve the value from.
 * @returns {string} The trimmed value of the input field.
 */
function getSubtaskInputValue(subtaskIndex) {
    const inputField = document.getElementById(`editInputField_${subtaskIndex}`);
    return inputField.value.trim();
}


/**
 * Deletes a subtask from the array based on the specified index and renders the updated list of subtasks.
 * @param {number} subtaskIndex - The index of the subtask to delete.
 */
function deleteSubtask(subtaskIndex) {
    subtasks.splice(subtaskIndex, 1);
    renderSubtasks();
}


/**
 * Renders the list of subtasks in the UI.
 * Clears the subtask container and repopulates it with the current list of subtasks.
 */
function renderSubtasks() {
    let subtaskContainer = document.getElementById('subtaskContainer');
   /** subtaskContainer.innerHTML = ''; got deleted by Eduard */
    for (let index = 0; index < subtasks.length; index++) {
        const subtaskText = subtasks[index];
        const subtaskItemHTML = createSubtaskTemplate(subtaskText, index);
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskItemHTML);
    }
}