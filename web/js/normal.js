eel.expose(printnormal);
function printnormal(result){
    disableMainForm(false);
    $('#btnSaveAsPdf').attr('disabled', false);

    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    test_latitude = $('#lat').val();
    test_longitude = $('#lon').val();

    // alert('printnormal');
    //document.getElementById("local_result").value += result + "\n";
    localResultId = '#tblLocalResult tbody';
    $(localResultId).empty();

    $('#results-info').show();
    $('#error-info').hide();

    if (result) {
        var normalResult = result;
        normalResult["CIR"] = $('#cir').val();

        $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'CIR' }</b></td><td>${ normalResult["CIR"] }${ ' Mbps' }</td></tr>`);

        if ("MTU" in normalResult && (normalResult["MTU"] || normalResult["MTU"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td>${ normalResult["MTU"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("RTT" in normalResult && (normalResult["RTT"] || normalResult["RTT"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td>${ numeral(normalResult["RTT"]).format('0,0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }
        
        if ("RWND" in normalResult && (normalResult["RWND"] || normalResult["RWND"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td>${ normalResult["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("THPT_AVG" in normalResult && (normalResult["THPT_AVG"] || normalResult["THPT_AVG"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td>${ numeral(normalResult["THPT_AVG"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("ACTUAL_IDEAL" in normalResult && (normalResult["ACTUAL_IDEAL"] || normalResult["ACTUAL_IDEAL"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td>${ numeral(result["ACTUAL_IDEAL"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANSFER_AVG" in normalResult && (normalResult["TRANSFER_AVG"] || normalResult["TRANSFER_AVG"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td>${ numeral(normalResult["TRANSFER_AVG"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANSFER_IDEAL" in normalResult && (normalResult["TRANSFER_IDEAL"] || normalResult["TRANSFER_IDEAL"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td>${ numeral(normalResult["TRANSFER_IDEAL"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TCP_TTR" in normalResult && (normalResult["TCP_TTR"] || normalResult["TCP_TTR"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td>${ numeral(normalResult["TCP_TTR"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANS_BYTES" in normalResult && (normalResult["TRANS_BYTES"] || normalResult["TRANS_BYTES"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td>${ normalResult["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("RETX_BYTES" in normalResult && (normalResult["RETX_BYTES"] || normalResult["RETX_BYTES"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td>${ normalResult["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TCP_EFF" in normalResult && (normalResult["TCP_EFF"] || normalResult["TCP_EFF"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td>${ numeral(normalResult["TCP_EFF"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("AVE_RTT" in normalResult && (normalResult["AVE_RTT"] || normalResult["AVE_RTT"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td>${ numeral(normalResult["AVE_RTT"]).format('0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("BUF_DELAY" in normalResult && (normalResult["BUF_DELAY"] || normalResult["BUF_DELAY"] === 0)){
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td>${ numeral(normalResult["BUF_DELAY"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(localResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }
    } else {
        $(localResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    var localWindowScanId = "#tblLocalWindowStats tbody";

    var windowSizes = result["WND_SIZES"] ?? [];
    var windowAverageThroughputs = result["WND_AVG_TCP"] ?? [];
    var windowIdealThroughputs = result["WND_ACTUAL_IDEAL"] ?? [];
    var windowTcpEfficiencies = result["EFF_PLOT"] ?? [];
    // var windowBufferDelays = result["BUF_PLOT"];

    var stepsCount = Math.max(windowSizes?.length ?? 0, windowAverageThroughputs?.length ?? 0, windowIdealThroughputs?.length ?? 0, windowTcpEfficiencies?.length ?? 0) + 1;
    var steps = [];
    for (var i = 0; i < stepsCount; i++) {
        steps.push(i + 1);
    }
    var windowScanRows = {
        'Steps': {
            'value': steps,
            'format': '0',
            'unit': null
        },
        'Window Size': {
            'value': windowSizes.concat(normalResult["ACTUAL_RWND"]),
            'format': '0',
            'unit': 'Bytes'
        },
        'Average TCP Throughput': {
            'value': windowAverageThroughputs.concat(normalResult["THPT_AVG"]),
            'format': '0.000',
            'unit': 'Mbps'
        },
        'Ideal TCP Throughput': {
            'value': windowIdealThroughputs.concat(normalResult["ACTUAL_IDEAL"]),
            'format': '0.000',
            'unit': 'Mbps'
        },
        'TCP Efficiency': {
            'value': windowTcpEfficiencies.concat(normalResult["TCP_EFF"]),
            'format': '0.[000]%',
            'unit': null
        },
    };

    $(localWindowScanId).empty();

    var rowParams = Object.keys(windowScanRows);
    for (i = 0; i < rowParams.length; i++) {
        $(`${localWindowScanId}`).append('<tr><td class="text-secondary"></td></tr>');
    }

    for (var r = 0; r < rowParams.length; r++) {
        var param = rowParams[r];
        $(localWindowScanId).find('tr').eq(r).find('td').eq(0).html(`<b>${ param }</b>`);

        var value = windowScanRows[param].value;
        var format = windowScanRows[param].format;
        var unit = windowScanRows[param].unit;

        console.log(value);
        if (value) {
            for (var c = 0; c < stepsCount; c++) {
                var displayValue = null;
                if ((value.length > c && (value[c] || value[c] === 0))) {
                    displayValue = [numeral(value[c]).format(format), unit].join(' ');
                } else {
                    displayValue = "<i class='text-muted'>-no result-</i>"
                }

                if (param == 'Steps' && c + 1 == stepsCount) {
                    displayValue = 'THPT';
                }

                console.log(`r: ${r}\nc: ${c}\ndisplayValue: ${displayValue}`);
                $(localWindowScanId).find('tr').eq(r).find('td').eq(c).after(`<td>${ displayValue }</td>`);
            }
        }
    }

    // $(localWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    // $(localWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    // $(localWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    // $(localWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    // $(localWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    // // $(localWindowScanId).find('tr').eq(5).find('td').eq(0).html(`<b>Buffer Delay</b>`);
    // if (windowSizes && windowSizes.length > 0) {
    //     for (var i = 0; i < windowSizes.length; i++) {
    //         $(localWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 }</td>`);
    //         $(localWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ windowSizes[i] } Bytes</td>`);
    //         $(localWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ windowAverageThroughputs.length > i ? numeral(windowAverageThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
    //         $(localWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ windowIdealThroughputs.length > i ? numeral( windowIdealThroughputs[i]).format('0.000') : "---" } Mbps</td>`);
    //         $(localWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ windowTcpEfficiencies.length > i ? numeral(windowTcpEfficiencies[i]).format('0.[000]%') : "---" } </td>`);
    //         // $(localWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowBufferDelays.length > i ? numeral(windowBufferDelays[i]).format('0.000') : "---" } ms</td>`);
    //     }
    // }
    // $(localWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ 'THPT' }</td>`);
    // $(localWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ result["ACTUAL_RWND"] == null ? "---" : numeral(result["ACTUAL_RWND"]).format('0') } Bytes</td>`);
    // $(localWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ result["THPT_AVG"] == null ? "---" : numeral(result["THPT_AVG"]).format('0.000') } Mbps</td>`);
    // $(localWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ result["ACTUAL_IDEAL"] == null ? "---" : numeral(result["ACTUAL_IDEAL"]).format('0.000') } Mbps</td>`);
    // $(localWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ result["TCP_EFF"] == null ? "---" : numeral(result["TCP_EFF"]).format('0.[000]%') } </td>`);
    // // $(localWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ result["BUF_DELAY"] == null ? "---" : numeral(result["BUF_DELAY"]).format('0.[000]%') } </td>`);

    normalTestResults = [];
    normalTestResults = normalResult;
    
    renderLocalWindowScanGraph(stepsCount, normalResult);
    renderLocalThroughputEfficiencyGraph(stepsCount, normalResult);

    Promise.all(chartPromises).then(() => {
        $('#btnSaveAsPdf').attr('disabled', false);
    })
    // renderLocalThroughputRTTGraph(result);
}


