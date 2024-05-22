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
    let urgent = getById('urgent').innerHTML = path.todo.length; // <--- Pfad ändern

    let sum = todo + done + urgent + inProgress + feedback;

    getById('allTasks').innerHTML = sum;
}


function getById(id) {
    let element = document.getElementById(id);
    return element;
}