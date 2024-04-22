let allTasks = [];
let allContacts = [];
let selectedContacts = [];
let subtasks = [];
let selectedPriority = [];

async function checkAuthentication() {
    const currentUser = await loadCurrentUser();
    if (!currentUser) {
        // Kein Benutzer eingeloggt, weiterleiten zur Login-Seite
        console.log("Kein Benutzer eingeloggt, Umleitung zur Login-Seite.");
        window.location.href = 'login.html';
    } else {
        console.log("Eingeloggt als:", currentUser.name);
        // Führe zusätzliche Initialisierungen hier durch, wenn nötig
    }
}


async function loadCurrentUser() {
    try {
        const userString = await getItem('currentUser');
        if (userString) {
            currentUser = JSON.parse(userString);
            console.log("Aktueller Benutzer geladen:", currentUser);
            return currentUser;
            // if (!currentUser.data) {
            //     currentUser.data = { contacts: [], tasks: [], board: {}, summary: {} };
            //     console.log("Keine Daten gefunden, Initialisierung leerer Datenstrukturen.");
            // }
        } else {
            console.log("Keine aktuellen Benutzerdaten gefunden.");
            // currentUser = null;
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Laden des aktuellen Benutzers:", error);
        // currentUser = null;
        return null;
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