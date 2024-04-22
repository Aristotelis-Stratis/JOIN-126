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


async function checkAuthentication() {
    const currentUser = await loadCurrentUser();
    if (!currentUser) {
        // Kein Benutzer eingeloggt, weiterleiten zur Login-Seite
        console.log("Kein Benutzer eingeloggt, Umleitung zur Login-Seite.");
        window.location.href = 'login.html';
    } else {
        console.log("Eingeloggt als:", currentUser.name);
    }
}


async function loadCurrentUser() {
    try {
        const userString = await getItem('currentUser');
        if (userString) {
            currentUser = JSON.parse(userString);
            console.log(" Benutzer geladen:", currentUser);
            setProfileInitials();
            return currentUser;
        } else {
            console.log("Keine aktuellen Benutzerdaten gefunden.");
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Laden des aktuellen Benutzers:", error);
        return null;
    }
}

async function saveCurrentUser() {
    if (currentUser) {
        console.log("Speichere aktuellen Benutzer: ", currentUser);
        try {
            // Stellen Sie sicher, dass die Änderungen auch im allUsers Array gespeichert werden
            const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                allUsers[userIndex] = currentUser;
                await setItem('allUsers', JSON.stringify(allUsers)); // Speichern des gesamten Benutzerarrays
            }
            const result = await setItem('currentUser', JSON.stringify(currentUser));
            console.log("Speichern erfolgreich: ", result);
        } catch (error) {
            console.error("Fehler beim Speichern des aktuellen Benutzers:", error);
        }
    } else {
        console.error("Kein aktueller Benutzer zum Speichern.");
    }
}

async function logoutCurrentUser() {
    try {
        console.log("Preparing to log out current user. Current allUsers state:", JSON.stringify(allUsers));

        // Only attempt to save to storage if the array is not empty
        if (allUsers.length > 0) {
            await setItem('allUsers', JSON.stringify(allUsers));
        } else {
            console.error("Attempting to save an empty allUsers array.");
        }
        console.log("Logging out current user.");

        // Instead of setting to null, use an empty string or placeholder object
        await setItem('currentUser', JSON.stringify("")); // Use empty string

        console.log('User has been logged out.');

        // Set a delay before redirecting to the login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000); // Delay of 10000 milliseconds (10 seconds)

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
    loadAllUsersFromStorage();
}

async function loadAllUsersFromStorage() {
    try {
      const usersString = await getItem('allUsers');
      if (usersString) {
        allUsers = JSON.parse(usersString);
        console.log("All users loaded from storage:", allUsers);
      } else {
        console.log("No user data found in storage.");
        allUsers = []; // Initialize to an empty array if no data is found
      }
    } catch (error) {
      console.error("Error loading all users from storage:", error);
      allUsers = []; // Initialize to an empty array in case of error
    }
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


async function loadTasksFromStorage() {
    try {
        const tasksString = await getItem('tasks');
        if (tasksString) {
            const tasks = JSON.parse(tasksString);
            allTasks = tasks;     // Update the global tasks array
        } else {
            console.log('No tasks found. Starting with an empty task list.');
        }
    } catch (e) {
        console.warn('Could not load tasks:', e);
        allTasks = [];               // Reset the tasks array on failure
    }
}


function setProfileInitials() {
    if (currentUser && currentUser.name) {
        const initials = currentUser.name.split(' ').map((part) => part[0]).join('');
        const profileInitialsSpans = document.querySelectorAll('#profile-button span');
        profileInitialsSpans.forEach((span, index) => {
            span.textContent = initials[index] || '';  // Setzt die Initialen oder leert den Text, falls keine Initialen vorhanden sind
        });
    }
}