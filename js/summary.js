async function initSummary() {
    await loadCurrentUserBoard();
    updateSummary();
}


function updateSummary() {
    let path = currentUser.data.board

    let todo = getById('todos').innerHTML = path.todo.length;
    let done = getById('done').innerHTML = path.done.length;
    let inProgress = getById('inProgress').innerHTML = path.inProgress.length;
    let feedback =  getById('feedback').innerHTML = path.awaitFeedback.length;

    let sum = todo + done + inProgress + feedback;

    getById('allTasks').innerHTML = sum;
    countUrgentTasks(path);
}


function getById(id) {
    let element = document.getElementById(id);
    return element;
}


function countUrgentTasks(path) {
    getById('urgent').innerHTML = Object.values(path).flat().filter(task => task.priority === 'urgent').length;
}