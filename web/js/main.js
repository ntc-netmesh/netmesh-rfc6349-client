// var fs = require("fs");
function disableMainForm(disabled) {
    $('.main-form').find('input').prop('disabled', disabled);
    $('.main-form').find('select').prop('disabled', disabled);
    $('.main-form').find('button').prop('disabled', disabled);
}

function get_gps_from_android() {
    // alert('gps');

    $('#btnGetGps').attr('disabled', true);
    $('#btnGetGps .spinner-grow').show();
    eel.get_gps_from_android();
}

eel.expose(set_gps_from_android);
function set_gps_from_android(lat, long) {

    $('#btnGetGps').attr('disabled', false);
    $('#btnGetGps .spinner-grow').hide();

    if (lat && long) {
        $('#lat').val(lat);
        $('#lon').val(long);
    }
    else {
        alert("Cannot get GPS coordinates\n\nMake sure you:\n- connected an Android phone to this laptop using a USB port\n- enabled 'Location' on the connceted Android phone\n- enabled and allowed 'USB Debugging Mode' on the connected Android phone");
    }
}


eel.expose(check_queue)
function check_queue(mode) {
    var data = getMainFormData();
    if (data) {
        eel.check_queue(mode);
    }
}

eel.expose(start_test)
function start_test(mode) {
    disableMainForm(true);

    $('#progress-finished-title').hide();
    $('#progress-status-info').show();
    $('#results-info').hide();
    
    $("#dynamic").css("width", 0 + "%").attr("aria-valuenow", 0);
    printprogress('Initializing...')

    $('#btnSaveAsPdf').data('test-mode', mode);

    switch(mode) {
        case "normal":
            testFinishedAt = null;
            var data = getMainFormData();

            $('#localResultCard').show();
            $('#remoteResultCard').hide();

            eel.normal(data.lat, data.lon, data.cir, data.server_ip, data.net_type);

            break;
        case "reverse":
            testFinishedAt = null;
            var data = getMainFormData();

            $('#localResultCard').hide();
            $('#remoteResultCard').show();
            
            eel.rev(data.lat, data.lon, data.cir, data.server_ip, data.net_type);
            break;
    }
    
    start_measurement_timer();
}

