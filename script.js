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