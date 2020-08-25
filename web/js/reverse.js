eel.expose(printreverse);
function printreverse(result){
    disableMainForm(false);
    $('#btnSaveAsPdf').attr('disabled', false);

    testFinishedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    clearInterval(measurementTimer);

    test_latitude = $('#lat').val();
    test_longitude = $('#lon').val();

    // alert('printreverse');
    //document.getElementById("remote_result").value += result + "\n";
    remoteResultId = '#tblRemoteResult tbody';
    $(remoteResultId).empty();


    $('#results-info').show();
    $('#error-info').hide();

    if (result) {
        var reverseResult = result;
        reverseResult["CIR"] = $('#cir').val();

        $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'CIR' }</b></td><td>${ reverseResult["CIR"] }${ ' Mbps' }</td></tr>`);

        if ("MTU" in reverseResult && (reverseResult["MTU"] || reverseResult["MTU"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td>${ reverseResult["MTU"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'MTU' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("RTT" in reverseResult && (reverseResult["RTT"] || reverseResult["RTT"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td>${ numeral(reverseResult["RTT"]).format('0,0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'RTT' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }
        
        if ("RWND" in reverseResult && (reverseResult["RWND"] || reverseResult["RWND"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td>${ reverseResult["ACTUAL_RWND"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP RWND' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("THPT_AVG" in reverseResult && (reverseResult["THPT_AVG"] || reverseResult["THPT_AVG"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_AVG"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average TCP Throughput' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("THPT_IDEAL" in reverseResult && (reverseResult["THPT_IDEAL"] || reverseResult["THPT_IDEAL"] === 0)){
            reverseResult["THPT_IDEAL"] /= 1.2;
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td>${ numeral(reverseResult["THPT_IDEAL"]).format('0,0.000') }${ ' Mbps' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal TCP Throughput' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANSFER_AVG" in reverseResult && (reverseResult["TRANSFER_AVG"] || reverseResult["TRANSFER_AVG"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_AVG"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average Transfer Time' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANSFER_IDEAL" in reverseResult && (reverseResult["TRANSFER_IDEAL"] || reverseResult["TRANSFER_IDEAL"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td>${ numeral(reverseResult["TRANSFER_IDEAL"]).format('0,0.000') }${ ' s' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Ideal Transfer Time' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TCP_TTR" in reverseResult && (reverseResult["TCP_TTR"] || reverseResult["TCP_TTR"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td>${ numeral(reverseResult["TCP_TTR"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP TTR' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TRANS_BYTES" in reverseResult && (reverseResult["TRANS_BYTES"] || reverseResult["TRANS_BYTES"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td>${ reverseResult["TRANS_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Transmitted Bytes' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("RETX_BYTES" in reverseResult && (reverseResult["RETX_BYTES"] || reverseResult["RETX_BYTES"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td>${ reverseResult["RETX_BYTES"] }${ ' Bytes' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Retransmitted Bytes' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("TCP_EFF" in reverseResult && (reverseResult["TCP_EFF"] || reverseResult["TCP_EFF"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td>${ numeral(reverseResult["TCP_EFF"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'TCP Efficiency' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("AVE_RTT" in reverseResult && (reverseResult["AVE_RTT"] || reverseResult["AVE_RTT"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td>${ numeral(reverseResult["AVE_RTT"]).format('0.000') }${ ' ms' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Average RTT' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }

        if ("BUF_DELAY" in reverseResult && (reverseResult["BUF_DELAY"] || reverseResult["BUF_DELAY"] === 0)){
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td>${ numeral(reverseResult["BUF_DELAY"]).format('0.000%') }${ '' }</td></tr>`);
        } else {
            $(remoteResultId).append(`<tr><td class="text-secondary"><b>${ 'Buffer Delay' }</b></td><td><span class="text-muted"><i>-no result-</i></span></td></tr>`);
        }
    } else {
        $(remoteResultId).append(`<tr><td><span class="text-muted">${ 'No measured results' }<span></td></tr>`);
    }

    var remoteWindowScanId = "#tblRemoteWindowStats tbody";
     
    var windowSizes = reverseResult["WND_SIZES"] ?? [];
    var windowAverageThroughputs = reverseResult["WND_AVG_TCP"] ?? [];
    var windowIdealThroughputs = reverseResult["WND_IDEAL_TCP"] ?? [];
    var windowTcpEfficiencies = reverseResult["WND_TCP_EFF"] ?? [];

    // if ("WND_SIZES" in reverseResult) {
    //     windowSizes = reverseResult["WND_SIZES"] ?? [];
    // }
    // if ("WND_AVG_TCP" in reverseResult) {
    //     windowAverageThroughputs = reverseResult["WND_AVG_TCP"];
    // }
    // if ("WND_IDEAL_TCP" in reverseResult) {
    //     windowIdealThroughputs = reverseResult["WND_IDEAL_TCP"];
    // }
    // if ("WND_IDEAL_TCP" in reverseResult) {
    //     windowTcpEfficiencies = reverseResult["WND_TCP_EFF"];
    // }

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
            'value': windowSizes.concat(reverseResult["ACTUAL_RWND"]),
            'format': '0',
            'unit': 'Bytes'
        },
        'Average TCP Throughput': {
            'value': windowAverageThroughputs.concat(reverseResult["THPT_AVG"]),
            'format': '0.000',
            'unit': 'Mbps'
        },
        'Ideal TCP Throughput': {
            'value': windowIdealThroughputs.concat(reverseResult["THPT_IDEAL"]),
            'format': '0.000',
            'unit': 'Mbps'
        },
        'TCP Efficiency': {
            'value': windowTcpEfficiencies.concat(reverseResult["TCP_EFF"]),
            'format': '0.[000]%',
            'unit': null
        },
        // 'Buffer Delay': {
        //     'value': windowBufferDelays.concat(reverseResult["BUF_DELAY"]),
        //     'format': '0.[000]%',
        //     'unit': null
        // },
    };

    $(remoteWindowScanId).empty();

    var rowParams = Object.keys(windowScanRows);
    for (var i = 0; i < rowParams.length; i++) {
        $(`${remoteWindowScanId}`).append('<tr><td class="text-secondary"></td></tr>');
    }

    for (var r = 0; r < rowParams.length; r++) {
        var param = rowParams[r];
        $(remoteWindowScanId).find('tr').eq(r).find('td').eq(0).html(`<b>${ param }</b>`);

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
                $(remoteWindowScanId).find('tr').eq(r).find('td').eq(c).after(`<td>${ displayValue }</td>`);
            }
        }
    }

    // $(remoteWindowScanId).find('tr').eq(0).find('td').eq(0).html(`<b>Steps</b>`);
    // $(remoteWindowScanId).find('tr').eq(1).find('td').eq(0).html(`<b>Window Size</b>`);
    // $(remoteWindowScanId).find('tr').eq(2).find('td').eq(0).html(`<b>Average TCP Throughput</b>`);
    // $(remoteWindowScanId).find('tr').eq(3).find('td').eq(0).html(`<b>Ideal TCP Throughput</b>`);
    // $(remoteWindowScanId).find('tr').eq(4).find('td').eq(0).html(`<b>TCP Efficiency</b>`);
    // // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(0).html(`<b>Buffer Delay</b>`);
    
    // for (var i = 0; i < maxColumns; i++) {
    //     $(remoteWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ i + 1 }</td>`);

    //     var windowSizeElement = $(remoteWindowScanId).find('tr').eq(1).find('td').eq(i);
    //     if (windowSizes && windowSizes.length < i) {
    //         windowSizeElement.after(`<td>${ windowSizes[i] } Bytes</td>`);
    //     } else {
    //         windowSizeElement.after(`<td><span class="text-muted"><i>-no result-</i></span></td>`);
    //     }

    //     var windowAverageThroughputElement = $(remoteWindowScanId).find('tr').eq(2).find('td').eq(i);
    //     if (windowAverageThroughputs && windowAverageThroughputs.length < i) {
    //         windowAverageThroughputElement.after(`<td>${ numeral(windowAverageThroughputs[i]).format('0.000') } Mbps</td>`);
    //     } else {
    //         windowAverageThroughputElement.after(`<td><span class="text-muted"><i>-no result-</i></span></td>`);
    //     }

    //     var windowIdealThroughputElement = $(remoteWindowScanId).find('tr').eq(3).find('td').eq(i);
    //     if (windowIdealThroughputs && windowIdealThroughputs.length < i) {
    //         windowIdealThroughputElement.after(`<td>${ numeral(windowIdealThroughputs[i]).format('0.000') } Mbps</td>`);
    //     } else {
    //         windowIdealThroughputElement.after(`<td><span class="text-muted"><i>-no result-</i></span></td>`);
    //     }

    //     var windowTcpEfficiencyElement = $(remoteWindowScanId).find('tr').eq(4).find('td').eq(i);
    //     if (windowTcpEfficiencies && windowTcpEfficiencies.length < i) {
    //         windowTcpEfficiencyElement.after(`<td>${ numeral(windowTcpEfficiencies[i]).format('0.[000]%')}</td>`);
    //     } else {
    //         windowTcpEfficiencyElement.after(`<td><span class="text-muted"><i>-no result-</i></span></td>`);
    //     }
    //     // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ windowBufferDelays.length > i && windowBufferDelays[i] ? numeral(windowBufferDelays[i]).format('0.[000]%') : "---" } </td>`);
    // }
    // // else {
    // //     $(remoteWindowScanId).append(`<tr><td><span class="text-muted">${ 'No measured window scan' }<span></td></tr>`);
    // // }

    // $(remoteWindowScanId).find('tr').eq(0).find('td').eq(i).after(`<td>${ 'THPT' }</td>`);
    // $(remoteWindowScanId).find('tr').eq(1).find('td').eq(i).after(`<td>${ reverseResult["ACTUAL_RWND"] == null ? "---" : numeral(reverseResult["ACTUAL_RWND"]).format('0') } Bytes</td>`);
    // $(remoteWindowScanId).find('tr').eq(2).find('td').eq(i).after(`<td>${ reverseResult["THPT_AVG"] == null ? "---" : numeral(reverseResult["THPT_AVG"]).format('0.000') } Mbps</td>`);
    // $(remoteWindowScanId).find('tr').eq(3).find('td').eq(i).after(`<td>${ reverseResult["THPT_IDEAL"] == null ? "---" : numeral(reverseResult["THPT_IDEAL"]).format('0.000') } Mbps</td>`);
    // $(remoteWindowScanId).find('tr').eq(4).find('td').eq(i).after(`<td>${ reverseResult["TCP_EFF"] == null ? "---" : numeral(reverseResult["TCP_EFF"]).format('0.[000]%') } </td>`);
    // $(remoteWindowScanId).find('tr').eq(5).find('td').eq(i).after(`<td>${ reverseResult["BUF_DELAY"] == null ? "---" : numeral(reverseResult["BUF_DELAY"]).format('0.[000]%') } </td>`);

    reverseTestResults = [];
    reverseTestResults = reverseResult;
    
    renderRemoteWindowScanGraph(stepsCount, reverseResult);
    renderRemoteThroughputEfficiencyGraph(stepsCount, reverseResult);

    Promise.all(chartPromises).then(() => {
        $('#btnSaveAsPdf').attr('disabled', false);
    })
    // renderRemoteThroughputRTTGraph(result);
}