function start_measurement_timer() {
    testStartedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    
    measurementTimer = setInterval(function () {
        var testDurationSeconds = parseInt(moment().diff(testStartedAt, 'seconds', true));
        var minute = Math.floor(testDurationSeconds / 60);
        var second = testDurationSeconds % 60;

        var currentDuration = `${ numeral(minute).format('0') }:${ numeral(second).format('00') }`;
        $('#measurement-timer').text(currentDuration);
    }, 100);
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

eel.expose(alert_debug);
function alert_debug(message){
    alert(message);
}

eel.expose(progress_now);
function progress_now(value, completed = false){
    if (value > 0) {
        $('#dynamic').addClass('progress-bar-striped progress-bar-animated');

        $('#process-progress-bar').removeClass('border-secondary');
        $('#process-progress-bar').addClass('border-primary');
        $('#dynamic').removeClass('bg-secondary');
        $('#dynamic').addClass('bg-primary');
        $('#progress-status-title').show();
        $('#progress-finished-title').hide();
    }

    if (completed && value == 100) {
        $('#dynamic').removeClass('progress-bar-striped progress-bar-animated');
        $('#cancel').hide();
        disableMainForm(false);
        $('#progress-status-title').hide();
        $('#progress-finished-title').show();
    }
    
    $("#dynamic").css("width", value + "%").attr("aria-valuenow", value);
}

eel.expose(cancel);
function cancel(){
    $('#cancel').hide();
    $('#progress-status-info').hide();
    disableMainForm(false);
    $("#dynamic").css("width", 0 + "%").attr("aria-valuenow", 0);

    eel.cancel_test();
}

eel.expose(add_server);
function add_server(server_name,ip_addr){
    var server_list = document.getElementById("server");
    var option = document.createElement("option");
    option.text = server_name;
    option.value = ip_addr;
    server_list.add(option, 0);

    if (server_name.startsWith("Local")) {
        $('#server').val($('#server option:first').val());
    }
}


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

function getMainFormData() {
    var lat = document.getElementById("lat").value;
    var lon = document.getElementById("lon").value;
    var cir = document.getElementById("cir").value;
    var server_ip = document.getElementById("server").value;
    var net_type = document.getElementById("net_type").value;

    if (cir && net_type && server_ip && lat && lon) {
        return {
            cir: cir,
            net_type: net_type,
            server_ip: server_ip,
            lat: lat,
            lon: lon,
        }
    } else {
        return null;
    }
}

// function normal_mode() {
//     var lat = document.getElementById("lat").value;
//     var lon = document.getElementById("lon").value;
//     var cir = document.getElementById("cir").value;
//     var server_ip = document.getElementById("server").value;
//     var net_type = document.getElementById("net_type").value;

//     document.getElementById("local_result").innerHTML = "";
//     document.getElementById("remote_result").innerHTML = "";

//     document.getElementById("pills-tab0Content").innerHTML = "";
//     document.getElementById("pills-tab1Content").innerHTML = "";
//     document.getElementById("pills-tab2Content").innerHTML = "";
//     document.getElementById("pills-tab3Content").innerHTML = "";

//     document.getElementById("pills-rtab0Content").innerHTML = "";
//     document.getElementById("pills-rtab1Content").innerHTML = "";
//     document.getElementById("pills-rtab2Content").innerHTML = "";
//     document.getElementById("pills-rtab3Content").innerHTML = "";

//     // eel.normal(lat, lon, cir, server_ip, net_type);

//     if(lat != "" && lon != ""){
//         $("#dynamic").css("width", 0 + "%").attr("aria-valuenow", 0);
        
//         eel.normal(lat, lon, cir, server_ip, net_type);
//     }
//     else {
//         alert("Latitude and Longitude must be filled out");   
//     }
// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// async function check_queue(mode) {
//     var cancel = document.getElementById("cancel");
//     cancel.style.display = "block";

//     // kung may iba pang nag-tetest, pakita muna 'ung progress ng queue
//     var random = Math.random() ** 2;
//     var queue_number = parseInt(random * 10);

//     // alert(queue_number);

//     if (queue_number > 0) {
//         $('#modalQueue').modal('show');

//         for (i = 0; i < queue_number; i++) {
//             var current_queue = queue_number - i;

//             if (current_queue == 1) {
//                 $('#queue-label-many').hide();
//                 $('#queue-label-one').show();
//             } else {
//                 $('#queue_remaining').text(current_queue);
    
//                 $('#queue-label-many').show();
//                 $('#queue-label-one').hide();
//             }
//             var queue_progress = (parseFloat(i + 1) / queue_number) * 100;
//             $("#queue-progress").css("width", queue_progress + "%").attr("aria-valuenow", queue_progress);

//             await sleep((Math.random() * 5 + 10) * 1000);
//         }
//     }
    
//     $('#modalQueue').modal('hide');
//     $('#progress-status-info').show();
// }

eel.expose(open_queue_dialog);
function open_queue_dialog() {
    $('#modalQueue').modal('show');
}

eel.expose(close_queue_dialog);
function close_queue_dialog() {
    $('#modalQueue').modal('hide');
}

eel.expose(set_queue);
function set_queue(queue_place) {
    // var queue_progress = (parseFloat(i + 1) / queue_place) * 100;
    // $("#queue-progress").css("width", queue_progress + "%").attr("aria-valuenow", queue_progress);

    if (queue_place > 1) {
        $('#queue_remaining').text(queue_place);

        $('#queue-label-one').hide();
        $('#queue-label-many').show();
    } else {
        $('#queue-label-many').hide();
        $('#queue-label-one').show();
    }
}

// function reverse_mode(){
//     var lat = document.getElementById("lat").value;
//     var lon = document.getElementById("lon").value;
//     var cir = document.getElementById("cir").value;
//     var server_ip = document.getElementById("server").value;
//     var net_type = document.getElementById("net_type").value;

//     document.getElementById("local_result").innerHTML = "";
//     document.getElementById("remote_result").innerHTML = "";

//     document.getElementById("pills-tab0Content").innerHTML = "";
//     document.getElementById("pills-tab1Content").innerHTML = "";
//     document.getElementById("pills-tab2Content").innerHTML = "";
//     document.getElementById("pills-tab3Content").innerHTML = "";

//     document.getElementById("pills-rtab0Content").innerHTML = "";
//     document.getElementById("pills-rtab1Content").innerHTML = "";
//     document.getElementById("pills-rtab2Content").innerHTML = "";
//     document.getElementById("pills-rtab3Content").innerHTML = "";

//     if(lat != "" && lon != ""){
//         eel.rev(lat, lon, cir, server_ip, net_type);
//     }

//     else{
//         alert("Latitude and Longitude must be filled out");
//     }
// }

function simultaneous(){
    var lat = document.getElementById("lat").value;
    var lon = document.getElementById("lon").value;
    var cir = document.getElementById("cir").value;
    var server_ip = document.getElementById("server").value;
    var net_type = document.getElementById("net_type").value;

    document.getElementById("local_result").innerHTML = "";
    document.getElementById("remote_result").innerHTML = "";

    document.getElementById("pills-tab0Content").innerHTML = "";
    document.getElementById("pills-tab1Content").innerHTML = "";
    document.getElementById("pills-tab2Content").innerHTML = "";
    document.getElementById("pills-tab3Content").innerHTML = "";

    document.getElementById("pills-rtab0Content").innerHTML = "";
    document.getElementById("pills-rtab1Content").innerHTML = "";
    document.getElementById("pills-rtab2Content").innerHTML = "";
    document.getElementById("pills-rtab3Content").innerHTML = "";

    if(lat != "" && lon != ""){
        eel.sim(lat, lon, cir, server_ip, net_type);
    }

    else{
        alert("Latitude and Longitude must be filled out");
    }

}


eel.expose(lgraph);
function lgraph(predata){
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#local_graph")
        var svg = d3.select("#tab1Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Throughput (Mbps)");

}

eel.expose(rgraph);
function rgraph(predata){
    console.log(predata)
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#remote_graph")
        var svg = d3.select("#pills-rtab1Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");


        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("x",0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text("Throughput (Mbps)");     

}

eel.expose(lbgraph);
function lbgraph(predata){
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#local_buffer_graph")
        var svg = d3.select("#tab2Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("RTT");

}

eel.expose(legraph);
function legraph(predata){
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#local_efficiency_graph")
        var svg = d3.select("#tab3Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Efficiency (%)");

}

eel.expose(regraph);
function regraph(predata){
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#remote_efficiency_graph")
        var svg = d3.select("#pills-rtab2Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Efficiency (%)");

}

eel.expose(rbgraph);
function rbgraph(predata){
    var data = predata.map(function(d){
        return{
            time: d[0],
            bw: d[1]
        }

        });

        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 50},
            width = 300 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        //set ranges
        var x = d3.scaleLinear().range([0,width]);
        var y = d3.scaleLinear().range([height,0]);

        //define line
        var valueline = d3.line()
            .x(function(d) {return x(d.time);})
            .y(function(d) {return y(d.bw);});

        // append the svg object to the body of the page
        //var svg = d3.select("#remote_buffer_graph")
        var svg = d3.select("#pills-rtab3Content")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        data.forEach( function(d){
            d.time = d.time;
            d.bw = +d.bw;
        });

        x.domain(d3.extent(data, function(d){return d.time;}));
        y.domain([0, d3.max(data, function(d){return d.bw;})]);

        svg.append("path")
            .data([data])
            .attr("class","line")
            .attr("d",valueline)

        svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .call(d3.axisBottom(x));

        svg.append("text")             
            .attr("transform",
                "translate(" + (width/2) + " ," + 
                    (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Time");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("RTT");

}

eel.expose(wnd_scan_graph);
function wnd_scan_graph(predata){
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
        width = 400 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom,
        barPadding = .2,
        axisTicks = {qty: 5, outerSize: 0, dateFormat: '%m-%d'};

    var svg = d3.select("#pills-tab0Content")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding)

    var xScale1 = d3.scaleBand()

    var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])

    var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);


    xScale0.domain(predata.map(d => d.wnd_size))
    xScale1.domain(['actual', 'ideal']).range([0, xScale0.bandwidth()])

    yScale.domain([0, d3.max(predata, d => d.actual > d.ideal ? d.actual : d.ideal)])

    var wnd_size = svg.selectAll(".wnd_size")
      .data(predata)
      .enter().append("g")
      .attr("class", "wnd_size")
      .attr("transform", d => `translate(${xScale0(d.wnd_size)},0)`);

    /* Add actual bars */
    wnd_size.selectAll(".bar.actual")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar actual")
    .style("fill","blue")
      .attr("x", d => xScale1('actual'))
      .attr("y", d => yScale(d.actual))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => {
        return height - margin.top - margin.bottom - yScale(d.actual)
      });


    /* Add ideal bars */
    wnd_size.selectAll(".bar.ideal")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar ideal")
    .style("fill","red")
      .attr("x", d => xScale1('ideal'))
      .attr("y", d => yScale(d.ideal))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => {
        return height - margin.top - margin.bottom - yScale(d.ideal)
      });

    // Add the X Axis
    svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0,"+(height - margin.top - margin.bottom)+")")
         .call(xAxis);
    // Add the Y Axis
    svg.append("g")
         .attr("class", "y axis")
         .call(yAxis);

