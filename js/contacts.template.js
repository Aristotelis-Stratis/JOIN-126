/**
 * Creates HTML markup for a new contact entry.
 * 
 * @param {Object} contact - The contact object containing the contact details.
 * @param {number} index - The index of the contact in the contact list array.
 * @returns {string} HTML string representing the contact item.
 */
function createNewContactHTML(contact, index) {
    return `
    <div id="contact-item-${index}" class="contact-item">
        <div class="contact-container" onclick="openContactDetails(${index})">
            <div class="contact-icon" style="background-color:${contact.color};">
                <span>${contact.initials.charAt(0)}</span>
                ${contact.initials.length > 1 ? `<span>${contact.initials.charAt(1)}</span>` : ''}
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
 * Generates the HTML content for displaying the detailed information of a contact.
 * 
 * @param {Object} contact - The contact object containing details to be displayed.
 * @param {number} index - The index of the contact in the contact list array.
 * @returns {string} HTML string for the detailed view of a contact.
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
                        <div class="edit-contact" onclick="editContact(${index})">
                            <img src="assets/img/icons/edit_dark.png" alt="Edit">
                            <span class="details-1-text">Edit</span>
                        </div>
                        <div class="delete-contact" onclick="deleteContact(${index})">
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
            <div class="edit-menu-choice" onclick="editContact(${index})">
                <img class="tw" src="assets/img/icons/edit_white.png" alt="Edit">
                <span class="edit-menu-1-text">Edit</span>
            </div>
            <div class="edit-menu-choice" onclick="deleteContact(${index})">
                <img class="tw" src="assets/img/icons/trash_white.png" alt="Delete">
                <span class="edit-menu-1-text">Delete</span>
            </div>
        </div>
    </button>
    `;
}


/**
 * Creates HTML markup for a container that groups contacts by their starting letter.
 * 
 * @param {string} initial - The initial letter to create a group container for.
 * @returns {string} HTML string representing the container for a specific letter.
 */
function createLetterContainerHTML(initial) {
    return `
        <div class="letter-container">
            <div class="letter"><span>${initial}</span></div>
        </div>
        <div class="seperator"></div>
    `;
}