
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

function confirmLeaveQueue() {

    $('#modalLeaveQueueConfirmation').modal('show');
    $('#modalQueue').prop('opacity', '50%');

    $('#btnLaveQueueConfirm').on('click', function () {
        $('#modalQueue').modal('hide');
        disableMainForm(false);
        // TODO: cancel queue
    })
    // var isLeaving = confirm("Are you sure you want to leave the queue?");
    // if (isLeaving) {
    //     $('#modalQueue').modal('hide');
    //     disableMainForm(false);
    //     // TODO: cancel queue
    // }
}

eel.expose(alert_debug);
function alert_debug(message){
    alert(message);
}

eel.expose(progress_now);
function progress_now(value){

    if (value > 0) {
        $('#dynamic').addClass('progress-bar-striped progress-bar-animated');

        $('#process-progress-bar').removeClass('border-secondary');
        $('#process-progress-bar').addClass('border-primary');
        $('#dynamic').removeClass('bg-secondary');
        $('#dynamic').addClass('bg-primary');
        $('#progress-status-title').show();
        $('#progress-finished-title').hide();
    }

    if (value == 100) {
        $('#dynamic').removeClass('progress-bar-striped progress-bar-animated');
        $('#cancel').hide();
        disableMainForm(false);
        $('#progress-status-title').hide();
        $('#progress-finished-title').show();
    }
    //document.getElementById("prog_bar").attr('aria-valuenow', value).css("width", percent);
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

async function normal_mode() {
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
        
        await check_queue("normal");

        disableMainForm(true);
        $("#dynamic").css("width", 0 + "%").attr("aria-valuenow", 0);
        
        eel.normal(lat, lon, cir, server_ip, net_type);
    }
    else {
        alert("Latitude and Longitude must be filled out");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function check_queue(mode) {
    var cancel = document.getElementById("cancel");
    cancel.style.display = "block";

    // kung may iba pang nag-tetest, pakita muna 'ung progress ng queue
    var random = Math.random() ** 2;
    var queue_number = parseInt(random * 10);

    // alert(queue_number);

    if (queue_number > 0) {
        $('#modalQueue').modal('show');

        for (i = 0; i < queue_number; i++) {
            var current_queue = queue_number - i;

            if (current_queue == 1) {
                $('#queue-label-many').hide();
                $('#queue-label-one').show();
            } else {
                $('#queue_remaining').text(current_queue);
    
                $('#queue-label-many').show();
                $('#queue-label-one').hide();
            }
            var queue_progress = (parseFloat(i + 1) / queue_number) * 100;
            $("#queue-progress").css("width", queue_progress + "%").attr("aria-valuenow", queue_progress);

            await sleep((Math.random() * 5 + 10) * 1000);
        }
    }
    
    $('#modalQueue').modal('hide');
    $('#progress-status-info').show();
}

function reverse_mode(){
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
        eel.rev(lat, lon, cir, server_ip, net_type);
    }

    else{
        alert("Latitude and Longitude must be filled out");
    }
}

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
    console.log(result);
    alert('aaaa');
    //document.getElementById("local_result").value += result + "\n";
    localResultId = '#tblLocalResult tbody';
    $(localResultId).empty();

    if ("MTU" in result){
        /// document.getElementById("local_result").innerHTML += "MTU: " + result["MTU"] + "Bytes <br>";
        $(localResultId).append(`<tr><td>${ 'MTU' }</td>${ result["MTU"] }${ ' Bytes' }<td></td></tr>`);
    }
    if ("RTT" in result){
        // document.getElementById("local_result").innerHTML += "RTT: " + result["RTT"] + "ms<br>";
        $(localResultId).append(`<tr><td>${ 'RTT' }</td>${ result["RTT"] }${ ' ms' }<td></td></tr>`);
    }
    if ("BB" in result){
        // document.getElementById("local_result").innerHTML += "BB: " + result["BB"] + "Mbps<br>";
        $(localResultId).append(`<tr><td>${ 'BB' }</td>${ result["BB"] }${ ' Mbps' }<td></td></tr>`);
    }
    if ("BDP" in result){
        // document.getElementById("local_result").innerHTML += "BDP: " + result["BDP"] + "<br>";
        $(localResultId).append(`<tr><td>${ 'BDP' }</td>${ result["BDP"] }${ '' }<td></td></tr>`);
    }
    if ("RWND" in result){
        // document.getElementById("local_result").innerHTML += "TCP RWND: " + result["RWND"] + "<br>";
        $(localResultId).append(`<tr><td>${ 'TCP RWND' }</td>${ result["RWND"] }${ '' }<td></td></tr>`);
    }
    if ("THPT_AVG" in result){
        // document.getElementById("local_result").innerHTML += "Average TCP Throughput: " + result["THPT_AVG"] + "Mbps<br>";
        $(localResultId).append(`<tr><td>${ 'Average TCP Throughput' }</td>${ result["THPT_AVG"] }${ ' Mbps' }<td></td></tr>`);
    }
    if ("THPT_IDEAL" in result){
        // document.getElementById("local_result").innerHTML += "Ideal TCP Throughput: " + result["THPT_IDEAL"] + "Mbps<br>";
        $(localResultId).append(`<tr><td>${ 'Ideal TCP Throughput' }</td>${ result["THPT_IDEAL"] }${ ' Mbps' }<td></td></tr>`);
    }
    if ("TRANSFER_AVG" in result){
        // document.getElementById("local_result").innerHTML += "Average Transfer Time: " + result["TRANSFER_AVG"] + "s<br>";
        $(localResultId).append(`<tr><td>${ 'Average Transfer Time' }</td>${ result["TRANSFER_AVG"] }${ ' s' }<td></td></tr>`);
    }
    if ("TRANSFER_IDEAL" in result){
        // document.getElementById("local_result").innerHTML += "Ideal Transfer Time: " + result["TRANSFER_IDEAL"] + "s<br>";
        $(localResultId).append(`<tr><td>${ 'Ideal Transfer Time' }</td>${ result["TRANSFER_IDEAL"] }${ ' s' }<td></td></tr>`);
    }
    if ("TCP_TTR" in result){
        // document.getElementById("local_result").innerHTML += "TCP TTR: " + result["TCP_TTR"] + "<br>";
        $(localResultId).append(`<tr><td>${ 'TCP TTR' }</td>${ result["TCP_TTR"] }${ '' }<td></td></tr>`);
    }
    if ("TRANS_BYTES" in result){
        // document.getElementById("local_result").innerHTML += "Transmitted Bytes: " + result["TRANS_BYTES"] + "Bytes<br>";
        $(localResultId).append(`<tr><td>${ 'Transmitted Bytes' }</td>${ result["TRANS_BYTES"] }${ ' Bytes' }<td></td></tr>`);
    }
    if ("RETX_BYTES" in result){
        // document.getElementById("local_result").innerHTML += "Reransmitted Bytes: " + result["RETX_BYTES"] + "Bytes<br>";
        $(localResultId).append(`<tr><td>${ 'Reransmitted Bytes' }</td>${ result["RETX_BYTES"] }${ ' Bytes' }<td></td></tr>`);
    }
    if ("TCP_EFF" in result){
        // document.getElementById("local_result").innerHTML += "TCP Efficiency: " + result["TCP_EFF"] + "<br>";
        $(localResultId).append(`<tr><td>${ 'TCP Efficiency' }</td>${ result["TCP_EFF"] }${ '' }<td></td></tr>`);
    }
    if ("AVE_RTT" in result){
        // document.getElementById("local_result").innerHTML += "Average RTT: " + result["AVE_RTT"] + "ms<br>";
        $(localResultId).append(`<tr><td>${ 'Average RTT' }</td>${ result["AVE_RTT"] }${ ' ms' }<td></td></tr>`);
    }
    if ("BUF_DELAY" in result){
        // document.getElementById("local_result").innerHTML += "Buffer Delay: " + result["BUF_DELAY"] + "%<br>";
        $(localResultId).append(`<tr><td>${ 'Buffer Delay' }</td>${ result["BUF_DELAY"] }${ '%' }<td></td></tr>`);
    }
}

