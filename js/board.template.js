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
                    placeholder="Add new subtask" oninput="toggleAddButtonImage()">
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
  
  function generateAddTaskPopUpEditHTML(task, date, usersHTML, category, subtasks, priority) {

    function getPriorityButtonClass(buttonId) {
      return priority === buttonId ? 'priority-button on-edit active' : 'priority-button on-edit';
    }
    
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
                <div class="selected-contacts-container" id="selected-contacts-list-edit">${usersHTML}</div>
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
                  <button id="priority-urgent" class="${getPriorityButtonClass('urgent')}" data-priority="urgent"
                    onclick="togglePriority('priority-urgent')"><span>Urgent</span> <img src="assets/img/icons/urgent.png"
                      alt="Urgent Priority"></button>
                  <button id="priority-medium" class="${getPriorityButtonClass('medium')}" data-priority="medium"
                    onclick="togglePriority('priority-medium')"><span>Medium</span> <img src="assets/img/icons/medium.png"
                      alt="Medium Priority"></button>
                  <button id="priority-low" class="${getPriorityButtonClass('low')}" data-priority="low"
                    onclick="togglePriority('priority-low')"><span>Low</span> <img src="assets/img/icons/low.png"
                      alt="Low Priority"></button>
                </div>
              </div>
  
              <div class="form-group-edit select-container">
                <label for="category">Category<span class="form-required-color">*</span></label>
                <div class="select-dropdown" id="select-dropdown" onclick="toggleCategoryDropdownMenu()">
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
                    <img id="addBtn" src="assets/img/icons/add.png" alt="">
                    <div id="sub-seperator" class="subtask-seperator" style="display:none;">
                    </div>
                    <img id="closeBtn" src="assets/img/icons/close.png"
                      onclick="clearInputField(), toggleAddButtonImage()" alt="" style="display:none;">
                  </div>
  
                  <input class="no-validate subtask" type="text" id="subTaskInput" maxlength="15"
                    placeholder="Add new subtask" oninput="toggleAddButtonImage()">
                </div>
                <div class="subtask-container-edit" id="subtaskContainer">
                  ${subtasks}
                </div>
              </div>
            </div>
          </form>
            <div class="edit-btn-position">
                <button class="fb rb" onclick="createTaskOnBoard(); showToDos();">OK<img src="assets/img/icons/check.png"
                  alt="Create Task"></button>
                </div>
            </div>
        </div>

    `;
  
  }