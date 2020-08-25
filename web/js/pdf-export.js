
function testSummaryPage(content, generatedAt) {

    var cir = $('#cir').val();
    var networkType = $('#net_type').val();
    var latitude = $('#lat').val();
    var longitude = $('#lon').val();

    content.push({
        text: 'TEST SUMMARY',
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 0],
    });

    content.push({
        table: {
            body: [
                [{ text: 'Test mode', bold: true, fillColor: '#cccccc' }, testMeasurementMode],
                [{ text: 'Generated at', bold: true, fillColor: '#cccccc' }, `${ generatedAt }`],
            ],
            widths: [80, 120],
            alignment: 'center'
        },
        fontSize: 10,
        margin: [0, 10, 0, 0]
    });

    
    var testDurationSeconds = testStartedAt && testFinishedAt ? moment(testFinishedAt).diff(testStartedAt, 'seconds', true) : 0;
    var minute = Math.floor(testDurationSeconds / 60);
    var second = parseInt(testDurationSeconds) % 60;

    content.push({
        table: {
            body: [
                [{ text: 'Started at', bold: true, fillColor: '#cccccc' }, { text: testStartedAt ?? 'unknown', style: testStartedAt ? '' : 'muted' }],
                [{ text: 'Stopped at', bold: true, fillColor: '#cccccc' }, { text: testFinishedAt ?? 'unknown', style: testFinishedAt ? '' : 'muted' }],
                [{ text: 'Test duration', bold: true, fillColor: '#cccccc' }, { text: testStartedAt && testFinishedAt ? `${ numeral(minute).format('0') }m ${ numeral(second).format('00') }s` : 'test not completed', style: testStartedAt && testFinishedAt ? '' : 'muted' }],
            ],
            widths: [80, 120],
            alignment: 'center'
        },
        fontSize: 10,
        margin: [0, 10, 0, 0]
    });

    var networkAndGps = [];
    if (networkType) {
        networkAndGps.push([{ text: 'Network connection type', bold: true, fillColor: '#cccccc' }, networkType]);
    }
    networkAndGps.push([{ text: 'GPS coordinates', bold: true, fillColor: '#cccccc' }, `${ latitude }, ${ longitude }`]);

    content.push({
        table: {
            body: networkAndGps,
            widths: [80, 120],
        },
        fontSize: 10,
        margin: [0, 10, 0, 0]
    });

    content.push({
        text: 'TEST SEQUENCE SUMMARY',
        fontSize: 12,
        alignment: 'center',
        margin: [0, 20, 0, 0],
    });

    switch (testMeasurementMode) {
        case "Upload":
        case "Download":
            var testResults = testMeasurementMode == "Upload" ? normalTestResults : reverseTestResults;
            // console.log("testResults");
            // console.log(testResults);
            content.push({
                table: {
                    body: [
                        [
                            { text: 'Network Parameter', bold: true, fillColor: '#cccccc' },
                            { text: 'Source', bold: true, fillColor: '#cccccc' },
                            { text: `${ testMeasurementMode == "Upload" ? 'Local to Remote' : 'Remote to Local' }`, bold: true, fillColor: '#cccccc' },
                        ],
                        ['CIR', 'User input', `${ cir } Mbps`],
                        ['Baseline RTT', 'Measured', `${ testResults["RTT"] == null ? "---" : numeral(testResults["RTT"]).format('0.000') } ms`],
                        ['BDP', 'Calculated', `${ testResults["BDP"] == null ? "---" : testResults["BDP"] } bits`],
                        ['MTU', 'Measured', `${ testResults["MTU"] == null ? "---" : testResults["MTU"] } Bytes`],
                    ],
                    widths: [90, 70, '*', '*'],
                },
                fontSize: 10,
                margin: [0, 10, 0, 0]
            });
            
            break;
        // case "Simultaneous":
        //     content.push({
        //         table: {
        //             body: [
        //                 [
        //                     { text: 'Network Parameter', bold: true, fillColor: '#cccccc' },
        //                     { text: 'Source', bold: true, fillColor: '#cccccc' },
        //                     { text: 'Local to Remote', bold: true, fillColor: '#cccccc' },
        //                     { text: 'Remote to Local', bold: true, fillColor: '#cccccc' }
        //                 ],
        //                 ['CIR', 'User input', `${ cir } Mbps`, `${ cir } Mbps`],
        //                 ['Baseline RTT', 'Measured', `${ normalTestResults["RTT"] == null ? "---" : numeral(normalTestResults["RTT"]).format('0.000') } ms`, `${ reverseTestResults["RTT"] == null ? "---" : numeral(reverseTestResults["RTT"]).format('0.000') } ms`],
        //                 ['BDP', 'Calculated', `${ normalTestResults["BDP"] == null ? "---" : normalTestResults["BDP"] } bits`, `${ reverseTestResults["BDP"] == null ? "---" : reverseTestResults["BDP"] } bits`],
        //                 ['MTU', 'Measured', `${ normalTestResults["MTU"] == null ? "---" : normalTestResults["MTU"] } Bytes`, `${ reverseTestResults["MTU"] == null ? "---" : reverseTestResults["MTU"] } Bytes`],
        //             ],
        //             widths: [90, 70, '*', '*'],
        //         },
        //         fontSize: 10,
        //         margin: [0, 10, 0, 0]
        //     });
        //     break;
    }
}

