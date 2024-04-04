

let allTasks = [];

async function init(){
    includeHTML();
    await loadTasksFromStorage();
    console.log(allTasks);
}

async function loadTasksFromStorage() {
    try {
        const tasksString = await getItem('tasks');
        if (tasksString) {
            const tasks = JSON.parse(tasksString);
            allTasks = tasks;     // Update the global tasks array
        } else {
            console.log('No tasks found. Starting with an empty task list.');
        }
    } catch (e) {
        console.warn('Could not load tasks:', e);
        allTasks = [];               // Reset the tasks array on failure
    }

    showToDos();
}


function showToDos(){
   let todo = document.getElementById('ToDos');
   todo.innerHTML = '';
   
    for (let i = 0; i < allTasks.length; i++) {
        const task = allTasks[i];
        let taskName = task.title;
        let taskDescription = task.description;
        let totalTasks = task.subtasks.length
        let completedTasks = 1
        let completionPercentage =(completedTasks / totalTasks) * 100
        let priorityImage = setPriority(task.priority);
        let usersHTML = '';

        for (let j = 0; j < task.contacts.length; j++) {
            const user = task.contacts[j];
            let userInitials = user.initials;
            let userColor = user.color;

            usersHTML += `
            <span class="contact-icon board-icon" style="background-color: ${userColor};">${userInitials}</span>
            `;
        }

        todo.innerHTML += `
        <div>
            <div class="cardA" onclick="showPopUp(${i})">
                  <span class="task-category-board">User Story</span>
                  <div class="card-middle-part">
                    <h4 class="task-name">${taskName}</h4>
                    <span class="task-description">${taskDescription}</span>
                  </div>
                  <div class="subtasks">
                    <div class="subtask-bar">
                      <div class="filled-subtask-bar" style="width: ${completionPercentage}%;"></div>
                    </div><span>1/${totalTasks} Subtasks</span>
                  </div>
                  <div class="asigned-to">
                    <div class="asigned-to-icons">
                        ${usersHTML}
                    </div>
                    <div class="asigned-to-image-container">
                      <img src="${priorityImage}" alt="medium-png">
                    </div>
                    </div>
            </div>
        </div>
        `;
    }
}

function setPriority(priority){
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
            priorityImage = './assets/img/icons/default.png';
            break;
    }

    return priorityImage;
}

function popUpCheckDark() {
    let check = document.getElementById('subtask-check1');
    if (check.src.includes('checkbox-checked-black-24.png')) {
        check.src = "./assets/img/icons/checkbox-empty-black-24.png";
    } else {
        check.src = "./assets/img/icons/checkbox-checked-black-24.png";
    }
}

function popUpCheckDark2() {
    let check = document.getElementById('subtask-check2');
    if (check.src.includes('checkbox-checked-black-24.png')) {
        check.src = "./assets/img/icons/checkbox-empty-black-24.png";
    } else {
        check.src = "./assets/img/icons/checkbox-checked-black-24.png";
    }
}

function showPopUp(index) {
    const task = allTasks[index];
    let taskName = task.title;
    let taskDescription = task.description;
    let overlay = document.getElementById('overlay');
    let popUp = document.getElementById('pop-up');
    overlay.classList.remove('d-none-board'); 
    popUp.classList.remove('closing-animation'); 
    popUp.classList.add('slide-in-animation'); 
    
    popUp.innerHTML = `
    <div class="pop-up-headline-flex">
        <div class="board-pop-up-headline">User Story</div>
        <img onclick="closePopUp()" src="./assets/img/icons/close.png" alt="Close-PNG">
      </div>
      <div class="board-task-pop-up-headline">${taskName}</div>
      <div class="board-pop-up-description">${taskDescription}</div>
      <div class="popup-date-container">
        <span class="popup-blue-span">Due date:</span> <span>date??</span>
      </div>
      <div class="popup-prio-container">
        <span class="popup-blue-span">Priority:</span> <span class="popup-medium-image">Medium <img
            src="./assets/img/icons/medium.png" alt="Medium-Image"></span>
      </div>
      <div class="popup-assignedto-container">
        <span class="popup-blue-span">Assigned To:</span>
        <div class="popup-names-container">
          <div class="popup-names">
            <span class="contact-icon">EM</span>
            <div>Eammanuel Mauer</div>
          </div>
          <div class="popup-names">
            <span class="contact-icon">MB</span>
            <div>Marcel Bauer</div>
          </div>
          <div class="popup-names">
            <span class="contact-icon">AM</span>
            <div>Anton Mayer</div>
          </div>
        </div>
      </div>
      <div class="popup-subtask-container">
        <span class="popup-blue-span">Subtasks</span>
        <div>
          <div class="popup-subtasks">
            <img onclick="popUpCheckDark()" id="subtask-check1" src="./assets/img/icons/checkbox-empty-black-24.png"
              alt="Box-Empty">
            <div>Implement Recipe Recommendation</div>
          </div>
          <div onclick="popUpCheckDark2()" class="popup-subtasks">
            <img src="./assets/img/icons/checkbox-empty-black-24.png" id="subtask-check2" alt="Box-Empty">
            <div>Start Page Layout</div>
          </div>
        </div>
      </div>
      <div class="popup-del-edit-container">
        <div class="popup-delete-and-edit">
          <img src="./assets/img/icons/trash.png" alt="Trash-Image">
          <span>Delete</span>
        </div>
        <span>|</span>
        <div class="popup-edit">
          <img src="./assets/img/icons/edit_dark.png" alt="edit-Image">
          <span>Edit</span>
        </div>
      </div>
    `;
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
