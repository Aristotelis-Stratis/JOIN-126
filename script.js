let allTasks = [];
let allContacts = [];
let selectedContacts = [];
let subtasks = [];
let selectedPriority = [];
let allUsers = [];
let currentUser;
const guestUser = {
    id: 'guest',
    name: 'Guest User',
    email: 'guest@example.com',
    password: '',
    data: {
        contacts: [],
        tasks: [],
        board: {},
        summary: {}
    }
};


async function loadCurrentUser() {
    try {
        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');

        let path;
        if (cleanedEmail && userId) {
            path = `users/${cleanedEmail}/${userId}`;
        } else {
            console.error("Keine gereinigte E-Mail-Adresse oder Benutzer-ID im Local Storage gefunden.");
            return null; 
        }

        const userData = await loadData(path);

        if (userData && userData.name) { 
            currentUser = { id: userId, data: userData };
            //await loadAllContacts();
            return currentUser;
        } else {
            console.error("Keine vollständigen Benutzerdaten gefunden.");
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Laden des aktuellen Benutzers:", error);
        return null;
    }
}


async function logoutCurrentUser() {
    try {
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cleanedEmail');
        console.log('User has been logged out.');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2500);
    } catch (error) {
        console.error('Failed to logout current user:', error);
    }
}


function openSubMenu() {
    let userSubMenu = document.getElementById('user-sub-menu');
    if (userSubMenu.style.display === "flex") {
        userSubMenu.style.display = "none";
    } else {
        userSubMenu.style.display = "flex";
    }
}


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


function setProfileInitials() {
    if (currentUser && currentUser.data && currentUser.data.name) {
        const initials = currentUser.data.name.split(' ').map((part) => part[0]).join('').toUpperCase();
        const profileInitialsSpans = document.querySelectorAll('#profile-button span');
        profileInitialsSpans.forEach((span, index) => {
            span.textContent = initials[index] || '';
        });
    }
}



function getInitials(name) {
    let parts = name.split(' ');
    if (parts.length > 1) {
        let initials = parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
        return initials.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}


function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}


function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}