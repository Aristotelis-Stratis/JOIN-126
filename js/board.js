

let allTasks = [];

async function init(){
    includeHTML();
    await loadTasksFromStorage();
    console.log(allTasks);
}

function popUpCheckBlue(){
    let check = document.getElementById('subtask-check');
    check.src ="./assets/img/icons/checkbox-checked-black-24.png";
}

function showPopUp() {
   document.getElementById('pop-up').classList.remove('d-none-board');
}

function closePopUp() {
    document.getElementById('pop-up').classList.add('d-none-board');
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