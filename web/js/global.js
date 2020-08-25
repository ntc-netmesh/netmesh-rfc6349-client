var testMeasurementMode = ""; // "Upload" or "Download"
var testStartedAt = null;
var testFinishedAt = null;
var loggedUsername = "";

var normalTestResults = {};
var reverseTestResults = {};
var isSendingResultsFailed = false;

var test_latitude = 0;
var test_longitude = 0;

const emptyImageURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
var chartPromises = [];
var windowsScanLocalToRemoteChart = emptyImageURI;
var windowsScanRemoteToLocalChart = emptyImageURI;
var throughputEfficiencyLocalToRemoteChart = emptyImageURI;
var throughputEfficiencyRemoteToLocalChart = emptyImageURI;

var measurementTimer;

// var testMeasurementMode = "Download";
// var testStartedAt = null;
// var testFinishedAt = null;
// var loggedUsername = "";

// var normalTestResults = {'MTU': '', 'RTT': null, 'BB': 12.0, 'BDP': 1700, 'MSS': 1460, 'RWND': 2920, 'PARALLEL_CONNECTIONS': '2', 'ACTUAL_RWND': 1460, 'WND_SIZES': [730.0, 1460.0, 2190.0], };
// var reverseTestResults = {'MTU': '', 'RTT': null, 'BB': 12.0, 'BDP': 1700, 'MSS': 1460, 'RWND': 2920, 'PARALLEL_CONNECTIONS': '2', 'ACTUAL_RWND': 1460, 'WND_SIZES': [730.0, 1460.0, 2190.0], }

// var emptyImageURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
// var chartPromises = [];
// var windowsScanLocalToRemoteChart = null;
// var windowsScanRemoteToLocalChart = null;
// var throughputEfficiencyLocalToRemoteChart = null;
// var throughputEfficiencyRemoteToLocalChart = null;

// var measurementTimer;
