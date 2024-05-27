let filteredContacts = [];

/**
 * Initializes tasks by including HTML, loading the current user, loading all contacts, 
 * and rendering the task contact list.
 */
async function initTasks() {
    includeHTML();
    currentUser = await loadCurrentUser();
    await loadAllContacts();
    filteredContacts = currentUser.data.contacts;
    renderTaskContactList(filteredContacts);
    document.getElementById('priority-medium').classList.add('active');
    selectedPriority = ["medium"];
}


/**
 * Creates a new task, validates the inputs, constructs the task, assigns a unique ID, 
 * and updates the user's board with the new task. Also handles UI reset and redirection.
 */
async function createTask() {
    if (validateTaskInputs()) {
        const newTask = constructNewTask();
        newTask.id = generateUniqueId();
        initializeBoard(currentUser.data);
        const newTaskIndex = currentUser.data.board.todo.length;
        currentUser.data.board.todo[newTaskIndex] = newTask;
        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');
        const taskPath = `users/${cleanedEmail}/${userId}/board/todo/${newTaskIndex}`;
        await updateData(taskPath, newTask);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        resetUI();
        initiateConfirmation('Task added to <img class="add-task-icon-board" src="assets/img/icons/board.png" alt="Board">');
        directToBoard();
    }
}


/**
 * Initializes the user's board by ensuring all necessary sections exist.
 */
function initializeBoard(data) {
    const board = data.board || {};
    const sections = ['todo', 'inProgress', 'awaitFeedback', 'done'];
    sections.forEach(section => {
        if (!board[section]) {
            board[section] = [];
        }
    });
    data.board = board;
}


/**
 * Redirects the user to the board page after a delay of 2.5 seconds.
 */
function directToBoard() {
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 2000);
}


/**
 * Constructs a new task object by gathering data from various input fields.
 * @returns {Object} The new task object.
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
        contacts: selectedContacts || [],
        subtasks: subtasks || [],
        status: "toDo",
        category
    };
}


/**
 * Resets the user interface by clearing input fields and resetting selected options.
 */
function resetUI() {
    document.querySelectorAll('.priority-button.active').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById('priority-medium').classList.add('active'); // Ensure medium priority is active
    selectedPriority = ["medium"]; // Ensure selectedPriority is reset to medium
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
 * Loads contacts from Firebase for the current user and updates the current user's data with the loaded contacts.
 */
async function loadContactsFromFirebase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const contactsPath = `users/${cleanedEmail}/${userId}/contacts`;
    const contactsData = await loadData(contactsPath);
    currentUser.data.contacts = contactsData;
}


/**
 * Loads all contacts for the current user from Firebase and updates the global list of all contacts.
 */
async function loadAllContacts() {
    await loadContactsFromFirebase();
    allContacts = currentUser.data.contacts;
}


/**
 * Filters the contacts based on the input provided and renders the filtered contact list.
 * @param {string} input - The input string to filter contacts by name.
 */
function filterContacts(input) {
    filteredContacts = currentUser.data.contacts.filter(contact =>
        contact.name.toLowerCase().includes(input.toLowerCase())
    );
    renderTaskContactList(filteredContacts);
}


/**
 * Renders the task contact list based on the provided contacts array.
 * @param {Array} contacts - The array of contacts to render.
 */
function renderTaskContactList(contacts) {
    const contactListContainer = document.getElementById('task-contact-list');
    contactListContainer.innerHTML = '';
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const isChecked = isSelected(contact);
        contactListContainer.innerHTML += generateContactHTML(contact, i, isChecked);
    }
}


/**
 * Toggles the selection of a contact based on its index in the filtered contacts list.
 * @param {number} index - The index of the contact to toggle selection for.
 */
function toggleContactSelection(index) {
    event.stopPropagation();
    const contactItem = document.getElementById(`contact-item-${index}`);
    const contact = filteredContacts[index];
    if (isSelected(contact)) {
        removeContact(contact);
        setCheckboxImage(contactItem, false);
    } else {
        addContact(contact);
        setCheckboxImage(contactItem, true);
    }
    renderSelectedContacts();
    const assignInput = document.getElementById('assignedTo');
    assignInput.value = '';
    assignInput.focus();
    filteredContacts = currentUser.data.contacts;
    renderTaskContactList(filteredContacts);
}


/**
 * Renders the selected contacts by creating their icons and inserting them into the container.
 */
