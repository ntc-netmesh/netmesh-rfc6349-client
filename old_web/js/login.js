eel.expose(hide_login);
function hide_login(){
    // document.getElementById('login').style.display='none';
    window.location.replace("hello.html");
}

function user_login(){
    var username = document.getElementById("uname").value;
    var password = document.getElementById("psw").value;

    eel.login(username,password); 
}

eel.expose(disable_login_form)
function disable_login_form() {
    setLogInFormStatus(true);
}

eel.expose(enable_login_form)
function enable_login_form() {
    setLogInFormStatus(false);
}


function setLogInFormStatus(disabled) {
    $('#uname').attr('disabled', disabled);
    $('#psw').attr('disabled', disabled);
    $('#btnLogIn').attr('disabled', disabled);

    if (disabled) {
        $('#spinnerLogIn').show();
        $('#spanLogIn').text('Logging in...');
    } else {
        $('#spinnerLogIn').hide();
        $('#spanLogIn').text('Log in');
    }
}

eel.expose(alert_debug);
function alert_debug(message){
    alert(message);
}

$(function () {
    $('#spinnerLogIn').hide();
});