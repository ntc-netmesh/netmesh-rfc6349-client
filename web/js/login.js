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

function user_logout() {

}