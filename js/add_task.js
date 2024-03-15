// Funktion zum Hinzufügen der Fehlermeldung, wenn das Eingabefeld leer ist
function validateInput(input) {
    if (input.value.trim() === '') {
        input.classList.add('input-error');
        input.nextElementSibling.style.display = 'block'; // Zeigt die Fehlermeldung an
    } else {
        input.classList.remove('input-error');
        input.nextElementSibling.style.display = 'none'; // Verbirgt die Fehlermeldung
    }
}

// Funktion zum Initialisieren der Validierung
function initValidation() {
    const inputs = document.querySelectorAll('input[type=text], input[type=date], textarea');
    
    inputs.forEach(input => {
        // Prüfe den Input beim Verlassen des Feldes (onblur)
        input.onblur = function() {
            validateInput(input);
        };

        // Entferne die Fehlermeldung beim Fokussieren, wenn der Benutzer anfängt zu tippen
        input.oninput = function() {
            if (input.value.trim() !== '') {
                input.classList.remove('input-error');
                input.nextElementSibling.style.display = 'none';
            }
        };
    });
}

// Initialisiere die Validierung, wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', initValidation);