// currentUser.data.board = {
//   todo: [],
//   inProgress: [],
//   awaitFeedback: [],
//   done: []
//    };

let subtaskIndexCounter = 0;
let currentDraggedElement;

async function init() {
  includeHTML();
  await loadCurrentUserBoard();
  //await loadAllContacts();
  showToDos();
}

async function loadCurrentUserBoard() {
  try {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');

    // Konstruieren Sie den Pfad für die Firebase-Anfrage.
    let path;
    if (cleanedEmail && userId) {
      path = `users/${cleanedEmail}/${userId}`;
    } else {
      console.error("Keine gereinigte E-Mail-Adresse oder Benutzer-ID im Local Storage gefunden.");
      return; // Frühes Beenden der Funktion, falls keine gültigen Daten vorhanden sind
    }

    // Lade die Benutzerdaten basierend auf dem konstruierten Pfad.
    const userData = await loadData(path);

    if (userData && userData.name) { // Überprüfen Sie auch, ob ein Name vorhanden ist
      currentUser = { id: userId, data: userData }; // Speichern Sie die vollständigen Benutzerdaten in currentUser
      setProfileInitials();  // Aufruf hier, nachdem currentUser aktualisiert wurde
      console.log('Loaded currentUser:', currentUser); // Ausgabe des geladenen Benutzers in der Konsole
    } else {
      console.error("Keine vollständigen Benutzerdaten gefunden.");
    }
  } catch (error) {
    console.error("Fehler beim Laden des aktuellen Benutzers:", error);
  }
}


function getCategoryBackgroundColor(category) {
  if (category === 'Technical Task') {
    return '#1FD7C1';
  } else if (category === 'User Story') {
    return '#038ff0';
  }
}

function showToDos() {
  // Stelle sicher, dass currentUser und currentUser.data.board.todo verfügbar sind
  if (!currentUser || !currentUser.data || !currentUser.data.tasks) {
    console.error("No todo tasks available to display.");
    return;
  }

  let todoTasks = currentUser.data.tasks;
  let todoContainer = document.getElementById('ToDos');
  todoContainer.innerHTML = ''; // Vorherige Inhalte löschen

  for (let i = 0; i < todoTasks.length; i++) {
    const task = todoTasks[i];
    const todoHTML = generateTodoHTML(task, i);
    todoContainer.innerHTML += todoHTML;
  }

  //let inProgressTask = currentUser.data.board.inProgress.filter(task => task.status == "In Progress");
  let inProgressTask = currentUser.data.tasks;
  let inProgressContainer = document.getElementById('progress-container');
  inProgressContainer.innerHTML = '';

  for (let i = 0; i < inProgressTask.length; i++) {
    const task = inProgressTask[i];
    const inProgressHTML = generateTodoHTML(task, i);
    inProgressContainer.innerHTML += inProgressHTML;

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
  const task = currentUser.data.tasks[index];
  const popUpHTML = generatePopUpHTML(task, index)
  showOverlayAndPopUp();
  let popUp = document.getElementById('pop-up');
  popUp.innerHTML = popUpHTML;
}

function deleteCard(index) {
  // Entferne den Task aus dem currentUser.data.tasks Array
  currentUser.data.tasks.splice(index, 1);
  // Aktualisiere die Boards mit den verbleibenden Tasks
  distributeTasksToBoard();

  // Speichere den aktualisierten currentUser
  saveCurrentUser().then(() => {
    console.log('Task successfully deleted and user saved');
    // Aktualisiere das UI
    showToDos();
    // Schließe das Pop-up oder führe weitere UI-Aktualisierungen durch, wenn nötig
    closePopUp();
  }).catch(error => {
    console.error('Error saving the user after deleting task:', error);
  });
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


/**
 * Creates a new task and adds it to the task list if all input validations pass.
 * It saves the updated task list to storage and resets the user interface.
 * @async
 */
async function createTaskOnBoard() {
  if (validateTaskInputs()) {
    const newTask = constructNewTask();
    if (!currentUser) {
      console.error("No current user logged in. Task cannot be added.");
      return;
    }
    currentUser.data.tasks.push(newTask);
    distributeTasksToBoard();
    await saveCurrentUser();  // Speichert den aktuellen Benutzer mit den neuen Aufgaben
    console.log('Task added to current user tasks:', currentUser.data.tasks);
    resetUI();
    initiateConfirmation('Task added to <img class="add-task-icon-board" src="assets/img/icons/board.png" alt="Board">');
    closeAddTaskPopUp();
  }
}

function showAddTaskPopUpEdit(index) {
  const task = currentUser.data.tasks[index];
  let popUp = document.getElementById('pop-up');
  let date = task.dueDate;
  let category = task.category;
  let priority = task.priority;
  let subtasks = generateSubtaskHTMLEdit(task.subtasks);
  let usersHTML = generateUserHTMLEdit(task.contacts);

  popUp.innerHTML = generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, index);
}


function generateSubtaskHTMLEdit(subtasks) {
  let subtaskHTML = '';
  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    subtaskHTML += generateSubtaskHTML(subtaskIndexCounter++, subtask);
  }
  return subtaskHTML;
}

function addSubtaskToEditWindow() {
  let newSubtask = document.getElementById('subTaskInputEdit').value;

  if (newSubtask.trim() !== '') {
    let subtaskContainer = document.getElementById('subtaskContainerEdit');
    subtaskContainer.insertAdjacentHTML('beforeend', generateSubtaskHTML(subtaskIndexCounter++, newSubtask));
    document.getElementById('subTaskInputEdit').value = '';
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


function editSubtaskEdit(subtaskIndex) {
  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  let subtaskSpan = document.getElementById(`subTask_${subtaskIndex}_span`);
  let subtaskText = subtaskSpan.innerHTML.trim();
  let subtaskInput = `<div class="edit-subtask-under-container">
                      <input class="edit-input" type="text" id="subTask_${subtaskIndex}_input" value="${subtaskText}">
                      <div class="sub-image-container-edit" id="image-container">
                      <img id="addBtnEdit" src="assets/img/icons/check_blue.png" alt="" onclick="saveEditedSubtask(${subtaskIndex})" style="display: block;">
                      <div id="sub-seperator" class="subtask-seperator-edit" style="display: block;">
                      </div>
                      <img id="closeBtn" src="./assets/img/icons/trash.png" onclick="deleteSubtaskEdit(${subtaskIndex})" alt="" style="display: block;">
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
      saveEditedSubtask(subtaskIndex); // Änderungen speichern
    }
  });
}

function saveEditedSubtask(subtaskIndex) {
  let subtaskInput = document.getElementById(`subTask_${subtaskIndex}_input`);
  let newText = subtaskInput.value.trim();
  let subtaskItem = document.getElementById(`subTaskItem_${subtaskIndex}`);
  subtaskItem.innerHTML = `
            <div class="subtask-item-edit" id="subTaskItem_${subtaskIndex}">
              <div>
                •
                <span id="subTask_${subtaskIndex}_span">${newText}</span>
              </div>
              <div class="subtask-item-icons">
                <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit(${subtaskIndex})">
                <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit(${subtaskIndex})">
              </div>
            </div>
      `;
}

function deleteSubtaskEdit(index) {
  let subtaskContainer = document.getElementById(`subTask_${index}`);
  subtaskContainer.remove();
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
  currentUser.data.board.todo[currentDraggedElement]['status'] = status;
  const movedTask = currentUser.data.board.todo.splice(currentDraggedElement, 1)[0];
  currentUser.data.board.inProgress.push(movedTask);

  showToDos();
}



