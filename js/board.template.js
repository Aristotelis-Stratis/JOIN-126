/**
 * Generates HTML markup for a todo task.
 * @param {Object} task - The task object containing details.
 * @param {string} id - The ID of the task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for the todo task.
 */
function generateTodoHTML(task, id, status) {
  let taskName = task.title;
  let taskDescription = task.description;
  let maxLength = 25;
  if (taskDescription.length > maxLength) {
    taskDescription = taskDescription.slice(0, maxLength) + '...';
  }
  let totalTasks = task.subtasks ? task.subtasks.length : 0;
  let completedTasks = task.subtasks ? task.subtasks.filter(subtask => subtask.completed).length : 0;
  let completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  let priorityImage = setPriority(task.priority);
  let category = task.category;
  let usersHTML = generateUserHTML(task.contacts);
  let backgroundColor = getCategoryBackgroundColor(category);

  return `
    <div draggable="true" ondragstart="startdragging('${task.id}', '${status}')" data-task-id="${task.id}" data-task-status="${status}">
        <div class="cardA" onclick="showPopUp('${task.id}', '${status}')">
            <div class="cardA-title-container">
                <span class="task-category-board" style="background-color: ${backgroundColor};">${category}</span>
                <img class="drag-icon" src="assets/img/icons/drag_icon.png" alt="drag menu" onclick="openDragMenu(event, '${task.id}', '${status}')">
            </div>
            <div class="card-middle-part">
                <h4 class="task-name">${taskName}</h4>
                <span class="task-description">${taskDescription}</span>
            </div>
            <div class="subtasks">
                <div class="subtask-bar">
                    <div class="filled-subtask-bar" style="width: ${completionPercentage}%;"></div>
                </div><span>${completedTasks}/${totalTasks} Subtasks</span>
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


/**
 * Generates HTML markup for a popup displaying task details.
 * @param {Object} task - The task object containing details.
 * @param {number} index - The index of the task.
 * @param {string} priority - The priority of the task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for the popup.
 */
function generatePopUpHTML(task, index, priority, status) {
  let taskName = task.title;
  let taskDescription = task.description;
  let date = task.dueDate;
  let priorityImage = setPriority(priority);
  let usersHTML = generateUserHTMLplusName(task.contacts);
  let category = task.category;
  let backgroundColor = getCategoryBackgroundColor(category);
  let subtasksHTML = generateSubtasksHTML(index, task.subtasks, status);

  return `
    <div class="board-pop-up-inner">
      <div class="pop-up-headline-flex">
          <div class="board-pop-up-headline" style="background-color: ${backgroundColor}">${category}</div>
          <img onclick="closePopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
        </div>
        <div class="board-task-pop-up-headline">${taskName}</div>
        <div class="board-pop-up-description"><span>${taskDescription}</span></div>
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
          <div onclick="deleteCard('${index}', '${status}')" class="popup-delete-and-edit">
            <img src="./assets/img/icons/trash.png" alt="Trash-Image">
            <span class="weight-700">Delete</span>
          </div>
          <span>|</span>
          <div class="popup-edit" onclick="showAddTaskPopUpEdit('${index}', '${status}')">
            <img src="./assets/img/icons/edit_dark.png" alt="edit-Image">
            <span class="weight-700">Edit</span>
          </div>
        </div>
    </div>
  `;
}


/**
 * Generates HTML markup for adding a new task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for adding a new task.
 */
function generateAddTaskPopUpHTML(status) {
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
                  oninput="hideValidationError('title', 'title-error-message')" maxlength="30">
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
                  <button id="priority-medium" class="priority-button active" data-priority="medium"
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
  
                  <input class="no-validate subtask" type="text" id="subTaskInput" maxlength="20"
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
        <div class="add-task-wrapper-board">
          <div class="form-below">
            <div class="aco-button-container">
              <button class="fb lb mb" onclick="resetUI()">Clear <img src="assets/img/icons/x.png" alt="Clear"></button>
              <button class="fb rb" onclick="createTaskOnBoard('${status}'); showToDos();">Create Task <img src="assets/img/icons/check.png"
                  alt="Create Task"></button>
            </div>
          </div>
          <div class="form-info">
            <span><span class="form-required-color">*</span>This field is required</span>
          </div>
        </div>
    `;
}


/**
 * Generates HTML markup for users assigned to a task.
 * @param {Array} contacts - Array of contacts assigned to the task.
 * @returns {string} The HTML markup for assigned users.
 */
function generateUserHTMLplusName(contacts) {
  let usersHTML = '';
  if (contacts && Array.isArray(contacts)) {
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
  }
  return usersHTML;
}


/**
 * Generates HTML markup for users assigned to a task.
 * @param {Array} contacts - Array of contacts assigned to the task.
 * @returns {string} The HTML markup for assigned users.
 */
function generateUserHTML(contacts) {
  let usersHTML = '';
  if (contacts && Array.isArray(contacts)) {
    for (let j = 0; j < contacts.length; j++) {
      const user = contacts[j];
      let userInitials = user.initials;
      let userColor = user.color;

      usersHTML += `
          <span class="contact-icon board-icon" style="background-color: ${userColor};">${userInitials}</span>
          `;
    }
  }
  return usersHTML;
}


