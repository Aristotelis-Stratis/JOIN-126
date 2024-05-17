let filteredContacts = [];

async function initTasks() {
    includeHTML();
    currentUser = await loadCurrentUser();
    if (currentUser) {
        await loadTasksFromFirebase();
        await loadAllContacts();
        filteredContacts = currentUser.data.contacts;
        renderTaskContactList(filteredContacts);
    } else {
        console.error("Current user could not be loaded.");
    }
}


function filterContacts(input) {
    filteredContacts = currentUser.data.contacts.filter(contact =>
        contact.name.toLowerCase().includes(input.toLowerCase())
    );
    renderTaskContactList(filteredContacts);
}


function renderTaskContactList(contacts) {
    if (!Array.isArray(contacts)) {
        console.error('Contacts is not an array:', contacts);
        return;
    }
    const contactListContainer = document.getElementById('task-contact-list');
    contactListContainer.innerHTML = '';
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const isChecked = isSelected(contact);
        contactListContainer.innerHTML += generateContactHTML(contact, i, isChecked);
    }
}


function toggleContactSelection(index) {
    event.stopPropagation();
    const contactItem = document.getElementById(`contact-item-${index}`);
    const contact = filteredContacts[index];
    if (isSelected(contact)) {
        removeContact(contact);
        setCheckboxImage(contactItem, false);
    } else {
        addContact(contact);
        setCheckboxImage(contactItem, true);
    }
    renderSelectedContacts();

    
    const assignInput = document.getElementById('assignedTo');
    assignInput.value = '';
    assignInput.focus();
    filteredContacts = currentUser.data.contacts;
    renderTaskContactList(filteredContacts);
}


function renderSelectedContacts() {
    const container = document.querySelector('.selected-contacts-container');
    container.innerHTML = '';

    selectedContacts.forEach(contact => {
        container.insertAdjacentHTML('beforeend', createContactIconHTML(contact));
    });
}


function toggleAssignDropdownMenu() {
    let dropdownMenu = document.getElementById('assign-dropdown-menu');
    let arrow = document.getElementById('arrow-assign-to');
    if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.classList.remove('visible');
        arrow.style.transform = "rotate(0deg)";
    } else {
        dropdownMenu.classList.add('visible');
        arrow.style.transform = "rotate(180deg)";
    }
    filteredContacts = currentUser.data.contacts;
    renderTaskContactList(filteredContacts);
}


async function createTask() {
    if (validateTaskInputs()) {
        const newTask = constructNewTask();
        if (!currentUser) {
            console.error("No current user logged in. Task cannot be added.");
            return;
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
            initiateConfirmation('Task added to <img class="add-task-icon-board" src="assets/img/icons/board.png" alt="Board">');
            directToBoard();
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Aufgabe zu Firebase:', error);
        }
    }
}


function directToBoard() {
    setTimeout(() => {
        window.location.href = 'board.html';
    }, 2500);
}


function constructNewTask() {
    let title = document.getElementById('title').value;
    let description = document.getElementById('description').value;
    let dueDate = document.getElementById('dueDate').value;
    let priority = selectedPriority[0];
    let category = document.getElementById('category-todo').value;

    return {
        title,
        description,
        dueDate,
        priority,
        contacts: selectedContacts || [],
        subtasks: subtasks || [],
        status: "toDo",
        category
    };
}


function deleteStorage() {
    allTasks = [];
    setItem('tasks', JSON.stringify(allTasks));
}


function resetUI() {
    document.querySelectorAll('.priority-button.active').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('selected-option').textContent = 'Select task category';
    document.getElementById('dueDate').value = '';
    document.getElementById('subtaskContainer').innerHTML = '';
    document.getElementById('selected-contacts-list').innerHTML = '';
    const dropdownMenu = document.getElementById('assign-dropdown-menu');
    if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.classList.remove('visible');
    }
    selectedContacts = [];
    subtasks = [];
    selectedPriority = [];
}


async function loadContactsFromFirebase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const contactsPath = `users/${cleanedEmail}/${userId}/contacts`;

    try {
        const contactsData = await loadData(contactsPath);
        if (contactsData) {
            currentUser.data.contacts = Object.values(contactsData);
        } else {
            currentUser.data.contacts = [];
        }
        console.log('Contacts successfully loaded from Firebase:', currentUser.data.contacts);
    } catch (error) {
        console.error('Error loading contacts from Firebase:', error);
        currentUser.data.contacts = [];
    }
}


