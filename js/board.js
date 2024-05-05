// currentUser.data.board = {
//   todo: [],
//   inProgress: [],
//   awaitFeedback: [],
//   done: []
// };

let subtaskIndexCounter = 0;


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
  let subtasks = generateSubtaskHTMLEdit(task.subtasks);
  let usersHTML = generateUserHTMLEdit(task.contacts);

  popUp.innerHTML = generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, index);
}



function generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, index) {

  return `
    <div class="form-container">
          <div class="task-title-popup-edit">
            <h1></h1>
            <img onclick="closePopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
          </div>
          <form class="task-form-edit" id="taskForm">
            <div class="form-left-edit">
              <div class="form-group-edit">
                <label for="title">Title<span class="form-required-color">*</span></label>
                <input type="text" id="title" required value="${task.title}"
                  oninput="hideValidationError('title', 'title-error-message')">
                <span id="title-error-message" class="error-message">This field is required.</span>
              </div>
              <div class="form-group-edit">
                <label for="description">Description</label>
                <textarea class="no-validate" id="description" placeholder="Enter a Description">${task.description}</textarea>
              </div>
              <!-- assign to list -->
              <div class="form-group-edit">
                <label for="assignedTo">Assigned to</label>
                <div class="drop-down-menu-container" onclick="toggleAssignDropdownMenu()">
                  <div class="drop-down-image-container">
                    <img id="arrow-assign-to" src="assets/img/icons/arrow_drop_down.png" alt="">
                  </div>
                  <input class="no-validate task-assign" type="text" id="assignedTo"
                    placeholder="Select contacts to assign" oninput="filterContacts(this.value)">
  
                  <div id="assign-dropdown-menu" class="dropdown-menu">
                    <!-- render contact list here -->
                    <div class="task-contact-list" id="task-contact-list"></div>
                  </div>
                  <div class="users-edit-flex"></div>
                </div>
                <div class="selected-contacts-container" id="selected-contacts-list-edit">
                  ${usersHTML}
                </div>
              </div>
            </div>
  
  
            <div class="form-right-edit">
              <!-- Date -->
              <div class="form-group-edit">
                <label for="dueDate">Due date<span class="form-required-color"></span></label>
                <input type="date" id="dueDate" required value="${date}" onchange="validateDueDate()">
                <span id="date-error-message" class="error-message" style="display: none;">This
                  field is required</span>
              </div>
  
              <!-- priority buttons -->
              <div class="form-group priority">
                <label>Prio</label>
                <div class="priority-button-container">
                <button id="priority-urgent" class="priority-button on-edit ${priority === 'urgent' ? 'active' : ''}" data-priority="urgent"
                  onclick="togglePriority('priority-urgent')"><span>Urgent</span> <img src="assets/img/icons/urgent.png"
                  alt="Urgent Priority">
                </button>
                <button id="priority-medium" class="priority-button on-edit ${priority === 'medium' ? 'active' : ''}" data-priority="medium"
                  onclick="togglePriority('priority-medium')"><span>Medium</span> <img src="assets/img/icons/medium.png"
                  alt="Medium Priority">
                </button>
                <button id="priority-low" class="priority-button on-edit ${priority === 'low' ? 'active' : ''}" data-priority="low"
                  onclick="togglePriority('priority-low')"><span>Low</span> <img src="assets/img/icons/low.png"
                  alt="Low Priority">
                </button>
            </div>
          </div>
  
              <div class="form-group-edit select-container">
                <label for="category">Category<span class="form-required-color">*</span></label>
                <div class="select-dropdown" style="pointer-events: none; color: lightgrey;" id="select-dropdown" onclick="toggleCategoryDropdownMenu()">
                  <div class="selected-option" id="selected-option">${category}</div>
                  <div class="drop-down-image-container">
                    <img id="arrow-category" src="assets/img/icons/arrow_drop_down.png" alt="">
                  </div>
                  <div class="dropdown-menu" id="category-dropdown-menu">
                    <div class="dropdown-category" onclick="setSelectedCategory(1)">Technical
                      Task</div>
                    <div class="dropdown-category" onclick="setSelectedCategory(2)">User Story
                    </div>
                  </div>
                </div>
                <select id="category-todo" required class="d-none task-category">
                  <option value="Technical Task">Technical Task</option>
                  <option value="User Story">User Story</option>
                </select>
                <div id="category-error-message" class="error-message">This field is required.</div>
              </div>
              <div class="form-group">
                <label>Subtasks</label>
                <div class="drop-down-menu-container">
  
                  <div class="sub-image-container" id="image-container">
                    <img id="addBtnEdit" src="assets/img/icons/add.png" alt="" onclick="addSubtaskToEditWindow(${index})">
                    <div id="sub-seperator" class="subtask-seperator" style="display:none;">
                    </div>
                    <img id="closeBtn" src="assets/img/icons/close.png"
                      onclick="clearInputFieldEdit(), toggleAddButtonImageEdit()" alt="" style="display:none;">
                  </div>
  
                  <input class="no-validate subtask" type="text" id="subTaskInputEdit" maxlength="15"
                    placeholder="Add new subtask" onkeypress="handleKeyPress(event, ${index})" oninput="toggleAddButtonImageEdit()">
                </div>
                <div class="subtask-container-edit" id="subtaskContainerEdit">
                  ${subtasks}
                </div>
              </div>
            </div>
          </form>
            <div class="edit-btn-position">
                <button class="fb rb" onclick="updateSubtaskEdit(${index})">OK<img src="assets/img/icons/check.png"
                  alt="Update Task"></button>
                </div>
            </div>
        </div>

    `;

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

function generateSubtaskHTML(index, subtask) {
  return `
    <div class="subtask-edit-container" id="subTask_${index}">
      <div class="subtask-item" id="subTaskItem_${index}">
        <div>
          •
          <span id="subTask_${index}_span">${subtask}</span>
        </div>
        <div class="subtask-item-icons">
          <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit(${index})">
          <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit(${index})">
        </div>
      </div>
    </div>
  `;
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

function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromLocalStorage() {
  const tasksJSON = localStorage.getItem('tasks');
  return JSON.parse(tasksJSON);
}


function updateSubtaskEdit(index) {
  saveTasksToLocalStorage(index);
  showPopUp(index); 
 
}

function handleKeyPress(event, index) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtaskToEditWindow(index);
  }
}


