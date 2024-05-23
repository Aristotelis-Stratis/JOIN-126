let subtaskIndexCounter = 0;
let currentDraggedElement;

async function init() {
  includeHTML();
  await loadCurrentUserBoard();
  showToDos();
}

async function loadCurrentUserBoard() {
  try {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');

    if (cleanedEmail && userId) {
      const path = `users/${cleanedEmail}/${userId}`;
      const userData = await loadData(path);

      if (userData) {
        currentUser = { id: userId, data: userData };
        if (!currentUser.data.board) {
          currentUser.data.board = {};
        }
        currentUser.data.board.todo = currentUser.data.board.todo || [];
        currentUser.data.board.inProgress = currentUser.data.board.inProgress || [];
        currentUser.data.board.awaitFeedback = currentUser.data.board.awaitFeedback || [];
        currentUser.data.board.done = currentUser.data.board.done || [];
        
        setProfileInitials();
        console.log('Loaded currentUser:', currentUser);
      } else {
        console.error("Keine vollständigen Benutzerdaten gefunden.");
      }
    } else {
      console.error("Keine gereinigte E-Mail-Adresse oder Benutzer-ID im Local Storage gefunden.");
    }
  } catch (error) {
    console.error("Fehler beim Laden des aktuellen Benutzers:", error);
  }
}


function showToDos() {
  if (!currentUser || !currentUser.data || !currentUser.data.board) {
    console.error("Keine Aufgaben verfügbar zum Anzeigen.");
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

  // Füge Aufgaben zu den entsprechenden Containern hinzu
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
      // Setze ein Standardbild, falls keine Übereinstimmung gefunden wurde
      priorityImage = './assets/img/icons/low.png';
      break;
  }

  return priorityImage;
}


