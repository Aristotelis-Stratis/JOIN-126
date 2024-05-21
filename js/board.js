
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
        // Initialisiere das Board- und Todo-Array, falls sie nicht existieren
        if (!currentUser.data.board) {
          currentUser.data.board = {};
        }
        if (!currentUser.data.board.todo) {
          currentUser.data.board.todo = [];
        }
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
  if (!currentUser || !currentUser.data || !currentUser.data.board || !currentUser.data.board.todo) {
    console.error("Keine Aufgaben verfügbar zum Anzeigen.");
    return;
  }

  let todoTasks = currentUser.data.board.todo.filter(task => task.status === "toDo");
  let inProgressTasks = currentUser.data.board.todo.filter(task => task.status === "In Progress");
  let feedbackTasks = currentUser.data.board.todo.filter(task => task.status === "Await Feedback");
  let doneTasks = currentUser.data.board.todo.filter(task => task.status === "Done");

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
      const todoHTML = generateTodoHTML(task, i);
      todoContainer.innerHTML += todoHTML;
  }

  for (let i = 0; i < inProgressTasks.length; i++) {
      const task = inProgressTasks[i];
      const inProgressHTML = generateTodoHTML(task, i);
      inProgressContainer.innerHTML += inProgressHTML;
  }

  for (let i = 0; i < feedbackTasks.length; i++) {
      const task = feedbackTasks[i];
      const awaitFeedbackHTML = generateTodoHTML(task, i);
      feedbackContainer.innerHTML += awaitFeedbackHTML;
  }

  for (let i = 0; i < doneTasks.length; i++) {
      const task = doneTasks[i];
      const doneHTML = generateTodoHTML(task, i);
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

function toggleSubtaskCheck(subtaskcheck) {
  let check = document.getElementById(subtaskcheck);
  if (check.src.includes('checkbox-checked-black-24.png')) {
    check.src = "./assets/img/icons/checkbox-empty-black-24.png";
  } else {
    check.src = "./assets/img/icons/checkbox-checked-black-24.png";
  }
}

function showOverlayAndPopUp() {
  let overlay = document.getElementById('overlay');
  let popUp = document.getElementById('pop-up');
  overlay.classList.remove('d-none-board');
  popUp.classList.remove('closing-animation');
  popUp.classList.add('slide-in-animation');
}


function showPopUp(index) {
  const task = currentUser.data.board.todo[index];
  const priority = task.priority ? task.priority : 'low';
  const popUpHTML = generatePopUpHTML(task, index, priority)
  showOverlayAndPopUp();
  let popUp = document.getElementById('pop-up');
  popUp.innerHTML = popUpHTML;
}

async function deleteCard(index) {
  try {
    if (!currentUser || !currentUser.data || !currentUser.data.board || !currentUser.data.board.todo) {
      console.error("No current user or tasks available. Task cannot be deleted.");
      return;
    }

    // Entferne den Task aus dem currentUser.data.board.todo Array
    currentUser.data.board.todo.splice(index, 1);

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

function showAddTaskPopUp() {
  let overlay = document.getElementById('overlay2');
  let addTaskPopUp = document.getElementById('addTaskPopUp');
  addTaskPopUp.innerHTML = generateAddTaskPopUpHTML();
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

async function createTaskOnBoard() {
  if (validateTaskInputs()) {
    const newTask = constructNewTask();
    if (!currentUser || !currentUser.data || !currentUser.data.board) {
      console.error("Kein angemeldeter Benutzer oder unvollständige Benutzerdaten. Aufgabe kann nicht hinzugefügt werden.");
      return;
    }

    // Initialisiere das Todo-Array, falls es nicht existiert
    if (!currentUser.data.board.todo) {
      currentUser.data.board.todo = [];
    }

    const newTaskIndex = currentUser.data.board.todo.length;
    currentUser.data.board.todo[newTaskIndex] = newTask;

    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const taskPath = `users/${cleanedEmail}/${userId}/board/todo/${newTaskIndex}`;

    try {
      await updateData(taskPath, newTask);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      resetUI();
      showToDos();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Aufgabe zu Firebase:', error);
    }
    closeAddTaskPopUp();
  }
}


function showAddTaskPopUpEdit(index) {
  const task = currentUser.data.board.todo[index];
  let popUp = document.getElementById('pop-up');
  let date = task.dueDate;
  let category = task.category;
  let priority = task.priority;
  let subtasks = generateSubtaskHTMLEdit(index, task.subtasks);
  let usersHTML = generateUserHTMLEdit(task.contacts);

  popUp.innerHTML = generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, index);
}


function generateSubtaskHTMLEdit(taskIndex, subtasks) {
  let subtaskHTML = '';

  if (subtasks && Array.isArray(subtasks)) {
    for (let i = 0; i < subtasks.length; i++) {
      const subtask = subtasks[i];
      subtaskHTML += generateSubtaskHTML(taskIndex, i, subtask);
    }
  }
  return subtaskHTML;
}

async function addSubtaskToEditWindow(taskIndex) {
  let newSubtask = document.getElementById('subTaskInputEdit').value.trim();

  if (newSubtask !== '') {
    // Füge die neue Unteraufgabe zum lokalen Datenmodell hinzu
    const task = currentUser.data.board.todo[taskIndex];
    if (!task.subtasks || !Array.isArray(task.subtasks)) {
      task.subtasks = [];
    }
    task.subtasks.push(newSubtask);

    // Aktualisiere die Daten in Firebase
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const boardPath = `users/${cleanedEmail}/${userId}/board`;

    try {
      // Aktualisiere das gesamte Board in Firebase
      await updateData(boardPath, currentUser.data.board);
      console.log('New subtask added to tasks.subtasks in Firebase.');
    } catch (error) {
      console.error('Error adding subtask to tasks.subtasks in Firebase:', error);
    }

    // Generiere HTML für die neue Unteraufgabe und füge sie zum Container hinzu
    let subtaskContainer = document.getElementById('subtaskContainerEdit');
    const subtaskIndex = task.subtasks.length - 1; // Index der neuen Unteraufgabe
    subtaskContainer.insertAdjacentHTML('beforeend', generateSubtaskHTML(taskIndex, subtaskIndex, newSubtask));

    // Lösche den Inhalt des Eingabefelds
    document.getElementById('subTaskInputEdit').value = '';
  }
  showToDos();
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


function editSubtaskEdit(taskIndex, subtaskIndex) {
  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  let subtaskSpan = document.getElementById(`subTask_${subtaskIndex}_span`);
  let subtaskText = subtaskSpan.innerHTML.trim();
  let subtaskInput = `<div class="edit-subtask-under-container">
                      <input class="edit-input" type="text" id="subTask_${subtaskIndex}_input" value="${subtaskText}">
                      <div class="sub-image-container-edit" id="image-container">
                      <img id="addBtnEdit" src="assets/img/icons/check_blue.png" alt="" onclick="saveEditedSubtask(${taskIndex}, ${subtaskIndex})" style="display: block;">
                      <div id="sub-seperator" class="subtask-seperator-edit" style="display: block;">
                      </div>
                      <img id="closeBtn" src="./assets/img/icons/trash.png" onclick="deleteSubtaskEdit(${taskIndex}, ${subtaskIndex})" alt="" style="display: block;">
                      </div>
                      </div>
                    `;
  subtaskItem.innerHTML = subtaskInput;

  document.getElementById(`subTask_${subtaskIndex}_input`).focus();

  let subtaskInputElement = document.getElementById(`subTask_${subtaskIndex}_input`);
  subtaskInputElement.focus();

  subtaskInputElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditedSubtask(taskIndex, subtaskIndex); // Änderungen speichern
    }
  });
}

function saveEditedSubtask(taskIndex, subtaskIndex) {
  let subtaskInput = document.getElementById(`subTask_${subtaskIndex}_input`);
  let newText = subtaskInput.value.trim();
  let task = currentUser.data.board.todo[taskIndex];
  if (!task || !task.subtasks || !Array.isArray(task.subtasks)) {
    console.error("Task or subtasks array not found or invalid.");
    return;
  }
  task.subtasks[subtaskIndex] = newText;

  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  subtaskItem.innerHTML = `
    <div class="subtask-item-edit" id="subTaskItem_${subtaskIndex}">
      <div>
        •
        <span id="subTask_${subtaskIndex}_span">${newText}</span>
      </div>
      <div class="subtask-item-icons">
        <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit(${taskIndex}, ${subtaskIndex})">
        <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit(${taskIndex}, ${subtaskIndex})">
      </div>
    </div>
  `;
}

async function deleteSubtaskEdit(taskIndex, subtaskIndex) {
  const task = currentUser.data.board.todo[taskIndex];
  if (!task.subtasks || !Array.isArray(task.subtasks)) {
    console.error("Subtasks array not found or invalid for the task.");
    return;
  }

  // Entferne den Subtask aus dem lokalen Datenmodell
  task.subtasks.splice(subtaskIndex, 1);

  // Aktualisiere die Daten in Firebase
  const cleanedEmail = localStorage.getItem('cleanedEmail');
  const userId = localStorage.getItem('currentUserId');
  const boardPath = `users/${cleanedEmail}/${userId}/board`;

  try {
    // Aktualisiere das gesamte Board in Firebase
    await updateData(boardPath, currentUser.data.board);
    console.log('Subtask removed from tasks.subtasks in Firebase.');
  } catch (error) {
    console.error('Error removing subtask from tasks.subtasks in Firebase:', error);
  }

  // Entferne den Subtask aus dem Container
  const subtaskContainer = document.getElementById(`subTaskItem_${subtaskIndex}`);
  if (subtaskContainer) {
    subtaskContainer.remove();
  }
  showToDos();
}


function updateSubtaskEdit(index) {
  showPopUp(index);
}

function handleKeyPress(event, index) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtaskToEditWindow(index);
  }
}

