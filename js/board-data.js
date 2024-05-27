/**
 * Loads the current user's board data and initializes the board.
 */
async function loadCurrentUserBoard() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');

    if (cleanedEmail && userId) {
        const path = `users/${cleanedEmail}/${userId}`;
        const userData = await loadData(path);

        if (userData) {
            currentUser = { id: userId, data: userData };
            ensureBoardInitialization();
            setProfileInitials();
        }
    }
}


/**
 * Toggles the completion status of a subtask and updates the data.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} status - The status of the task.
 */
async function toggleSubtaskCheck(taskId, subtaskIndex, status) {
    const boardStatusArray = getStatusArray(status.toLowerCase());

    if (!boardStatusArray) return;

    const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
    const task = boardStatusArray[taskIndex];

    if (!task || !task.subtasks || !Array.isArray(task.subtasks)) return;

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

    await updateData(taskPath, task);
    showPopUp(taskId, status);
    updateProgressBar(taskId, status);
}


/**
 * Deletes a card from the board.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The status of the task.
 */
async function deleteCard(taskId, status) {
    if (!currentUser || !currentUser.data || !currentUser.data.board) return;

    const taskList = getStatusArray(status.toLowerCase());
    if (!taskList) return;

    const taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    taskList.splice(taskIndex, 1);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    await updateData(boardPath, currentUser.data.board);
    closePopUp();
    showToDos();
    updateNoTaskPlaceholders();
}


/**
 * Returns the array of tasks based on the status.
 * @param {string} status - The status of the tasks.
 * @returns {Array|null} The array of tasks or null if the status is invalid.
 */
function getStatusArray(status) {
    switch (status) {
        case "todo":
            return currentUser.data.board.todo;
        case "inprogress":
            return currentUser.data.board.inProgress;
        case "awaitfeedback":
            return currentUser.data.board.awaitFeedback;
        case "done":
            return currentUser.data.board.done;
        default:
            console.error(`Invalid status: ${status}`);
            return null;
    }
}


/**
 * Creates a new task on the board.
 * @param {string} status - The status of the new task.
 */
async function createTaskOnBoard(status) {
    if (!validateTaskInputs()) return;

    const newTask = constructNewTask();
    newTask.status = status.toLowerCase();
    newTask.id = generateUniqueId();
    newTask.priority = selectedPriority[0];
    if (!currentUser || !currentUser.data) return;

    ensureBoardInitialization();

    const taskList = getStatusArray(newTask.status);
    if (!taskList) return;

    taskList.push(newTask);

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    await updateData(boardPath, currentUser.data.board);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    resetUI();
    showToDos();
    closeAddTaskPopUp();
    initiateConfirmationOnBoard('Task added to <img class="add-task-icon-board" src="assets/img/icons/board.png" alt="Board">');
}


/**
 * Finds a task by its ID and status.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 * @returns {Object|null} The task object or null if not found.
 */
function findTaskByIdAndStatus(id, status) {
    switch (status) {
        case "todo":
            return currentUser.data.board.todo.find(task => task.id === id);
        case "inprogress":
            return currentUser.data.board.inProgress.find(task => task.id === id);
        case "awaitfeedback":
            return currentUser.data.board.awaitFeedback.find(task => task.id === id);
        case "done":
            return currentUser.data.board.done.find(task => task.id === id);
        default:
            return null;
    }
}


/**
 * Finds a task and its index by its ID.
 * @param {string} taskId - The ID of the task.
 * @returns {Object} An object containing the task, taskIndex, and status.
 */
function findTaskAndIndexById(taskId) {
    if (!currentUser || !currentUser.data || !currentUser.data.board) return {};

    const allTasks = getAllTasks();
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    const task = allTasks[taskIndex];
    const status = getStatusByIndex(taskIndex);

    return { task, taskIndex, status };
}


/**
 * Returns all tasks from the board.
 * @returns {Array} An array of all tasks.
 */
function getAllTasks() {
    return [
        ...currentUser.data.board.todo,
        ...currentUser.data.board.inProgress,
        ...currentUser.data.board.awaitFeedback,
        ...currentUser.data.board.done
    ];
}


/**
 * Gets the status of a task by its index.
 * @param {number} taskIndex - The index of the task.
 * @returns {string} The status of the task.
 */
function getStatusByIndex(taskIndex) {
    const { todo, inProgress, awaitFeedback } = currentUser.data.board;

    if (taskIndex < todo.length) return 'todo';
    if (taskIndex < todo.length + inProgress.length) return 'inProgress';
    if (taskIndex < todo.length + inProgress.length + awaitFeedback.length) return 'awaitFeedback';
    return 'done';
}


/**
 * Saves the edited subtask and updates the data.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} status - The status of the task.
 */
async function saveEditedSubtask(taskId, subtaskIndex, status) {
    const subtaskInput = document.getElementById(`subTask_${subtaskIndex}_input`);
    const newText = subtaskInput.value.trim();
    if (!newText) return;

    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(taskId, status.toLowerCase());
    if (!task || !task.subtasks || !Array.isArray(task.subtasks)) return;

    task.subtasks[subtaskIndex].text = newText;

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;
    await updateData(taskPath, task);

    const subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
    subtaskItem.innerHTML = generateEditedSubtaskHTML(taskId, subtaskIndex, newText, status);
    showToDos();
}


/**
 * Updates the subtask edit data and UI.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 */
async function updateSubtaskEdit(id, status) {
    const { task, taskIndex } = findTaskAndIndexByIdAndStatus(id, status.toLowerCase());
    if (!task || taskIndex === -1) return;

    const updatedTask = getUpdatedTaskData(task);
    if (!updatedTask) return;

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

    await updateData(taskPath, updatedTask);
    showPopUp(id, status);
    showToDos();
}


/**
 * Gets the updated task data from the UI.
 * @param {Object} task - The task object.
 * @returns {Object|null} The updated task object or null if invalid.
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
 * @param {number} subtaskIndex - The index of the subtask.
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