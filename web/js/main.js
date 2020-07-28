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
        $('#modalGpsProblem').modal('show');
        // alert("Cannot get GPS coordinates\n\nMake sure you:\n- \n- \n- ");
    }
}

eel.expose(start_test)
function start_test(mode) {
    disableMainForm(true);

    if (chartPromises && chartPromises.length > 0) {
        ApexCharts.exec('windowsScanLocalToRemoteChart', 'destroy', []);
        ApexCharts.exec('throughputEfficiencyLocalToRemoteChart', 'destroy', []);
        ApexCharts.exec('windowsScanRemoteToLocalChart', 'destroy', []);
        ApexCharts.exec('throughputEfficiencyRemoteToLocalChart', 'destroy', []);
    }
    chartPromises = [];

    $('#progress-finished-title').hide();
    $('#progress-status-info').show();
    $('#results-info').hide();
    $('#error-info').hide();
    
    $('#measurement-timer').text("0:00");
    $("#dynamic").css("width", 0 + "%").attr("aria-valuenow", 0);
    progress_now(0);
    printprogress('Initializing...')

    $('#test-error-message').text('');

    $('#btnSaveAsPdf').data('test-mode', mode);

    switch(mode) {
        case "normal":
            testStartedAt = null;
            testFinishedAt = null;
            var data = getMainFormData();

            $('#localResultCard').show();
            $('#remoteResultCard').hide();

            $('#mode-icon').removeClass("fa-download");
            $('#mode-icon').removeClass("text-info");
            $('#mode-icon').addClass("fa-upload");
            $('#mode-icon').addClass("text-primary");

            eel.normal(data.lat, data.lon, data.cir, data.server_ip, data.net_type);

            break;
        case "reverse":
            testStartedAt = null;
            testFinishedAt = null;
            var data = getMainFormData();

            $('#localResultCard').hide();
            $('#remoteResultCard').show();

            $('#mode-icon').removeClass("fa-upload");
            $('#mode-icon').removeClass("text-primary");
            $('#mode-icon').addClass("fa-download");
            $('#mode-icon').addClass("text-info");
            
            eel.rev(data.lat, data.lon, data.cir, data.server_ip, data.net_type);
            break;
    }
}

eel.expose(start_measurement_timer)
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

eel.expose(progress_now);
function progress_now(value, completed = false){
    if (value >= 0) {
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

eel.expose(add_servers);
function add_servers(servers) {
    var serverSelect = $('#server');

    serverSelect.append(`
        <option value="" selected="selected" hidden="hidden"> 
            Select test server...
        </option>
    `); 

    serverSelect.append(`
        <option value="${ '35.185.183.104,uuid.35.185.183.104' }"> 
            ${ 'Google Cloud Server (THIS IS A TEST)' }
        </option>`
    );
    serverSelect.append(`
        <option value="${ '35.198.221.235,uuid.35.198.221.235' }"> 
            ${ 'Region 1 Server (THIS IS A TEST)' }
        </option>`
    );
    serverSelect.append(`
        <option value="${ '202.90.158.168,uuid.202.90.158.168' }"> 
            ${ 'Local test server (THIS IS A TEST)' }
        </option>`
    );

    for (var server of servers) {
        serverSelect.append(`
            <option value="${server.ip_address}"> 
                ${server.nickname} 
            </option>
        `); 
    }
}

eel.expose(print_test_error);
function print_test_error(message) {
    $('#error-info').show();
    $('#results-info').hide();

    $('#test-error-message').text(message);
}

function getMainFormData() {
    var lat = document.getElementById("lat").value;
    var lon = document.getElementById("lon").value;
    var cir = document.getElementById("cir").value;
    var server_ip = document.getElementById("server").value;
    var net_type = document.getElementById("net_type").value;

    if (cir && server_ip && lat && lon) {
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

eel.expose(set_current_username);
function set_current_username(username, region) {
    $('#loggedUsername').text(username);
    $('#region-name').text(region);
}


function logout() {
    window.location.replace("login.html");
}

// eel.expose(set_user)
// function set_user(username) {
//     $('#loggedUsername').text(username);
// }

$(function () {

    // $('#net_type').val("Fixed Wireless");
    // $('#cir').val(10);
    // $('#lat').val(14.811390);
    // $('#lon').val(120.521248);
    // $('#lat').val(14.647132);
    // $('#lon').val(121.072027);
    // alert(eel.getLoggedUsername());

    eel.set_current_username()

    // generateTestResultsPdfReport();
});

// Example when handled through fs.watch() listener
// fs.watch('./tempfiles/queue/queue_place', { encoding: 'buffer' }, (eventType, filename) => {
//     if (filename) {
//       console.log(filename);
//       // Prints: <Buffer ...>
//     }
// });