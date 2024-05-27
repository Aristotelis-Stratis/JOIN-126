/**
 * Initializes the summary by loading the current user's board, updating the summary, 
 * displaying greetings, and triggering an animation validation.
 */
async function initSummary() {
    await loadCurrentUserBoard();
    updateSummary();
    displayGreeting('greeting');
    displayGreeting('resp-greeting');
    animationValidation();
}


// function updateSummary() {
//     let path = currentUser.data.board

//     let todo = getById('todos').innerHTML = path.todo.length;
//     let done = getById('done').innerHTML = path.done.length;
//     let inProgress = getById('inProgress').innerHTML = path.inProgress.length;
//     let feedback =  getById('feedback').innerHTML = path.awaitFeedback.length;
//     let urgent = getUrgentTaskData(path);

//     let sum = todo + done + inProgress + feedback;

//     getById('allTasks').innerHTML = sum;
//     getById('urgent').innerHTML = countUrgentTasks(path);

//     try {
//         let test = getById('urgentDate').innerHTML = formatDate(sortTasksByDueDate(urgent)[0]['dueDate']);
//         console.log(test);
//         console.log(currentUser);
//         displayUsername('username');
//         displayUsername('resp-username');
//     } catch (error) {
//         getById('upcomDeadline').innerHTML = '';
//         displayUsername('username');
//         displayUsername('resp-username');
//     }
// }



/**
 * Updates the summary by loading task counts, urgent tasks, and the username.
 */
function updateSummary() {
    const path = currentUser.data.board;
    
    updateTaskCounts(path);
    updateUrgentTasks(path);
    updateUsername();
}


/**
 * Updates the task counts (todos, done, inProgress, feedback) and the total number of tasks.
 * @param {Object} path - An object containing task data.
 */
function updateTaskCounts(path) {
    const todo = setInnerHtmlById('todos', path.todo.length);
    const done = setInnerHtmlById('done', path.done.length);
    const inProgress = setInnerHtmlById('inProgress', path.inProgress.length);
    const feedback = setInnerHtmlById('feedback', path.awaitFeedback.length);

    const totalTasks = todo + done + inProgress + feedback;
    setInnerHtmlById('allTasks', totalTasks);
}


/**
 * Updates the urgent tasks count and the next urgent task's due date.
 * @param {Object} path - An object containing task data.
 */
function updateUrgentTasks(path) {
    const urgentTasks = getUrgentTaskData(path);
    setInnerHtmlById('urgent', countUrgentTasks(path));

    try {
        const nextUrgentTaskDate = formatDate(sortTasksByDueDate(urgentTasks)[0].dueDate);
        setInnerHtmlById('urgentDate', nextUrgentTaskDate);
    } catch (error) {
        setInnerHtmlById('upcomDeadline', '');
    }
}


/**
 * Updates the username in the specified HTML elements.
 */
function updateUsername() {
    displayUsername('username');
    displayUsername('resp-username');
}


/**
 * Sets the inner HTML of an element by its ID and returns the value.
 * @param {string} id - The ID of the HTML element.
 * @param {string|number} value - The value to set as inner HTML.
 * @returns {string|number} The value that was set.
 */
function setInnerHtmlById(id, value) {
    const element = getById(id);
    element.innerHTML = value;
    return value;
}





//     }
// }

/**
 * Returns a greeting message based on the current time.
 * @returns {string} A greeting message ("Good morning," "Good afternoon," or "Good evening,")
 */
function greeting() {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) {
        return "Good morning,";
    } else if (hours < 18) {
        return "Good afternoon,";
    } else {
        return "Good evening,";
    }
}


/**
 * Displays the greeting message in the HTML element with the specified id.
 * @param {string} id - The id of the HTML element where the greeting message will be displayed.
 */
function displayGreeting(id) {
    document.getElementById(id).innerHTML = greeting();
}


/**
 * Displays the current user's name in the HTML element with the specified id.
 * @param {string} id - The id of the HTML element where the user's name will be displayed.
 */
function displayUsername(id) {
    document.getElementById(id).innerHTML = currentUser.data.name;
}

/**
 * Retrieves urgent tasks that are not done from a given path object.
 * @param {Object} path - An object containing task data.
 * @returns {Object[]} An array of urgent tasks that are not done.
 */
function getUrgentTaskData(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent' && task.status !== 'done');
}


/**
 * Counts the number of urgent tasks that are not done in a given path object.
 * @param {Object} path - An object containing task data.
 * @returns {number} The number of urgent tasks that are not done.
 */
function countUrgentTasks(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent' && task.status !== 'done').length;
}


/**
 * Sorts an array of tasks by their due date in ascending order.
 * @param {Object[]} tasks - An array of task objects, each with a dueDate property.
 * @returns {Object[]} The sorted array of tasks.
 */
function sortTasksByDueDate(tasks) {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}


/**
 * Formats a date string into a more readable format.
 * @param {string} dateStr - A date string to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}


/**
 * Retrieves an HTML element by its id.
 * @param {string} id - The id of the HTML element to be retrieved.
 * @returns {HTMLElement} The HTML element with the specified id.
 */
function getById(id) {
    let element = document.getElementById(id);
    return element;
}

/**
 * Validates if the overlay exists and removes it. Returns false if the overlay doesn't exist.
 * @returns {boolean} - Returns false if the overlay doesn't exist.
 */
function animationValidation() {
    if (document.getElementById('greeting-overlay')) {
        removeOverlay();
    } else {
        return false;
    }
}


/**
 * Removes the overlay element after a delay and displays the main logo.
 */
function removeOverlay() {
    let overlay = document.getElementById('greeting-overlay');


    setTimeout(() => {
        overlay.classList.remove('d-flex1300');
    }, 1750);
}