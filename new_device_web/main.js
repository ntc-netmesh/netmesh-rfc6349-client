eel.expose(alert_debug);
function alert_debug(message){
    console.log(message);
    alert(message);
}

function submit_reg(){
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    var serial = document.getElementById("serial").value;
    var region = document.getElementById("region").value;

    eel.process_submit(user, pass, serial, region);
}