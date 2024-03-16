function validateInput(input) {
    if (input.classList.contains('no-validate')) {
        return;
    }

    if (input.value.trim() === '') {
        input.classList.add('input-error');
        input.nextElementSibling.style.display = 'block';
    } else {
        input.classList.remove('input-error');
        input.nextElementSibling.style.display = 'none';
    }
}

function initValidation() {
    const inputs = document.querySelectorAll('input[type=text], input[type=date], textarea');
    inputs.forEach(input => {
        input.onblur = function() {
            validateInput(input);
        };

        input.oninput = function() {
            if (input.value.trim() !== '') {
                input.classList.remove('input-error');
                input.nextElementSibling.style.display = 'none';
            }
        };
    });
}

function togglePriority(element, priority) {
    var priorityButtons = document.getElementsByClassName('priority-button');
    
    for (var i = 0; i < priorityButtons.length; i++) {
        priorityButtons[i].classList.remove('active');
    }

    element.classList.add('active');

    // Optional: Führe weitere Aktionen basierend auf der Priorität aus
    // (z.B. Werte in einem versteckten Formularfeld speichern)
}

// Init
document.addEventListener('DOMContentLoaded', initValidation);

