let subtaskIndexCounter = 0;
let currentDraggedElement;


async function init() {
  includeHTML();
  await loadCurrentUserBoard();
  showToDos();
}


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


function getCategoryBackgroundColor(category) {
  if (category === 'Technical Task') {
    return '#1FD7C1';
  } else if (category === 'User Story') {
    return '#038ff0';
  }
}


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


function showOverlayAndPopUp() {
  let overlay = document.getElementById('overlay');
  let popUp = document.getElementById('pop-up');
  overlay.classList.remove('d-none-board');
  popUp.classList.remove('closing-animation');
  popUp.classList.add('slide-in-animation');
}


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
      return null;
  }
}


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


function doNotClosePopUp(event) {
  event.stopPropagation();
}


function showAddTaskPopUp(status = 'todo') {
  let overlay = document.getElementById('overlay2');
  let addTaskPopUp = document.getElementById('addTaskPopUp');
  addTaskPopUp.innerHTML = generateAddTaskPopUpHTML(status);
  overlay.classList.remove('d-none-board');
  addTaskPopUp.classList.remove('closing-animation');
  addTaskPopUp.classList.add('slide-in-animation');
}


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


function doNotCloseAddTaskPopUp(event) {
  event.stopPropagation();
}


async function createTaskOnBoard(status) {
  if (!validateTaskInputs()) return;

  const newTask = constructNewTask();
  newTask.status = status.toLowerCase();
  newTask.id = generateUniqueId();

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

function findTaskAndIndexById(taskId) {
  if (!currentUser || !currentUser.data || !currentUser.data.board) return {};

  const allTasks = getAllTasks();
  const taskIndex = allTasks.findIndex(t => t.id === taskId);
  const task = allTasks[taskIndex];
  const status = getStatusByIndex(taskIndex);

  return { task, taskIndex, status };
}

function getAllTasks() {
  return [
    ...currentUser.data.board.todo,
    ...currentUser.data.board.inProgress,
    ...currentUser.data.board.awaitFeedback,
    ...currentUser.data.board.done
  ];
}

function getStatusByIndex(taskIndex) {
  const { todo, inProgress, awaitFeedback } = currentUser.data.board;

  if (taskIndex < todo.length) return 'todo';
  if (taskIndex < todo.length + inProgress.length) return 'inProgress';
  if (taskIndex < todo.length + inProgress.length + awaitFeedback.length) return 'awaitFeedback';
  return 'done';
}


function toggleAddButtonImageEdit() {
  const subtaskInputValue = document.getElementById('subTaskInputEdit').value.trim();
  const isInputNotEmpty = subtaskInputValue !== '';
  updateAddButtonEdit(isInputNotEmpty);
  updateElementVisibilityEdit(document.getElementById('closeBtn'), isInputNotEmpty);
  updateElementVisibilityEdit(document.getElementById('sub-seperator'), isInputNotEmpty);
}


function toggleAddButtonImageEdit() {
  const subtaskInputValue = document.getElementById('subTaskInputEdit').value.trim();
  const isInputNotEmpty = subtaskInputValue !== '';
  updateAddButtonEdit(isInputNotEmpty);
  updateElementVisibilityEdit(document.getElementById('closeBtn'), isInputNotEmpty);
  updateElementVisibilityEdit(document.getElementById('sub-seperator'), isInputNotEmpty);
}


function updateAddButtonEdit(isInputNotEmpty) {
  const addButtonImage = document.getElementById('addBtnEdit');
  addButtonImage.src = isInputNotEmpty ? 'assets/img/icons/check_blue.png' : 'assets/img/icons/add.png';
  addButtonImage.style.display = 'block';
}


function updateElementVisibilityEdit(element, shouldDisplay) {
  element.style.display = shouldDisplay ? 'block' : 'none';
}


function clearInputFieldEdit() {
  const subtaskInput = document.getElementById('subTaskInputEdit');
  subtaskInput.value = '';
}


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

function findTaskAndIndexByIdAndStatus(taskId, status) {
  const boardStatusArray = getStatusArray(status);
  if (!boardStatusArray) return {};

  const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
  const task = boardStatusArray[taskIndex];
  return { task, taskIndex };
}

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


function updateSubtaskUI(taskId, subtasks, status) {
  const subtaskContainer = document.getElementById('subtaskContainerEdit');
  subtaskContainer.innerHTML = '';
  for (let i = 0; i < subtasks.length; i++) {
    const subtaskHTML = generateSubtaskHTML(taskId, i, subtasks[i], status);
    subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
  }
}


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


function handleKeyPress(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtaskToEditWindow(taskId);
  }
}


function startdragging(id, status) {
  currentDraggedElement = { id, status };
  const currentContainer = document.getElementById(status.toLowerCase() + '-container');
  if (currentContainer) {
    currentContainer.classList.add('highlight');
  }
}


function onDragLeave(ev) {
  ev.preventDefault();
  const target = ev.target;
  if (target && target.classList) {
    target.classList.remove('highlight');
  }
}


function onDragEnter(ev) {
  ev.preventDefault();
  const target = ev.target;
  if (target && target.classList) {
    target.classList.add('highlight');
  }
}


function allowDrop(ev) {
  ev.preventDefault();
}


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

function removeTaskFromStatusArray(status, taskIndex) {
  const taskArray = getStatusArray(status);
  if (taskArray && taskIndex > -1) {
    taskArray.splice(taskIndex, 1);
  }
}

function addTaskToStatusArray(status, task) {
  const taskArray = getStatusArray(status);
  if (taskArray) {
    taskArray.push(task);
  }
}


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


async function saveBoard() {
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const boardPath = `users/${cleanedEmail}/${userId}/board`;
  await updateData(boardPath, currentUser.data.board);
}


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