/*

    svg.append("g")
        .attr("transform","translate(0,"+height+")")
        .call(d3.axisBottom(xScale1));

    svg.append("text")             
        .attr("transform",
            "translate(" + (width/2) + " ," + 
                (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Window Size (Bytes)");*/

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Throughput (Mbps)");
}

eel.expose(rev_wnd_scan_graph);
function rev_wnd_scan_graph(predata){
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
        width = 400 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom,
        barPadding = .2,
        axisTicks = {qty: 5, outerSize: 0, dateFormat: '%m-%d'};

    var svg = d3.select("#pills-rtab0Content")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding)

    var xScale1 = d3.scaleBand()

    var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0])

    var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);

    xScale0.domain(predata.map(d => d.wnd_size))
    xScale1.domain(['actual', 'ideal']).range([0, xScale0.bandwidth()])

    yScale.domain([0, d3.max(predata, d => d.actual > d.ideal ? d.actual : d.ideal)])

    var wnd_size = svg.selectAll(".wnd_size")
      .data(predata)
      .enter().append("g")
      .attr("class", "wnd_size")
      .attr("transform", d => `translate(${xScale0(d.wnd_size)},0)`);

    /* Add actual bars */
    wnd_size.selectAll(".bar.actual")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar actual")
    .style("fill","blue")
      .attr("x", d => xScale1('actual'))
      .attr("y", d => yScale(d.actual))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => {
        return height - margin.top - margin.bottom - yScale(d.actual)
      });


    /* Add ideal bars */
    wnd_size.selectAll(".bar.ideal")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar ideal")
    .style("fill","red")
      .attr("x", d => xScale1('ideal'))
      .attr("y", d => yScale(d.ideal))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => {
        return height - margin.top - margin.bottom - yScale(d.ideal)
      });

    // Add the X Axis
    svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0,"+(height - margin.top - margin.bottom)+")")
         .call(xAxis);
    // Add the Y Axis
    svg.append("g")
         .attr("class", "y axis")
         .call(yAxis);


    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Throughput (Mbps)");
}

