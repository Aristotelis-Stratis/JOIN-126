// // Array to store tasks
// let tasks = [];

// // Function to add a task
// function addTask(task) {
//     tasks.push(task);
// }

// // Function to display tasks on the board
// function displayTasks() {
//     let todoTasksContainer = document.getElementById('todo-tasks');
//     let inProgressTasksContainer = document.getElementById('in-progress-tasks');
//     let awaitingFeedbackTasksContainer = document.getElementById('awaiting-feedback-tasks');
//     let doneTasksContainer = document.getElementById('done-tasks');

//     // Clear the task containers
//     todoTasksContainer.innerHTML = '';
//     inProgressTasksContainer.innerHTML = '';
//     awaitingFeedbackTasksContainer.innerHTML = '';
//     doneTasksContainer.innerHTML = '';

//     // Loop through tasks and display them in the corresponding containers
//     for (let i = 0; i < tasks.length; i++) {
//         let task = tasks[i];
//         let taskElement = document.createElement('div');
//         taskElement.classList.add('contant-card', 'list-item');
//         taskElement.draggable = true;
//         taskElement.textContent = task;

//         // Determine the task status and append it to the corresponding container
//         switch (task.status) {
//             case 'To do':
//                 todoTasksContainer.appendChild(taskElement);
//                 break;
//             case 'In Progress':
//                 inProgressTasksContainer.appendChild(taskElement);
//                 break;
//             case 'Awaiting Feedback':
//                 awaitingFeedbackTasksContainer.appendChild(taskElement);
//                 break;
//             case 'Done':
//                 doneTasksContainer.appendChild(taskElement);
//                 break;
//             default:
//                 // Handle any other status
//                 break;
//         }
//     }
// }

// // Example usage
// addTask("Task 1");
// addTask("Task 2");
// displayTasks();
