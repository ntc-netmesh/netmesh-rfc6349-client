const testDirections = {
  "upload": {
    name: "upload",
    mode: "normal",
    titleCase: "Upload",
  },
  "download": {
    name: "download",
    mode: "reverse",
    titleCase: "Download",
  },
}

const testModes = {
  "normal": {
    name: "normal",
    titleCase: "Normal",
    directions: ["upload"]
  },
  "reverse": {
    name: "reverse",
    titleCase: "Reverse",
    directions: ["download"]
  },
  "bidirectional": {
    name: "bidirectional",
    titleCase: "Bidirectional",
    directions: ["download", "upload"]
  }
};

const networkConnectionTypes = {
  "Ethernet": {
    prefix: "en"
  },
  "Wi-Fi": {
    prefix: "wlp"
  },
};

const measurementProcesses = [
  {
    processId: 'mtu',
    label: 'MTU test',
  },
  {
    processId: 'rtt',
    label: 'RTT test',
  },
  {
    processId: 'bdp',
    label: 'BDP test',
  },
  {
    processId: 'thpt',
    label: 'Throughput test',
  },
];

let _throughputChartImgURI = {
  upload: '',
  download: ''
};
let _transferChartImgURI = {
  upload: '',
  download: ''
};

let _cir, _netType, _mode, _lon, _lat;
let _netTypeName, _testServer;
let _testStartedOnText, _testFinishedOnText, _testDurationText;