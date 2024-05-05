function generateTodoHTML(task, i) {
  let taskName = task.title;
  let taskDescription = task.description;
  let totalTasks = task.subtasks.length;
  let completedTasks = 1;
  let completionPercentage = (completedTasks / totalTasks) * 100
  let priorityImage = setPriority(task.priority);
  let category = task.category;
  let usersHTML = generateUserHTML(task.contacts);
  let backgroundColor = getCategoryBackgroundColor(category);

  return `
        <div draggable="true">
            <div class="cardA" onclick="showPopUp(${i})">
                  <span class="task-category-board" style="background-color: ${backgroundColor};">${category}</span>
                  <div class="card-middle-part">
                    <h4 class="task-name">${taskName}</h4>
                    <span class="task-description">${taskDescription}</span>
                  </div>
                  <div class="subtasks">
                    <div class="subtask-bar">
                      <div class="filled-subtask-bar" style="width: ${completionPercentage}%;"></div>
                    </div><span>1/${totalTasks} Subtasks</span>
                  </div>
                 <div class="asigned-to-flex"> 
                  <div class="asigned-to">
                    <div class="asigned-to-icons">
                        ${usersHTML}
                    </div>
                  </div>
                  <div class="asigned-to-image-container">
                      <img src="${priorityImage}" alt="medium-png">
                  </div>
                 </div>
            </div>
        </div>
        `;
}


function generatePopUpHTML(task, index) {
  let taskName = task.title;
  let taskDescription = task.description;
  let date = task.dueDate;
  let priority = task.priority;
  let priorityImage = setPriority(task.priority);
  let usersHTML = generateUserHTMLplusName(task.contacts);
  let category = task.category;
  let backgroundColor = getCategoryBackgroundColor(category);
  let subtasksHTML = generateSubtasksHTML(task.subtasks);


  return `
    <div class="pop-up-headline-flex">
        <div class="board-pop-up-headline" style="background-color: ${backgroundColor}">${category}</div>
        <img onclick="closePopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
      </div>
      <div class="board-task-pop-up-headline">${taskName}</div>
      <div class="board-pop-up-description">${taskDescription}</div>
      <div class="popup-date-container">
        <span class="popup-blue-span">Due date:</span> <span>${date}</span>
      </div>
      <div class="popup-prio-container">
        <span class="popup-blue-span">Priority:</span> <span class="popup-medium-image">${priority}<img
            src="${priorityImage}" alt="Medium-Image"></span>
      </div>
      <div class="popup-assignedto-container">
        <span class="popup-blue-span">Assigned To:</span>
        <div class="popup-names-container">
          <div class="popup-names">
            ${usersHTML}
          </div>
        </div>
      </div>
      <div class="popup-subtask-container">
        <span class="popup-blue-span">Subtasks</span>
        <div id="subtasks">${subtasksHTML}</div>
      </div>
      <div class="popup-del-edit-container">
        <div onclick="deleteCard(${index})" class="popup-delete-and-edit">
          <img src="./assets/img/icons/trash.png" alt="Trash-Image">
          <span class="weight-700">Delete</span>
        </div>
        <span>|</span>
        <div class="popup-edit" onclick="showAddTaskPopUpEdit(${index})">
          <img src="./assets/img/icons/edit_dark.png" alt="edit-Image">
          <span class="weight-700">Edit</span>
        </div>
      </div>
    `;
}