eel.expose(printreverse);
function printreverse(result){
    console.log(result);
    //document.getElementById("local_result").value += result + "\n";

    if ("MTU" in result){
        document.getElementById("remote_result").innerHTML += "MTU: " + result["MTU"] + "Bytes <br>";
    }
    if ("RTT" in result){
        document.getElementById("remote_result").innerHTML += "RTT: " + result["RTT"] + "ms<br>";
    }
    if ("BB" in result){
        document.getElementById("remote_result").innerHTML += "BB: " + result["BB"] + "Mbps<br>";
    }
    if ("BDP" in result){
        document.getElementById("remote_result").innerHTML += "BDP: " + result["BDP"] + "<br>";
    }
    if ("RWND" in result){
        document.getElementById("remote_result").innerHTML += "TCP RWND: " + result["RWND"] + "<br>";
    }
    if ("THPT_AVG" in result){
        document.getElementById("remote_result").innerHTML += "Average TCP Throughput: " + result["THPT_AVG"] + "Mbps<br>";
    }
    if ("THPT_IDEAL" in result){
        document.getElementById("remote_result").innerHTML += "Ideal TCP Throughput: " + result["THPT_IDEAL"] + "Mbps<br>";
    }
    if ("TRANSFER_AVG" in result){
        document.getElementById("remote_result").innerHTML += "Average Transfer Time: " + result["TRANSFER_AVG"] + "s<br>";
    }
    if ("TRANSFER_IDEAL" in result){
        document.getElementById("remote_result").innerHTML += "Ideal Transfer Time: " + result["TRANSFER_IDEAL"] + "s<br>";
    }
    if ("TCP_TTR" in result){
        document.getElementById("remote_result").innerHTML += "TCP TTR: " + result["TCP_TTR"] + "<br>";
    }
    if ("TRANS_BYTES" in result){
        document.getElementById("remote_result").innerHTML += "Transmitted Bytes: " + result["TRANS_BYTES"] + "Bytes<br>";
    }
    if ("RETX_BYTES" in result){
        document.getElementById("remote_result").innerHTML += "Reransmitted Bytes: " + result["RETX_BYTES"] + "Bytes<br>";
    }
    if ("TCP_EFF" in result){
        document.getElementById("remote_result").innerHTML += "TCP Efficiency: " + result["TCP_EFF"] + "<br>";
    }
    if ("AVE_RTT" in result){
        document.getElementById("remote_result").innerHTML += "Average RTT: " + result["AVE_RTT"] + "ms<br>";
    }
    if ("BUF_DELAY" in result){
        document.getElementById("remote_result").innerHTML += "Buffer Delay: " + result["BUF_DELAY"] + "%<br>";
    }
}

eel.expose(printprogress);
function printprogress(state){
    document.getElementById("progress").innerHTML = state;
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