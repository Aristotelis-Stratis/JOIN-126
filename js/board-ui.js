let subtaskIndexCounter = 0;
let currentDraggedElement;


/**
 * Initializes the application by loading the current user's board and displaying tasks.
 */
async function init() {
    includeHTML();
    await loadCurrentUserBoard();
    setDefaultPriority();
    showToDos();
}


/**
 * Sets the default priority to medium.
 */
function setDefaultPriority() {
    const priorityButtons = document.querySelectorAll('.priority-button');
    priorityButtons.forEach(button => {
        button.classList.remove('active');
    });
    const mediumButton = document.getElementById('priority-medium');
    if (mediumButton) {
        mediumButton.classList.add('active');
        selectedPriority = ["medium"];
    }
}

/**
 * Displays tasks on the board based on their status.
 */
function showToDos() {
    if (!currentUser || !currentUser.data || !currentUser.data.board) {
        return;
    }

    const board = currentUser.data.board;

    const taskTypes = [
        { tasks: board.todo || [], containerId: 'ToDos', type: 'todo' },
        { tasks: board.inProgress || [], containerId: 'progress-container', type: 'inProgress' },
        { tasks: board.awaitFeedback || [], containerId: 'feedback-container', type: 'awaitFeedback' },
        { tasks: board.done || [], containerId: 'done-container', type: 'done' }
    ];

    taskTypes.forEach(({ tasks, containerId, type }) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        tasks.forEach((task, i) => {
            container.innerHTML += generateTodoHTML(task, i, type);
        });
    });

    updateNoTaskPlaceholders();
}


/**
 * Gets the background color for a given category.
 * @param {string} category - The task category.
 * @returns {string} The background color for the category.
 */
function getCategoryBackgroundColor(category) {
    if (category === 'Technical Task') {
        return '#1FD7C1';
    } else if (category === 'User Story') {
        return '#038ff0';
    }
}


/**
 * Sets the priority image based on the priority level.
 * @param {string} priority - The priority level.
 * @returns {string} The path to the priority image.
 */
function setPriority(priority) {
    let priorityImage;

    switch (priority) {
        case 'low':
            priorityImage = './assets/img/icons/low.png';
            break;
        case 'medium':
            priorityImage = './assets/img/icons/medium.png';
            break;
        case 'urgent':
            priorityImage = './assets/img/icons/urgent.png';
            break;
        default:
            priorityImage = './assets/img/icons/low.png';
            break;
    }

    return priorityImage;
}


/**
 * Updates the progress bar for a task.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The status of the task.
 */
function updateProgressBar(taskId, status) {
    const boardStatusArray = getStatusArray(status.toLowerCase());

    if (!boardStatusArray) return;

    const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
    const task = boardStatusArray[taskIndex];

    if (!task || !task.subtasks || !Array.isArray(task.subtasks)) return;

    const totalTasks = task.subtasks.length;
    const completedTasks = task.subtasks.filter(subtask => subtask.completed).length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    updateProgressUI(taskId, status, completionPercentage, completedTasks, totalTasks);
}


/**
 * Updates the progress UI for a task.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The status of the task.
 * @param {number} completionPercentage - The completion percentage of the task.
 * @param {number} completedTasks - The number of completed subtasks.
 * @param {number} totalTasks - The total number of subtasks.
 */
function updateProgressUI(taskId, status, completionPercentage, completedTasks, totalTasks) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"][data-task-status="${status}"]`);
    if (taskElement) {
        const progressBar = taskElement.querySelector('.filled-subtask-bar');
        const progressText = taskElement.querySelector('.subtasks span');
        if (progressBar) {
            progressBar.style.width = `${completionPercentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${completedTasks}/${totalTasks} Subtasks`;
        }
    }
}


/**
 * Displays the overlay and popup for task details.
 */
function showOverlayAndPopUp() {
    let overlay = document.getElementById('overlay');
    let popUp = document.getElementById('pop-up');
    overlay.classList.remove('d-none-board');
    popUp.classList.remove('closing-animation');
    popUp.classList.add('slide-in-animation');
}


/**
 * Displays the popup for a specific task.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 */
function showPopUp(id, status) {
    const task = findTaskByIdAndStatus(id, status.toLowerCase());

    if (!task) return;

    const priority = task.priority || 'low';
    const popUpHTML = generatePopUpHTML(task, id, priority, status);
    showOverlayAndPopUp();
    const popUp = document.getElementById('pop-up');
    popUp.innerHTML = popUpHTML;
    updateProgressBar(id, status);
}


/**
 * Closes the popup for task details.
 */
function closePopUp() {
    const overlay = document.getElementById('overlay');
    const popUp = document.getElementById('pop-up');
    popUp.classList.remove('slide-in-animation');
    popUp.classList.add('closing-animation');

    setTimeout(() => {
        overlay.classList.add('d-none-board');
        popUp.classList.remove('closing-animation');
        document.body.classList.remove('no-scroll');
    }, 500);
}


/**
 * Prevents closing the popup when clicking inside it.
 * @param {Event} event - The click event.
 */
function doNotClosePopUp(event) {
    event.stopPropagation();
}


/**
 * Displays the popup for adding a new task.
 * @param {string} [status='todo'] - The status of the new task.
 */
function showAddTaskPopUp(status = 'todo') {
    let overlay = document.getElementById('overlay2');
    let addTaskPopUp = document.getElementById('addTaskPopUp');
    addTaskPopUp.innerHTML = generateAddTaskPopUpHTML(status);
    overlay.classList.remove('d-none-board');
    addTaskPopUp.classList.remove('closing-animation');
    addTaskPopUp.classList.add('slide-in-animation');
    setDefaultPriority();
}


/**
 * Closes the popup for adding a new task.
 */
function closeAddTaskPopUp() {
    const overlay = document.getElementById('overlay2');
    const addtask = document.getElementById('addTaskPopUp');
    addtask.classList.remove('slide-in-animation');
    addtask.classList.add('closing-animation');

    setTimeout(() => {
        overlay.classList.add('d-none-board');
        addtask.classList.remove('closing-animation');
    }, 500);
}


/**
 * Prevents closing the add task popup when clicking inside it.
 * @param {Event} event - The click event.
 */
function doNotCloseAddTaskPopUp(event) {
    event.stopPropagation();
}


/**
 * Opens the drag menu overlay and sets the current dragged element.
 * @param {Event} event - The click event that triggered the function.
 * @param {string} taskId - The ID of the task being dragged.
 * @param {string} status - The current status of the task.
 */
function openDragMenu(event, taskId, status) {
    event.stopPropagation();
    currentDraggedElement = { id: taskId, status: status };
    document.getElementById('dragOverlay').style.display = 'flex';
}


/**
 * Closes the drag menu overlay.
 */
function closeDragMenu() {
    document.getElementById('dragOverlay').style.display = 'none';
}


/**
 * Moves the current dragged task to a new status.
 * @param {string} newStatus - The new status to move the task to.
 */
async function moveTask(newStatus) {
    ensureBoardInitialization();
    if (!currentDraggedElement) return;

    const { id, status: currentStatus } = currentDraggedElement;

    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(id, currentStatus.toLowerCase());
    if (!task || taskIndex === -1) return;

    removeTaskFromStatusArray(currentStatus.toLowerCase(), taskIndex);
    task.status = newStatus.toLowerCase();
    addTaskToStatusArray(newStatus.toLowerCase(), task);

    await saveBoard();
    showToDos();
    closeDragMenu();
}