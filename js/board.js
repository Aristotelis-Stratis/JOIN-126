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

  let todoTasks = currentUser.data.board.todo || [];
  let inProgressTasks = currentUser.data.board.inProgress || [];
  let feedbackTasks = currentUser.data.board.awaitFeedback || [];
  let doneTasks = currentUser.data.board.done || [];

  let todoContainer = document.getElementById('ToDos');
  let inProgressContainer = document.getElementById('progress-container');
  let feedbackContainer = document.getElementById('feedback-container');
  let doneContainer = document.getElementById('done-container');

  todoContainer.innerHTML = '';
  inProgressContainer.innerHTML = '';
  feedbackContainer.innerHTML = '';
  doneContainer.innerHTML = '';

  for (let i = 0; i < todoTasks.length; i++) {
    const task = todoTasks[i];
    const todoHTML = generateTodoHTML(task, i, 'todo');
    todoContainer.innerHTML += todoHTML;
  }

  for (let i = 0; i < inProgressTasks.length; i++) {
    const task = inProgressTasks[i];
    const inProgressHTML = generateTodoHTML(task, i, 'inProgress');
    inProgressContainer.innerHTML += inProgressHTML;
  }

  for (let i = 0; i < feedbackTasks.length; i++) {
    const task = feedbackTasks[i];
    const awaitFeedbackHTML = generateTodoHTML(task, i, 'awaitFeedback');
    feedbackContainer.innerHTML += awaitFeedbackHTML;
  }

  for (let i = 0; i < doneTasks.length; i++) {
    const task = doneTasks[i];
    const doneHTML = generateTodoHTML(task, i, 'done');
    doneContainer.innerHTML += doneHTML;
  }
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
  let task;
  let boardStatusArray;

  switch (status.toLowerCase()) {
    case "todo":
      boardStatusArray = currentUser.data.board.todo;
      break;
    case "inprogress":
      boardStatusArray = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      boardStatusArray = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      boardStatusArray = currentUser.data.board.done;
      break;
    default:
      return;
  }

  const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
  task = boardStatusArray[taskIndex];

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    return;
  }

  task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

  await updateData(taskPath, task);
  showPopUp(taskId, status);
  updateProgressBar(taskId, status);
}


function updateProgressBar(taskId, status) {
  let task;
  let boardStatusArray;

  switch (status.toLowerCase()) {
    case "todo":
      boardStatusArray = currentUser.data.board.todo;
      break;
    case "inprogress":
      boardStatusArray = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      boardStatusArray = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      boardStatusArray = currentUser.data.board.done;
      break;
    default:
      return;
  }

  const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
  task = boardStatusArray[taskIndex];

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    return;
  }

  const totalTasks = task.subtasks.length;
  const completedTasks = task.subtasks.filter(subtask => subtask.completed).length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
  let task;

  switch (status.toLowerCase()) {
    case "todo":
      task = currentUser.data.board.todo.find(task => task.id === id);
      break;
    case "inprogress":
      task = currentUser.data.board.inProgress.find(task => task.id === id);
      break;
    case "awaitfeedback":
      task = currentUser.data.board.awaitFeedback.find(task => task.id === id);
      break;
    case "done":
      task = currentUser.data.board.done.find(task => task.id === id);
      break;
    default:
      return;
  }

  if (!task) {
    return;
  }

  const priority = task.priority || 'low';
  const popUpHTML = generatePopUpHTML(task, id, priority, status);
  showOverlayAndPopUp();
  const popUp = document.getElementById('pop-up');
  popUp.innerHTML = popUpHTML;
  updateProgressBar(id, status);
}


async function deleteCard(taskId, status) {
  if (!currentUser || !currentUser.data || !currentUser.data.board) {
    return;
  }

  let taskList;
  switch (status.toLowerCase()) {
    case "todo":
      taskList = currentUser.data.board.todo;
      break;
    case "inprogress":
      taskList = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      taskList = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      taskList = currentUser.data.board.done;
      break;
    default:
      return;
  }

  const taskIndex = taskList.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    return;
  }

  taskList.splice(taskIndex, 1);
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const boardPath = `users/${cleanedEmail}/${userId}/board`;

  await updateData(boardPath, currentUser.data.board);
  closePopUp();
  showToDos();
  updateNoTaskPlaceholders();
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
  if (validateTaskInputs()) {
    const newTask = constructNewTask();
    newTask.status = status.toLowerCase();
    newTask.id = generateUniqueId();

    if (!currentUser || !currentUser.data) {
      return;
    }

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

    switch (newTask.status) {
      case 'todo':
        currentUser.data.board.todo.push(newTask);
        break;
      case 'inprogress':
        currentUser.data.board.inProgress.push(newTask);
        break;
      case 'awaitfeedback':
        currentUser.data.board.awaitFeedback.push(newTask);
        break;
      case 'done':
        currentUser.data.board.done.push(newTask);
        break;
      default:
        return;
    }

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    await updateData(boardPath, currentUser.data.board);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    resetUI();
    showToDos();
    closeAddTaskPopUp();
  }
}


