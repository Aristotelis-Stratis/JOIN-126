let allContacts = [];
let selectedContacts = [];
let subtasks = [];

/**
 * Initializes the application by loading contacts and rendering them.
 */
async function init() {
    await loadContactsToTasks();
    console.log(allContacts);
    console.log(selectedContacts);
    renderTaskContactList();
}


function createTask() { }

/**
 * Loads contacts into the application from storage.
 */
async function loadContactsToTasks() {
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
        contactListContainer.innerHTML += generateContactHTML(contact, i);
    }
}


/**
 * Toggles the selection state of a contact.
 * @param {number} index - The index of the contact in the allContacts array.
 * @param {Element} element - The DOM element of the contact item.
 */
function toggleContactSelection(index) {
    const contactItem = document.getElementById(`contact-item-${index}`);
    const contact = allContacts[index];

    if (isSelected(contact)) {
        removeContact(contact);
        setCheckboxImage(contactItem, false);
    } else {
        addContact(contact);
        setCheckboxImage(contactItem, true);
    }
    console.log(selectedContacts);
}


/**
 * Checks if a contact is selected.
 * @param {Object} contact - The contact object.
 * @returns {boolean} - Returns true if the contact is selected, false otherwise.
 */
function isSelected(contact) {
    return selectedContacts.findIndex(selected => selected.id === contact.id) !== -1;
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
    updateTaskContactItemStyle(element, isChecked);
}


/**
 * Updates the source of the checkbox image.
 * @param {Element} element - The DOM element containing the checkbox.
 * @param {boolean} isChecked - The selection state of the checkbox.
 */
function updateCheckboxImage(element, isChecked) {
    const checkboxImg = element.querySelector('img');
    checkboxImg.src = isChecked ? "assets/img/icons/box_checked.png" : "assets/img/icons/box_unchecked.png";
}


/**
 * Updates the style of the task contact item based on the selection state.
 * @param {Element} element - The DOM element of the task contact item.
 * @param {boolean} isChecked - The selection state of the item.
 */
function updateTaskContactItemStyle(element, isChecked) {
    const taskContactItem = element.closest('.contact-item');
    if (isChecked) {
        setItemSelectedStyle(taskContactItem);
    } else {
        resetItemStyle(taskContactItem);
    }
}


/**
 * Sets the style of a selected item.
 * @param {Element} item - The DOM element of the item.
 */
function setItemSelectedStyle(item) {
    item.style.backgroundColor = 'rgba(42, 54, 71, 1)';
    item.style.color = 'white';
}


/**
 * Resets the style of an item to default.
 * @param {Element} item - The DOM element of the item.
 */
function resetItemStyle(item) {
    item.style.backgroundColor = '';
    item.style.color = '';
}


/**
 * Toggles the visibility of the category dropdown menu and the rotation of the arrow icon.
 */
function toggleCategoryDropdownMenu() {
    var dropdownMenu = document.getElementById("category-dropdown-menu");
    var arrow = document.getElementById("arrow-category");

    if (dropdownMenu.style.display === "flex") {
        dropdownMenu.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
    } else {
        dropdownMenu.style.display = "flex";
        arrow.style.transform = "rotate(180deg)";
    }
}


function setSelectedCategory(index) {
    var categoryNames = ['Technical Task', 'User Story'];
    var selectedCategory = categoryNames[index - 1];
    document.getElementById("selected-option").innerText = selectedCategory;
    document.getElementById("category-todo").value = selectedCategory;
}


/**
 * Toggles the visibility of the assign dropdown menu and the rotation of the arrow icon.
 * Additionally, it renders the task contact list.
 */
function toggleAssignDropdownMenu() {
    let dropdownMenu = document.getElementById('assign-dropdown-menu');
    let arrow = document.getElementById('arrow-assign-to');
    dropdownMenu.classList.toggle('visible');
    arrow.classList.toggle('rotate-180');
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


function assignSelectedContact() { }

//Button priority
function togglePriority(element, priority) {
    var priorityButtons = document.getElementsByClassName('priority-button');

    for (var i = 0; i < priorityButtons.length; i++) {
        priorityButtons[i].classList.remove('active');
    }

    element.classList.add('active');
}



// // Input Validation
// function validateInput(input) {
//     const isNotValid = input.value.trim() === '';
//     input.classList.toggle('input-error', isNotValid);
//     input.nextElementSibling.style.display = isNotValid ? 'block' : 'none';
// }
// function initValidation() {
//     document.querySelectorAll('input[type=text], input[type=date], textarea').forEach(input => {
//         if (!input.classList.contains('no-validate')) {
//             input.onblur = () => validateInput(input);
//             input.oninput = () => input.value.trim() && validateInput(input);
//         }
//     });
// }


//  document.addEventListener('DOMContentLoaded', initValidation);

