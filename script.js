let allTasks = [];
let allContacts = [];
let selectedContacts = [];
let subtasks = [];
let selectedPriority = [];


/**
 * Toggles the display of the submenu with ID 'user-sub-menu' between 'flex' and 'none'.
 */
function openSubMenu() {
    let userSubMenu = document.getElementById('user-sub-menu');
    if (userSubMenu.style.display === "flex") {
        userSubMenu.style.display = "none";
    } else {
        userSubMenu.style.display = "flex";
    }
}


/**
 * Loads and embeds HTML content into elements with 'w3-include-html' attributes from specified URLs.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
    activeMenu();
}


/**
 * Updates the 'active' class on menu items based on the current path.
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