function throughputTestPage(content, fromLocal = true) {
    var cir = $('#cir').val();

    content.push({
        text: 'THROUGHPUT TEST',
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    var isNormal = testMeasurementMode == "Upload";

    switch (testMeasurementMode) {
        case "Upload":
        case "Download":
            var testResults = isNormal ? normalTestResults :  reverseTestResults;
            content.push({
                table: {
                    body: [
                        [{ text: 'Test Conditions', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['CIR', `${ cir } Mbps`],
                        ['Mode', { text: testMeasurementMode }],
                        ['Direction', `${ testMeasurementMode == "Upload" ? 'Local to Remote' :  'Remote to Local' }`],
                        ['Window Size', `${ testResults["ACTUAL_RWND"] == null ? "---" : numeral(testResults["ACTUAL_RWND"]).format('0') } Bytes`],
                        ['Parallel Connections', testResults["PARALLEL_CONNECTIONS"] ?? "---"],
                        ['BDP', `${ testResults["BDP"] == null ? "---" : numeral(testResults["BDP"]).format('0') } bits`],
                        ['Path MTU', `${ testResults["MTU"] == null ? "---" : testResults["MTU"] } Bytes`],
                        ['Baseline RTT', `${ testResults["RTT"] == null ? "---" : numeral(testResults["RTT"]).format('0.000') } ms`],

                        [{ text: 'TCP Throughput', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Average', `${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"]).format('0.000') } Mbps`],
                        ['Ideal', `${ testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"] == null ? "---" : numeral(testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"]).format('0.000') } Mbps`],
                        ['Threshold', `${ testResults["THPT_AVG"] == null || testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"] == null ? "---" : numeral(testResults["THPT_AVG"] / testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"]).format('0.[000]%') } of Ideal`],

                        [{ text: 'Transfer Time', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Average', `${ testResults["TRANSFER_AVG"] == null ? "---" : numeral(testResults["TRANSFER_AVG"]).format('0.000') } s`],
                        ['Ideal', `${ testResults["TRANSFER_IDEAL"] == null ? "---" : numeral(testResults["TRANSFER_IDEAL"]).format('0.000') } s`],
                        ['Transfer Time Ratio', `${ testResults["TRANSFER_AVG"] == null || testResults["TRANSFER_IDEAL"] == null ? "---" : numeral(testResults["TRANSFER_AVG"] / testResults["TRANSFER_IDEAL"]).format('0.000') }`],

                        [{ text: 'Data Transfer', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Transmitted Bytes', `${ testResults["TRANS_BYTES"] == null ? "---" : numeral(testResults["TRANS_BYTES"]).format('0') } Bytes`],
                        ['Retransmitted Bytes', `${ testResults["RETX_BYTES"] == null ? "---" : numeral(testResults["RETX_BYTES"]).format('0') } Bytes`],
                        // ['Retransmitted %', `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`],
                        ['TCP Efficiency %', `${ testResults["TCP_EFF"] == null ? "---" : numeral(testResults["TCP_EFF"]).format('0.[000]%') }`],

                        [{ text: 'RTT', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Baseline RTT', `${ testResults["RTT"] == null ? "---" : numeral(testResults["RTT"]).format('0.000') } ms`],
                        ['Average RTT', `${ testResults["AVE_RTT"] == null ? "---" : numeral(testResults["AVE_RTT"]).format('0.000') } ms`],
                        // ['Average', `${ reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_IDEAL"] }`],
                        // ['Maximum', `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`],
                        ['Buffer Delay', `${ testResults["BUF_DELAY"] == null ? "---" : numeral(testResults["BUF_DELAY"]).format('0.[000]%') }`],
                    ],
                    widths: ['*', '*'],
                },
                fontSize: 10,
                margin: [0, 0, 0, 20],
            });
            break;
        // case "Simultaneous":
        //     content.push({
        //         table: {
        //             body: [
        //                 [{ text: 'Test Conditions', colSpan: 3, fillColor: '#cccccc' }, {}, {}],
        //                 ['Mode', { text: testMeasurementMode, colSpan: 2 }, {}],
        //                 ['Direction', 'Local to Remote', 'Remote to Local'],
        //                 ['Window Size', `${ numeral(normalTestResults["RWND"]).format('0.000') } KBytes`, `${ numeral(reverseTestResults["RWND"]).format('0.000') } KBytes`],
        //                 ['Connections', 1, 1],
        //                 ['BDP', `${ numeral(normalTestResults["BDP"]).format('0.000') } bits`, `${ numeral(reverseTestResults["BDP"]).format('0.000') } bits`],
        //                 ['Path MTU', `${ numeral(normalTestResults["MTU"]).format('0.000') }`, `${ numeral(reverseTestResults["MTU"]).format('0.000') }`],
        //                 ['Baseline RTT', `${ numeral(normalTestResults["RTT"]).format('0.000') } ms`, `${ numeral(reverseTestResults["RTT"]).format('0.000') } ms`],
        //                 ['CIR', `${ cir } Mbps`, `${ cir } Mbps`],

        //                 [{ text: 'TCP Througput', colSpan: 3, fillColor: '#cccccc' }, {}, {}],
        //                 ['Average', `${ numeral(normalTestResults["THPT_AVG"]).format('0.000') } Mbits/s`, `${ numeral(reverseTestResults["THPT_AVG"]).format('0.000') } Mbits/s`],
        //                 ['Ideal', `${ numeral(normalTestResults["THPT_IDEAL"]).format('0.000') } Mbits/s`, `${ numeral(reverseTestResults["THPT_IDEAL"]).format('0.000') } Mbits/s`],
        //                 ['Threshold', `${ numeral(95).format('0.00') }% of Ideal`, `${ numeral(95).format('0.00') }% of Ideal`],

        //                 [{ text: 'Transfer Time', colSpan: 3, fillColor: '#cccccc' }, {}, {}],
        //                 ['Average', `${ numeral(normalTestResults["TRANSFER_AVG"]).format('0.000') }`, `${ numeral(reverseTestResults["TRANSFER_AVG"]).format('0.000') }`],
        //                 ['Ideal', `${ numeral(normalTestResults["TRANSFER_IDEAL"]).format('0.000') }`, `${ numeral(reverseTestResults["TRANSFER_IDEAL"]).format('0.000') }`],
        //                 ['Transfer Time Ratio', `${ numeral(normalTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"al]).format('0.000') }`, `${ numeral(reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"]).format('0.000') }`],

        //                 [{ text: 'Data Transfer', colSpan: 3, fillColor: '#cccccc' }, {}, {}],
        //                 ['Transmitted Bytes', `${ numeral(normalTestResults["TRANS_BYTES"]).format('0') }`, `${ numeral(reverseTestResults["TRANS_BYTES"]).format('0') }`],
        //                 ['Retransmitted Bytes', `${ numeral(normalTestResults["RETX_BYTES"]).format('0') }`, `${ numeral(reverseTestResults["RETX_BYTES"]).format('0') }`],
        //                 // ['Retransmitted %', `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`],
        //                 ['TCP Efficiency %', `${ numeral(normalTestResults["TCP_EFF"]).format('0.000') }%`, `${ numeral(reverseTestResults["TCP_EFF"]).format('0.000') }%`],

        //                 [{ text: 'RTT', colSpan: 3, fillColor: '#cccccc' }, {}, {}],
        //                 ['Minimum', `${ numeral(normalTestResults["RTT"]).format('0.000') } ms`, `${ numeral(reverseTestResults["RTT"]).format('0.000') } ms`],
        //                 // ['Average', `${ reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_IDEAL"] }`],
        //                 // ['Maximum', `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`, `${ reverseTestResults["TRANSFER_AVG"] / reverseTestResults["TRANSFER_IDEAL"] }`],
        //                 ['Buffer Delay', `${ numeral(normalTestResults["BUF_DELAY"]).format('0.[000]') }%`, `${ numeral(reverseTestResults["BUF_DELAY"]).format('0.[000]') }%`],
        //             ],
        //             widths: ['*', '*', '*'],
        //         },
        //         fontSize: 10,
        //     });
        //     break;
    }

    content.push({
        text: `Throughput and TCP Efficiency Chart\n${ fromLocal ? 'Local to Remote' : 'Remote to Local' }`,
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    // WINDOW SCAN TEST (L > R),,,,,
    content.push({
        image: (fromLocal ? throughputEfficiencyLocalToRemoteChart : throughputEfficiencyRemoteToLocalChart) ?? emptyImageURI,
        width: 240,
        alignment: "center"
    });
}


function windowScanTestPage(content, isNormal = true) {
    var cir = $('#cir').val();

    content.push({
        text: 'WINDOW SCAN TEST',
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
    });

    content.push({
        text: `${ isNormal ? 'Local to Remote' : 'Remote to Local' }`,
        fontSize: 12,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    var testResults = isNormal ? normalTestResults : reverseTestResults;
    // console.log("testResults");
    // console.log(testResults);

    var pageBody = [];
    var pageBodyWidths = ['*'];

    var steps = ['Steps'];
    var windowSizes = ['Window Size'];
    var averageTcpThroughputs = ['Average TCP Throughput'];
    var idealTcpThroughputs = ['Ideal TCP Throughput'];
    var tcpEfficiencies = ['TCP Efficiency'];
    var bufferDelays = ['Buffer Delay'];

    if (testResults["WND_SIZES"]) {
        var windowSizeLength = testResults["WND_SIZES"].length;
        for (var i = 0; i < windowSizeLength; i++) {
            steps.push(i + 1);

            var windowSize = testResults["WND_SIZES"][i];
            windowSizes.push(`${ windowSize == null ? "---" : numeral(windowSize).format('0') } Bytes`);

            var averageThroughput = testResults["WND_AVG_TCP"][i];
            averageTcpThroughputs.push(`${ averageThroughput == null ? "---" : numeral(averageThroughput).format('0.000') } Mbps`);

            var idealThroughput = testResults[isNormal ? "WND_ACTUAL_IDEAL" : "WND_IDEAL_TCP"][i];
            idealTcpThroughputs.push(`${ idealThroughput == null ? "---" : numeral(idealThroughput).format('0.000') } Mbps`);

            var throughputEfficiency = testResults[isNormal ? "EFF_PLOT" : "WND_TCP_EFF"][i];
            tcpEfficiencies.push(`${ throughputEfficiency == null ? "---" : numeral(throughputEfficiency).format('0.000%')}`);

            var bufferDelay = testResults[isNormal ? "BUF_PLOT" : "WND_BUF_DEL"][i];
            bufferDelays.push(`${ bufferDelay == null ? "---" : numeral(bufferDelay).format('0.000%')}`);

            pageBodyWidths.push('*');
        }
    }
    steps.push('THPT');
    windowSizes.push(`${ testResults["ACTUAL_RWND"] == null ? "---" : numeral(testResults["ACTUAL_RWND"] ).format('0')} Bytes`);
    averageTcpThroughputs.push(`${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"] ).format('0.000')} Mbps`);
    idealTcpThroughputs.push(`${ testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"] == null ? "---" : numeral(testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"] ).format('0.000')} Mbps`);
    tcpEfficiencies.push(`${ testResults["TCP_EFF"] == null ? "---" : numeral(testResults["TCP_EFF"]).format('0.000%')}`);
    bufferDelays.push(`${ testResults["BUF_DELAY"] == null ? "---" : numeral(testResults["BUF_DELAY"]).format('0.[000]%')}`);
    pageBodyWidths.push('*');

    var width = pageBodyWidths.length - 1;

    pageBody.push([{ text: 'Test Conditions', colSpan: width + 1, fillColor: '#cccccc' }].concat(new Array(width).fill([{}]).flat()));
    pageBody.push(['CIR', { text: `${ cir } Mbps`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Mode', { text: testMeasurementMode, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));

    pageBody.push(steps);
    pageBody.push(windowSizes);
    pageBody.push(averageTcpThroughputs);
    pageBody.push(idealTcpThroughputs);
    pageBody.push(tcpEfficiencies);

    pageBody.push(['BDP', { text: `${ testResults["BDP"] == null ? "---" : testResults["BDP"] } bits`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Path MTU', { text: `${ testResults["MTU"] == null ? "---" : testResults["MTU"] } Bytes`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Baseline RTT', { text: `${ testResults["RTT"] == null ? "---" : testResults["RTT"] } ms`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));

    pageBody.push([{ text: 'TCP Thoughput', colSpan: width + 1, fillColor: '#cccccc' }].concat(new Array(width).fill([{}]).flat()));
    pageBody.push(['Average', { text: `${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"]).format('0.000') } Mbps`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Ideal', { text: `${ testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"] == null ? "---" :  numeral(testResults[isNormal ? "ACTUAL_IDEAL" : "THPT_IDEAL"]).format('0.000') } Mbps`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));

    pageBody.push([{ text: 'Data Transfer', colSpan: width + 1, fillColor: '#cccccc' }].concat(new Array(width).fill([{}]).flat()));
    pageBody.push(['TCP Efficiency', { text: testResults["TCP_EFF"] == null ? "---" : numeral(testResults["TCP_EFF"]).format('0.[000]%'), colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push([{ text: 'RTT', colSpan: width + 1, fillColor: '#cccccc' }].concat(new Array(width).fill([{}]).flat()));
    pageBody.push(['Baseline RTT', { text: testResults["RTT"] == null ? "---" :  `${ numeral(testResults["RTT"]).format('0.000') } ms`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Average RTT ', { text: testResults["AVE_RTT"] == null ? "---" :  `${ numeral(testResults["AVE_RTT"]).format('0.000') } ms`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));
    pageBody.push(['Buffer Delay', { text: testResults["BUF_DELAY"] == null ? "---" :  `${ numeral(testResults["BUF_DELAY"]).format('0.000%') }`, colSpan: width }].concat(new Array(width - 1).fill([{}]).flat()));

    content.push({
        table: {
            body: pageBody,
            widths: pageBodyWidths,
        },
        fontSize: 10,
        margin: [0, 0, 0, 20],
    });

    content.push({
        text: `Window Scan Graph: ${ isNormal ? 'Local to Remote' : 'Remote to Local' }`,
        fontSize: 11,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });
    
    content.push({
        image: (isNormal ? windowsScanLocalToRemoteChart : windowsScanRemoteToLocalChart) ?? emptyImageURI,
        width: 240,
        alignment: "center"
    });
}

// function page6(content) {
//     content.push({
//         text: 'Single Direction: Remote > Local',
//         fontSize: 12,
//         bold: true,
//         alignment: 'center',
//         margin: [0, 0, 0, 10],
//     });

//     // WINDOW SCAN TEST (L > R),,,,,
//     // content.push({
//     //     image: throughputGraphRemoteToLocalChart ? throughputGraphRemoteToLocalChart.toBase64Image() : [],
//     //     height: 180,
//     //     width: 240,
//     //     alignment: "center"
//     // });
// }

function pageBreak(content) {
    content.push({
        text: '',
        pageBreak: 'after'
    });
}

async function generateTestResultsPdfReport() {

    var username = $('#loggedUsername').text();
    var mode = $('#btnSaveAsPdf').data('test-mode');
    var isNormal = mode == "normal";
    var params = ["CIR", "MTU", "RTT", "BB", "BDP", "RWND",
        "THPT_AVG", "THPT_IDEAL", "TRANSFER_AVG", "TRANSFER_IDEAL",
        "TCP_TTR", "TRANS_BYTES", "RETX_BYTES", "TCP_EFF", "AVE_RTT", "BUF_DELAY",
        "ACTUAL_RWND", "WND_SIZES", "PARALLEL_CONNECTIONS", "ACTUAL_IDEAL"];

    if (normalTestResults == null) {
        normalTestResults = {};
    }
    if (reverseTestResults == null) {
        reverseTestResults = {};
    }

    if (mode == "normal" || mode == "simultaneous") {
        for (param in params) {
            if (!(param in normalTestResults) || !normalTestResults[param]) {
                normalTestResults[param] = null;
            }
        }
    }
    
    if (mode == "reverse" || mode == "simultaneous") {
        for (param in params) {
            if (!(param in reverseTestResults) || !reverseTestResults[param]) {
                reverseTestResults[param] = null;
            }
        }
    }

    // console.log("reverseTestResults");
    // console.log(reverseTestResults);

    $('#btnSaveAsPdf').attr('disabled', true);

    var testModeProperName = "";
    switch (mode) {
        case "normal":
            testMeasurementMode = "Upload";
            testModeProperName = "Upload speed";
            break;
        case "reverse":
            testMeasurementMode = "Download";
            testModeProperName = "Download speed";
            break;
        case "simultaneous":
            testMeasurementMode = "Simultaneous";
            testModeProperName = "Simultaneous mode";
            break;
        case "bidirectional":
            testMeasurementMode = "Auto";
            testModeProperName = "Auto mode";
            break;
    }

    var timestampCondensed = moment(testStartedAt).format('YYYYMMDD-HHmmss');
    var timestampKebab = moment(testStartedAt).format('YYYY-MM-DD-HHmmss');
    var generatedTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    var fileName = `netmesh-test-results-${testMeasurementMode.toLowerCase()}-${ username }-${ timestampCondensed }`;
    var documentName = `NTC NetMesh Test Measurement Results (${ testModeProperName }) - ${ username } - ${ timestampKebab }`;

    var dd = {};

    dd.footer = function (currentPage, pageCount) {
        return {
            columns: [
                {
                    text: username,
                    margin: 15,
                    fontSize: 7,
                    alignment: 'left',
                },
                {
                    text: `Page ${currentPage} of ${pageCount}`,
                    margin: 15,
                    fontSize: 8,
                    alignment: 'center',
                    width: 'auto'
                },
                {
                    text: `Generated at ${generatedTimestamp}`,
                    margin: 15,
                    fontSize: 7,
                    alignment: 'right',
                },
            ]
        }
    };
    dd.info = {
        fileName: fileName,
        title: documentName,
        author: username,
        subject: 'Test measurement results',
    };
    dd.content = [];

    dd.content.push({
        columns: [
            {
                image: await getBase64ImageFromURLAsync('images/user_login.png'),
                width: 50,
                height: 50,
            },
            [
                {
                    text: 'NATIONAL TELECOMMUNICATIONS COMMISSION',
                    style: 'header',
                    margin: [2, 8, 2, 0],
                },
                {
                    text: 'NTC NetMesh RFC-6349 Application',
                    style: 'subheader',
                    margin: 2,
                    bold: false
                },
            ],
        ],
        columnGap: 10
    });

    testSummaryPage(dd.content, generatedTimestamp);

    pageBreak(dd.content);
    switch (testMeasurementMode) {
        case "Upload":
            throughputTestPage(dd.content, true);
            break;
        case "Download":
            throughputTestPage(dd.content, false);
            break;
    }

    pageBreak(dd.content);
    switch (testMeasurementMode) {
        case "Upload":
            windowScanTestPage(dd.content, true);
            break;
        case "Download":
            windowScanTestPage(dd.content, false);
            break;
    }

    dd.styles = {
        header: {
            fontSize: 14,
            bold: true
        },
        subheader: {
            fontSize: 12,
            bold: true
        },
        quote: {
            italics: true
        },
        small: {
            fontSize: 8
        },
        muted: {
            italics: true,
            color: '#6c757d'
        }
    };

    // SHOW PDF PREVIEW
    // const pdfDocGenerator = pdfMake.createPdf(dd);
    // pdfDocGenerator.getDataUrl((dataUrl) => {
    //     const targetElement = document.querySelector('#pdfViewer');
    //     const iframe = document.createElement('iframe');
    //     iframe.width = 1020;
    //     iframe.height = 825;
    //     iframe.src = dataUrl;
    //     if (targetElement.hasChildNodes()) {
    //         $('iframe').remove();
    //     }
    //     targetElement.appendChild(iframe);
    // });

    pdfMake.createPdf(dd).download(`${fileName}.pdf`);

    $('#btnSaveAsPdf').attr('disabled', false);
}

async function getBase64ImageFromURLAsync(url) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = () => {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = error => {
            reject(error);
        };
        img.src = url;
    });
}

