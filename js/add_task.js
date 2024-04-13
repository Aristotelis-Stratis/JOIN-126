
/**
 * Initializes the application by loading contacts and rendering them.
 */
async function initTasks() {
    includeHTML();
    await loadContactsFromStorage();
    await loadTasksFromStorage();
    renderTaskContactList();
    // console.warn('All Tasks are here:', allTasks);
}

/**
 * Creates a new task and adds it to the task list if all input validations pass.
 * It saves the updated task list to storage and resets the user interface.
 * @async
 */
async function createTask() {
    if (validateTaskInputs()) {
        const newTask = constructNewTask();
        allTasks.push(newTask);
        await saveToStorage();
        console.log('Added task into allTask array:', allTasks);
        resetUI();
        initiateConfirmation('Task added to <img class="add-task-icon-board"src="assets/img/icons/board.png" alt="Board">');
    }
}

function directToBoard(){
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
        category
    };
}


/**
 * Saves the current state of `allContacts` array to storage.
 */
async function saveToStorage() {
    await setItem('tasks', JSON.stringify(allTasks));
}

/**
 * Asynchronously loads tasks from storage. If tasks are found, it updates the global tasks array with these tasks.
 * If no tasks are found or an error occurs during the loading process, it either logs that no tasks were found or warns of an error,
 * and resets the global tasks array to an empty array.
 * @async
 */
async function loadTasksFromStorage() {
    try {
        const tasksString = await getItem('tasks');
        if (tasksString) {
            const tasks = JSON.parse(tasksString);
            allTasks = tasks;     // Update the global tasks array
        } else {
            console.log('No tasks found. Starting with an empty task list.');
        }
    } catch (e) {
        console.warn('Could not load tasks:', e);
        allTasks = [];               // Reset the tasks array on failure
    }
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
    contactListContainer.innerHTML = '';

    for (let i = 0; i < allContacts.length; i++) {
        const contact = allContacts[i];
        const isChecked = isSelected(contact);
        contactListContainer.innerHTML += generateContactHTML(contact, i, isChecked);
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
    container.innerHTML = ''; // Clear the container first

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
    console.log(selectedContacts);
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
    subtaskContainer.innerHTML = '';
    for (let index = 0; index < subtasks.length; index++) {
        const subtaskText = subtasks[index];
        const subtaskItemHTML = createSubtaskTemplate(subtaskText, index);
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskItemHTML);
    }
}


/**
 * Clears the text from the subtask input field and toggles the add button image based on the current input.
 */
function clearInputField() {
    const subtaskInput = document.getElementById('subTaskInput');
    subtaskInput.value = '';
    toggleAddButtonImage();
}


/**
 * Toggles the add button image, visibility, and functionality based on the subtask input's value.
 */
function toggleAddButtonImage() {
    const subtaskInputValue = document.getElementById('subTaskInput').value.trim();
    const isInputNotEmpty = subtaskInputValue !== '';
    updateAddButton(isInputNotEmpty);
    updateElementVisibility(document.getElementById('closeBtn'), isInputNotEmpty);
    updateElementVisibility(document.getElementById('sub-seperator'), isInputNotEmpty);
}

/**
 * Updates the add button's source, display, and onclick event based on the input value.
 * @param {boolean} isInputNotEmpty - Indicates whether the input contains text.
 */
function updateAddButton(isInputNotEmpty) {
    const addButtonImage = document.getElementById('addBtn');
    addButtonImage.src = isInputNotEmpty ? 'assets/img/icons/check_blue.png' : 'assets/img/icons/add.png';
    addButtonImage.style.display = 'block';
    addButtonImage.onclick = isInputNotEmpty ? addSubtask : null;
}

/**
 * Updates the visibility of an element based on the specified condition.
 * @param {HTMLElement} element - The DOM element to update.
 * @param {boolean} shouldDisplay - Determines whether the element should be displayed.
 */
