eel.expose(check_queue)
function check_queue(mode) {
    var data = getMainFormData();
    if (data) {
        eel.check_queue(mode);
    }
}

eel.expose(set_queue);
function set_queue(queue_place) {
    // var queue_progress = (parseFloat(i + 1) / queue_place) * 100;
    // $("#queue-progress").css("width", queue_progress + "%").attr("aria-valuenow", queue_progress);

    $("#selected-server").text($('#server option:selected').text());

    if (queue_place > 1) {
        $('#queue_remaining').text(queue_place);

        $('#queue-label-one').hide();
        $('#queue-label-many').show();
    } else {
        $('#queue-label-many').hide();
        $('#queue-label-one').show();
    }
}

eel.expose(open_queue_dialog);
function open_queue_dialog() {
    $('#modalQueue').modal('show');
}

eel.expose(close_queue_dialog);
function close_queue_dialog() {
    $('#modalQueue').modal('hide');
}

function confirmLeaveQueue() {
    $('#modalLeaveQueueConfirmation').modal('show');
    // $('#modalQueue').prop('opacity', '50%');
}

function leaveQueue() {
    eel.leave_queue();

    $('#modalQueue').modal('hide');
    disableMainForm(false);
}