async function loadAllContacts() {
    await loadContactsFromFirebase();
    if (currentUser && currentUser.data && currentUser.data.contacts) {
        allContacts = currentUser.data.contacts;
    } else {
        console.error("Keine Kontaktdaten verfügbar für den aktuellen Benutzer.");
    }
}


async function loadTasksFromFirebase() {
    const cleanedEmail = localStorage.getItem('cleanedEmail');
    const userId = localStorage.getItem('currentUserId');
    const tasksPath = `users/${cleanedEmail}/${userId}/board/todo`;

    try {
        const tasksData = await loadData(tasksPath);
        if (tasksData) {
            currentUser.data.board.todo = Object.values(tasksData);
        } else {
            currentUser.data.board.todo = [];
        }
        console.log('Tasks successfully loaded from Firebase:', currentUser.data.board.todo);
    } catch (error) {
        console.error('Error loading tasks from Firebase:', error);
        currentUser.data.board.todo = [];
    }
}


function isSelected(contact) {
    return selectedContacts.some(selectedContact => selectedContact.id === contact.id);
}


function addContact(contact) {
    selectedContacts.push(contact);
}



function removeContact(contact) {
    selectedContacts = selectedContacts.filter(selected => selected.id !== contact.id);
}


function setCheckboxImage(element, isChecked) {
    updateCheckboxImage(element, isChecked);
}


function updateCheckboxImage(element, isChecked) {
    const checkboxImg = element.querySelector('img');
    checkboxImg.src = isChecked ? "assets/img/icons/checkbox-checked-black-24.png" : "assets/img/icons/checkbox-empty-black-24.png";
}


function toggleCategoryDropdownMenu() {
    let dropdownMenu = document.getElementById('category-dropdown-menu');
    let arrow = document.getElementById('arrow-category');

    if (dropdownMenu.style.display === 'flex') {
        dropdownMenu.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        dropdownMenu.style.display = 'flex';
        arrow.style.transform = 'rotate(180deg)';
    }
}


function setSelectedCategory(index) {
    var categoryNames = ['Technical Task', 'User Story'];
    var selectedCategory = categoryNames[index - 1];
    document.getElementById("selected-option").innerText = selectedCategory;
    document.getElementById("category-todo").value = selectedCategory;

    let errorMessageElement = document.getElementById('category-error-message');
    let categoryDropdown = document.getElementById('select-dropdown');
    clearErrorMessage(errorMessageElement, categoryDropdown);
}


function addSubtask() {
    let subtaskInput = document.getElementById('subTaskInput');
    let subtaskText = subtaskInput.value;
    if (subtaskText !== '') {
        subtasks.push(subtaskText);
        renderSubtasks();
        clearInputField();
    }
}


function editSubtask(subtaskIndex) {
    const subtaskItem = document.getElementById(`subtask_${subtaskIndex}`);
    subtaskItem.style.padding = '0';
    subtaskItem.innerHTML = createEditInputField(subtasks[subtaskIndex], subtaskIndex);
    focusAndSetCursorAtEnd(subtaskItem.querySelector('.edit-input-field'));
}


function updateSubtask(subtaskIndex) {
    const newText = getSubtaskInputValue(subtaskIndex);
    if (newText) {
        subtasks[subtaskIndex] = newText;
    } else {
        subtasks.splice(subtaskIndex, 1);
    }
    renderSubtasks();
}


function focusAndSetCursorAtEnd(inputField) {
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
}


function getSubtaskInputValue(subtaskIndex) {
    const inputField = document.getElementById(`editInputField_${subtaskIndex}`);
    return inputField.value.trim();
}


function deleteSubtask(subtaskIndex) {
    subtasks.splice(subtaskIndex, 1);
    renderSubtasks();
}


function renderSubtasks() {
    let subtaskContainer = document.getElementById('subtaskContainer');
    subtaskContainer.innerHTML = '';
    for (let index = 0; index < subtasks.length; index++) {
        const subtaskText = subtasks[index];
        const subtaskItemHTML = createSubtaskTemplate(subtaskText, index);
        subtaskContainer.insertAdjacentHTML('beforeend', subtaskItemHTML);
    }
}