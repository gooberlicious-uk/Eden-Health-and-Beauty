/*  Web3Forms submission
*   Submits any form with class "web3form" via fetch and shows the result inline.
*/

(function () {
    var forms = document.querySelectorAll('form.web3form');

    // Don't allow dates in the past
    var now = new Date();
    var today = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    var dates = document.querySelectorAll('form.web3form input[type="date"]');
    for (var i = 0; i < dates.length; i++) {
        dates[i].min = today;
    }

    for (var j = 0; j < forms.length; j++) {
        // Show our own inline errors instead of the browser's validation bubbles
        forms[j].noValidate = true;
        forms[j].addEventListener('submit', submitForm);
        forms[j].addEventListener('input', revalidateField);
        forms[j].addEventListener('change', revalidateField);
    }

    function submitForm(event) {
        event.preventDefault();

        var form = event.target;
        if (!validateForm(form)) {
            return;
        }

        var button = form.querySelector('button[type="submit"]');
        var status = form.querySelector('.form-status');
        var buttonText = button.textContent;
        var data = {};

        new FormData(form).forEach(function (value, key) {
            data[key] = value;
        });

        // Send dates as DD/MM/YYYY rather than YYYY-MM-DD
        var formDates = form.querySelectorAll('input[type="date"]');
        for (var k = 0; k < formDates.length; k++) {
            var parts = formDates[k].value.split('-');
            if (parts.length === 3) {
                data[formDates[k].name] = parts[2] + '/' + parts[1] + '/' + parts[0];
            }
        }

        button.disabled = true;
        button.textContent = 'Sending…';
        showStatus(status, '', '');

        fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                if (result.success) {
                    form.reset();
                    showStatus(status, 'success', form.getAttribute('data-success') || 'Thank you, your message has been sent.');
                } else {
                    showStatus(status, 'danger', result.message || 'Sorry, something went wrong. Please try again.');
                }
            })
            .catch(function () {
                showStatus(status, 'danger', 'Sorry, your message could not be sent. Please try again, or call us on 01242 528 282.');
            })
            .then(function () {
                button.disabled = false;
                button.textContent = buttonText;
            });
    }

    function validateForm(form) {
        var firstInvalid = null;
        var groups = form.querySelectorAll('.form-group');

        for (var i = 0; i < groups.length; i++) {
            var invalid = validateGroup(groups[i]);
            if (invalid && !firstInvalid) {
                firstInvalid = invalid;
            }
        }

        if (firstInvalid) {
            firstInvalid.focus();
        }
        return !firstInvalid;
    }

    // Re-check a field's group as the user corrects it, once it has been flagged
    function revalidateField(event) {
        var group = event.target.closest && event.target.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
            validateGroup(group);
        }
    }

    // Validates every field in a form group; returns the first invalid field, or null
    function validateGroup(group) {
        var fields = group.querySelectorAll('input, select, textarea');
        var error = group.querySelector('.form-error');
        var invalid = null;
        var allMissing = true;

        for (var i = 0; i < fields.length; i++) {
            var valid = fields[i].checkValidity();
            fields[i].setAttribute('aria-invalid', valid ? 'false' : 'true');
            if (!valid && !invalid) {
                invalid = fields[i];
            }
            allMissing = allMissing && fields[i].validity.valueMissing;
        }

        if (!invalid) {
            group.classList.remove('has-error');
            if (error) {
                error.hidden = true;
            }
            return null;
        }

        if (!error) {
            error = document.createElement('p');
            error.className = 'help-block form-error';
            error.id = (fields[0].id || fields[0].name) + '-error';
            group.appendChild(error);
            for (var j = 0; j < fields.length; j++) {
                fields[j].setAttribute('aria-describedby', error.id);
            }
        }

        group.classList.add('has-error');
        // e.g. "Preferred date and time is required." when both are empty
        var label = group.querySelector('.control-label');
        error.textContent = fields.length > 1 && allMissing && label
            ? label.textContent.trim() + ' is required.'
            : errorMessage(invalid);
        error.hidden = false;
        return invalid;
    }

    function errorMessage(field) {
        var v = field.validity;
        var label = fieldLabel(field);

        if (v.valueMissing) {
            return label + ' is required.';
        }
        if (v.typeMismatch && field.type === 'email') {
            return 'Please enter a valid email address, like name@example.com.';
        }
        if (v.rangeUnderflow && field.type === 'date') {
            return 'Please choose a date from today onwards.';
        }
        if (v.stepMismatch && field.type === 'time') {
            return 'Please choose a time on the hour, quarter past, half past or quarter to.';
        }
        if (v.badInput) {
            return 'Please enter a valid ' + label.toLowerCase() + '.';
        }
        return field.validationMessage;
    }

    function fieldLabel(field) {
        if (field.getAttribute('aria-label')) {
            return field.getAttribute('aria-label');
        }
        var label = field.id && document.querySelector('label[for="' + field.id + '"]');
        return label ? label.textContent.trim() : 'This field';
    }

    function showStatus(status, type, message) {
        status.className = 'form-status' + (type ? ' alert alert-' + type : '');
        status.textContent = message;
        status.hidden = !message;
    }
})();
