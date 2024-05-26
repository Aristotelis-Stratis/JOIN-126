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
* Initiates and displays a confirmation window with a specified message.
* @param {string} message - The message to be displayed in the confirmation window.
*/
function initiateConfirmation(message) {
    const confirmation = document.getElementById('add-task-confirmation');
    confirmation.innerHTML = message;
    confirmation.style.display = 'flex';
    confirmation.style.animation = `slideInUp 0.5s ease-in-out forwards`;

    setTimeout(() => {
        confirmation.style.animation = `slideOutDown 0.5s ease-in-out forwards`;
        confirmation.addEventListener('animationend', () => {
            confirmation.style.display = 'none';
        }, { once: true });
    }, 2000);
}


/**
 * Shows a confirmation message upon successful task creation.
 */
function showCreationConfirmation() {
    initiateConfirmation('Contact successfully created');
}


/**
 * Determines if a click event's target is within a specified element.
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
 * @param {string} menuId - The ID of the dropdown menu.
 * @param {string} arrowIconId - The ID of the associated arrow icon.
 */
function closeDropdownMenu(menuId, arrowIconId) {
    const dropdownMenu = document.getElementById(menuId);
    const arrowIcon = document.getElementById(arrowIconId);
    if (dropdownMenu && arrowIcon) {
        const isVisible = dropdownMenu.classList.contains('visible') || dropdownMenu.style.display === 'flex';
        if (isVisible) {
            if (dropdownMenu.classList.contains('visible')) {
                dropdownMenu.classList.remove('visible');
            } else {
                dropdownMenu.style.display = 'none';
            }
            arrowIcon.style.transform = '';
        }
    }
}


/**
 * Handles key down events on the subtask input field.
 * Specifically, it checks for the 'Enter' key to add a subtask without submitting the form.
 * @param {KeyboardEvent} event - The event object that contains information about the key pressed.
 */
function handleSubtaskKeyDown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask();
    }
}


/**
 * Handles key down events on the editSubtask input field.
 * Specifically, it checks for the 'Enter' key to add a subtask without submitting the form.
 * @param {KeyboardEvent} event - The event object that contains information about the key pressed.
 */
function handleEditKeyDown(event, subtaskIndex) {
    if (event.key === "Enter") {
        event.preventDefault();
        updateSubtask(subtaskIndex);
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