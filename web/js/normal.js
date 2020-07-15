eel.expose(printnormal);
function printnormal(result){
    disableMainForm(false);
    $('#btnSaveAsPdf').attr('disabled', false);

    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    // alert('printnormal');
    //document.getElementById("local_result").value += result + "\n";
    localResultId = '#tblLocalResult tbody';
    $(localResultId).empty();

    $('#results-info').show();
    $('#error-info').hide();

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
        if ("ACTUAL_IDEAL" in result){
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
    var windowBufferDelays = result["BUF_PLOT"];
    $(localWindowScanId).empty();
    for (i = 0; i < 6; i++) {
        $(`${localWindowScanId}`).append('<tr><td class="text-secondary"></td></tr>');
    }

    $(localWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    $(localWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    $(localWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    $(localWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    $(localWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    $(localWindowScanId).find('tr').eq(5).find('td').eq(0).html(`<b>Buffer Delay</b>`);
    if (windowSizes && windowSizes.length > 0) {
        for (var i = 0; i < windowSizes.length; i++) {
            $(localWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 }</td>`);
            $(localWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ windowSizes[i] } Bytes</td>`);
            $(localWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ windowAverageThroughputs.length > i ? numeral(windowAverageThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(localWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ windowIdealThroughputs.length > i ? numeral( windowIdealThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(localWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ windowTcpEfficiencies.length > i ? numeral(windowTcpEfficiencies[i]).format('0.[000]%') : "---" } </td>`);
            $(localWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowBufferDelays.length > i ? numeral(windowBufferDelays[i]).format('0.000') : "---" } ms</td>`);
        }
    }
    $(localWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ 'THPT' }</td>`);
    $(localWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ result["ACTUAL_RWND"] == null ? "---" : numeral(result["ACTUAL_RWND"]).format('0') } Bytes</td>`);
    $(localWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ result["THPT_AVG"] == null ? "---" : numeral(result["THPT_AVG"]).format('0.000') } Mbps</td>`);
    $(localWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ result["ACTUAL_IDEAL"] == null ? "---" : numeral(result["ACTUAL_IDEAL"]).format('0.000') } Mbps</td>`);
    $(localWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ result["TCP_EFF"] == null ? "---" : numeral(result["TCP_EFF"]).format('0.[000]%') } </td>`);
    $(localWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ result["BUF_DELAY"] == null ? "---" : numeral(result["BUF_DELAY"]).format('0.[000]%') } </td>`);

    normalTestResults = [];
    normalTestResults = result;
    
    renderLocalWindowScanGraph(result);
    renderLocalThroughputEfficiencyGraph(result);

    Promise.all(chartPromises).then(() => {
        $('#btnSaveAsPdf').attr('disabled', false);
    })
    // renderLocalThroughputRTTGraph(result);
}


function renderLocalWindowScanGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var idealThroughputs = [];
    
    var windowSizes = result['WND_SIZES'];
    for (var i = 0; i < windowSizes.length; i++) {
        steps.push(`Step ${ i + 1 }`);
        averageThroughputs.push(result['WND_AVG_TCP'][i]);
        idealThroughputs.push(result['WND_ACTUAL_IDEAL'][i]);
    }
    steps.push('THPT');
    averageThroughputs.push(result['THPT_AVG']);
    idealThroughputs.push(result['ACTUAL_IDEAL']);

    // console.log(steps);
    // console.log(averageThroughputs);
    // console.log(idealThroughputs);

    var options = {
        chart: {
            id: 'windowsScanLocalToRemoteChart',
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
    chartPromises.push(new Promise(function(resolve, reject) {
        chart.render().then(() => {
            setTimeout(function () {
                chart.dataURI().then(({ imgURI, blob }) => {
                    windowsScanLocalToRemoteChart = imgURI;
                });
            }, 3000);
            resolve("done");
        });
    }));
}

function renderLocalThroughputEfficiencyGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var efficiencies = [];
    
    var windowSizes = result['WND_SIZES'];
    for (var i = 0; i < windowSizes.length; i++) {
        steps.push(`Step ${ i + 1 }`);
        averageThroughputs.push(result['WND_AVG_TCP'][i]);
        efficiencies.push(result['EFF_PLOT'][i]);
    }
    steps.push('THPT');
    averageThroughputs.push(result['THPT_AVG']);
    efficiencies.push(result['TCP_EFF']);

    // console.log(steps);
    // console.log(averageThroughputs);
    // console.log(efficiencies);

    var options = {
        chart: {
            id: 'throughputEfficiencyLocalToRemoteChart',
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
    chartPromises.push(new Promise(function(resolve, reject) {
        chart.render().then(() => {
            setTimeout(function () {
                chart.dataURI().then(({ imgURI, blob }) => {
                    throughputEfficiencyLocalToRemoteChart = imgURI;
                });
                resolve("done");
            }, 3000);
        });
    }));
}
