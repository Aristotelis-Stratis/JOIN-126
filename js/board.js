

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
            <div class="cardA" onclick="showPopUp()">
                  <span class="task-category-board">User Story</span>
                  <div class="card-middle-part">
                    <h4 class="task-name">${taskName}</h4>
                    <span class="task-description">${taskDescription}</span>
                  </div>
                  <div class="subtasks">
                    <div class="subtask-bar">
                      <div class="filled-subtask-bar"></div>
                    </div><span>1/2 Subtasks</span>
                  </div>
                  <div class="asigned-to">
                    <div class="asigned-to-icons">
                        ${usersHTML}
                    </div>
                    <div class="asigned-to-image-container">
                      <img src="./assets/img/icons/medium.png" alt="medium-png">
                    </div>
                    </div>
            </div>
        </div>
        `;
    }
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

function showPopUp() {
    const overlay = document.getElementById('overlay');
    const popUp = document.getElementById('pop-up');
    overlay.classList.remove('d-none-board'); 
    popUp.classList.remove('closing-animation'); 
    popUp.classList.add('slide-in-animation'); 
    document.body.classList.add('no-scroll'); 
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