function generateAddTaksPopUpHTML() {

  return `
    <div class="form-container">
          <div class="task-title-popup">
            <h1>Add Task</h1>
            <img onclick="closeAddTaskPopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
          </div>
          <form class="task-form" id="taskForm">
            <div class="form-left">
              <div class="form-group">
                <label for="title">Title<span class="form-required-color">*</span></label>
                <input type="text" id="title" required placeholder="Enter a title"
                  oninput="hideValidationError('title', 'title-error-message')">
                <span id="title-error-message" class="error-message">This field is required.</span>
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea class="no-validate" id="description" placeholder="Enter a Description"></textarea>
              </div>
              <!-- assign to list -->
              <div class="form-group">
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
                </div>
                <div class="selected-contacts-container" id="selected-contacts-list"></div>
              </div>
            </div>
  
  
            <div class="form-right">
              <!-- Date -->
              <div class="form-group-edit">
                <label for="dueDate">Due date<span class="form-required-color">*</span></label>
                <input type="date" id="dueDate" required onchange="validateDueDate()">
                <span id="date-error-message" class="error-message" style="display: none;">This
                  field is required</span>
              </div>
  
              <!-- priority buttons -->
              <div class="form-group priority">
                <label>Prio</label>
                <div class="priority-button-container">
                  <button id="priority-urgent" class="priority-button" data-priority="urgent"
                    onclick="togglePriority('priority-urgent')"><span>Urgent</span> <img src="assets/img/icons/urgent.png"
                      alt="Urgent Priority"></button>
                  <button id="priority-medium" class="priority-button" data-priority="medium"
                    onclick="togglePriority('priority-medium')"><span>Medium</span> <img src="assets/img/icons/medium.png"
                      alt="Medium Priority"></button>
                  <button id="priority-low" class="priority-button" data-priority="low"
                    onclick="togglePriority('priority-low')"><span>Low</span> <img src="assets/img/icons/low.png"
                      alt="Low Priority"></button>
                </div>
              </div>
  
              <div class="form-group select-container">
                <label for="category">Category<span class="form-required-color">*</span></label>
                <div class="select-dropdown" id="select-dropdown" onclick="toggleCategoryDropdownMenu()">
                  <div class="selected-option" id="selected-option">Select task category</div>
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
                    <img id="addBtn" src="assets/img/icons/add.png" alt="">
                    <div id="sub-seperator" class="subtask-seperator" style="display:none;">
                    </div>
                    <img id="closeBtn" src="assets/img/icons/close.png"
                      onclick="clearInputField(), toggleAddButtonImage()" alt="" style="display:none;">
                  </div>
  
                  <input class="no-validate subtask" type="text" id="subTaskInput" maxlength="15"
                    placeholder="Add new subtask" oninput="toggleAddButtonImage()" onkeydown="handleSubtaskKeyDown(event)">
                </div>
                <div class="subtask-container" id="subtaskContainer">
                  <!-- Hier werden die Subtasks gerendert -->
                </div>
              </div>
            </div>
          </form>
        </div>
        <!-- wrapper -->
        <div class="add-task-wrapper">
          <div class="form-below">
            <div class="aco-button-container">
              <button class="fb lb mb" onclick="resetUI()">Clear <img src="assets/img/icons/x.png" alt="Clear"></button>
              <button class="fb rb" onclick="createTaskOnBoard(); showToDos();">Create Task <img src="assets/img/icons/check.png"
                  alt="Create Task"></button>
            </div>
          </div>
          <div class="form-info">
            <span><span class="form-required-color">*</span>This field is required</span>
          </div>
        </div>
    `;

}


function generateUserHTMLplusName(contacts) {
  let usersHTML = '';

  for (let j = 0; j < contacts.length; j++) {
    const user = contacts[j];
    let userInitials = user.initials;
    let userColor = user.color;
    let userName = user.name;

    usersHTML += `
        <div class="username-HTML">
            <span class="contact-icon board-icon" style="background-color: ${userColor};">${userInitials}</span>
            <div>${userName}</div>
        </div>
        `;
  }

  return usersHTML;
}


function generateUserHTML(contacts) {
  let usersHTML = '';

  for (let j = 0; j < contacts.length; j++) {
    const user = contacts[j];
    let userInitials = user.initials;
    let userColor = user.color;

    usersHTML += `
        <span class="contact-icon board-icon" style="background-color: ${userColor};">${userInitials}</span>
        `;
  }

  return usersHTML;
}

function generateUserHTMLEdit(contacts) {
  let usersHTML = '';

  for (let j = 0; j < contacts.length; j++) {
    const user = contacts[j];
    let userInitials = user.initials;
    let userColor = user.color;

    usersHTML += `
        <span class="contact-icon edit-icon" style="background-color: ${userColor};">${userInitials}</span>
        `;
  }

  return usersHTML;
}

function generateSubtasksHTML(subtasks) {
  let subtasksHTML = '';

  for (let i = 0; i < subtasks.length; i++) {
    let subtask = subtasks[i];
    subtasksHTML += `
          <div class="popup-subtasks">
              <img src="./assets/img/icons/checkbox-empty-black-24.png" id="subtask-check${i}" onclick="toggleSubtaskCheck('subtask-check${i}')" alt="Box-Empty">
              <div>${subtask}</div>
          </div>
      `;
  }

  return subtasksHTML;
}

function handleSubtaskKeyDown(event) {
  if (event.key === "Enter") {
      event.preventDefault();
      addSubtask();
  }
}