/**
 * Generates HTML markup for subtasks of a task.
 * @param {number} taskIndex - The index of the task.
 * @param {Array} subtasks - Array of subtasks for the task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for subtasks.
 */
function generateSubtasksHTML(taskIndex, subtasks, status) {
  let subtasksHTML = '';
  if (subtasks && Array.isArray(subtasks)) {
    for (let i = 0; i < subtasks.length; i++) {
      let subtask = subtasks[i];
      let checkIcon = subtask.completed ? './assets/img/icons/checkbox-checked-black-24.png' : './assets/img/icons/checkbox-empty-black-24.png';
      subtasksHTML += `
          <div class="popup-subtasks">
              <img src="${checkIcon}" id="subtask-check${i}" onclick="toggleSubtaskCheck(${taskIndex}, ${i}, '${status}')" alt="Box-Empty">
              <div>${subtask.text}</div>
          </div>
      `;
    }
  }
  return subtasksHTML;
}


/**
 * Generates HTML markup for a single subtask.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {Object} subtask - The subtask object containing details.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for a single subtask.
 */
function generateSubtaskHTML(taskId, subtaskIndex, subtask, status) {
  return `
    <div class="subtask-edit-container" id="subTask_${subtaskIndex}">
      <div class="subtask-item" id="subTaskItem_${subtaskIndex}">
        <div>
          •
          <span id="subTask_${subtaskIndex}_span">${subtask.text}</span>
        </div>
        <div class="subtask-item-icons">
          <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit('${taskId}', ${subtaskIndex}, '${status}')">
          <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit('${taskId}', ${subtaskIndex}, '${status}')">
        </div>
      </div>
    </div>
  `;
}


/**
 * Handles key down event for subtasks.
 * @param {Event} event - The keydown event object.
 */
function handleSubtaskKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}


/**
 * Generates HTML markup for editing a task.
 * @param {Object} task - The task object containing details.
 * @param {string} date - The due date of the task.
 * @param {string} usersHTML - The HTML markup for assigned users.
 * @param {string} category - The category of the task.
 * @param {Array} subtasks - Array of subtasks for the task.
 * @param {string} priority - The priority of the task.
 * @param {number} index - The index of the task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for editing a task.
 */
function generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority, index, status) {
  return `
      <div class="form-container-inner">
          <div class="form-container">
              <div class="task-title-popup-edit">
                  <h1>Edit Task</h1>
                  <img onclick="closePopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
              </div>
              <form class="task-form-edit" id="taskForm">
                  <div class="form-left-edit">
                      <div class="form-group-edit">
                          <label for="title">Title<span class="form-required-color">*</span></label>
                          <input type="text" id="title" required value="${task.title}" oninput="hideValidationError('title', 'title-error-message')">
                          <span id="title-error-message" class="error-message">This field is required.</span>
                      </div>
                      <div class="form-group-edit">
                          <label for="description">Description</label>
                          <textarea class="no-validate" id="description" placeholder="Enter a Description">${task.description}</textarea>
                      </div>
                      <div class="form-group-edit">
                          <label for="assignedTo">Assigned to</label>
                          <div class="drop-down-menu-container" onclick="toggleAssignDropdownMenu()">
                              <div class="drop-down-image-container">
                                  <img id="arrow-assign-to" src="assets/img/icons/arrow_drop_down.png" alt="">
                              </div>
                              <input class="no-validate task-assign" type="text" id="assignedTo" placeholder="Select contacts to assign" oninput="filterContacts(this.value)">
                              <div id="assign-dropdown-menu" class="dropdown-menu">
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
                      <div class="form-group-edit">
                          <label for="dueDate">Due date<span class="form-required-color"></span></label>
                          <input type="date" id="dueDate" required value="${date}" onchange="validateDueDate()">
                          <span id="date-error-message" class="error-message" style="display: none;">This field is required</span>
                      </div>
                      <div class="form-group priority">
                          <label>Prio</label>
                          <div class="priority-button-container">
                              <button id="priority-urgent" class="priority-button on-edit ${priority === 'urgent' ? 'active' : ''}" data-priority="urgent" onclick="togglePriority('priority-urgent')"><span>Urgent</span> <img src="assets/img/icons/urgent.png" alt="Urgent Priority"></button>
                              <button id="priority-medium" class="priority-button on-edit ${priority === 'medium' ? 'active' : ''}" data-priority="medium" onclick="togglePriority('priority-medium')"><span>Medium</span> <img src="assets/img/icons/medium.png" alt="Medium Priority"></button>
                              <button id="priority-low" class="priority-button on-edit ${priority === 'low' ? 'active' : ''}" data-priority="low" onclick="togglePriority('priority-low')"><span>Low</span> <img src="assets/img/icons/low.png" alt="Low Priority"></button>
                          </div>
                      </div>
                      <div class="form-group-edit select-container">
                          <label for="category">Category</label>
                          <div class="select-dropdown" style="pointer-events: none; color: lightgrey;" id="select-dropdown">
                              <div class="selected-option" id="selected-option">${category}</div>
                              <div class="drop-down-image-container">
                                  <img id="arrow-category" src="assets/img/icons/arrow_drop_down.png" alt="">
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
                                  <img id="addBtnEdit" src="assets/img/icons/add.png" alt="" onclick="addSubtaskToEditWindow('${index}')">
                                  <div id="sub-seperator" class="subtask-seperator" style="display:none;"></div>
                                  <img id="closeBtn" src="assets/img/icons/close.png" onclick="clearInputFieldEdit(), toggleAddButtonImageEdit()" alt="" style="display:none;">
                              </div>
                              <input class="no-validate subtask" type="text" id="subTaskInputEdit" maxlength="20" placeholder="Add new subtask" onkeypress="handleKeyPress(event, '${index}')" oninput="toggleAddButtonImageEdit()">
                          </div>
                          <div class="subtask-container-edit" id="subtaskContainerEdit">
                              ${subtasks}
                          </div>
                      </div>
                  </div>
              </form>
              <div class="edit-btn-position">
                  <button class="fb rb" onclick="updateSubtaskEdit('${index}', '${status}')">OK<img src="assets/img/icons/check.png" alt="Update Task"></button>
              </div>
          </div>
      </div>
  `;
}


