/**
 * Creates a new user object based on the provided username, email, and password.
 * 
 * @param {string} username - The username of the new user.
 * @param {string} email - The email of the new user.
 * @param {string} password - The password of the new user.
 * @returns {Object} The new user object.
 */
function createNewUser(username, email, password) {
    const initials = getInitials(username);

    return {
        name: username,
        email: email,
        password: password,
        contacts: [{
            id: generateUniqueId(),
            color: randomColor(),
            name: username,
            email: email,
            number: "",
            initials: initials
        }],
        board: {
            todo: [
                {
                    id: generateUniqueId(),
                    title: "TestTask",
                    description: "TestDescription",
                    dueDate: "2024-12-12",
                    priority: "urgent",
                    contacts: [],
                    subtasks: [
                        { text: "TestSubtask", completed: false }
                    ],
                    status: "todo",
                    category: "User Story"
                }
            ],
            inProgress: [],
            awaitFeedback: [],
            done: []
        },
        summary: {}
    };
}


/**
 * Ensures that a guest user exists in the system. If not, creates a new guest user.
 */
async function ensureGuestUserExists() {
    let guestEmail = "guest@example.com";
    let cleanedEmail = guestEmail.replace(/[^\w\s]/gi, '');
    let guestUserId = "guest";

    let path = `users/${cleanedEmail}/${guestUserId}`;
    let guestUser = await loadData(path);

    if (!guestUser || !guestUser.contacts) {
        let newUser = createGuestUser(guestEmail);
        let response = await updateData(path, newUser);
    }
}

/**
 * Creates a new guest user object with predefined details.
 * 
 * @param {string} email - The email of the guest user.
 * @returns {Object} The new guest user object.
 */
function createGuestUser(email) {
    return {
        name: "Guest",
        email: email,
        password: "",
        contacts: [{
            id: generateUniqueId(),
            color: randomColor(),
            name: "Max Mustermann",
            email: "max@mustermann.com",
            number: "+4912345690",
            initials: "MM"
        }],
        board: {
            todo: [
                {
                    id: generateUniqueId(),
                    title: "TestTask",
                    description: "TestDescription",
                    dueDate: "2012-12-12",
                    priority: "urgent",
                    contacts: [],
                    subtasks: [
                        { text: "TestSubtask", completed: false }
                    ],
                    status: "todo",
                    category: "User Story"
                }
            ],
            inProgress: [],
            awaitFeedback: [],
            done: []
        },
        summary: {}
    };
}