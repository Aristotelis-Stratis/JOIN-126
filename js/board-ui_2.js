/**
 * Generates HTML for editing subtasks.
 * @param {number} taskIndex - The index of the task.
 * @param {Array} subtasks - The subtasks array.
 * @param {string} status - The status of the task.
 * @returns {string} The generated HTML for the subtasks.
 */
function generateSubtaskHTMLEdit(taskIndex, subtasks, status) {
    let subtaskHTML = '';

    if (subtasks && Array.isArray(subtasks)) {
        for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i];
            subtaskHTML += generateSubtaskHTML(taskIndex, i, subtask, status);
        }
    }
    return subtaskHTML;
}


/**
 * Toggles the add button image in the edit subtask window based on input value.
 */
function toggleAddButtonImageEdit() {
    const subtaskInputValue = document.getElementById('subTaskInputEdit').value.trim();
    const isInputNotEmpty = subtaskInputValue !== '';
    updateAddButtonEdit(isInputNotEmpty);
    updateElementVisibilityEdit(document.getElementById('closeBtn'), isInputNotEmpty);
    updateElementVisibilityEdit(document.getElementById('sub-seperator'), isInputNotEmpty);
}


/**
 * Updates the add button image in the edit subtask window.
 * @param {boolean} isInputNotEmpty - Whether the input field is not empty.
 */
function updateAddButtonEdit(isInputNotEmpty) {
    const addButtonImage = document.getElementById('addBtnEdit');
    addButtonImage.src = isInputNotEmpty ? 'assets/img/icons/check_blue.png' : 'assets/img/icons/add.png';
    addButtonImage.style.display = 'block';
}


/**
 * Updates the visibility of an element in the edit subtask window.
 * @param {HTMLElement} element - The DOM element to update.
 * @param {boolean} shouldDisplay - Whether the element should be displayed.
 */
function updateElementVisibilityEdit(element, shouldDisplay) {
    element.style.display = shouldDisplay ? 'block' : 'none';
}


/**
 * Clears the input field in the edit subtask window.
 */
function clearInputFieldEdit() {
    const subtaskInput = document.getElementById('subTaskInputEdit');
    subtaskInput.value = '';
}


/**
 * Edits a subtask in the edit window.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 * @param {string} status - The status of the task.
 */
function editSubtaskEdit(taskId, subtaskIndex, status) {
    let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
    let subtaskSpan = document.getElementById(`subTask_${subtaskIndex}_span`);
    let subtaskText = subtaskSpan.innerHTML.trim();

    subtaskItem.innerHTML = generateEditSubtaskInputHTML(taskId, subtaskIndex, subtaskText, status);

    let subtaskInputElement = document.getElementById(`subTask_${subtaskIndex}_input`);
    subtaskInputElement.focus();

    subtaskInputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveEditedSubtask(taskId, subtaskIndex, status);
        }
    });
}


/**
 * Updates the subtask UI with the current subtasks.
 * @param {string} taskId - The ID of the task.
 * @param {Array} subtasks - The array of subtasks.
 * @param {string} status - The status of the task.
 */
function updateSubtaskUI(taskId, subtasks, status) {
    const subtaskContainer = document.getElementById('subtaskContainerEdit');
    subtaskContainer.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        const subtaskHTML = generateSubtaskHTML(taskId, i, subtasks[i], status);
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
    }
}


/**
 * Handles key press events for adding subtasks.
 * @param {Event} event - The key press event.
 * @param {string} taskId - The ID of the task.
 */
function handleKeyPress(event, taskId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtaskToEditWindow(taskId);
    }
}


/**
 * Starts dragging a task.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 */
function startdragging(id, status) {
    currentDraggedElement = { id, status };
    const currentContainer = document.getElementById(status.toLowerCase() + '-container');
    if (currentContainer) {
        currentContainer.classList.add('highlight');
    }
}


/**
 * Handles the drag leave event.
 * @param {Event} ev - The drag leave event.
 */
function onDragLeave(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target && target.classList) {
        target.classList.remove('highlight');
    }
}


/**
 * Handles the drag enter event.
 * @param {Event} ev - The drag enter event.
 */
function onDragEnter(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target && target.classList) {
        target.classList.add('highlight');
    }
}