function updateElementVisibility(element, shouldDisplay) {
    element.style.display = shouldDisplay ? 'block' : 'none';
}


/**
 * Toggles the 'active' state of priority buttons and updates the selectedPriority.
 * It ensures only one priority is active at a time by managing an array of selected priorities.
 * @param {string} buttonId - The ID of the button that was clicked.
 */
function togglePriority(buttonId) {
    event.preventDefault();
    const button = document.getElementById(buttonId);
    const priority = button.getAttribute('data-priority');
    if (!selectedPriority.includes(priority)) {
        document.querySelectorAll('.priority-button').forEach(btn => {
            btn.classList.remove('active');
        });
        selectedPriority = [priority];
        button.classList.add('active');
    }
}


/**
 * Checks if the input field with the specified ID is filled out.
 * @param {string} id - The ID of the input field to check.
 * @returns {boolean} True if the field is filled, false otherwise.
 */
function checkIsFieldFilled(id) {
    let content = document.getElementById(id);
    return content.value.length > 0;
}


/**
 * Adds an "input-error" class to the element with the specified ID and displays an error message
 * if an errorMessageId is provided.
 * @param {string} id - The ID of the element to add the error class to.
 * @param {string} [errorMessageId] - The ID of the element where the error message will be displayed.
 */
function setRedBorder(id, errorMessageId) {
    let element = document.getElementById(id);
    element.classList.add("input-error");
    if (errorMessageId) {
        let errorMessageElement = document.getElementById(errorMessageId);
        errorMessageElement.textContent = "This field is required";
        errorMessageElement.style.display = 'block';
    }
}


/**
 * Validates all task input fields by checking the title, due date, and category.
 * @returns {boolean} True if all validations pass, false otherwise.
 */
function validateTaskInputs() {
    let isTitleValid = validateTitle();
    let isDueDateValid = validateDueDate();
    let isCategoryValid = validateCategory();
    return isTitleValid && isDueDateValid && isCategoryValid;
}


/**
 * Validates the title input field to ensure it is filled out.
 * Sets a red border if validation fails.
 * @returns {boolean} True if the title field is filled, false otherwise.
 */
function validateTitle() {
    const titleIsValid = checkIsFieldFilled('title');
    if (!titleIsValid) {
        setRedBorder('title', 'title-error-message');
    }
    return titleIsValid;
}


/**
 * Validates that a task category has been selected and is not the default option.
 * Sets a red border if validation fails.
 * @returns {boolean} True if a valid category is selected, false otherwise.
 */
function validateCategory() {
    let selectedCategory = document.getElementById('selected-option').textContent;
    const categoryIsValid = selectedCategory !== 'Select task category';
    if (!categoryIsValid) {
        setRedBorder('select-dropdown', 'category-error-message');
    }
    return categoryIsValid;
}


/**
 * Checks if a given date string represents a date that is in the future relative to the current date.
 * @param {string} dateString - The date string to check.
 * @returns {boolean} True if the date is in the future, false otherwise.
 */
function isDateValidAndFuture(dateString) {
    const dueDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return dueDate >= currentDate;
}


/**
 * Displays an error message related to a specific input field and adds an error class to that field.
 * @param {HTMLElement} element - The element where the error message will be displayed.
 * @param {string} message - The error message to display.
 * @param {HTMLElement} inputField - The input field associated with the error.
 */
function showErrorMessage(element, message, inputField) {
    element.textContent = message;
    element.style.display = 'block';
    inputField.classList.add('input-error');
}


/**
 * Clears the displayed error message for a specific input field and removes the error class from that field.
 * @param {HTMLElement} element - The element where the error message was displayed.
 * @param {HTMLElement} inputField - The input field associated with the error.
 */
function clearErrorMessage(element, inputField) {
    element.style.display = 'none';
    inputField.classList.remove('input-error');
}