async function showAddTaskPopUpEdit(id, status) {
  let task;

  switch (status.toLowerCase()) {
    case "todo":
      task = currentUser.data.board.todo.find(task => task.id === id);
      break;
    case "inprogress":
      task = currentUser.data.board.inProgress.find(task => task.id === id);
      break;
    case "awaitfeedback":
      task = currentUser.data.board.awaitFeedback.find(task => task.id === id);
      break;
    case "done":
      task = currentUser.data.board.done.find(task => task.id === id);
      break;
    default:
      return;
  }

  if (!task) {
    return;
  }

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

  if (newSubtaskText !== '') {
    let task;
    let taskIndex = -1;
    let status;

    if (currentUser && currentUser.data && currentUser.data.board) {
      const allTasks = [
        ...currentUser.data.board.todo,
        ...currentUser.data.board.inProgress,
        ...currentUser.data.board.awaitFeedback,
        ...currentUser.data.board.done
      ];

      taskIndex = allTasks.findIndex(t => t.id === taskId);
      task = allTasks[taskIndex];

      if (taskIndex < currentUser.data.board.todo.length) {
        status = 'todo';
      } else if (taskIndex < currentUser.data.board.todo.length + currentUser.data.board.inProgress.length) {
        status = 'inProgress';
      } else if (taskIndex < currentUser.data.board.todo.length + currentUser.data.board.inProgress.length + currentUser.data.board.awaitFeedback.length) {
        status = 'awaitFeedback';
      } else {
        status = 'done';
      }
    }

    if (!task) {
      return;
    }

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
  let task;
  let boardStatusArray;

  switch (status.toLowerCase()) {
    case "todo":
      boardStatusArray = currentUser.data.board.todo;
      break;
    case "inprogress":
      boardStatusArray = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      boardStatusArray = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      boardStatusArray = currentUser.data.board.done;
      break;
    default:
      return;
  }

  const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
  task = boardStatusArray[taskIndex];

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    return;
  }

  task.subtasks[subtaskIndex].text = newText;
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;
  await updateData(taskPath, task);
  const subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  subtaskItem.innerHTML = generateEditedSubtaskHTML(taskId, subtaskIndex, newText, status);
  showToDos();
}

async function deleteSubtaskEdit(taskId, subtaskIndex, status) {
  let task;
  let boardStatusArray;

  switch (status.toLowerCase()) {
    case "todo":
      boardStatusArray = currentUser.data.board.todo;
      break;
    case "inprogress":
      boardStatusArray = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      boardStatusArray = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      boardStatusArray = currentUser.data.board.done;
      break;
    default:
      return;
  }

  const taskIndex = boardStatusArray.findIndex(t => t.id === taskId);
  task = boardStatusArray[taskIndex];

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    return;
  }


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
  let taskList;

  switch (status.toLowerCase()) {
    case "todo":
      taskList = currentUser.data.board.todo;
      break;
    case "inprogress":
      taskList = currentUser.data.board.inProgress;
      break;
    case "awaitfeedback":
      taskList = currentUser.data.board.awaitFeedback;
      break;
    case "done":
      taskList = currentUser.data.board.done;
      break;
    default:
      return;
  }

  if (!taskList || !Array.isArray(taskList)) {
    return;
  }

  const taskIndex = taskList.findIndex(t => t.id === id);
  const task = taskList[taskIndex];

  if (taskIndex === -1 || !task) {
    return;
  }

  const titleElement = document.getElementById('title');
  const descriptionElement = document.getElementById('description');
  const dueDateElement = document.getElementById('dueDate');
  const priorityElement = document.querySelector('.priority-button.active');

  if (!titleElement || !descriptionElement || !dueDateElement || !priorityElement) {
    return;
  }

  task.title = titleElement.value;
  task.description = descriptionElement.value;
  task.dueDate = dueDateElement.value;
  task.priority = priorityElement.getAttribute('data-priority');
  task.contacts = selectedContacts;

  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

  await updateData(taskPath, task);
  showPopUp(id, status);
  showToDos();
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

  const currentContainer = document.getElementById(currentDraggedElement.status.toLowerCase() + '-container');
  const targetContainer = document.getElementById(newStatus.toLowerCase() + '-container');

  if (currentContainer) {
    currentContainer.classList.remove('highlight');
  }

  if (targetContainer) {
    targetContainer.classList.add('highlight');
  }

  let { id, status: currentStatus } = currentDraggedElement;

  currentStatus = currentStatus.toLowerCase();
  newStatus = newStatus.toLowerCase();

  let taskIndex;
  let task;

  switch (currentStatus) {
    case "todo":
      taskIndex = currentUser.data.board.todo.findIndex(task => task.id === id);
      task = currentUser.data.board.todo[taskIndex];
      if (taskIndex > -1) {
        currentUser.data.board.todo.splice(taskIndex, 1);
      }
      break;
    case "inprogress":
      taskIndex = currentUser.data.board.inProgress.findIndex(task => task.id === id);
      task = currentUser.data.board.inProgress[taskIndex];
      if (taskIndex > -1) {
        currentUser.data.board.inProgress.splice(taskIndex, 1);
      }
      break;
    case "awaitfeedback":
      taskIndex = currentUser.data.board.awaitFeedback.findIndex(task => task.id === id);
      task = currentUser.data.board.awaitFeedback[taskIndex];
      if (taskIndex > -1) {
        currentUser.data.board.awaitFeedback.splice(taskIndex, 1);
      }
      break;
    case "done":
      taskIndex = currentUser.data.board.done.findIndex(task => task.id === id);
      task = currentUser.data.board.done[taskIndex];
      if (taskIndex > -1) {
        currentUser.data.board.done.splice(taskIndex, 1);
      }
      break;
    default:
      return;
  }

  if (!task) {
    return;
  }

  task.status = newStatus;

  if (!currentUser.data.board[newStatus]) {
    currentUser.data.board[newStatus] = [];
  }

  switch (newStatus) {
    case "todo":
      currentUser.data.board.todo.push(task);
      break;
    case "inprogress":
      currentUser.data.board.inProgress.push(task);
      break;
    case "awaitfeedback":
      currentUser.data.board.awaitFeedback.push(task);
      break;
    case "done":
      currentUser.data.board.done.push(task);
      break;
    default:
      return;
  }

  await saveBoard();
  showToDos();

  if (targetContainer) {
    targetContainer.classList.remove('highlight');
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

  const todoTasks = (currentUser.data.board.todo || []).filter(task =>
    task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
  );
  const inProgressTasks = (currentUser.data.board.inProgress || []).filter(task =>
    task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
  );
  const feedbackTasks = (currentUser.data.board.awaitFeedback || []).filter(task =>
    task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
  );
  const doneTasks = (currentUser.data.board.done || []).filter(task =>
    task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
  );

  displayFilteredTasks(todoTasks, inProgressTasks, feedbackTasks, doneTasks);
}


