var testMeasurementMode = "";
var testStartedAt = null;
var testFinishedAt = null;
var loggedUsername = "username";

var normalTestResults = {};
var reverseTestResults = {};

var emptyImageURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
var chartPromises = [];
var windowsScanLocalToRemoteChart = null;
var windowsScanRemoteToLocalChart = null;
var throughputEfficiencyLocalToRemoteChart = null;
var throughputEfficiencyRemoteToLocalChart = null;

var measurementTimer;