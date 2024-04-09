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

function createEditInputField(subtaskText, subtaskIndex) {
    return `
        <div class="edit-container">
            <div class="edit-input-field-container">
                <input type="text" id="editInputField_${subtaskIndex}" maxlength="15" class="edit-input-field subtask-edit-input" value="${subtaskText}">
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

function createContactIconHTML(contact) {
    const initialsHTML = contact.initials.split('').map(initial => `<span>${initial}</span>`).join('');
    return `<div class="contact-icon" style="background-color:${contact.color};">${initialsHTML}</div>`;
}