/**
 * Hides validation error visual cues for a specific input field, if an error message ID is provided,
 * also hides the error message.
 * @param {string} id - The ID of the input field.
 * @param {string} [errorMessageId] - The ID of the error message element.
 */
function hideValidationError(id, errorMessageId) {
    let element = document.getElementById(id);
    element.classList.remove("input-error");
    if (errorMessageId) {
        let errorMessageElement = document.getElementById(errorMessageId);
        errorMessageElement.style.display = 'none';
    }
}


/**
 * Validates the due date input to ensure it's in the future.
 * Displays or clears the error message based on the validation result.
 * @returns {boolean} True if the due date is valid and in the future, false otherwise.
 */
function validateDueDate() {
    const dueDateInput = document.getElementById('dueDate');
    const errorMessageElement = document.getElementById('date-error-message');
    const isDueDateValid = isDateValidAndFuture(dueDateInput.value);
    if (isDueDateValid) {
        clearErrorMessage(errorMessageElement, dueDateInput);
    } else {
        showErrorMessage(errorMessageElement, "Due date cannot be in the past.", dueDateInput);
    }
    return isDueDateValid;
}


/**
 * Determines if a click event's target is within a specified element.
 * 
 * @param {string} elementId - The ID of the target element.
 * @param {EventTarget} target - The click event's target.
 * @returns {boolean} True if target is inside the element, false otherwise.
 */
function isClickInside(elementId, target) {
    const element = document.getElementById(elementId);
    return element && element.contains(target);
}


/**
 * Toggles the visibility of a dropdown menu, hiding it if visible, and resets the arrow icon's rotation.
 * 
 * @param {string} menuId - The ID of the dropdown menu.
 * @param {string} arrowIconId - The ID of the associated arrow icon.
 */
function closeDropdownMenu(menuId, arrowIconId) {
    const dropdownMenu = document.getElementById(menuId);
    const arrowIcon = document.getElementById(arrowIconId);
    const isVisible = dropdownMenu.classList.contains('visible') || dropdownMenu.style.display === 'flex';
    if (isVisible) {
        if (dropdownMenu.classList.contains('visible')) {
            dropdownMenu.classList.remove('visible');
        } else {
            dropdownMenu.style.display = 'none';
        }
        if (arrowIcon) {
            arrowIcon.style.transform = '';
        }
    }
}


/**
 * Handles document-wide click events to close dropdown menus if clicked outside.
 * This listener checks clicks against the 'assignedTo' and 'category' dropdowns.
 * It closes a dropdown if the click occurred outside its area or its associated input.
 */
document.addEventListener('click', function (event) {
    if (!isClickInside('assignedTo', event.target) && !isClickInside('assign-dropdown-menu', event.target)) {
        closeDropdownMenu('assign-dropdown-menu', 'arrow-assign-to');
    }
    if (!isClickInside('selected-option', event.target) && !isClickInside('category-dropdown-menu', event.target)) {
        closeDropdownMenu('category-dropdown-menu', 'arrow-category');
    }
});


/**
* Initiates and displays a confirmation window with a specified message.
* @param {string} message - The message to be displayed in the confirmation window.
*/
function initiateConfirmation(message) {
    const confirmation = document.getElementById('add-task-confirmation');
    confirmation.innerHTML = message;
    confirmation.style.display = 'flex';
    confirmation.style.animation = `slideInUp 0.5s ease-in-out forwards`;

    setTimeout(() => {
        // Starte die Ausflug-Animation
        confirmation.style.animation = `slideOutDown 0.5s ease-in-out forwards`;
        confirmation.addEventListener('animationend', () => {
            confirmation.style.display = 'none'; // Verstecke den Container am Ende der Ausflug-Animation
        }, { once: true });
    }, 2000); // Die Zeit, die der Container sichtbar bleibt, bevor er wieder herausfliegt
}


/**
 * Shows a confirmation message upon successful task creation.
 */
function showCreationConfirmation() {
    initiateConfirmation('Contact successfully created');
}