async function toggleSubtaskCheck(taskIndex, subtaskIndex, status) {
  let task;

  switch (status) {
    case "todo":
      task = currentUser.data.board.todo[taskIndex];
      break;
    case "inProgress":
      task = currentUser.data.board.inProgress[taskIndex];
      break;
    case "awaitFeedback":
      task = currentUser.data.board.awaitFeedback[taskIndex];
      break;
    case "done":
      task = currentUser.data.board.done[taskIndex];
      break;
    default:
      console.error("Invalid status:", status);
      return;
  }

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    console.error("Task or subtasks array not found or invalid.");
    return;
  }

  task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const subtaskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}/subtasks`;

  try {
    await updateData(subtaskPath, task.subtasks);
    console.log('Subtask status updated in Firebase.');
  } catch (error) {
    console.error('Error updating subtask status in Firebase:', error);
  }

  showPopUp(taskIndex, status);
  updateProgressBar(taskIndex, status);
}

function updateProgressBar(taskIndex, status) {
  let task;

  switch (status) {
    case "todo":
      task = currentUser.data.board.todo[taskIndex];
      break;
    case "inProgress":
      task = currentUser.data.board.inProgress[taskIndex];
      break;
    case "awaitFeedback":
      task = currentUser.data.board.awaitFeedback[taskIndex];
      break;
    case "done":
      task = currentUser.data.board.done[taskIndex];
      break;
    default:
      console.error("Invalid status:", status);
      return;
  }

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    return;
  }

  const totalTasks = task.subtasks.length;
  const completedTasks = task.subtasks.filter(subtask => subtask.completed).length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const taskElement = document.querySelector(`[data-task-index="${taskIndex}"][data-task-status="${status}"]`);
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
      console.error("Invalid status:", status);
      return;
  }

  if (!task) {
    console.error(`Task with id "${id}" not found.`);
    return;
  }

  const priority = task.priority ? task.priority : 'low';
  const popUpHTML = generatePopUpHTML(task, id, priority, status);
  showOverlayAndPopUp();
  let popUp = document.getElementById('pop-up');
  popUp.innerHTML = popUpHTML;
  updateProgressBar(id, status);
}

async function deleteCard(index, status) {
  try {
    if (!currentUser || !currentUser.data || !currentUser.data.board) {
      console.error("No current user or tasks available. Task cannot be deleted.");
      return;
    }

    let taskList;
    switch (status) {
      case "todo":
        taskList = currentUser.data.board.todo;
        break;
      case "inProgress":
        taskList = currentUser.data.board.inProgress;
        break;
      case "awaitFeedback":
        taskList = currentUser.data.board.awaitFeedback;
        break;
      case "done":
        taskList = currentUser.data.board.done;
        break;
      default:
        console.error("Invalid status:", status);
        return;
    }

    // Entferne den Task aus dem entsprechenden Array
    taskList.splice(index, 1);

    // Initialisiere die Board-Struktur, falls sie nicht existiert
    if (!currentUser.data.board.todo) {
      currentUser.data.board.todo = [];
    }
    if (!currentUser.data.board.inProgress) {
      currentUser.data.board.inProgress = [];
    }
    if (!currentUser.data.board.awaitFeedback) {
      currentUser.data.board.awaitFeedback = [];
    }
    if (!currentUser.data.board.done) {
      currentUser.data.board.done = [];
    }

    // Bestimme den Pfad zum gesamten Board in Firebase
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    // Aktualisiere das gesamte Board in Firebase
    await updateData(boardPath, currentUser.data.board);

    // Aktualisiere das UI
    closePopUp();
    showToDos();

    console.log('Task successfully deleted and board updated.');
  } catch (error) {
    console.error('Error deleting task:', error);
  }
  updateNoTaskPlaceholders();
}

function closePopUp() {
  const overlay = document.getElementById('overlay');
  const popUp = document.getElementById('pop-up');
  popUp.classList.remove('slide-in-animation');
  popUp.classList.add('closing-animation');

  // Warten Sie auf das Ende der Animation, bevor Sie das Popup ausblenden
  setTimeout(() => {
    overlay.classList.add('d-none-board'); // Overlay ausblenden
    popUp.classList.remove('closing-animation'); // Zur Wiederverwendung vorbereiten
    document.body.classList.remove('no-scroll'); // Body scrollen wieder erlauben
  }, 500); // Die Dauer der Schließanimation in Millisekunden
}

function doNotClosePopUp(event) {
  event.stopPropagation();
}

function showAddTaskPopUp(status = 'todo') {
  let overlay = document.getElementById('overlay2');
  let addTaskPopUp = document.getElementById('addTaskPopUp');
  addTaskPopUp.innerHTML = generateAddTaskPopUpHTML(status); // Übergib den Status
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
    newTask.status = status.toLowerCase(); // Setze den Status des neuen Tasks
    newTask.id = generateUniqueId(); // Eindeutige ID generieren

    if (!currentUser || !currentUser.data) {
      console.error("Kein angemeldeter Benutzer oder unvollständige Benutzerdaten. Aufgabe kann nicht hinzugefügt werden.");
      return;
    }

    // Initialisiere das Board- und Status-Arrays, falls sie nicht existieren
    if (!currentUser.data.board) {
      currentUser.data.board = {
        todo: [],
        inProgress: [],
        awaitFeedback: [],
        done: []
      };
    }

    if (!currentUser.data.board.todo) {
      currentUser.data.board.todo = [];
    }
    if (!currentUser.data.board.inProgress) {
      currentUser.data.board.inProgress = [];
    }
    if (!currentUser.data.board.awaitFeedback) {
      currentUser.data.board.awaitFeedback = [];
    }
    if (!currentUser.data.board.done) {
      currentUser.data.board.done = [];
    }

    // Füge den Task basierend auf dem Status in das richtige Array ein
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
        console.error("Invalid status:", newTask.status);
        return;
    }

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    try {
      await updateData(boardPath, currentUser.data.board);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      resetUI();
      showToDos();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aufgabe zu Firebase:', error);
    }
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
      console.error("Invalid status:", status);
      return;
  }

  if (!task) {
    console.error(`Task with id "${id}" not found.`);
    return;
  }

  task.contacts = Array.isArray(task.contacts) ? task.contacts : [];
  selectedContacts = [...task.contacts];
  let popUp = document.getElementById('pop-up');
  let date = task.dueDate;
  let category = task.category;
  let priority = task.priority;
  let subtasks = generateSubtaskHTMLEdit(id, task.subtasks, status);
  let usersHTML = generateUserHTMLEdit(task.contacts);

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
      subtaskHTML += generateSubtaskHTML(taskIndex, i, subtask, status); // Hier den Status übergeben
    }
  }
  return subtaskHTML;
}

async function addSubtaskToEditWindow(taskIndex) {
  let newSubtaskText = document.getElementById('subTaskInputEdit').value.trim();

  if (newSubtaskText !== '') {
    const task = currentUser.data.board.todo[taskIndex];
    if (!task.subtasks || !Array.isArray(task.subtasks)) {
      task.subtasks = [];
    }
    task.subtasks.push({ text: newSubtaskText, completed: false });

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const subtaskPath = `users/${cleanedEmail}/${userId}/board/todo/${taskIndex}/subtasks`;
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    try {
      await updateData(subtaskPath, task.subtasks);
      await updateData(boardPath, currentUser.data.board);  // Aktualisiere das gesamte Board
      console.log('New subtask added and board updated in Firebase.');
    } catch (error) {
      console.error('Error adding subtask and updating board in Firebase:', error);
    }

    updateSubtaskUI(taskIndex, task.subtasks);

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


function editSubtaskEdit(taskIndex, subtaskIndex, status) {
  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  let subtaskSpan = document.getElementById(`subTask_${subtaskIndex}_span`);
  let subtaskText = subtaskSpan.innerHTML.trim();
  let subtaskInput = `
    <div class="edit-subtask-under-container">
      <input class="edit-input" type="text" id="subTask_${subtaskIndex}_input" value="${subtaskText}">
      <div class="sub-image-container-edit" id="image-container">
        <img id="addBtnEdit" src="assets/img/icons/check_blue.png" alt="" onclick="saveEditedSubtask(${taskIndex}, ${subtaskIndex}, '${status}')" style="display: block;">
        <div id="sub-seperator" class="subtask-seperator-edit" style="display: block;"></div>
        <img id="closeBtn" src="./assets/img/icons/trash.png" onclick="deleteSubtaskEdit(${taskIndex}, ${subtaskIndex}, '${status}')" alt="" style="display: block;">
      </div>
    </div>
  `;
  subtaskItem.innerHTML = subtaskInput;

  let subtaskInputElement = document.getElementById(`subTask_${subtaskIndex}_input`);
  subtaskInputElement.focus();

  subtaskInputElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditedSubtask(taskIndex, subtaskIndex, status); // Änderungen speichern
    }
  });
}

async function saveEditedSubtask(taskIndex, subtaskIndex, status) {
  let subtaskInput = document.getElementById(`subTask_${subtaskIndex}_input`);
  let newText = subtaskInput.value.trim();
  let task;
  
  switch (status.toLowerCase()) {
    case "todo":
      task = currentUser.data.board.todo[taskIndex];
      break;
    case "inprogress":
      task = currentUser.data.board.inProgress[taskIndex];
      break;
    case "awaitfeedback":
      task = currentUser.data.board.awaitFeedback[taskIndex];
      break;
    case "done":
      task = currentUser.data.board.done[taskIndex];
      break;
    default:
      console.error("Invalid status:", status);
      return;
  }

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    console.error("Task or subtasks array not found or invalid.");
    return;
  }

  task.subtasks[subtaskIndex].text = newText;  // Aktualisieren des Textfelds der Subtask

  // Speichern der aktualisierten Subtask-Liste in Firebase
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const subtaskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}/subtasks`;

  try {
    await updateData(subtaskPath, task.subtasks);
    console.log('Subtask updated in Firebase.');
  } catch (error) {
    console.error('Error updating subtask in Firebase:', error);
  }

  // Aktualisieren des UI
  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  subtaskItem.innerHTML = `
    <div class="subtask-item-edit" id="subTaskItem_${subtaskIndex}">
      <div>
        •
        <span id="subTask_${subtaskIndex}_span">${newText}</span>
      </div>
      <div class="subtask-item-icons">
        <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit(${taskIndex}, ${subtaskIndex}, '${status}')">
        <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit(${taskIndex}, ${subtaskIndex}, '${status}')">
      </div>
    </div>
  `;
  showToDos(); // Aktualisieren des gesamten To-Do-Boards
}

