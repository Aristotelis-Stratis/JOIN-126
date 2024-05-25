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
    let urgent = getUrgentTaskData(path);

    let sum = todo + done + inProgress + feedback;

    getById('allTasks').innerHTML = sum;
    getById('urgent').innerHTML = countUrgentTasks(path);

    try {
        let test = getById('urgentDate').innerHTML = formatDate(sortTasksByDueDate(urgent)[0]['dueDate']);
        console.log(test);
        console.log(currentUser);
    } catch (error) {
        console.log('Nope, du hast keine fucking Urgent Tasks, Bitch!');
        getById('upcomDeadline').innerHTML = '';
    }
}


function getUrgentTaskData(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent' && task.status !== 'done');
}


function countUrgentTasks(path) {
    return Object.values(path).flat().filter(task => task.priority === 'urgent').length;
}

function sortTasksByDueDate(tasks) {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function getById(id) {
    let element = document.getElementById(id);
    return element;
}