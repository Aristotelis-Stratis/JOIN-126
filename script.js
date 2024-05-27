let allContacts = [];
let selectedContacts = [];
let selectedPriority = ["medium"];
let currentUser;
let subtasks = [];


/**
 * Loads the current user from local storage and fetches user data.
 * @returns {Object|null} - The current user object or null if not found.
 */
async function loadCurrentUser() {
    try {
        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');
        if (!cleanedEmail || !userId) {
            return null;
        }
        const path = `users/${cleanedEmail}/${userId}`;
        const userData = await loadData(path);
        if (userData?.name) {
            currentUser = { id: userId, data: userData };
            return currentUser;
        }
        return null;
    } catch (error) {
        return null;
    }
}


/**
 * Logs out the current user by removing their data from local storage
 * and redirects to the login page after a short delay.
 */
async function logoutCurrentUser() {
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cleanedEmail');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 250);
}


/**
 * Toggles the user submenu display, hides after 5 seconds if shown.
 */
function openSubMenu() {
    let userSubMenu = document.getElementById('user-sub-menu');
    if (userSubMenu.style.display === "flex") {
        userSubMenu.style.display = "none";
    } else {
        userSubMenu.style.display = "flex";
        setTimeout(() => {
            userSubMenu.style.display = "none";
        }, 5000);
    }
}


/**
 * Checks if the user is logged in. Hides menu and profile elements if not logged in.
 * Executes a callback if provided and the user is logged in.
 * @param {Function} callback - Optional callback to execute if the user is logged in.
 */
function checkUserLogin(callback) {
    loadCurrentUser().then(currentUser => {
        if (!currentUser) {
            const menuChoices = document.querySelectorAll('.menu-choice');
            const profileContainers = document.querySelectorAll('.profile-container');
            menuChoices.forEach(menu => menu.style.display = 'none');
            profileContainers.forEach(profile => profile.style.display = 'none');
        } else if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

/**
 * Loads HTML content into elements with "w3-include-html" attribute.
 * @param {Function} callback - Executes callback if provided and initializes the menu.
 */
async function includeHTML(callback) {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        const file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
    if (callback && typeof callback === "function") {
        callback();
    }
    activeMenu();
}


/**
 * Highlights the active menu item based on the current URL path.
 */
function activeMenu() {
    const menuItems = document.querySelectorAll('.menu-choice a');
    const currentPath = window.location.pathname;
    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href').replace(/^\.\//, '');
        if (currentPath.endsWith(itemPath)) {
            item.closest('.menu-choice').classList.add('active');
        } else {
            item.closest('.menu-choice').classList.remove('active');
        }
    });
}


/**
 * Sets the profile initials based on the current user's name.
 */
function setProfileInitials() {
    if (currentUser && currentUser.data && currentUser.data.name) {
        const initials = currentUser.data.name.split(' ').map((part) => part[0]).join('').toUpperCase();
        const profileInitialsSpans = document.querySelectorAll('#profile-button span');
        profileInitialsSpans.forEach((span, index) => {
            span.textContent = initials[index] || '';
        });
    }
}


/**
 * Returns the initials of a given name.
 * @param {string} name - The full name from which to derive initials.
 * @returns {string} - The initials of the name.
 */
function getInitials(name) {
    let parts = name.split(' ');
    if (parts.length > 1) {
        let initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
        return initials.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}


/**
 * Generates a random hex color code.
 * @returns {string} - A random color in hex format.
 */
function randomColor() {
    let color = Math.floor(Math.random() * 16777215).toString(16);
    while (color.length < 6) {
        color = "0" + color;
    }
    return '#' + color;
}


/**
 * Generates a unique identifier.
 * @returns {string} - A unique identifier string.
 */
function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}