function displayFilteredTasks(todoTasks, inProgressTasks, feedbackTasks, doneTasks) {
  let todoContainer = document.getElementById('ToDos');
  let inProgressContainer = document.getElementById('progress-container');
  let feedbackContainer = document.getElementById('feedback-container');
  let doneContainer = document.getElementById('done-container');

  todoContainer.innerHTML = '';
  inProgressContainer.innerHTML = '';
  feedbackContainer.innerHTML = '';
  doneContainer.innerHTML = '';

  if (todoTasks.length === 0) {
    todoContainer.innerHTML = '<div class="no-task-box">No tasks found</div>';
  } else {
    todoTasks.forEach((task) => {
      todoContainer.innerHTML += generateTodoHTML(task, task.id, 'todo');
    });
  }

  if (inProgressTasks.length === 0) {
    inProgressContainer.innerHTML = '<div class="no-task-box">No tasks found</div>';
  } else {
    inProgressTasks.forEach((task) => {
      inProgressContainer.innerHTML += generateTodoHTML(task, task.id, 'inProgress');
    });
  }

  if (feedbackTasks.length === 0) {
    feedbackContainer.innerHTML = '<div class="no-task-box">No tasks found</div>';
  } else {
    feedbackTasks.forEach((task) => {
      feedbackContainer.innerHTML += generateTodoHTML(task, task.id, 'awaitFeedback');
    });
  }

  if (doneTasks.length === 0) {
    doneContainer.innerHTML = '<div class="no-task-box">No tasks found</div>';
  } else {
    doneTasks.forEach((task) => {
      doneContainer.innerHTML += generateTodoHTML(task, task.id, 'done');
    });
  }
}


document.addEventListener('DOMContentLoaded', (event) => {
  if (window.location.pathname.endsWith('board.html')) {
    document.getElementById('ToDos').addEventListener('dragenter', onDragEnter);
    document.getElementById('ToDos').addEventListener('dragleave', onDragLeave);
    document.getElementById('ToDos').addEventListener('drop', (event) => {
      moveTo('todo');
      event.currentTarget.classList.remove('highlight');
    });

    document.getElementById('progress-container').addEventListener('dragenter', onDragEnter);
    document.getElementById('progress-container').addEventListener('dragleave', onDragLeave);
    document.getElementById('progress-container').addEventListener('drop', (event) => {
      moveTo('inprogress');
      event.currentTarget.classList.remove('highlight');
    });

    document.getElementById('feedback-container').addEventListener('dragenter', onDragEnter);
    document.getElementById('feedback-container').addEventListener('dragleave', onDragLeave);
    document.getElementById('feedback-container').addEventListener('drop', (event) => {
      moveTo('awaitfeedback');
      event.currentTarget.classList.remove('highlight');
    });

    document.getElementById('done-container').addEventListener('dragenter', onDragEnter);
    document.getElementById('done-container').addEventListener('dragleave', onDragLeave);
    document.getElementById('done-container').addEventListener('drop', (event) => {
      moveTo('done');
      event.currentTarget.classList.remove('highlight');
    });
  }
});