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
        forms[j].addEventListener('submit', submitForm);
    }

    function submitForm(event) {
        event.preventDefault();

        var form = event.target;
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

    function showStatus(status, type, message) {
        status.className = 'form-status' + (type ? ' alert alert-' + type : '');
        status.textContent = message;
        status.hidden = !message;
    }
})();
