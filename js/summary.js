async function initSummary() {
    await loadCurrentUserBoard();
    updateSummary();
    displayGreeting('greeting');
    displayGreeting('resp-greeting');
    animationValidation();
}


function updateSummary() {
    let path = currentUser.data.board

    let todo = getById('todos').innerHTML = path.todo.length;
    let done = getById('done').innerHTML = path.done.length;
    let inProgress = getById('inProgress').innerHTML = path.inProgress.length;
    let feedback =  getById('feedback').innerHTML = path.awaitFeedback.length;
    let urgent = getUrgentTaskData(path);

    let sum = todo + done + inProgress + feedback;

    getById('allTasks').innerHTML = sum;
    getById('urgent').innerHTML = countUrgentTasks(path);

    try {
        let test = getById('urgentDate').innerHTML = formatDate(sortTasksByDueDate(urgent)[0]['dueDate']);
        console.log(test);
        console.log(currentUser);
        displayUsername('username');
        displayUsername('resp-username');
    } catch (error) {
        getById('upcomDeadline').innerHTML = '';
        displayUsername('username');
        displayUsername('resp-username');
    }
}

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

function displayGreeting(id) {
    document.getElementById(id).innerHTML = greeting();
}

function displayUsername(id) {
    document.getElementById(id).innerHTML = currentUser.data.name;
}


function getUrgentTaskData(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent' && task.status !== 'done');
}


function countUrgentTasks(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent' && task.status !== 'done').length;
}

function sortTasksByDueDate(tasks) {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

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