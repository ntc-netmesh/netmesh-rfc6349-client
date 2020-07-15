var testMeasurementMode = ""; // "Upload" or "Download"
var testStartedAt = null;
var testFinishedAt = null;
var loggedUsername = "";

var normalTestResults = {};
var reverseTestResults = {};

var emptyImageURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
var chartPromises = [];
var windowsScanLocalToRemoteChart = null;
var windowsScanRemoteToLocalChart = null;
var throughputEfficiencyLocalToRemoteChart = null;
var throughputEfficiencyRemoteToLocalChart = null;

var measurementTimer;

// var testMeasurementMode = "Download";
// var testStartedAt = null;
// var testFinishedAt = null;
// var loggedUsername = "";

// var normalTestResults = {};
// var reverseTestResults = {'MTU': '1500', 'RTT': '20.71111', 'BB': 12.0, 'BDP': 31066, 'MSS': 1460, 'RWND': 32120, 'PARALLEL_CONNECTIONS': '2', 'ACTUAL_RWND': 26280, 'WND_SIZES': [8030.0, 16060.0, 24090.0], 'WND_AVG_TCP': [1.68, 5.68, 5.71], 'WND_IDEAL_TCP': [3.1017169045985464, 6.203433809197093, 9.305150713795637], 'THPT_AVG': 7.41, 'THPT_IDEAL': 12.406867618394186, 'TRANSFER_AVG': 10.0, 'TRANSFER_IDEAL': 5.693620837484433, 'TCP_TTR': 1.7563515881078973, 'SPEED_PLOT': [], 'TRANS_BYTES': 9706988, 'RETX_BYTES': 54, 'TCP_EFF': 0.9999944369973467, 'AVE_RTT': 54.89875, 'BUF_DELAY': -0.9973493089135838};

// var emptyImageURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
// var chartPromises = [];
// var windowsScanLocalToRemoteChart = null;
// var windowsScanRemoteToLocalChart = null;
// var throughputEfficiencyLocalToRemoteChart = null;
// var throughputEfficiencyRemoteToLocalChart = null;

// var measurementTimer;