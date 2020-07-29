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
        // console.log(result);
        var reverseResult = result;
        reverseResult["CIR"] = $('#cir').val();
        // console.log(reverseResult);
        $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'CIR' }</b></td><td>${ reverseResult["CIR"] }${ ' Mbps' }</td></tr>`);

        if ("MTU" in reverseResult && (reverseResult["MTU"] || reverseResult["MTU"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'MTU' }</b></td><td>${ reverseResult["MTU"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("RTT" in reverseResult && (reverseResult["RTT"] || reverseResult["RTT"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'RTT' }</b></td><td>${ numeral(reverseResult["RTT"]).format('0,0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }
        
        if ("RWND" in reverseResult && (reverseResult["RWND"] || reverseResult["RWND"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'TCP RWND' }</b></td><td>${ reverseResult["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("THPT_AVG" in reverseResult && (reverseResult["THPT_AVG"] || reverseResult["THPT_AVG"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Average TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_AVG"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("THPT_IDEAL" in reverseResult && (reverseResult["THPT_IDEAL"] || reverseResult["THPT_IDEAL"] === 0)){
            reverseResult["THPT_IDEAL"] /= 1.2;
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Ideal TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_IDEAL"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("TRANSFER_AVG" in reverseResult && (reverseResult["TRANSFER_AVG"] || reverseResult["TRANSFER_AVG"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Average Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_AVG"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("TRANSFER_IDEAL" in reverseResult && (reverseResult["TRANSFER_IDEAL"] || reverseResult["TRANSFER_IDEAL"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Ideal Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_IDEAL"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("TCP_TTR" in reverseResult && (reverseResult["TCP_TTR"] || reverseResult["TCP_TTR"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'TCP TTR' }</b></td><td>${ numeral(reverseResult["TCP_TTR"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("TRANS_BYTES" in reverseResult && (reverseResult["TRANS_BYTES"] || reverseResult["TRANS_BYTES"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Transmitted Bytes' }</b></td><td>${ reverseResult["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("RETX_BYTES" in reverseResult && (reverseResult["RETX_BYTES"] || reverseResult["RETX_BYTES"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Retransmitted Bytes' }</b></td><td>${ reverseResult["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("TCP_EFF" in reverseResult && (reverseResult["TCP_EFF"] || reverseResult["TCP_EFF"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'TCP Efficiency' }</b></td><td>${ numeral(reverseResult["TCP_EFF"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("AVE_RTT" in reverseResult && (reverseResult["AVE_RTT"] || reverseResult["AVE_RTT"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Average RTT' }</b></td><td>${ numeral(reverseResult["AVE_RTT"]).format('0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }

        if ("BUF_DELAY" in reverseResult && (reverseResult["BUF_DELAY"] || reverseResult["BUF_DELAY"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-info"><b>${ 'Buffer Delay' }</b></td><td>${ numeral(reverseResult["BUF_DELAY"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td><span class="text-muted"><i>(no result)</i></span></td></tr>`);
        }
    } else {
        $(remoteResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    var remoteWindowScanId = "#tblRemoteWindowStats tbody";
    
    var windowSizes = reverseResult["WND_SIZES"];
    var windowAverageThroughputs = reverseResult["WND_AVG_TCP"];
    var windowIdealThroughputs = reverseResult["WND_IDEAL_TCP"];
    var windowTcpEfficiencies = reverseResult["WND_TCP_EFF"];
    // var windowBufferDelays = reverseResult["WND_BUF_DEL"];

    // var stepsCount = windowSizes.length;
    // var windowScanRows = {
    //     'Steps': {
    //         'value': [...Array(stepsCount).keys()],
    //         'format': '0',
    //         'unit': null
    //     },
    //     'Window Size': {
    //         'value': windowSizes.concat(reverseResult["ACTUAL_RWND"]),
    //         'format': '0',
    //         'unit': 'Bytes'
    //     },
    //     'Average TCP Throughput': {
    //         'value': windowAverageThroughputs.concat(reverseResult["THPT_AVG"]),
    //         'format': '0.000',
    //         'unit': 'Mbps'
    //     },
    //     'Ideal TCP Throughput': {
    //         'value': windowIdealThroughputs.concat(reverseResult["THPT_IDEAL"]),
    //         'format': '0.000',
    //         'unit': 'Mbps'
    //     },
    //     'TCP Efficiency': {
    //         'value': windowTcpEfficiencies.concat(reverseResult["TCP_EFF"]),
    //         'format': '0.[000]%',
    //         'unit': null
    //     },
    //     'Buffer Delay': {
    //         'value': windowBufferDelays.concat(reverseResult["BUF_DELAY"]),
    //         'format': '0.[000]%',
    //         'unit': null
    //     },
    // };

    // var rowParams = Object.keys(windowScanRows);

    $(remoteWindowScanId).empty();
    for (var i = 0; i < 5; i++) {
        $(`${remoteWindowScanId}`).append('<tr><td class="text-secondary"></td></tr>');
    }

    // for (var r = 0; r < rowParams.length; r++) {
    //     var param = rowParams[r];
    //     $(remoteWindowScanId).find('tr').eq(r).find('td').eq(0).html(`<b>${ param }</b>`);

    //     var values = windowScanRows[param].values;
    //     var format = windowScanRows[param].format;
    //     var unit = windowScanRows[param].unit;


    //     if (values) {
    //         for (var c = 0; c < stepsCount; c++) {
    //             var displayValue = [(values.length > c && values[c] ? numeral(values[c]).format(format) : '---'), unit].join(' ');
    //             if (param == 'Steps' && c + 1 == stepsCount) {
    //                 displayValue = 'THPT';
    //             }
    //             console.log(`r: ${r}\nc: ${c}\n`);
    //             $(remoteWindowScanId).find('tr').eq(r).find('td').eq(c).after(`<td>${ displayValue }</td>`);
    //         }
    //     }
    // }

    $(remoteWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    $(remoteWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    $(remoteWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    $(remoteWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    $(remoteWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(0).html(`<b>Buffer Delay</b>`);
    if (windowSizes && windowSizes.length > 0) {
        for (var i = 0; i < windowSizes.length; i++) {
            $(remoteWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 }</td>`);
            $(remoteWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ windowSizes[i] } Bytes</td>`);
            $(remoteWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ windowAverageThroughputs.length > i && windowAverageThroughputs[i] ? numeral(windowAverageThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(remoteWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ windowIdealThroughputs.length > i && windowIdealThroughputs[i] ? numeral(windowIdealThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
            $(remoteWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ windowTcpEfficiencies.length > i && windowTcpEfficiencies[i] ? numeral(windowTcpEfficiencies[i]).format('0.[000]%') : "---" } </td>`);
            // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowBufferDelays.length > i && windowBufferDelays[i] ? numeral(windowBufferDelays[i]).format('0.[000]%') : "---" } </td>`);
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
    $(remoteWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ reverseResult["BUF_DELAY"] == null ? "---" : numeral(reverseResult["BUF_DELAY"]).format('0.[000]%') } </td>`);

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

    // console.log(steps);
    // console.log(averageThroughputs);
    // console.log(idealThroughputs);

    var options = {
        chart: {
            id: 'windowsScanRemoteToLocalChart',
            type: 'bar',
            width: '100%',
            height: 360,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false,
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
            efficiencies.push(result['WND_TCP_EFF'][i]); // should be EFF_PLOT
        }
        steps.push('THPT');
        averageThroughputs.push(result['THPT_AVG']);
        efficiencies.push(result['TCP_EFF']);
    }

    // console.log(steps);
    // console.log(averageThroughputs);
    // console.log(efficiencies);

    var options = {
        chart: {
            id: 'throughputEfficiencyRemoteToLocalChart',
            type: 'line',
            width: '100%',
            height: 360,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false,
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


$(function () {
    $('#cir').val(10);
    printreverse(reverseTestResults);
});