function startdragging(id) {
  currentDraggedElement = id;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function moveTo(status) {
  console.log('Moving task to:', status);
  let task = currentUser.data.board.todo[currentDraggedElement];
  task.status = status;

  // Entferne die Aufgabe aus ihrem aktuellen Container
  currentUser.data.board.todo.splice(currentDraggedElement, 1);

  // Aktualisiere den Status und füge die Aufgabe in den richtigen Container ein
  switch (status) {
    case "toDo":
      currentUser.data.board.todo.push(task);
      break;
    case "In Progress":
      currentUser.data.board.inProgress.push(task);
      break;
    case "Await Feedback":
      currentUser.data.board.awaitFeedback.push(task);
      break;
    case "Done":
      currentUser.data.board.done.push(task);
      break;
    default:
      console.error("Invalid status:", status);
  }

  showToDos();
}

function updateNoTaskPlaceholders() {
  const columns = [
    { id: 'ToDos', placeholder: 'No tasks To do' },
    { id: 'progress-container', placeholder: 'No Task is in Progress' },
    { id: 'feedback-container', placeholder: 'No Task requires Feedback' },
    { id: 'done-container', placeholder: 'No Task is Done' }
  ];

  columns.forEach(column => {
    const container = document.getElementById(column.id);
    const noTaskBox = container.querySelector('.no-task-box');

    if (container.children.length === 0) {
      // Wenn der Container leer ist und kein Placeholder vorhanden ist, füge einen hinzu
      if (!noTaskBox) {
        container.innerHTML = `<div class="no-task-box">${column.placeholder}</div>`;
      }
    } else {
      // Wenn der Container nicht leer ist und ein Placeholder vorhanden ist, entferne ihn
      if (noTaskBox) {
        noTaskBox.remove();
      }
    }
  });
}



