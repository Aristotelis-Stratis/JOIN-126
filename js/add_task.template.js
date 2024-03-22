function generateContactHTML(contact, index) {
    return `
        <div id="contact-item-${index}" class="contact-item">
            <div class="task-contact-item">
                <div class="contact-icon" style="background-color:${contact.color};">
                    ${contact.initials.split('').map(initial => `<span>${initial}</span>`).join('')}
                </div>
                <div class="contact-info">
                    <div class="contact-name">
                        <span id="contact-name-${index}">${contact.name}</span>
                    </div>
                </div>
                <div class="task-contact-checkbox" onclick="toggleContactSelection(${index}, this)">
                    <img id="checkbox-${index}" src="assets/img/icons/box_unchecked.png">
                </div>
            </div>
        </div>
    `;
}


function createSubtaskTemplate(subtaskText, subtaskIndex) {
    return `
        <div class="subtask-item" data-index="${subtaskIndex}">
            <div>
                &#8226; <span>${subtaskText}</span>
            </div>
            <div class="subtask-item-icons">
                <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="">
                <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtask(${subtaskIndex})">
            </div>
        </div>
    `;
}
