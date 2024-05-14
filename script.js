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


// async function checkAuthentication() {
//     const currentUser = await loadCurrentUser();
//     if (!currentUser) {
//         // Kein Benutzer eingeloggt, weiterleiten zur Login-Seite
//         console.log("Kein Benutzer eingeloggt, Umleitung zur Login-Seite.");
//         window.location.href = 'login.html';
//     } else {
//         console.log("Eingeloggt als:", currentUser.name);
//     }
// }

// "theoretisch" in jeder datei einmal folgendes setzen und dies dann später löschen
// currentUser = await loadCurrentUser();
// 
//
// async function loadCurrentUser() {
//     try {
//         const userString = await getItem('currentUser');
//         if (userString) {
//             currentUser = JSON.parse(userString);
//             console.log(" Benutzer geladen:", currentUser);
//             setProfileInitials();
//             return currentUser;
//         } else {
//             console.log("Keine aktuellen Benutzerdaten gefunden.");
//             return null;
//         }
//     } catch (error) {
//         console.error("Fehler beim Laden des aktuellen Benutzers:", error);
//         return null;
//     }
// }


// Diese Funktion sollte an einem zentralen Ort aufgerufen werden, zum Beispiel direkt nach dem Login.
async function loadCurrentUser() {
    try {
        const cleanedEmail = localStorage.getItem('cleanedEmail');
        const userId = localStorage.getItem('currentUserId');

        // Konstruieren Sie den Pfad für die Firebase-Anfrage.
        let path;
        if (cleanedEmail && userId) {
            path = `users/${cleanedEmail}/${userId}`;
        } else {
            console.error("Keine gereinigte E-Mail-Adresse oder Benutzer-ID im Local Storage gefunden.");
            return; // Frühes Beenden der Funktion, falls keine gültigen Daten vorhanden sind
        }

        // Lade die Benutzerdaten basierend auf dem konstruierten Pfad.
        const userData = await loadData(path);

        if (userData && userData.name) { // Überprüfen Sie auch, ob ein Name vorhanden ist
            currentUser = { id: userId, data: userData }; // Speichern Sie die vollständigen Benutzerdaten in currentUser
            setProfileInitials();  // Aufruf hier, nachdem currentUser aktualisiert wurde
            await loadAllContacts(); // Funktion zum Laden aller Kontakte des Benutzers
        } else {
            console.error("Keine vollständigen Benutzerdaten gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Laden des aktuellen Benutzers:", error);
    }
}


// async function saveCurrentUser() {
//     if (currentUser) {
//         console.log("Speichere aktuellen Benutzer: ", currentUser);
//         try {
//             // Stellen Sie sicher, dass die Änderungen auch im allUsers Array gespeichert werden
//             const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
//             if (userIndex !== -1) {
//                 allUsers[userIndex] = currentUser;
//                 await setItem('allUsers', JSON.stringify(allUsers)); // Speichern des gesamten Benutzerarrays
//             }
//             const result = await setItem('currentUser', JSON.stringify(currentUser));
//             console.log("Speichern erfolgreich: ", result);
//         } catch (error) {
//             console.error("Fehler beim Speichern des aktuellen Benutzers:", error);
//         }
//     } else {
//         console.error("Kein aktueller Benutzer zum Speichern.");
//     }
// }

async function logoutCurrentUser() {
    try {
        // Lösche den `currentUserId`, den `currentUser` und den `cleanedEmail` aus dem localStorage
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cleanedEmail');
        console.log('User has been logged out.');

        // Setze einen Timeout, bevor die Seite zur Login-Seite umgeleitet wird
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2500);
    } catch (error) {
        console.error('Failed to logout current user:', error);
    }
}

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


function checkUserLogin() {
    loadCurrentUser().then(currentUser => {
        if (!currentUser) {
            // Kein Benutzer ist eingeloggt
            const menuChoices = document.querySelectorAll('.menu-choice');
            const profileContainers = document.querySelectorAll('.profile-container');
            menuChoices.forEach(menu => menu.style.display = 'none');
            profileContainers.forEach(profile => profile.style.display = 'none');
        }
    });
}

/**
 * Loads and embeds HTML content into elements with 'w3-include-html' attributes from specified URLs.
 */
async function includeHTML(callback) {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    if (callback && typeof callback === "function") {
        callback();
    }

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
    // loadAllUsersFromStorage();
}

// async function loadAllUsersFromStorage() {
//     try {
//         const usersString = await getItem('allUsers');
//         if (usersString) {
//             allUsers = JSON.parse(usersString);
//             console.log("All users loaded from storage:", allUsers);
//         } else {
//             console.log("No user data found in storage.");
//             allUsers = []; // Initialize to an empty array if no data is found
//         }
//     } catch (error) {
//         console.error("Error loading all users from storage:", error);
//         allUsers = []; // Initialize to an empty array in case of error
//     }
// }

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


// async function loadTasksFromStorage() {
//     try {
//         const tasksString = await getItem('tasks');
//         if (tasksString) {
//             const tasks = JSON.parse(tasksString);
//             allTasks = tasks;     // Update the global tasks array
//         } else {
//             console.log('No tasks found. Starting with an empty task list.');
//         }
//     } catch (e) {
//         console.warn('Could not load tasks:', e);
//         allTasks = [];               // Reset the tasks array on failure
//     }
// }


function setProfileInitials() {
    if (currentUser && currentUser.data && currentUser.data.name) {
        const initials = currentUser.data.name.split(' ').map((part) => part[0]).join('').toUpperCase(); // Stellen Sie sicher, dass die Initialen in Großbuchstaben sind
        const profileInitialsSpans = document.querySelectorAll('#profile-button span');
        profileInitialsSpans.forEach((span, index) => {
            span.textContent = initials[index] || '';  // Setzt die Initialen oder leert den Text, falls keine Initialen vorhanden sind
        });
    }
}


/**
 * Generates initials from a given name. If the name consists of multiple parts, initials of the first and last parts are used.
 * @param {string} name - The full name from which to generate initials.
 * @return {string} The generated initials, in uppercase.
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
 * @return {string} The generated hex color code.
 */
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Generates a unique identifier using the current timestamp and a random string.
 * @return {string} The generated unique identifier.
 */
function generateUniqueId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}