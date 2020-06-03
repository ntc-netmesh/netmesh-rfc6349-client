
function testSummaryPage(content, generatedAt) {

    var cir = $('#cir').val();
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

    content.push({
        table: {
            body: [
                [{ text: 'GPS coordinates', bold: true, fillColor: '#cccccc' }, `${ latitude }, ${ longitude }`],
            ],
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
        case "Simultaneous":
            content.push({
                table: {
                    body: [
                        [
                            { text: 'Network Parameter', bold: true, fillColor: '#cccccc' },
                            { text: 'Source', bold: true, fillColor: '#cccccc' },
                            { text: 'Local to Remote', bold: true, fillColor: '#cccccc' },
                            { text: 'Remote to Local', bold: true, fillColor: '#cccccc' }
                        ],
                        ['CIR', 'User input', `${ cir } Mbps`, `${ cir } Mbps`],
                        ['Baseline RTT', 'Measured', `${ normalTestResults["RTT"] == null ? "---" : numeral(normalTestResults["RTT"]).format('0.000') } ms`, `${ reverseTestResults["RTT"] == null ? "---" : numeral(reverseTestResults["RTT"]).format('0.000') } ms`],
                        ['BDP', 'Calculated', `${ normalTestResults["BDP"] == null ? "---" : normalTestResults["BDP"] } bits`, `${ reverseTestResults["BDP"] == null ? "---" : reverseTestResults["BDP"] } bits`],
                        ['MTU', 'Measured', `${ normalTestResults["MTU"] == null ? "---" : normalTestResults["MTU"] } Bytes`, `${ reverseTestResults["MTU"] == null ? "---" : reverseTestResults["MTU"] } Bytes`],
                    ],
                    widths: [90, 70, '*', '*'],
                },
                fontSize: 10,
                margin: [0, 10, 0, 0]
            });
            break;
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

    switch (testMeasurementMode) {
        case "Upload":
        case "Download":
            var testResults = testMeasurementMode == "Upload" ? normalTestResults :  reverseTestResults;
            content.push({
                table: {
                    body: [
                        [{ text: 'Test Conditions', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Mode', { text: testMeasurementMode }],
                        ['Direction', `${ testMeasurementMode == "Upload" ? 'Local to Remote' :  'Remote to Local' }`],
                        ['Window Size', `${ testResults["ACTUAL_RWND"] == null ? "---" : numeral(testResults["ACTUAL_RWND"]).format('0') } Bytes`],
                        ['Parallel Connections', testResults["PARALLEL_CONNECTIONS"] ?? "---"],
                        ['BDP', `${ testResults["BDP"] == null ? "---" : numeral(testResults["BDP"]).format('0') } bits`],
                        ['Path MTU', `${ testResults["MTU"] == null ? "---" : testResults["MTU"] } Bytes`],
                        ['Baseline RTT', `${ testResults["RTT"] == null ? "---" : numeral(testResults["RTT"]).format('0.000') } ms`],
                        ['CIR', `${ cir } Mbps`],

                        [{ text: 'TCP Throughput', colSpan: 2, fillColor: '#cccccc' }, {}],
                        ['Average', `${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"]).format('0.000') } Mbps`],
                        ['Ideal', `${ testResults["ACTUAL_IDEAL"] == null ? "---" : numeral(testResults["ACTUAL_IDEAL"]).format('0.000') } Mbps`],
                        ['Threshold', `${ testResults["THPT_AVG"] == null || testResults["ACTUAL_IDEAL"] == null ? "---" : numeral(testResults["THPT_AVG"] / testResults["ACTUAL_IDEAL"]).format('0.[000]%') } of Ideal`],

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
                        ['Minimum', `${ testResults["RTT"] == null ? "---" : numeral(testResults["RTT"]).format('0.000') } ms`],
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
        width: 300,
        alignment: "center"
    });
}


function windowScanTestPage(content, fromLocal = true) {
    var cir = $('#cir').val();

    content.push({
        text: 'WINDOW SCAN TEST',
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
    });

    content.push({
        text: `${ fromLocal ? 'Local to Remote' : 'Remote to Local' }`,
        fontSize: 12,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });

    var testResults = fromLocal ? normalTestResults : reverseTestResults;

    var windowSize1 = null;
    var windowSize2 = null;
    var windowSize3 = null;
    var windowSizeLength = 0;
    if (testResults["WND_SIZES"] != null) {
        windowSizeLength = testResults["WND_SIZES"].length;
        if (windowSizeLength = 1) {
            windowSize1 = testResults["WND_SIZES"][0];
        }
        if (windowSizeLength = 2) {
            windowSize2 = testResults["WND_SIZES"][1];
        }
        if (windowSizeLength = 3) {
            windowSize3 = testResults["WND_SIZES"][2];
        }
    }
    
    var averageThroughput1 = null;
    var averageThroughput2 = null;
    var averageThroughput3 = null;
    var averageThroughputLength = 0;
    if (testResults["WND_AVG_TCP"] != null) {
        averageThroughputLength = testResults["WND_AVG_TCP"].length;
        if (averageThroughputLength = 1) {
            averageThroughput1 = testResults["WND_AVG_TCP"][0];
        }
        if (averageThroughputLength = 2) {
            averageThroughput2 = testResults["WND_AVG_TCP"][1];
        }
        if (averageThroughputLength = 3) {
            averageThroughput3 = testResults["WND_AVG_TCP"][2];
        }
    }

    var idealThroughput1 = null;
    var idealThroughput2 = null;
    var idealThroughput3 = null;
    var idealThroughputLength = 0;
    if (testResults["WND_ACTUAL_IDEAL"] != null) {
        idealThroughputLength = testResults["WND_ACTUAL_IDEAL"].length;
        if (idealThroughputLength = 1) {
            idealThroughput1 = testResults["WND_ACTUAL_IDEAL"][0];
        }
        if (idealThroughputLength = 2) {
            idealThroughput2 = testResults["WND_ACTUAL_IDEAL"][1];
        }
        if (idealThroughputLength = 3) {
            idealThroughput3 = testResults["WND_ACTUAL_IDEAL"][2];
        }
    }

    var throughputEfficiency1 = null;
    var throughputEfficiency2 = null;
    var throughputEfficiency3 = null;
    var throughputEfficiencyLength = 0;
    if (testResults["EFF_PLOT"] != null) {
        throughputEfficiencyLength = testResults["EFF_PLOT"].length;
        if (throughputEfficiencyLength = 1) {
            throughputEfficiency1 = testResults["EFF_PLOT"][0];
        }
        if (ThroughputLength = 2) {
            throughputEfficiency2 = testResults["EFF_PLOT"][1];
        }
        if (ThroughputLength = 3) {
            throughputEfficiency3 = testResults["EFF_PLOT"][2];
        }
    }

    content.push({
        table: {
            body: [
                [{ text: 'Test Conditions', colSpan: 5, fillColor: '#cccccc' }, {}, {}, {}, {}],
                ['Mode', { text: testMeasurementMode, colSpan: 4 }, {}, {}, {}],
                ['Steps', '1', '2', '3', 'THPT'],
                [
                    'Window Size',
                    `${ windowSize1 == null ? "---" : numeral(windowSize1).format('0') } Bytes`,
                    `${ windowSize2 == null ? "---" : numeral(windowSize2).format('0') } Bytes`,
                    `${ windowSize3 == null ? "---" : numeral(windowSize3).format('0') } Bytes`,
                    `${ testResults["ACTUAL_RWND"] == null ? "---" : numeral(testResults["ACTUAL_RWND"] ).format('0')} Bytes`
                ],
                [
                    'Average TCP Throughput',
                    `${ averageThroughput1 == null ? "---" : numeral(averageThroughput1).format('0.000') } Mbps`,
                    `${ averageThroughput2 == null ? "---" : numeral(averageThroughput2).format('0.000') } Mbps`,
                    `${ averageThroughput3 == null ? "---" : numeral(averageThroughput3).format('0.000') } Mbps`,
                    `${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"] ).format('0.000')} Mbps`
                ],
                [
                    'Ideal TCP Throughput',
                    `${ idealThroughput1 == null ? "---" : numeral(idealThroughput1).format('0.000') } Mbps`,
                    `${ idealThroughput2 == null ? "---" : numeral(idealThroughput2).format('0.000') } Mbps`,
                    `${ idealThroughput3 == null ? "---" : numeral(idealThroughput3).format('0.000') } Mbps`,
                    `${ testResults["ACTUAL_IDEAL"] == null ? "---" : numeral(testResults["ACTUAL_IDEAL"] ).format('0.000')} Mbps`
                ],
                [
                    'TCP Efficiency',
                    `${ throughputEfficiency1 == null ? "---" : numeral(throughputEfficiency1).format('0.000%') }`,
                    `${ throughputEfficiency2 == null ? "---" : numeral(throughputEfficiency2).format('0.000%') }`,
                    `${ throughputEfficiency3 == null ? "---" : numeral(throughputEfficiency3).format('0.000%') }`,
                    `${ testResults["TCP_EFF"] == null ? "---" : numeral(testResults["TCP_EFF"]).format('0.000%')}`
                ],
                ['BDP', { text: `${ testResults["BDP"] == null ? "---" : testResults["BDP"] } bits`, colSpan: 4 }, {}, {}, {}],
                ['Path MTU', { text: `${ testResults["MTU"] == null ? "---" : testResults["MTU"] } Bytes`, colSpan: 4 }, {}, {}, {}],
                ['Baseline RTT', { text: `${ testResults["RTT"] == null ? "---" : testResults["RTT"] } ms`, colSpan: 4 }, {}, {}, {}],
                ['CIR', { text: `${ cir } Mbps`, colSpan: 4 }, {}, {}, {}],

                [{ text: 'TCP Thoughput', colSpan: 5, fillColor: '#cccccc' }, {}, {}, {}, {}],
                ['Average', { text: `${ testResults["THPT_AVG"] == null ? "---" : numeral(testResults["THPT_AVG"]).format('0.000') } Mbps`, colSpan: 4 }, {}, {}, {}],
                ['Ideal', { text: `${ testResults["ACTUAL_IDEAL"] == null ? "---" :  numeral(testResults["ACTUAL_IDEAL"]).format('0.000') } Mbps`, colSpan: 4 }, {}, {}, {}],

                [{ text: 'Data Transfer', colSpan: 5, fillColor: '#cccccc' }, {}, {}, {}, {}],
                ['TCP Efficiency', { text: testResults["TCP_EFF"] == null ? "---" : numeral(testResults["TCP_EFF"]).format('0.[000]%'), colSpan: 4 }, {}, {}, {}],

                [{ text: 'RTT', colSpan: 5, fillColor: '#cccccc' }, {}, {}, {}, {}],
                ['Average', { text: testResults["RTT"] == null ? "---" :  `${ numeral(testResults["RTT"]).format('0.000') } ms`, colSpan: 4 }, {}, {}, {}],
            ],
            widths: ['*', '*', '*', '*', '*'],
        },
        fontSize: 10,
        margin: [0, 0, 0, 20],
    });

    content.push({
        text: `Window Scan Graph: ${ fromLocal ? 'Local to Remote' : 'Remote to Local' }`,
        fontSize: 11,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10],
    });
    
    content.push({
        image: (fromLocal ? windowsScanLocalToRemoteChart : windowsScanRemoteToLocalChart) ?? emptyImageURI,
        width: 300,
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

    var mode = $('#btnSaveAsPdf').data('test-mode');
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

    var fileName = `netmesh-test-results-${testMeasurementMode.toLowerCase()}-${"agent1"}-${timestampCondensed}`;
    var documentName = `NTC NetMesh Test Measurement Results (${testModeProperName}) - ${"agent1"} - ${timestampKebab}`;

    var dd = {};

    dd.footer = function (currentPage, pageCount) {
        return {
            columns: [
                {
                    text: loggedUsername,
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
        author: loggedUsername, // TODO: MAKE THIS AN ACTUAL USER
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
    // pdfMake.fonts = {
    //     Helvetica: {
    //         normal: 'Helvetica',
    //         bold: 'Helvetica-Bold',
    //         italics: 'Helvetica-Oblique',
    //         bolditalics: 'Helvetica-BoldOblique'
    //       },
    // };

    // var dd = {
    //     // header: {

    //     // }
    //     content: [
            
    //         // {
    //         //     text: 'DOCUMENT INFORMATION',
    //         //     fontSize: 12,
    //         //     bold: true,
    //         //     alignment: 'center',
    //         //     margin: [0, 20, 0, 0],
    //         // },
    //         // {
    //         //     table: {
    //         //         body: [
    //         //             [{ text: 'Report Name', bold: true, fillColor: '#cccccc' }, 'RFC-6349 Test'],
    //         //             [{ text: 'File Name', bold: true, fillColor: '#cccccc' }, fileName],
    //         //         ],
    //         //         widths: [80, 320],
    //         //         alignment: 'center'
    //         //     },
    //         //     fontSize: 10,
    //         //     margin: [0, 10, 0, 0]
    //         // },
    //         // {
    //         //     text: '',
    //         //     pageBreak: 'after'
    //         // },

    //         // {
    //         //     columns: [
    //         //         {
    //         //             text: 'Committed information rate:',
    //         //             width: 'auto',
    //         //             margin: [0, 0, 5, 0],
    //         //         },
    //         //         {
    //         //             text: `${reverseTestResults["CIR"]} Mbps`,
    //         //             bold: true,
    //         //             width: 'auto'
    //         //         }
    //         //     ],
    //         //     margin: [0, 20, 0, 0],
    //         // },
    //         // {
    //         //     text: testModeProperName.toUpperCase(),
    //         //     fontSize: 11,
    //         //     margin: [0, 10, 0, 0],
    //         // },
    //         // {
    //         //     table: {
    //         //         body: [
    //         //             ['MTU', reverseTestResults["MTU"]],
    //         //             ['RTT', reverseTestResults["RTT"]],
    //         //             ['BB', reverseTestResults["BB"]],
    //         //             ['BDP', reverseTestResults["BDP"]],
    //         //             ['TCP RWND', reverseTestResults["RWND"]],
    //         //             ['Average TCP Throughput', reverseTestResults["THPT_AVG"]],
    //         //             ['Ideal TCP Throughput', reverseTestResults["THPT_IDEAL"]],
    //         //             ['Average Transfer Time', reverseTestResults["TRANSFER_AVG"]],
    //         //             ['Ideal Transfer Time', reverseTestResults["TRANSFER_IDEAL"]],
    //         //             ['TCP TTR', reverseTestResults["TCP_TTR"]],
    //         //             ['Transmitted Bytes', reverseTestResults["TRANS_BYTES"]],
    //         //             ['Retransmitted Bytes', reverseTestResults["RETX_BYTES"]],
    //         //             ['TCP Efficiency', reverseTestResults["TCP_EFF"]],
    //         //             ['Average RTT', reverseTestResults["AVE_RTT"]],
    //         //             ['Buffer Delay', reverseTestResults["BUF_DELAY"]],
    //         //         ]
    //         //     },
    //         //     layout: 'lightHorizontalLines',
    //         //     margin: [0, 5, 0, 15],
    //         //     fontSize: 11
    //         // },
    //     ],
    // }

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


$(function () {
    $('#net_type').val("Fixed Wireless");
    $('#cir').val(10);
    $('#lat').val(14.811390);
    $('#lon').val(120.521248);
    // $('#lat').val(14.647132);
    // $('#lon').val(121.072027);

    // generateTestResultsPdfReport();
});
