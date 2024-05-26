/**
 * Moves a task to a new status on the board.
 * @param {string} newStatus - The new status for the task.
 */
async function moveTo(newStatus) {
    ensureBoardInitialization();

    const currentContainer = document.getElementById(`${currentDraggedElement.status.toLowerCase()}-container`);
    const targetContainer = document.getElementById(`${newStatus.toLowerCase()}-container`);

    if (currentContainer) currentContainer.classList.remove('highlight');
    if (targetContainer) targetContainer.classList.add('highlight');

    const { id, status: currentStatus } = currentDraggedElement;

    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(id, currentStatus.toLowerCase());
    if (!task || taskIndex === -1) return;

    removeTaskFromStatusArray(currentStatus.toLowerCase(), taskIndex);
    task.status = newStatus.toLowerCase();
    addTaskToStatusArray(newStatus.toLowerCase(), task);

    await saveBoard();
    showToDos();
    if (targetContainer) targetContainer.classList.remove('highlight');
}


/**
 * Removes a task from a status array.
 * @param {string} status - The status of the task.
 * @param {number} taskIndex - The index of the task.
 */
function removeTaskFromStatusArray(status, taskIndex) {
    const taskArray = getStatusArray(status);
    if (taskArray && taskIndex > -1) {
        taskArray.splice(taskIndex, 1);
    }
}


/**
 * Adds a task to a status array.
 * @param {string} status - The status of the task.
 * @param {Object} task - The task object.
 */
function addTaskToStatusArray(status, task) {
    const taskArray = getStatusArray(status);
    if (taskArray) {
        taskArray.push(task);
    }
}


/**
 * Adds a subtask to the edit window and updates the data.
 * @param {string} taskId - The ID of the task.
 */