/**
 * Generates HTML markup for subtasks of a task.
 * @param {number} taskIndex - The index of the task.
 * @param {Array} subtasks - Array of subtasks for the task.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for subtasks.
 */
function generateSubtasksHTML(taskIndex, subtasks, status) {
  let subtasksHTML = '';

  if (subtasks && Array.isArray(subtasks)) {
    for (let i = 0; i < subtasks.length; i++) {
      let subtask = subtasks[i];
      let checkIcon = subtask.completed ? './assets/img/icons/checkbox-checked-black-24.png' : './assets/img/icons/checkbox-empty-black-24.png';
      subtasksHTML += `
          <div class="popup-subtasks">
              <img src="${checkIcon}" id="subtask-check${i}" onclick="toggleSubtaskCheck('${taskIndex}', ${i}, '${status}')" alt="Box-Empty">
              <div>${subtask.text}</div>
          </div>
      `;
    }
  }

  return subtasksHTML;
}


/**
 * Generates HTML markup for editing users assigned to a task.
 * @param {Array} contacts - Array of contacts assigned to the task.
 * @returns {string} The HTML markup for editing assigned users.
 */
function generateUserHTMLEdit(contacts) {
  let usersHTML = '';
  contacts = Array.isArray(contacts) ? contacts : [];
  if (contacts.length > 0) {
    for (let j = 0; j < contacts.length; j++) {
      const user = contacts[j];
      let userInitials = user.initials;
      let userColor = user.color;

      usersHTML += `
        <span class="contact-icon" style="background-color:${userColor};">${userInitials}</span>
      `;
    }
  }
  return usersHTML;
}


/**
 * Generates HTML markup for editing a subtask.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} newText - The new text of the subtask.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for editing a subtask.
 */
function generateEditedSubtaskHTML(taskId, subtaskIndex, newText, status) {
  return `
    <div class="subtask-item-edit" id="subTaskItem_${subtaskIndex}">
      <div>
        •
        <span id="subTask_${subtaskIndex}_span">${newText}</span>
      </div>
      <div class="subtask-item-icons">
        <img class="subtask-item-icon" style="border-right: 1px solid rgba(209, 209, 209, 1);" src="assets/img/icons/edit_dark.png" alt="" onclick="editSubtaskEdit('${taskId}', ${subtaskIndex}, '${status}')">
        <img class="subtask-item-icon" src="assets/img/icons/trash.png" alt="" onclick="deleteSubtaskEdit('${taskId}', ${subtaskIndex}, '${status}')">
      </div>
    </div>
  `;
}


/**
 * Generates HTML markup for input field to edit a subtask.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {string} subtaskText - The text of the subtask.
 * @param {string} status - The status of the task.
 * @returns {string} The HTML markup for editing a subtask input field.
 */
function generateEditSubtaskInputHTML(taskId, subtaskIndex, subtaskText, status) {
  return `
    <div class="edit-subtask-under-container">
      <input class="edit-input" type="text" id="subTask_${subtaskIndex}_input" value="${subtaskText}">
      <div class="sub-image-container-edit" id="image-container">
        <img id="addBtnEdit" src="assets/img/icons/check_blue.png" alt="" onclick="saveEditedSubtask('${taskId}', ${subtaskIndex}, '${status}')" style="display: block;">
        <div id="sub-seperator" class="subtask-seperator-edit" style="display: block;"></div>
        <img id="closeBtn" src="./assets/img/icons/trash.png" onclick="deleteSubtaskEdit('${taskId}', ${subtaskIndex}, '${status}')" alt="" style="display: block;">
      </div>
    </div>
  `;
}