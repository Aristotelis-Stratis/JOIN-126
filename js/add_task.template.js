/**
 * Generates HTML markup for a contact item with a selectable checkbox.
 * @param {Object} contact - The contact object containing the details to display.
 * @param {number} index - The index of the contact in the list, used for unique ID attributes.
 * @param {boolean} isChecked - Determines if the contact is selected (checked) or not.
 * @returns {string} HTML string representing the contact item.
 */
function generateContactHTML(contact, index, isChecked) {
    const checkboxImage = isChecked ? "assets/img/icons/checkbox-checked-black-24.png" : "assets/img/icons/checkbox-empty-black-24.png";
    return `
        <div id="contact-item-${index}" class="contact-item" onclick="toggleContactSelection(${index})">
            <div class="task-contact-item">
                <div class="contact-icon" style="background-color:${contact.color};">
                    ${contact.initials.split('').map(initial => `<span>${initial}</span>`).join('')}
                </div>
                <div class="contact-info">
                    <div class="contact-name">
                        <span id="contact-name-${index}">${contact.name}</span>
                    </div>
                </div>
                <div class="task-contact-checkbox">
                    <img id="checkbox-${index}" src="${checkboxImage}">
                </div>
            </div>
        </div>
    `;
}


/**
 * Creates an HTML template for a subtask item.
 * @param {string} subtaskText - The text content of the subtask.
 * @param {number} subtaskIndex - The index of the subtask, used for unique ID attributes.
 * @returns {string} HTML string representing the subtask item.
 */
function createSubtaskTemplate(subtaskText, subtaskIndex) {
    return `
        <div class="subtask-item" id="subtask_${subtaskIndex}">
            <div>
                &#8226; <span>${subtaskText}</span>
            </div>
            <div class="subtask-item-icons">
                <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtask(${subtaskIndex})">
                <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtask(${subtaskIndex})">
            </div>
        </div>
    `;
}


/**
 * Returns an HTML string for an input field pre-populated with the subtask's text, for editing purposes.
 * @param {string} subtaskText - The current text of the subtask to be edited.
 * @param {number} subtaskIndex - The index of the subtask, used to generate unique IDs for the input field and buttons.
 * @returns {string} HTML markup for the input field and associated action icons.
 */
function createEditInputField(subtaskText, subtaskIndex) {
    return `
        <div class="edit-container">
            <div class="edit-input-field-container">
                <input type="text" id="editInputField_${subtaskIndex}" maxlength="15" class="edit-input-field subtask-edit-input" value="${subtaskText}" onkeydown="handleEditKeyDown(event, ${subtaskIndex})">
            </div>
            <div class="subtask-item-icons">
                <img class="subtask-item-icon" src="assets/img/icons/trash.png" style="border-right: 1px solid rgba(209, 209, 209, 1);" onclick="deleteSubtask(${subtaskIndex})">
                <img class="confirm-edit-icon" src="assets/img/icons/check_blue.png" onclick="updateSubtask(${subtaskIndex})">
            </div>
        </div>
        <div>
        <span id="error-message" style="display: none; color: red;"></span>
        </div>
    `;
}


/**
 * Generates HTML for a contact's icon, displaying the contact's initials on a colored background.
 * @param {Object} contact - The contact object containing initials and color properties.
 * @returns {string} HTML string for the contact's icon.
 */
function createContactIconHTML(contact) {
    const initialsHTML = contact.initials.split('').map(initial => `<span>${initial}</span>`).join('');
    return `<div class="contact-icon" style="background-color:${contact.color};">${initialsHTML}</div>`;
}