function renderSelectedContacts() {
    const container = document.querySelector('.selected-contacts-container');
    container.innerHTML = '';

    selectedContacts.forEach(contact => {
        container.insertAdjacentHTML('beforeend', createContactIconHTML(contact));
    });
}


/**
 * Toggles the visibility of the assign dropdown menu and updates the arrow icon accordingly.
 * Also, refreshes the task contact list.
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
    filteredContacts = currentUser.data.contacts;
    renderTaskContactList(filteredContacts);
}


/**
 * Checks if a contact is already selected.
 * @param {Object} contact - The contact object to check.
 * @returns {boolean} True if the contact is selected, otherwise false.
 */
function isSelected(contact) {
    return selectedContacts.some(selectedContact => selectedContact.id === contact.id);
}


/**
 * Adds a contact to the selected contacts list.
 * @param {Object} contact - The contact object to add.
 */
function addContact(contact) {
    selectedContacts.push(contact);
}


/**
 * Removes a contact from the selected contacts list.
 * @param {Object} contact - The contact object to remove.
 */
function removeContact(contact) {
    selectedContacts = selectedContacts.filter(selected => selected.id !== contact.id);
}


/**
 * Sets the image of a checkbox element based on the isChecked parameter.
 * @param {Element} element - The checkbox element.
 * @param {boolean} isChecked - Indicates whether the checkbox is checked.
 */
function setCheckboxImage(element, isChecked) {
    updateCheckboxImage(element, isChecked);
}


/**
 * Updates the image of a checkbox element based on the isChecked parameter.
 * @param {Element} element - The checkbox element.
 * @param {boolean} isChecked - Indicates whether the checkbox is checked.
 */
function updateCheckboxImage(element, isChecked) {
    const checkboxImg = element.querySelector('img');
    checkboxImg.src = isChecked ? "assets/img/icons/checkbox-checked-black-24.png" : "assets/img/icons/checkbox-empty-black-24.png";
}


/**
 * Toggles the visibility of the category dropdown menu and rotates the arrow accordingly.
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
 * Sets the selected category based on the provided index.
 * @param {number} index - The index of the category.
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
 * Adds a subtask to the list of subtasks.
 */
function addSubtask() {
    let subtaskInput = document.getElementById('subTaskInput');
    let subtaskText = subtaskInput.value;
    if (subtaskText !== '') {
        subtasks.push({ text: subtaskText, completed: false });
        renderSubtasks();
        clearInputField();
    }
}


/**
 * Edits a subtask identified by its index.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 */
function editSubtask(subtaskIndex) {
    const subtaskItem = document.getElementById(`subtask_${subtaskIndex}`);
    const subtask = subtasks[subtaskIndex];
    subtaskItem.style.padding = '0';
    subtaskItem.innerHTML = createEditInputField(subtask.text, subtaskIndex);
    focusAndSetCursorAtEnd(subtaskItem.querySelector('.edit-input-field'));
}


/**
 * Updates a subtask identified by its index with the new text value.
 * If the new text is empty, the subtask will be removed.
 * @param {number} subtaskIndex - The index of the subtask to update.
 */
function updateSubtask(subtaskIndex) {
    const newText = getSubtaskInputValue(subtaskIndex);
    if (newText) {
        subtasks[subtaskIndex].text = newText;
    } else {
        subtasks.splice(subtaskIndex, 1);
    }
    renderSubtasks();
}


/**
 * Sets focus on the provided input field and places the cursor at the end of the input value.
 * @param {HTMLInputElement} inputField - The input field to focus on.
 */
function focusAndSetCursorAtEnd(inputField) {
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
}


/**
 * Retrieves the value of the input field associated with the given subtask index.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {string} The value of the input field.
 */
function getSubtaskInputValue(subtaskIndex) {
    const inputField = document.getElementById(`editInputField_${subtaskIndex}`);
    return inputField.value.trim();
}


/**
 * Deletes a subtask identified by its index.
 * @param {number} subtaskIndex - The index of the subtask to delete.
 */
function deleteSubtask(subtaskIndex) {
    subtasks.splice(subtaskIndex, 1);
    renderSubtasks();
}


/**
 * Renders all subtasks in the subtask container.
 */
function renderSubtasks() {
    let subtaskContainer = document.getElementById('subtaskContainer');
    subtaskContainer.innerHTML = '';
    for (let index = 0; index < subtasks.length; index++) {
        const subtask = subtasks[index];
        const subtaskItemHTML = createSubtaskTemplate(subtask.text, index, subtask.completed);
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskItemHTML);
    }
}