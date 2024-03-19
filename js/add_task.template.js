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