eel.expose(printreverse);
function printreverse(result){
    disableMainForm(false);
    $('#btnSaveAsPdf').attr('disabled', false);

    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    // alert('printreverse');
    //document.getElementById("remote_result").value += result + "\n";
    remoteResultId = '#tblRemoteResult tbody';
    $(remoteResultId).empty();


    $('#results-info').show();
    $('#error-info').hide();

    if (result) {
        var reverseResult = result[0][0];
        reverseResult["CIR"] = $('#cir').val();
        console.log(reverseResult);
        $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'CIR' }</b></td><td>${ reverseResult["CIR"] }${ ' Mbps' }</td></tr>`);

        if ("MTU" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td>${ reverseResult["MTU"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RTT" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td>${ numeral(reverseResult["RTT"]).format('0,0.000') }${ ' ms' }</td></tr>`);
        }
        if ("RWND" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td>${ reverseResult["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        }
        if ("THPT_AVG" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_AVG"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        }
        if ("THPT_IDEAL" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_IDEAL"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        }
        if ("TRANSFER_AVG" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_AVG"]).format('0,0.000') }${ ' s' }</td></tr>`);
        }
        if ("TRANSFER_IDEAL" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_IDEAL"]).format('0,0.000') }${ ' s' }</td></tr>`);
        }
        if ("TCP_TTR" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td>${ numeral(reverseResult["TCP_TTR"]).format('0.000%') }${ '' }</td></tr>`);
        }
        if ("TRANS_BYTES" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td>${ reverseResult["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("RETX_BYTES" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td>${ reverseResult["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        }
        if ("TCP_EFF" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td>${ numeral(reverseResult["TCP_EFF"]).format('0.000%') }${ '' }</td></tr>`);
        }
        if ("AVE_RTT" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td>${ numeral(reverseResult["AVE_RTT"]).format('0.000') }${ ' ms' }</td></tr>`);
        }
        if ("BUF_DELAY" in reverseResult){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td>${ numeral(reverseResult["BUF_DELAY"]).format('0.000%') }${ '' }</td></tr>`);
        }
    } else {
        $(remoteResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    remoteWindowScanId = "#tblRemoteWindowStats tbody";
    var windowSizes = reverseResult["WND_SIZES"];
    var windowAverageThroughputs = reverseResult["WND_AVG_TCP"];
    var windowIdealThroughputs = reverseResult["WND_IDEAL_TCP"];
    var windowTcpEfficiencies = [null, null, null] // SPEED PLOT???
    // var windowAverageRtt = reverseResult["BUF_PLOT"];
    // var windowAverageRtt = reverseResult["BUF_PLOT"];
    $(remoteWindowScanId).empty();
    for (i = 0; i < 5; i++) {
        $(`${remoteWindowScanId}`).append('<tr><td class="text-secondary"></td></tr>');
    }

    $(remoteWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    $(remoteWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    $(remoteWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    $(remoteWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    $(remoteWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    if (windowSizes && windowSizes.length > 0) {
        for (var i = 0; i < windowSizes.length; i++) {
            $(remoteWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 }</td>`);
            $(remoteWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ windowSizes[i] } Bytes</td>`);
            $(remoteWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ windowAverageThroughputs.length > i && windowAverageThroughputs[i] ? numeral(windowAverageThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(remoteWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ windowIdealThroughputs.length > i && windowIdealThroughputs[i] ? numeral(windowIdealThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(remoteWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ windowTcpEfficiencies.length > i && windowTcpEfficiencies[i] ? numeral(windowTcpEfficiencies[i]).format('0.[000]%') : "---" } </td>`);
            // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowAverageRtt.length > i ? numeral(windowAverageRtt[i]).format('0.000') : "---" } ms</td>`);
        }
    }
    // else {
    //     $(remoteWindowScanId).append(`<tr><td><span class="text-muted">${ 'No measured window scan' }<span></td></tr>`);
    // }

    $(remoteWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ 'THPT' }</td>`);
    $(remoteWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ reverseResult["ACTUAL_RWND"] == null ? "---" : numeral(reverseResult["ACTUAL_RWND"]).format('0') } Bytes</td>`);
    $(remoteWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ reverseResult["THPT_AVG"] == null ? "---" : numeral(reverseResult["THPT_AVG"]).format('0.000') } Mbps</td>`);
    $(remoteWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ reverseResult["THPT_IDEAL"] == null ? "---" : numeral(reverseResult["THPT_IDEAL"]).format('0.000') } Mbps</td>`);
    $(remoteWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ reverseResult["TCP_EFF"] == null ? "---" : numeral(reverseResult["TCP_EFF"]).format('0.[000]%') } </td>`);

    reverseTestResults = [];
    reverseTestResults = reverseResult;
    
    renderRemoteWindowScanGraph(reverseResult);
    renderRemoteThroughputEfficiencyGraph(reverseResult);

    Promise.all(chartPromises).then(() => {
        $('#btnSaveAsPdf').attr('disabled', false);
    })
    // renderRemoteThroughputRTTGraph(result);
}


function renderRemoteWindowScanGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var idealThroughputs = [];
    
    var windowSizes = result['WND_SIZES'];
    if (windowSizes) {
        for (var i = 0; i < windowSizes.length; i++) {
            steps.push(`Step ${ i + 1 }`);
            averageThroughputs.push(result['WND_AVG_TCP'][i]);
            idealThroughputs.push(result['WND_IDEAL_TCP'][i]);
        }
        steps.push('THPT');
        averageThroughputs.push(result['THPT_AVG']);
        idealThroughputs.push(result['THPT_IDEAL']); // should be ACTUAL_IDEAL
    }

    // for (var i = 0; i < 2; i++) {
    //     steps.push('');
    //     averageThroughputs.push(0);
    //     idealThroughputs.push(0);
    // }

    console.log(steps);
    console.log(averageThroughputs);
    console.log(idealThroughputs);

    var options = {
        chart: {
            id: 'windowsScanRemoteToLocalChart',
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
                    y: result["THPT_IDEAL"],
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
                        text: `Max THPT: ${ numeral(result["THPT_IDEAL"]).format('0.000') } Mbps`
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

    var chart = new ApexCharts(document.querySelector('#windowScanReverseChart'), options);
    chartPromises.push(new Promise(function(resolve, reject) {
        chart.render().then(() => {
            setTimeout(function () {
                chart.dataURI().then(({ imgURI, blob }) => {
                    windowsScanRemoteToLocalChart = imgURI;
                });
            }, 3000);
            resolve("done");
        });
    }));
}

function renderRemoteThroughputEfficiencyGraph(result) {
    var steps = [];
    var averageThroughputs = [];
    var efficiencies = [];
    
    var windowSizes = result['WND_SIZES'];
    if (windowSizes) {
        for (var i = 0; i < windowSizes.length; i++) {
            steps.push(`Step ${ i + 1 }`);
            averageThroughputs.push(result['WND_AVG_TCP'][i]);
            efficiencies.push(null); // should be EFF_PLOT
        }
        steps.push('THPT');
        averageThroughputs.push(result['THPT_AVG']);
        efficiencies.push(result['TCP_EFF']);
    }

    console.log(steps);
    console.log(averageThroughputs);
    console.log(efficiencies);

    var options = {
        chart: {
            id: 'throughputEfficiencyRemoteToLocalChart',
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

    var chart = new ApexCharts(document.querySelector('#throughputEfficiencyReverseChart'), options);
    chartPromises.push(new Promise(function(resolve, reject) {
        chart.render().then(() => {
            setTimeout(function () {
                chart.dataURI().then(({ imgURI, blob }) => {
                    throughputEfficiencyRemoteToLocalChart = imgURI;
                });
                resolve("done");
            }, 3000);
        });
    }));
}