function renderLocalWindowScanGraph(stepsCount, result) {
    var steps = [];
    var averageThroughputs = [];
    var idealThroughputs = [];
    
    for (var i = 0; i < stepsCount - 1; i++) {
        steps.push(`Step ${ i + 1 }`);

        if ('WND_AVG_TCP' in result && result['WND_AVG_TCP'] && result['WND_AVG_TCP'].length > i) {
            averageThroughputs.push(result['WND_AVG_TCP'][i]);
        } else {
            averageThroughputs.push(null);
        }

        if ('WND_IDEAL_TCP' in result && result['WND_IDEAL_TCP'] && result['WND_IDEAL_TCP'].length > i) {
            idealThroughputs.push(result['WND_IDEAL_TCP'][i]);
        } else {
            idealThroughputs.push(null);
        }
    }

    var cir = result['CIR'];
    var throughputIdeal = result['ACTUAL_IDEAL'];

    steps.push('THPT');
    averageThroughputs.push(result['THPT_AVG']);
    idealThroughputs.push(throughputIdeal);
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
                    y: cir,
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
                        text: `CIR: ${ numeral(cir).format('0.000') } Mbps`
                    }
                },
                {
                    y: throughputIdeal,
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
                        text: throughputIdeal ? `Max THPT: ${ numeral(result["ACTUAL_IDEAL"]).format('0.000') } Mbps` : null
                    }
                }
            ]
        },
        tooltip: {
            shared: true,
            y: {
                formatter: function(value, { series, seriesIndex, dataPointIndex, w }) {
                    return `\t${numeral(value).format('0.[000]')} Mbps`;
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

function renderLocalThroughputEfficiencyGraph(stepsCount, result) {
    var steps = [];
    var averageThroughputs = [];
    var efficiencies = [];
    
    for (var i = 0; i < stepsCount - 1; i++) {
        steps.push(`Step ${ i + 1 }`);

        if ('WND_AVG_TCP' in result && result['WND_AVG_TCP'] && result['WND_AVG_TCP'].length > i) {
            averageThroughputs.push(result['WND_AVG_TCP'][i]);
        } else {
            averageThroughputs.push(null);
        }

        if ('EFF_PLOT' in result && result['EFF_PLOT'] && result['EFF_PLOT'].length > i) {
            efficiencies.push(result['EFF_PLOT'][i]);
        } else {
            efficiencies.push(null);
        }
    }

    var efficiency = result['TCP_EFF'];

    steps.push('THPT');
    averageThroughputs.push(result['THPT_AVG']);
    efficiencies.push(efficiency);

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

// $(function () {
//     printnormal(normalTestResults);
// });