async function deleteSubtaskEdit(taskIndex, subtaskIndex, status) {
  let task;
  
  switch (status.toLowerCase()) {
    case "todo":
      task = currentUser.data.board.todo[taskIndex];
      break;
    case "inprogress":
      task = currentUser.data.board.inProgress[taskIndex];
      break;
    case "awaitfeedback":
      task = currentUser.data.board.awaitFeedback[taskIndex];
      break;
    case "done":
      task = currentUser.data.board.done[taskIndex];
      break;
    default:
      console.error("Invalid status:", status);
      return;
  }

  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    console.error("Subtasks array not found or invalid for the task.");
    return;
  }

  task.subtasks.splice(subtaskIndex, 1);

  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const subtaskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}/subtasks`;
  const boardPath = `users/${cleanedEmail}/${userId}/board`;

  try {
    await updateData(subtaskPath, task.subtasks);
    await updateData(boardPath, currentUser.data.board);  // Aktualisiere das gesamte Board
    console.log('Subtask removed and board updated in Firebase.');
  } catch (error) {
    console.error('Error removing subtask and updating board in Firebase:', error);
  }

  const subtaskContainer = document.getElementById(`subTaskItem_${subtaskIndex}`);
  if (subtaskContainer) {
    subtaskContainer.remove();
  }
  updateSubtaskUI(taskIndex, task.subtasks, status);
  showToDos();
}

function updateSubtaskUI(taskIndex, subtasks, status) {
  const subtaskContainer = document.getElementById('subtaskContainerEdit');
  subtaskContainer.innerHTML = ''; // Leere den Container

  for (let i = 0; i < subtasks.length; i++) {
    const subtaskHTML = generateSubtaskHTML(taskIndex, i, subtasks[i], status);
    subtaskContainer.insertAdjacentHTML('beforeend', subtaskHTML);
  }
}



// function updateSubtaskEdit(index) {
//   showPopUp(index);
// }

async function updateSubtaskEdit(id, status) {
  let taskList;
  let taskIndex = -1;

  console.log('Update Task:', id, status);
  
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
      console.error("Invalid status:", status);
      return;
  }

  if (!taskList || !Array.isArray(taskList)) {
    console.error(`Task list for status "${status}" not found or invalid.`);
    return;
  }

  const task = taskList.find(t => t.id === id);
  taskIndex = taskList.findIndex(t => t.id === id);

  if (taskIndex === -1 || !task) {
    console.error(`Task with id "${id}" not found.`);
    return;
  }

  console.log('Task found:', task);

  const titleElement = document.getElementById('title');
  const descriptionElement = document.getElementById('description');
  const dueDateElement = document.getElementById('dueDate');
  const priorityElement = document.querySelector('.priority-button.active');
  
  if (!titleElement || !descriptionElement || !dueDateElement || !priorityElement) {
    console.error('Required elements for updating task not found.');
    return;
  }

  task.title = titleElement.value;
  task.description = descriptionElement.value;
  task.dueDate = dueDateElement.value;
  task.priority = priorityElement.getAttribute('data-priority');
  task.contacts = selectedContacts; // Aktualisiere die Kontakte mit den ausgewählten Kontakten

  console.log('Updated task data:', task);

  // Aktualisiere die Aufgabe in Firebase
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const taskPath = `users/${cleanedEmail}/${userId}/board/${status}/${taskIndex}`;

  try {
    await updateData(taskPath, task);
    console.log('Task updated in Firebase.');
  } catch (error) {
    console.error('Error updating task in Firebase:', error);
  }

  showPopUp(id, status); // Zeige das aktualisierte Popup an
  showToDos(); // Aktualisiere das Board
}

function handleKeyPress(event, index) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtaskToEditWindow(index);
  }
}

function startdragging(id, status) {
  currentDraggedElement = { id, status };
  console.log('Started dragging:', currentDraggedElement);
}

function allowDrop(ev) {
  ev.preventDefault();
}

async function moveTo(newStatus) {
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
      console.error("Invalid current status:", currentStatus);
      return;
  }

  if (!task) {
    console.error(`Task with id "${id}" not found in current status "${currentStatus}" array.`);
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
      console.error("Invalid target status:", newStatus);
      return;
  }

  await saveBoard();
  showToDos();
  updateNoTaskPlaceholders();
}

async function saveBoard() {
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const boardPath = `users/${cleanedEmail}/${userId}/board`;

  try {
    await updateData(boardPath, currentUser.data.board);
    console.log('Board updated in Firebase.');
  } catch (error) {
    console.error('Error updating board in Firebase:', error);
  }
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


// Function to filter tasks
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
    todoContainer.innerHTML = '<div class="no-task-box">Keine Ergebnisse gefunden</div>';
  } else {
    todoTasks.forEach((task) => {
      todoContainer.innerHTML += generateTodoHTML(task, task.id, 'todo');
    });
  }

  if (inProgressTasks.length === 0) {
    inProgressContainer.innerHTML = '<div class="no-task-box">Keine Ergebnisse gefunden</div>';
  } else {
    inProgressTasks.forEach((task) => {
      inProgressContainer.innerHTML += generateTodoHTML(task, task.id, 'inProgress');
    });
  }

  if (feedbackTasks.length === 0) {
    feedbackContainer.innerHTML = '<div class="no-task-box">Keine Ergebnisse gefunden</div>';
  } else {
    feedbackTasks.forEach((task) => {
      feedbackContainer.innerHTML += generateTodoHTML(task, task.id, 'awaitFeedback');
    });
  }

  if (doneTasks.length === 0) {
    doneContainer.innerHTML = '<div class="no-task-box">Keine Ergebnisse gefunden</div>';
  } else {
    doneTasks.forEach((task) => {
      doneContainer.innerHTML += generateTodoHTML(task, task.id, 'done');
    });
  }
}