/**
 * Allows dropping an element.
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Updates the placeholders for columns with no tasks.
 */
function updateNoTaskPlaceholders() {
    const columns = [
        { id: 'ToDos', placeholder: 'No tasks To do' },
        { id: 'progress-container', placeholder: 'No tasks in progress' },
        { id: 'feedback-container', placeholder: 'No tasks require feedback' },
        { id: 'done-container', placeholder: 'No tasks are done' }
    ];

    columns.forEach(column => {
        const container = document.getElementById(column.id);
        const noTaskBox = container.querySelector('.no-task-box');

        if (container.children.length === 0) {
            if (!noTaskBox) {
                container.innerHTML = `<div class="no-task-box">${column.placeholder}</div>`;
            }
        } else {
            if (noTaskBox) {
                noTaskBox.remove();
            }
        }
    });
}


/**
 * Filters tasks based on a search term.
 */
function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const taskTypes = ['todo', 'inProgress', 'awaitFeedback', 'done'];

    const filteredTasks = taskTypes.map(type =>
        (currentUser.data.board[type] || []).filter(task =>
            task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
        )
    );

    displayFilteredTasks(...filteredTasks);
}


/**
 * Displays filtered tasks based on search criteria.
 * @param {Array} todoTasks - Array of tasks with 'todo' status.
 * @param {Array} inProgressTasks - Array of tasks with 'inProgress' status.
 * @param {Array} feedbackTasks - Array of tasks with 'awaitFeedback' status.
 * @param {Array} doneTasks - Array of tasks with 'done' status.
 */
function displayFilteredTasks(todoTasks, inProgressTasks, feedbackTasks, doneTasks) {
    const taskContainers = [
        { tasks: todoTasks, containerId: 'ToDos', type: 'todo' },
        { tasks: inProgressTasks, containerId: 'progress-container', type: 'inProgress' },
        { tasks: feedbackTasks, containerId: 'feedback-container', type: 'awaitFeedback' },
        { tasks: doneTasks, containerId: 'done-container', type: 'done' }
    ];

    taskContainers.forEach(({ tasks, containerId, type }) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = '<div class="no-task-box">No tasks found</div>';
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task, task.id, type);
            });
        }
    });
}



/**
* Initiates and displays a confirmation window with a specified message.
* @param {string} message - The message to be displayed in the confirmation window.
*/
function initiateConfirmationOnBoard(message) {
    const confirmation = document.getElementById('add-task-confirmation');
    confirmation.innerHTML = message;
    confirmation.style.display = 'flex';
    confirmation.style.animation = `slideInUp 0.5s ease-in-out forwards`;

    setTimeout(() => {
        confirmation.style.animation = `slideOutDown 0.5s ease-in-out forwards`;
        confirmation.addEventListener('animationend', () => {
            confirmation.style.display = 'none';
        }, { once: true });
    }, 2000);
}


/**
 * Displays the add task popup for editing an existing task.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 */
async function showAddTaskPopUpEdit(id, status) {
    const task = findTaskByIdAndStatus(id, status.toLowerCase());

    if (!task) return;

    task.contacts = Array.isArray(task.contacts) ? task.contacts : [];
    selectedContacts = [...task.contacts];

    const popUp = document.getElementById('pop-up');
    const date = task.dueDate;
    const category = task.category;
    const priority = task.priority;
    const subtasks = generateSubtaskHTMLEdit(id, task.subtasks, status);
    const usersHTML = generateUserHTMLEdit(task.contacts);

    popUp.innerHTML = generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, id, status);
    renderTaskContactList(filteredContacts);
    renderSelectedContacts();
    showOverlayAndPopUp();
}

/**
 * Adds event listeners for drag and drop functionality when the document is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('board.html')) {
        const containers = [
            { id: 'ToDos', status: 'todo' },
            { id: 'progress-container', status: 'inprogress' },
            { id: 'feedback-container', status: 'awaitfeedback' },
            { id: 'done-container', status: 'done' }
        ];

        containers.forEach(({ id, status }) => {
            const container = document.getElementById(id);
            container.addEventListener('dragenter', onDragEnter);
            container.addEventListener('dragleave', onDragLeave);
            container.addEventListener('drop', (event) => {
                moveTo(status);
                event.currentTarget.classList.remove('highlight');
            });
        });
    }
});