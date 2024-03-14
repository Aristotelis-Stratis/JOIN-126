// Function to handle form submission
function handleFormSubmission(event) {
    event.preventDefault(); // Prevent form from submitting

    // Get form values
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const priority = document.getElementById('priority').value;
    const dueDate = document.getElementById('due-date').value;
    const assignedTo = Array.from(document.getElementById('assigned-to').selectedOptions).map(option => option.value);

    // Perform validation and add task logic here

    // Clear form fields
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
    document.getElementById('priority').value = '';
    document.getElementById('due-date').value = '';
    Array.from(document.getElementById('assigned-to').options).forEach(option => option.selected = false);
}

// Add event listener to form submission
document.getElementById('add-task-form').addEventListener('submit', handleFormSubmission);
