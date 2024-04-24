// currentUser.data.board = {
//   todo: [],
//   inProgress: [],
//   awaitFeedback: [],
//   done: []
// };


async function init() {
  includeHTML();
  currentUser = await loadCurrentUser();
  if (currentUser && currentUser.data) {
    await loadTasksFromStorage();
    await loadContactsFromStorage();
    console.warn('CurrentUser tasks are ===', currentUser.data.tasks);
    showToDos();
  } else {
    console.error('currentUser is not defined');
  }
}

async function loadTasksFromStorage() {
  try {
    const currentUserString = await getItem('currentUser');
    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      allTasks = currentUser.data.tasks;  // Update the global tasks array with currentUser's tasks
      console.log('Tasks loaded from currentUser:', allTasks);
    } else {
      console.log('No tasks found in currentUser. Starting with an empty task list.');
      allTasks = [];
    }
  } catch (e) {
    console.warn('Could not load tasks from currentUser:', e);
    allTasks = [];  // Reset the tasks array on failure
  }
}


// Später noch eine saveCurrentUserToStorage() erstellen die erst den User speichert und dann allUser







function getCategoryBackgroundColor(category) {
  if (category === 'Technical Task') {
    return '#1FD7C1';
  } else if (category === 'User Story') {
    return '#038ff0';
  }
}

function showToDos() {
  // Stelle sicher, dass currentUser und currentUser.data.board.todo verfügbar sind
  if (!currentUser || !currentUser.data || !currentUser.data.board || !currentUser.data.board.todo) {
    console.error("No todo tasks available to display.");
    return;
  }

  let todoTasks = currentUser.data.board.todo; // Zugriff auf die Todo-Tasks
  let todoContainer = document.getElementById('ToDos');
  todoContainer.innerHTML = ''; // Vorherige Inhalte löschen

  for (let i = 0; i < todoTasks.length; i++) {
    const task = todoTasks[i];
    const todoHTML = generateTodoHTML(task, i);
    todoContainer.innerHTML += todoHTML;
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
  addTaskPopUp.innerHTML = generateAddTaksPopUpHTML();
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
  const task = allTasks[index];
  let popUp = document.getElementById('pop-up');
  let date = task.dueDate;
  let category = task.category;
  let priority = task.priority;
  let subtasks = subtaskTemplateEdit(task.subtasks);
  let usersHTML = generateUserHTMLEdit(task.contacts);
  popUp.innerHTML = generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority);
}