function selectTab(tabIndex){
    document.getElementById('pills-tab0Content').style.display="none";
    document.getElementById('pills-tab1Content').style.display="none";
    document.getElementById('pills-tab2Content').style.display="none";
    document.getElementById('pills-tab3Content').style.display="none";

    document.getElementById('pills-tab' + tabIndex +'Content').style.display="block";
}

function rselectTab(tabIndex){
    document.getElementById('pills-rtab0Content').style.display="none";
    document.getElementById('pills-rtab1Content').style.display="none";
    document.getElementById('pills-rtab2Content').style.display="none";
    document.getElementById('pills-rtab3Content').style.display="none";

    document.getElementById('pills-rtab' + tabIndex +'Content').style.display="block";
}

eel.expose(printlocal);
function printlocal(result){
	console.log(result);
	//document.getElementById("local_result").value += result + "\n";
    document.getElementById("local_result").innerHTML += result + "<br>";
}

eel.expose(printnormal);
function printnormal(result){
    disableMainForm(false);

    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    // alert('printnormal');
    //document.getElementById("local_result").value += result + "\n";
    localResultId = '#tblLocalResult tbody';
    $(localResultId).empty();

    $('#results-info').show();

    if (result) {
        result["CIR"] = $('#cir').val();
        $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'CIR' }</b></td><td>${ result["CIR"] }${ ' Mbps' }</td></tr>`);

        if ("MTU" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td>${ result["MTU"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RTT" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td>${ numeral(result["RTT"]).format('0,0.000') }${ ' ms' }</td></tr>`);
        }
        if ("RWND" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td>${ result["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        }
        if ("THPT_AVG" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td>${ numeral(result["THPT_AVG"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        }
        if ("THPT_IDEAL" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td>${ numeral(result["ACTUAL_IDEAL"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        }
        if ("TRANSFER_AVG" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td>${ numeral(result["TRANSFER_AVG"]).format('0,0.000') }${ ' s' }</td></tr>`);
        }
        if ("TRANSFER_IDEAL" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td>${ numeral(result["TRANSFER_IDEAL"]).format('0,0.000') }${ ' s' }</td></tr>`);
        }
        if ("TCP_TTR" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td>${ numeral(result["TCP_TTR"]).format('0.000%') }${ '' }</td></tr>`);
        }
        if ("TRANS_BYTES" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td>${ result["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RETX_BYTES" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td>${ result["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("TCP_EFF" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td>${ numeral(result["TCP_EFF"]).format('0.000%') }${ '' }</td></tr>`);
        }
        if ("AVE_RTT" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td>${ numeral(result["AVE_RTT"]).format('0.000') }${ ' ms' }</td></tr>`);
        }
        if ("BUF_DELAY" in result){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td>${ numeral(result["BUF_DELAY"]).format('0.000%') }${ '' }</td></tr>`);
        }
    } else {
        $(localResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    localWindowScanId = "#tblLocalWindowStats tbody";
    var windowSizes = result["WND_SIZES"];
    var windowAverageThroughputs = result["WND_AVG_TCP"];
    var windowIdealThroughputs = result["WND_ACTUAL_IDEAL"];
    var windowTcpEfficiencies = result["EFF_PLOT"];
    // var windowAverageRtt = result["BUF_PLOT"];
    $(localWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    $(localWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    $(localWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    $(localWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    $(localWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    if (windowSizes && windowSizes.length > 0) {
        for (var i = 0; i < windowSizes.length; i++) {
            $(localWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 == windowSizes.length ? 'THPT' : i + 1 }</td>`);
            $(localWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ windowSizes[i] } Bytes</td>`);
            $(localWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ windowAverageThroughputs.length > i ? numeral(windowAverageThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(localWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ windowIdealThroughputs.length > i ? numeral( windowIdealThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(localWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ windowTcpEfficiencies.length > i ? numeral(windowTcpEfficiencies[i]).format('0.[000]%') : "---" } </td>`);
            // $(localWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowAverageRtt.length > i ? numeral(windowAverageRtt[i]).format('0.000') : "---" } ms</td>`);
        }
    }
    else {
        $(localWindowScanId).append(`<tr><td><span class="text-muted">${ 'No measured window scan' }<span></td></tr>`);
    }
    
    renderLocalWindowScanGraph(result);
    renderLocalThroughputEfficiencyGraph(result);
    // renderLocalThroughputRTTGraph(result);

    normalTestResults = result;
}


function renderLocalWindowScanGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var idealThroughputs = [];
    
    var windowSizes = result['WND_SIZES'];
    for (var i = 0; i < windowSizes.length; i++) {
        steps.push(i + 1 == windowSizes.length ? 'THPT' : `Step ${ i + 1 }`);
        averageThroughputs.push(result['WND_AVG_TCP'][i]);
        idealThroughputs.push(result['WND_ACTUAL_IDEAL'][i]);
    }

    for (var i = 0; i < 2; i++) {
        steps.push('');
        averageThroughputs.push(0);
        idealThroughputs.push(0);
    }

    console.log(steps);
    console.log(averageThroughputs);
    console.log(idealThroughputs);

    var options = {
        chart: {
            type: 'bar',
            width: '100%',
            height: 360,
            toolbar: {
                show: false
            },
            fontFamily: 'Arial, sans-serif',
        },
        plotOptions: {
            bar: {
                // horizontal: false,
                columnWidth: '80%',
                endingShape: 'flat',
                dataLabels: {
                    position: 'top',
                }
            },
        },
        colors: ['#40C4FF', '#448AFF'],
        dataLabels: {
            enabled: false,
        },
        series: [
            {
                name: 'Average TCP Throughput',
                data: averageThroughputs
            },
            {
                name: 'Ideal TCP Throughput',
                data: idealThroughputs
            },
        ],
        xaxis: {
            categories: steps,
        },
        yaxis: {
            title: {
                text: 'Mbps',
            },
            labels: {
                formatter: function (value) {
                    return `${ numeral(value).format("0.[000]") }`;
                },
            },
        },
        annotations: {
            yaxis: [
                {
                    y: result["CIR"],
                    borderColor: '#4CAF50',
                    strokeDashArray: 0,
                    label: {
                        textAnchor: 'start',
                        position: 'left',
                        borderWidth: 0,
                        style: {
                            background: 'rgba(0,0,0,0)',
                            color: '#4CAF50',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        },
                        text: `CIR: ${ numeral(result["CIR"]).format('0.000') } Mbps`
                    }
                },
                {
                    y: result["ACTUAL_IDEAL"],
                    borderColor: '#FF9800',
                    strokeDashArray: 8,
                    label: {
                        // textAnchor: 'start',
                        // position: 'left',
                        borderWidth: 0,
                        style: {
                            background: 'rgba(0,0,0,0)',
                            color: '#FF9800',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        },
                        text: `Max THPT: ${ numeral(result["ACTUAL_IDEAL"]).format('0.000') } Mbps`
                    }
                }
            ]
        },
        tooltip: {
            y: {
                formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                    return `${numeral(value).format('0.[000]')} Mbps`;
                },
            },
            style: {
                fontSize: '14px',
            },
        }
    }

    var chart = new ApexCharts(document.querySelector('#windowScanChart'), options);
    chart.render();
}

function renderLocalThroughputEfficiencyGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var efficiencies = [];
    
    var windowSizes = result['WND_SIZES'];
    for (var i = 0; i < windowSizes.length; i++) {
        steps.push(i + 1 == windowSizes.length ? 'THPT' : `Step ${ i + 1 }`);
        averageThroughputs.push(result['WND_AVG_TCP'][i]);
        efficiencies.push(result['EFF_PLOT'][i]);
    }

    console.log(steps);
    console.log(averageThroughputs);
    console.log(efficiencies);

    var options = {
        chart: {
            type: 'line',
            width: '100%',
            height: 360,
            toolbar: {
                show: false
            },
            fontFamily: 'Arial, sans-serif',
        },
        markers: {
            size: 4,
        },
        stroke: {
            width: 3,
            curve: 'straight',
        },
        colors: ['#40C4FF', '#536DFE'],
        series: [
            {
                name: 'Average TCP Throughput',
                data: averageThroughputs
            },
            {
                name: 'Efficiency',
                data: efficiencies
            },
        ],
        xaxis: {
            categories: steps,
        },
        yaxis: [
            {
                title: {
                    text: 'Mbps',
                },
                labels: {
                    formatter: function (value) {
                        return `${ numeral(value).format("0.[000]") }`;
                    },
                },
            },
            {
                min: 0,
                max: 1,
                opposite: true,
                labels: {
                    formatter: function (value) {
                        return `${ numeral(value).format("0.[000]%") }`;
                    },
                },
            }
        ],
        tooltip: {
            y: {
                formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                    if (seriesIndex == 0) {
                        return `${numeral(value).format('0.[000]')} Mbps`;
                    } else if (seriesIndex == 1) {
                        return `${numeral(value).format('0.[000]%')}`;
                    }
                },
            },
            style: {
                fontSize: '14px',
            },
        }
    }

    var chart = new ApexCharts(document.querySelector('#throughputEfficiencyChart'), options);
    chart.render();
}


// function renderLocalThroughputRTTGraph(result) {
//     var steps = [];
//     var averageThroughputs = [];
//     var rtts = [];
    
//     var windowSizes = result['WND_SIZES'];
//     for (var i = 0; i < windowSizes.length; i++) {
//         steps.push(i + 1 == windowSizes.length ? 'THPT' : `Step ${ i + 1 }`);
//         averageThroughputs.push(result['WND_AVG_TCP'][i]);
//         rtts.push(result['BUF_PLOT'][i]);
//     }

//     console.log(steps);
//     console.log(averageThroughputs);
//     console.log(rtts);

//     var options = {
//         chart: {
//             type: 'line',
//             width: '100%',
//             height: 360,
//             toolbar: {
//                 show: false
//             },
//             fontFamily: 'Arial, sans-serif',
//         },
//         markers: {
//             size: 4,
//         },
//         stroke: {
//             width: 3,
//             curve: 'straight',
//         },
//         colors: ['#40C4FF', '#7C4DFF'],
//         series: [
//             {
//                 name: 'Average TCP Throughput',
//                 data: averageThroughputs
//             },
//             {
//                 name: 'RTT',
//                 data: rtts
//             },
//         ],
//         xaxis: {
//             categories: steps,
//         },
//         yaxis: [
//             {
//                 title: {
//                     text: 'Mbps',
//                 },
//                 labels: {
//                     formatter: function (value) {
//                         return `${ numeral(value).format("0.[000]") }`;
//                     },
//                 },
//             },
//             {
//                 opposite: true,
//                 title: {
//                     text: 'ms',
//                 },
//                 labels: {
//                     formatter: function (value) {
//                         return `${ numeral(value).format("0.[000]") }`;
//                     },
//                 },
//             }
//         ],
//         tooltip: {
//             y: {
//                 formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
//                     if (seriesIndex == 0) {
//                         return `${numeral(value).format('0.[000]')} Mbps`;
//                     } else if (seriesIndex == 1) {
//                         return `${numeral(value).format('0.[000]')} ms`;
//                     }
//                 },
//             },
//             style: {
//                 fontSize: '14px',
//             },
//         }
//     }

//     var chart = new ApexCharts(document.querySelector('#throughputRTTChart'), options);
//     chart.render();
// }

function adjustChart(chartId) {
    var obj = $(`#${chartId} text.apexcharts-datalabel`);
    var result = Object.keys(obj).map(function(key) {
        if (obj[key]) {
            return obj[key];
        }
    });

    for (var i = 0; i < result.length; i++) {
        var target = $(result[i]);
        if (target.is('text')) {
            target.attr('x', 8);
        }
    }
}

eel.expose(printreverse);
function printreverse(result){
    disableMainForm(false);
    
    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    //document.getElementById("local_result").value += result + "\n";

    localResultId = '#tblRemoteResult tbody';
    $(localResultId).empty();

    $('#results-info').show();

    if (result) {
        if ("MTU" in result){
            $(localResultId).append(`<tr><td>${ 'MTU' }</td><td>${ result["MTU"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RTT" in result){
            $(localResultId).append(`<tr><td>${ 'RTT' }</td><td>${ result["RTT"] }${ ' ms' }</td></tr>`);
        }
        // if ("BB" in result){
        //     $(localResultId).append(`<tr><td>${ 'BB' }</td><td>${ result["BB"] }${ ' Mbps' }</td></tr>`);
        // }
        // if ("BDP" in result){
        //     $(localResultId).append(`<tr><td>${ 'BDP' }</td><td>${ result["BDP"] }${ '' }</td></tr>`);
        // }
        if ("RWND" in result){
            $(localResultId).append(`<tr><td>${ 'TCP RWND' }</td><td>${ result["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        }
        if ("THPT_AVG" in result){
            $(localResultId).append(`<tr><td>${ 'Average TCP Throughput' }</td><td>${ result["THPT_AVG"] }${ ' Mbps' }</td></tr>`);
        }
        if ("THPT_IDEAL" in result){
            $(localResultId).append(`<tr><td>${ 'Ideal TCP Throughput' }</td><td>${ result["ACTUAL_IDEAL"] }${ ' Mbps' }</td></tr>`);
        }
        if ("TRANSFER_AVG" in result){
            $(localResultId).append(`<tr><td>${ 'Average Transfer Time' }</td><td>${ result["TRANSFER_AVG"] }${ ' s' }</td></tr>`);
        }
        if ("TRANSFER_IDEAL" in result){
            $(localResultId).append(`<tr><td>${ 'Ideal Transfer Time' }</td><td>${ result["TRANSFER_IDEAL"] }${ ' s' }</td></tr>`);
        }
        if ("TCP_TTR" in result){
            $(localResultId).append(`<tr><td>${ 'TCP TTR' }</td><td>${ result["TCP_TTR"] }${ '' }</td></tr>`);
        }
        if ("TRANS_BYTES" in result){
            $(localResultId).append(`<tr><td>${ 'Transmitted Bytes' }</td><td>${ result["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RETX_BYTES" in result){
            $(localResultId).append(`<tr><td>${ 'Reransmitted Bytes' }</td><td>${ result["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("TCP_EFF" in result){
            $(localResultId).append(`<tr><td>${ 'TCP Efficiency' }</td><td>${ result["TCP_EFF"] }${ '' }</td></tr>`);
        }
        if ("AVE_RTT" in result){
            $(localResultId).append(`<tr><td>${ 'Average RTT' }</td><td>${ result["AVE_RTT"] }${ ' ms' }</td></tr>`);
        }
        if ("BUF_DELAY" in result){
            $(localResultId).append(`<tr><td>${ 'Buffer Delay' }</td><td>${ result["BUF_DELAY"] }${ '%' }</td></tr>`);
        }
    } else {
        $(localResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    // if (!result) {
    //     alert("No measured results");
    //     return;
    // }

    // if ("MTU" in result){
    //     document.getElementById("remote_result").innerHTML += "MTU: " + result["MTU"] + "Bytes <br>";
    // }
    // if ("RTT" in result){
    //     document.getElementById("remote_result").innerHTML += "RTT: " + result["RTT"] + "ms<br>";
    // }
    // if ("BB" in result){
    //     document.getElementById("remote_result").innerHTML += "BB: " + result["BB"] + "Mbps<br>";
    // }
    // if ("BDP" in result){
    //     document.getElementById("remote_result").innerHTML += "BDP: " + result["BDP"] + "<br>";
    // }
    // if ("RWND" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP RWND: " + result["RWND"] + "<br>";
    // }
    // if ("THPT_AVG" in result){
    //     document.getElementById("remote_result").innerHTML += "Average TCP Throughput: " + result["THPT_AVG"] + "Mbps<br>";
    // }
    // if ("THPT_IDEAL" in result){
    //     document.getElementById("remote_result").innerHTML += "Ideal TCP Throughput: " + result["THPT_IDEAL"] + "Mbps<br>";
    // }
    // if ("TRANSFER_AVG" in result){
    //     document.getElementById("remote_result").innerHTML += "Average Transfer Time: " + result["TRANSFER_AVG"] + "s<br>";
    // }
    // if ("TRANSFER_IDEAL" in result){
    //     document.getElementById("remote_result").innerHTML += "Ideal Transfer Time: " + result["TRANSFER_IDEAL"] + "s<br>";
    // }
    // if ("TCP_TTR" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP TTR: " + result["TCP_TTR"] + "<br>";
    // }
    // if ("TRANS_BYTES" in result){
    //     document.getElementById("remote_result").innerHTML += "Transmitted Bytes: " + result["TRANS_BYTES"] + "Bytes<br>";
    // }
    // if ("RETX_BYTES" in result){
    //     document.getElementById("remote_result").innerHTML += "Reransmitted Bytes: " + result["RETX_BYTES"] + "Bytes<br>";
    // }
    // if ("TCP_EFF" in result){
    //     document.getElementById("remote_result").innerHTML += "TCP Efficiency: " + result["TCP_EFF"] + "<br>";
    // }
    // if ("AVE_RTT" in result){
    //     document.getElementById("remote_result").innerHTML += "Average RTT: " + result["AVE_RTT"] + "ms<br>";
    // }
    // if ("BUF_DELAY" in result){
    //     document.getElementById("remote_result").innerHTML += "Buffer Delay: " + result["BUF_DELAY"] + "%<br>";
    // }
}

eel.expose(printprogress);
function printprogress(state){
    $('#progress').text(state);
}

eel.expose(mode);
function mode(test_mode){
    document.getElementById("mode").innerHTML = test_mode;
}

eel.expose(create_table_local_window);
function create_table_local_window(tableData){
    var tableBody = document.createElement('tbody');

    //TABLE HEADERS
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("Steps"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("1"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("2"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("3"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("THPT"));
    row.appendChild(cell);
    tableBody.appendChild(row);

    tableData.forEach(function(rowData){
        var row = document.createElement('tr');

        rowData.forEach(function (cellData){
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
    
    document.getElementById('local_wnd_stats').innerHTML = "";
    document.getElementById('local_wnd_stats').appendChild(tableBody);
}

eel.expose(create_table_remote_window);
function create_table_remote_window(tableData){
    var tableBody = document.createElement('tbody');

    //TABLE HEADERS
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("Steps"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("1"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("2"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("3"));
    row.appendChild(cell);
    var cell = document.createElement('td');
    cell.appendChild(document.createTextNode("THPT"));
    row.appendChild(cell);
    tableBody.appendChild(row);

    tableData.forEach(function(rowData){
        var row = document.createElement('tr');

        rowData.forEach(function (cellData){
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
    
    document.getElementById('remote_wnd_stats').innerHTML = "";
    document.getElementById('remote_wnd_stats').appendChild(tableBody);
}


// Example when handled through fs.watch() listener
// fs.watch('./tempfiles/queue/queue_place', { encoding: 'buffer' }, (eventType, filename) => {
//     if (filename) {
//       console.log(filename);
//       // Prints: <Buffer ...>
//     }
// });