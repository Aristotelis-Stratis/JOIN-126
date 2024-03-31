// // Array to store tasks
 let tasks = [];

// // Function to add a task
 function addTask(task) {
    tasks.push(task);
 }

// // Function to display tasks on the board
function displayTasks() {
     let todoTasksContainer = document.getElementById('todo-tasks');
     let inProgressTasksContainer = document.getElementById('in-progress-tasks');
     let awaitingFeedbackTasksContainer = document.getElementById('awaiting-feedback-tasks');
     let doneTasksContainer = document.getElementById('done-tasks');
    }

//     // Clear the task containers
     todoTasksContainer.innerHTML = '';
     inProgressTasksContainer.innerHTML = '';
     awaitingFeedbackTasksContainer.innerHTML = '';
     doneTasksContainer.innerHTML = '';

     // Loop through tasks and display them in the corresponding containers
     for (let i = 0; i < tasks.length; i++) {
         let task = tasks[i];
         let taskElement = document.createElement('div');
         taskElement.classList.add('contant-card', 'list-item');
         taskElement.draggable = true;
         taskElement.textContent = task;
        }

//         // Determine the task status and append it to the corresponding container
         switch (task.status) {
             case 'To do':
                 todoTasksContainer.appendChild(taskElement);
                 break;
             case 'In Progress':
                 inProgressTasksContainer.appendChild(taskElement);
                 break;
             case 'Awaiting Feedback':
                 awaitingFeedbackTasksContainer.appendChild(taskElement);
                 break;
             case 'Done':
                 doneTasksContainer.appendChild(taskElement);
                 break;
             default:
                 // Handle any other status
                 break;
         }


// // Example usage
 addTask("Task 1");
 addTask("Task 2");
 displayTasks();

function popUpCheckBlue() {
    let check = document.getElementById('subtask-check');
    check.src = "./assets/img/icons/checkbox-checked-black-24.png";
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
}