async function addSubtaskToEditWindow(taskId) {
    ensureBoardInitialization();

    let newSubtaskText = document.getElementById('subTaskInputEdit').value.trim();
    if (newSubtaskText === '') return;

    const { task, taskIndex, status } = findTaskAndIndexById(taskId);
    if (!task) return;

    if (!task.subtasks || !Array.isArray(task.subtasks)) {
        task.subtasks = [];
    }

    const newSubtask = { text: newSubtaskText, completed: false, status: task.status };
    task.subtasks.push(newSubtask);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const subtaskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}/subtasks`;
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    await updateData(subtaskPath, task.subtasks);
    await updateData(boardPath, currentUser.data.board);

    updateSubtaskUI(task.id, task.subtasks, task.status);
    document.getElementById('subTaskInputEdit').value = '';
    showToDos();
}


/**
 * Finds a task and its index by its ID and status.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The status of the task.
 * @returns {Object} An object containing the task and its index.
 */
function findTaskAndIndexByIdAndStatus(taskId, status) {
    const boardStatusArray = getStatusArray(status);
    if (!boardStatusArray) return {};

    const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
    const task = boardStatusArray[taskIndex];
    return { task, taskIndex };
}


/**
 * Gets the updated task data from the UI elements.
 * @param {Object} task - The task object to update.
 * @returns {Object|null} The updated task object or null if any required element is missing.
 */
function getUpdatedTaskData(task) {
    const titleElement = document.getElementById('title');
    const descriptionElement = document.getElementById('description');
    const dueDateElement = document.getElementById('dueDate');
    const priorityElement = document.querySelector('.priority-button.active');

    if (!titleElement || !descriptionElement || !dueDateElement || !priorityElement) return null;

    task.title = titleElement.value;
    task.description = descriptionElement.value;
    task.dueDate = dueDateElement.value;
    task.priority = priorityElement.getAttribute('data-priority');
    task.contacts = selectedContacts;

    return task;
}


/**
 * Deletes a subtask and updates the data.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask to delete.
 * @param {string} status - The status of the task.
 */
async function deleteSubtaskEdit(taskId, subtaskIndex, status) {
    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(taskId, status.toLowerCase());
    if (!task || !task.subtasks || !Array.isArray(task.subtasks)) return;

    task.subtasks.splice(subtaskIndex, 1);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

    await updateData(taskPath, task);

    const subtaskContainer = document.getElementById(`subTaskItem_${subtaskIndex}`);
    if (subtaskContainer) {
        subtaskContainer.remove();
    }
    updateSubtaskUI(taskId, task.subtasks, status);
    showToDos();
}


/**
 * Saves the current state of the board to the database.
 */
async function saveBoard() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;
    await updateData(boardPath, currentUser.data.board);
}


/**
 * Ensures the board structure is initialized.
 */
function ensureBoardInitialization() {
    if (!currentUser.data.board) {
        currentUser.data.board = {
            todo: [],
            inProgress: [],
            awaitFeedback: [],
            done: []
        };
    }
    currentUser.data.board.todo = currentUser.data.board.todo || [];
    currentUser.data.board.inProgress = currentUser.data.board.inProgress || [];
    currentUser.data.board.awaitFeedback = currentUser.data.board.awaitFeedback || [];
    currentUser.data.board.done = currentUser.data.board.done || [];
}


/**
 * Moves a task to a new status on the board.
 * @param {string} newStatus - The new status for the task.
 */
async function moveTo(newStatus) {
    ensureBoardInitialization();

    const currentContainer = document.getElementById(`${currentDraggedElement.status.toLowerCase()}-container`);
    const targetContainer = document.getElementById(`${newStatus.toLowerCase()}-container`);

    if (currentContainer) currentContainer.classList.remove('highlight');
    if (targetContainer) targetContainer.classList.add('highlight');

    const { id, status: currentStatus } = currentDraggedElement;

    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(id, currentStatus.toLowerCase());
    if (!task || taskIndex === -1) return;

    removeTaskFromStatusArray(currentStatus.toLowerCase(), taskIndex);
    task.status = newStatus.toLowerCase();
    addTaskToStatusArray(newStatus.toLowerCase(), task);

    await saveBoard();
    showToDos();
    if (targetContainer) targetContainer.classList.remove('highlight');
}


/**
 * Removes a task from a status array.
 * @param {string} status - The status of the task.
 * @param {number} taskIndex - The index of the task.
 */
function removeTaskFromStatusArray(status, taskIndex) {
    const taskArray = getStatusArray(status);
    if (taskArray && taskIndex > -1) {
        taskArray.splice(taskIndex, 1);
    }
}


/**
 * Adds a task to a status array.
 * @param {string} status - The status of the task.
 * @param {Object} task - The task object.
 */
function addTaskToStatusArray(status, task) {
    const taskArray = getStatusArray(status);
    if (taskArray) {
        taskArray.push(task);
    }
}


/**
 * Adds a subtask to the edit window and updates the data.
 * @param {string} taskId - The ID of the task.
 */
async function addSubtaskToEditWindow(taskId) {
    ensureBoardInitialization();

    let newSubtaskText = document.getElementById('subTaskInputEdit').value.trim();
    if (newSubtaskText === '') return;

    const { task, taskIndex, status } = findTaskAndIndexById(taskId);
    if (!task) return;

    if (!task.subtasks || !Array.isArray(task.subtasks)) {
        task.subtasks = [];
    }

    const newSubtask = { text: newSubtaskText, completed: false, status: task.status };
    task.subtasks.push(newSubtask);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const subtaskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}/subtasks`;
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    await updateData(subtaskPath, task.subtasks);
    await updateData(boardPath, currentUser.data.board);

    updateSubtaskUI(task.id, task.subtasks, task.status);
    document.getElementById('subTaskInputEdit').value = '';
    showToDos();
}


/**
 * Finds a task and its index by its ID and status.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The status of the task.
 * @returns {Object} An object containing the task and its index.
 */
function findTaskAndIndexByIdAndStatus(taskId, status) {
    const boardStatusArray = getStatusArray(status);
    if (!boardStatusArray) return {};

    const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
    const task = boardStatusArray[taskIndex];
    return { task, taskIndex };
}