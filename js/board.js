

let allTasks = [];

async function init(){
    includeHTML();
    await loadTasksFromStorage();
    console.log(allTasks);
}

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