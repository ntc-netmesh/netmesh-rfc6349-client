

const MEASUREMENT_TIMEOUT = 5 /*minutes*/ * 60 * 1000;
const BLANK_IMAGE_ENCODED = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

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
    methods: Object.freeze(["upload"])
  }),
  "reverse": Object.freeze({
    name: "reverse",
    titleCase: "Reverse",
    methods: Object.freeze(["download"])
  }),
  "bidirectional": Object.freeze({
    name: "bidirectional",
    titleCase: "Bidirectional",
    methods: Object.freeze(["download", "upload"])
  })
});

const NETWORK_CONNECTION_TYPES = Object.freeze({
  "Ethernet": Object.freeze({
    prefix: "enx"
  }),
  "Wi-Fi": Object.freeze({
    prefix: "wlp"
  }),
});

const MEASUREMENT_PROCESSES = Object.freeze([
  Object.freeze({
    processId: 'mtu',
    label: 'MTU test',
  }),
  Object.freeze({
    processId: 'rtt',
    label: 'RTT test',
  }),
  Object.freeze({
    processId: 'bdp',
    label: 'BDP test',
  }),
  Object.freeze({
    processId: 'thpt',
    label: 'Throughput test',
  }),
  Object.freeze({
    processId: 'analysis',
    label: 'Throughput analysis',
  }),
]);

const APP_STATE = Object.freeze({
  Ready: 'Ready',
  Testing: 'Testing',
  TestFinished: 'TestFinished',
});

const testInputs = Object.seal({
  isr: null,
  testServer: null,
  networkConnectionTypeName: null,
  modeName: null,
  location: {
    lat: null,
    lon: null,
    name: null,
    reverseGeoLicense: "",
  },
  mapImage: {
    dataUri: null,
    width: 0,
    height: 0,
  },
  get networkConnectionType() {
    return NETWORK_CONNECTION_TYPES[this.networkConnectionTypeName];
  },
  get mode() {
    return TEST_MODES[this.modeName];
  },
  get coordinates() {
    const latDirection = this.location.lat >= 0 ? "N" : "S";
    const lonDirection = this.location.lon >= 0 ? "E" : "W";
    return `${this.location.lat}°${latDirection}, ${this.location.lon}°${lonDirection}`;
  },
});
