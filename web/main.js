eel.expose(alert_debug);
function alert_debug(message){
    alert(message);
}

eel.expose(progress_now);
function progress_now(value){
    //document.getElementById("prog_bar").attr('aria-valuenow', value).css("width", percent);
    $("#dynamic").css("width", value + "%").attr("aria-valuenow", value);
}

eel.expose(cancel);
function cancel(){
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
    document.getElementById('login').style.display='none';
}


function user_login(){
    var username = document.getElementById("uname").value;
    var password = document.getElementById("psw").value;

    eel.login(username,password); 
}

function normal_mode(){
    var lat = document.getElementById("lat").value
    var lon = document.getElementById("lon").value
    var cir = document.getElementById("cir").value
    var server_ip = document.getElementById("server").value

    document.getElementById("local_result").innerHTML = "";
    document.getElementById("remote_result").innerHTML = "";

    document.getElementById("tab0Content").innerHTML = "";
    document.getElementById("tab1Content").innerHTML = "";
    document.getElementById("tab2Content").innerHTML = "";
    document.getElementById("tab3Content").innerHTML = "";

    document.getElementById("rtab0Content").innerHTML = "";
    document.getElementById("rtab1Content").innerHTML = "";
    document.getElementById("rtab2Content").innerHTML = "";
    document.getElementById("rtab3Content").innerHTML = "";

    if(lat != "" && lon != ""){
        eel.normal(lat, lon, cir, server_ip);
        var cancel = document.getElementById("cancel");
        cancel.style.display = "block";
    }

    else{
        alert("Latitude and Longitude must be filled out");
    }
	
}

function reverse_mode(){
    var lat = document.getElementById("lat").value
    var lon = document.getElementById("lon").value
    var cir = document.getElementById("cir").value
    var server_ip = document.getElementById("server").value

    document.getElementById("local_result").innerHTML = "";
    document.getElementById("remote_result").innerHTML = "";

    document.getElementById("tab0Content").innerHTML = "";
    document.getElementById("tab1Content").innerHTML = "";
    document.getElementById("tab2Content").innerHTML = "";
    document.getElementById("tab3Content").innerHTML = "";

    document.getElementById("rtab0Content").innerHTML = "";
    document.getElementById("rtab1Content").innerHTML = "";
    document.getElementById("rtab2Content").innerHTML = "";
    document.getElementById("rtab3Content").innerHTML = "";

    if(lat != "" && lon != ""){
        eel.rev(lat, lon);
    }

    else{
        alert("Latitude and Longitude must be filled out");
    }
}

function bidirectional(){
    var lat = document.getElementById("lat").value
    var lon = document.getElementById("lon").value
    var cir = document.getElementById("cir").value
    var server_ip = document.getElementById("server").value

    document.getElementById("local_result").innerHTML = "";
    document.getElementById("remote_result").innerHTML = "";

    document.getElementById("tab0Content").innerHTML = "";
    document.getElementById("tab1Content").innerHTML = "";
    document.getElementById("tab2Content").innerHTML = "";
    document.getElementById("tab3Content").innerHTML = "";

    document.getElementById("rtab0Content").innerHTML = "";
    document.getElementById("rtab1Content").innerHTML = "";
    document.getElementById("rtab2Content").innerHTML = "";
    document.getElementById("rtab3Content").innerHTML = "";

    if(lat != "" && lon != ""){
        eel.bi(lat, lon);
    }

    else{
        alert("Latitude and Longitude must be filled out");
    }
}

function simultaneous(){
    var lat = document.getElementById("lat").value
    var lon = document.getElementById("lon").value
    var cir = document.getElementById("cir").value
    var server_ip = document.getElementById("server").value

    document.getElementById("local_result").innerHTML = "";
    document.getElementById("remote_result").innerHTML = "";

    document.getElementById("tab0Content").innerHTML = "";
    document.getElementById("tab1Content").innerHTML = "";
    document.getElementById("tab2Content").innerHTML = "";
    document.getElementById("tab3Content").innerHTML = "";

    document.getElementById("rtab0Content").innerHTML = "";
    document.getElementById("rtab1Content").innerHTML = "";
    document.getElementById("rtab2Content").innerHTML = "";
    document.getElementById("rtab3Content").innerHTML = "";

    if(lat != "" && lon != ""){
        eel.sim(lat, lon);
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
        var svg = d3.select("#rtab1Content")
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
        var svg = d3.select("#rtab2Content")
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
        var svg = d3.select("#rtab3Content")
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

    var svg = d3.select("#tab0Content")
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

    var svg = d3.select("#rtab0Content")
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
    document.getElementById('tab0Content').style.display="none";
    document.getElementById('tab1Content').style.display="none";
    document.getElementById('tab2Content').style.display="none";
    document.getElementById('tab3Content').style.display="none";

    document.getElementById('tab' + tabIndex +'Content').style.display="block";
}

function rselectTab(tabIndex){
    document.getElementById('rtab0Content').style.display="none";
    document.getElementById('rtab1Content').style.display="none";
    document.getElementById('rtab2Content').style.display="none";
    document.getElementById('rtab3Content').style.display="none";

    document.getElementById('rtab' + tabIndex +'Content').style.display="block";
}

eel.expose(printlocal);
function printlocal(result){
	console.log(result);
	//document.getElementById("local_result").value += result + "\n";
    document.getElementById("local_result").innerHTML += result + "<br>";
}

eel.expose(printremote);
function printremote(result){
	console.log(result);
	document.getElementById("remote_result").innerHTML += result + "<br>";
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