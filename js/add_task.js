let allContacts = [];
let selectedContacts = [];

async function init() {
    await loadContactsToTasks();
    initValidation();
    console.log(allContacts);
    console.log(selectedContacts);
    renderTaskContactList();
}


/**
 * Initializes the application by loading contacts and rendering them.
 */
async function init() {
    await loadContactsToTasks();
    console.log(allContacts);
    console.log(selectedContacts);
    renderTaskContactList();
}


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
function toggleContactSelection(index, element) {
    const contact = allContacts[index];

    if (isSelected(contact)) {
        removeContact(contact);
        setCheckboxImage(element, false);
    } else {
        addContact(contact);
        setCheckboxImage(element, true);
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
    const taskContactItem = element.closest('.task-contact-item');
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
    let dropdownMenu = document.getElementById('category-dropdown-menu');
    let arrow = document.getElementById('arrow-category');
    dropdownMenu.classList.toggle('visible');
    arrow.classList.toggle('rotate-180');
}


/**
 * Sets the selected category based on the provided index.
 * @param {number} index - The index of the selected category.
 */
function setSelectedCategory(index) {
    const categoryNames = ['Technical Task', 'User Story'];
    const categoryName = categoryNames[index - 1];
    document.getElementById('category').value = categoryName;
    toggleCategoryDropdownMenu();
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
 * Toggles the visibility of the subtask dropdown menu.
 */
function toggleSubtaskDropdownMenu() {
    let dropdownMenu = document.getElementById('subtask-dropdown-menu');
    dropdownMenu.classList.toggle('visible');
}

function assignSelectedContact() { }


//Input Validation
function validateInput(input) {
    if (input.classList.contains('no-validate')) {
        return;
    }

    if (input.value.trim() === '') {
        input.classList.add('input-error');
        input.nextElementSibling.style.display = 'block';
    } else {
        input.classList.remove('input-error');
        input.nextElementSibling.style.display = 'none';
    }
}

function initValidation() {
    const inputs = document.querySelectorAll('input[type=text], input[type=date], textarea');
    inputs.forEach(input => {
        input.onblur = function () {
            validateInput(input);
        };

        input.oninput = function () {
            if (input.value.trim() !== '') {
                input.classList.remove('input-error');
                input.nextElementSibling.style.display = 'none';
            }
        };
    });
}


//Button priority
function togglePriority(element, priority) {
    var priorityButtons = document.getElementsByClassName('priority-button');

    for (var i = 0; i < priorityButtons.length; i++) {
        priorityButtons[i].classList.remove('active');
    }

    element.classList.add('active');
}

// document.addEventListener('DOMContentLoaded', initValidation);

