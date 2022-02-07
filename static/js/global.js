const MEASUREMENT_TIMEOUT = 5 /*minutes*/ * 60 * 1000;

const TEST_METHODS = Object.freeze({
  "upload": Object.freeze({
    name: "upload",
    mode: "normal",
    titleCase: "Upload",
  }),
  "download": Object.freeze({
    name: "download",
    mode: "reverse",
    titleCase: "Download",
  }),
});

const TEST_MODES = Object.freeze({
  "normal": Object.freeze({
    name: "normal",
    titleCase: "Normal",
    methods: ["upload"]
  }),
  "reverse": Object.freeze({
    name: "reverse",
    titleCase: "Reverse",
    methods: ["download"]
  }),
  "bidirectional": Object.freeze({
    name: "bidirectional",
    titleCase: "Bidirectional",
    methods: ["download", "upload"]
  })
});

const NETWORK_CONNECTION_TYPES = Object.freeze({
  "Ethernet": Object.freeze({
    prefix: "en"
  }),
  "Wi-Fi": Object.freeze({
    prefix: "wlp"
  }),
});

const MEASUREMENT_PROCESSES = Object.freeze([
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
]);

const APP_STATE = Object.freeze({
  Ready: 'Ready',
  Testing: 'Testing',
  TestFinished: 'TestFinished',
});

const chartImageUris = {
  throughputCharts: {},
  transferCharts: {},
  rttCharts: {}
};

const testInputs = {
  isr: null,
  testServer: null,
  networkConnectionTypeName: null,
  get networkConnectionType() {
    return NETWORK_CONNECTION_TYPES[this.networkConnectionTypeName];
  },
  modeName: null,
  get mode() {
    return TEST_MODES[this.modeName];
  },
  lon: null,
  lat: null,
  get coordinates() {
    return `${this.lon}, ${this.lat}`;
  },
};

const testTime = {
  startedOn: '',
  finishedOn: '',
  duration: ''
}

const testClient = {
  isp: ''
}

// let _throughputChartImgURI = {
//   upload: '',
//   download: ''
// };
// let _transferChartImgURI = {
//   upload: '',
//   download: ''
// };

// let _cir, _netType, _mode, _lon, _lat;
// let _netTypeName, _testServer;
// let _testStartedOnText, _testFinishedOnText, _testDurationText;