function renderRemoteWindowScanGraph(stepsCount, result) {
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
    var throughputIdeal = result['THPT_IDEAL'];

    steps.push('THPT');
    averageThroughputs.push(result['THPT_AVG']);
    idealThroughputs.push(throughputIdeal);
    
    // if (windowSizes) {
    //     for (var i = 0; i < windowSizes.length; i++) {
    //         steps.push(`Step ${ i + 1 }`);
    //         averageThroughputs.push(result['WND_AVG_TCP'][i]);
    //         idealThroughputs.push(result['WND_IDEAL_TCP'][i]);
    //     }
    //     steps.push('THPT');
    //     averageThroughputs.push(result['THPT_AVG']);
    //     idealThroughputs.push(result['THPT_IDEAL']); // should be ACTUAL_IDEAL
    // }

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
        noData: {
            text: 'Insufficient results',
            style: {
                color: 'gray',
                fontSize: '24px'
            }
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
                        text: throughputIdeal ? `Max THPT: ${ numeral(result["THPT_IDEAL"]).format('0.000') } Mbps` : null
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

function renderRemoteThroughputEfficiencyGraph(stepsCount, result) {
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

        if ('WND_TCP_EFF' in result && result['WND_TCP_EFF'] && result['WND_TCP_EFF'].length > i) {
            efficiencies.push(result['WND_TCP_EFF'][i]);
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

// $(function () {
//     printreverse(reverseTestResults);
// });