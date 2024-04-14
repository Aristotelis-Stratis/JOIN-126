let allTasks = [];
let allContacts = [];
let selectedContacts = [];
let subtasks = [];
let selectedPriority = [];

function openSubMenu() {
    let userSubMenu = document.getElementById('user-sub-menu');
    if (userSubMenu.style.display === "flex") {
        userSubMenu.style.display = "none";
    } else {
        userSubMenu.style.display = "flex";
    }
}

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
}

/**
 * Determines if a click event's target is within a specified element.
 * 
 * @param {string} elementId - The ID of the target element.
 * @param {EventTarget} target - The click event's target.
 * @returns {boolean} True if target is inside the element, false otherwise.
 */
function isClickInside(elementId, target) {
    const element = document.getElementById(elementId);
    return element && element.contains(target);
}


/**
 * Toggles the visibility of a dropdown menu, hiding it if visible, and resets the arrow icon's rotation.
 * 
 * @param {string} menuId - The ID of the dropdown menu.
 * @param {string} arrowIconId - The ID of the associated arrow icon.
 */
function closeDropdownMenu(menuId, arrowIconId) {
    const dropdownMenu = document.getElementById(menuId);
    const arrowIcon = document.getElementById(arrowIconId);
    const isVisible = dropdownMenu.classList.contains('visible') || dropdownMenu.style.display === 'flex';
    if (isVisible) {
        if (dropdownMenu.classList.contains('visible')) {
            dropdownMenu.classList.remove('visible');
        } else {
            dropdownMenu.style.display = 'none';
        }
        if (arrowIcon) {
            arrowIcon.style.transform = '';
        }
    }
}


/**
 * Handles document-wide click events to close dropdown menus if clicked outside.
 * This listener checks clicks against the 'assignedTo' and 'category' dropdowns.
 * It closes a dropdown if the click occurred outside its area or its associated input.
 */
document.addEventListener('click', function (event) {
    if (!isClickInside('assignedTo', event.target) && !isClickInside('assign-dropdown-menu', event.target)) {
        closeDropdownMenu('assign-dropdown-menu', 'arrow-assign-to');
    }
    if (!isClickInside('selected-option', event.target) && !isClickInside('category-dropdown-menu', event.target)) {
        closeDropdownMenu('category-dropdown-menu', 'arrow-category');
    }
});