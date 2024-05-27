/**
 * Generates HTML markup for a new contact item.
 * @param {Object} contact - The contact object containing details.
 * @param {number} index - The index of the contact.
 * @returns {string} The HTML markup for the contact item.
 */
function createNewContactHTML(contact, index) {
    const initials = contact.initials || '';
    return `
    <div id="contact-item-${index}" class="contact-item">
        <div class="contact-container" onclick="openContactDetails(${index})">
            <div class="contact-icon" style="background-color:${contact.color || randomColor()};">
                <span>${initials.charAt(0)}</span>
                ${initials.length > 1 ? `<span>${initials.charAt(1)}</span>` : ''}
            </div>
            <div class="contact-info">
                <div class="contact-name">
                    <span id="contact-name-${index}">${contact.name}</span>
                </div>
                <div class="contact-email">
                    <span id="contact-email-${index}">${contact.email}</span>
                </div>
                <div class="contact-number">
                    <span id="contact-number-${index}" style="display:none">${contact.number}</span>
                </div>
            </div>
        </div>
    </div>
    `;
}


/**
 * Generates HTML markup for displaying contact details.
 * @param {Object} contact - The contact object containing details.
 * @param {number} index - The index of the contact.
 * @returns {string} The HTML markup for contact details.
 */
function contactDetailsHTML(contact, index) {
    return `
        <div class="contacts-title-bar">
            <h1>Contacts</h1>
            <div class="seperator-vertical"></div>
            <span>Better with a team</span>
            <div class="seperator-mobile"></div>
        </div>
        <div class="contact-details" id="contact-overview">
            <div class="details-1">
                <div class="details-1-icon" id="details-1-icon"style="background-color:${contact.color}">
                    <span>${contact.initials.split("").join("</span><span>")}</span>
                </div>

                <div class="details-1-name-container">
                    <div class="details-1-name">
                        <span>${contact.name}</span>
                    </div>
                    <div class="details-1-edit">
                        <div class="edit-contact" onclick="editContact('${contact.id}')">
                            <img src="assets/img/icons/edit_dark.png" alt="Edit">
                            <span class="details-1-text">Edit</span>
                        </div>
                        <div class="delete-contact" onclick="deleteContact('${contact.id}')">
                            <img src="assets/img/icons/trash.png" alt="Delete">
                            <span>Delete</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="details-2">
                <div class="contact-information-text">
                    <span>Contact Information</span>
                </div>
            </div>
            <div class="details-3">
                <div class="details-3-category">
                    <span>Email</span>
                </div>
                <div class="email-text">
                    <span class="contact-email">${contact.email}</span>
                </div>
                <div class="details-3-category">
                    <span>Phone</span>
                </div>
                <div class="phone-number">
                    <span>${contact.number}</span>
                </div>
            </div>

        </div>

        <button class="edit-mobile" onclick="openEditMobileMenu()">
        <img src="assets/img/icons/more.png" alt="Add Contact">
        <div class="edit-menu d-none" id="edit-sub-menu">
            <div class="edit-menu-choice" onclick="editContact('${contact.id}')">
                <img class="tw" src="assets/img/icons/edit_white.png" alt="Edit">
                <span class="edit-menu-1-text">Edit</span>
            </div>
            <div class="edit-menu-choice" onclick="deleteContact('${contact.id}')">
                <img class="tw" src="assets/img/icons/trash_white.png" alt="Delete">
                <span class="edit-menu-1-text">Delete</span>
            </div>
        </div>
    </button>
    `;
}


/**
 * Generates HTML markup for a letter container.
 * @param {string} initial - The initial letter for the container.
 * @returns {string} The HTML markup for the letter container.
 */
function createLetterContainerHTML(initial) {
    return `
        <div class="letter-container">
            <div class="letter"><span>${initial}</span></div>
        </div>
        <div class="seperator"></div>
    `;
}