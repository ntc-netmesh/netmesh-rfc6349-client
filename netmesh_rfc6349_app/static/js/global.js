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

// const NETWORK_CONNECTION_TYPES = Object.freeze({
//   "Ethernet": Object.freeze({
//     prefix: "enx"
//   }),
//   "Wi-Fi": Object.freeze({
//     prefix: "wlp"
//   }),
// });

const MEASUREMENT_PROCESSES = Object.freeze([
  Object.freeze({
    processId: 'verify-test',
    label: 'Test server connection',
  }),
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
  Object.freeze({
    processId: 'finish-test',
    label: 'Results',
  }),
]);

const APP_STATE = Object.freeze({
  Ready: 'Ready',
  Testing: 'Testing',
  TestFinished: 'TestFinished',
});

// const testInputs = Object.seal({
//   isr: null,
//   testServer: null,
//   ethernetName: null,
//   modeName: null,
//   location: {
//     lat: null,
//     lon: null,
//     name: null,
//     reverseGeoLicense: "",
//   },
//   mapImage: {
//     dataUri: null,
//     width: 0,
//     height: 0,
//   },
//   get networkConnectionTypeName() {
//     return "Ethernet";
//   },
//   get mode() {
//     return TEST_MODES[this.modeName];
//   },
//   get coordinates() {
//     const latDirection = this.location.lat >= 0 ? "N" : "S";
//     const lonDirection = this.location.lon >= 0 ? "E" : "W";
//     return `${this.location.lat}°${latDirection}, ${this.location.lon}°${lonDirection}`;
//   },
// });

const NETMESH_COLORS = Object.freeze({
  ntcBlueColor: '#0038a7',
  ntcRedColor: '#CE1127',
  greenColor: '#38A700',
  uploadColor: '#4824FF',
  downloadColor: '#008ca7'
});

const TR = [
  {
    "download": {
      "startedOn": 1658987257692,
      "endedOn": 1658987313567,
      "mtuDuration": [
        1658987257698,
        1658987258070
      ],
      "rttDuration": [
        1658987258077,
        1658987272580
      ],
      "bdpDuration": [
        1658987277707,
        1658987292912
      ],
      "thptDuration": [
        1658987298055,
        1658987313417
      ],
      "analysisDuration": [
        1658987313420,
        1658987313567
      ],
      "results": {
        "ave_rtt": 1.359,
        "bb": 711,
        "bdp": 550811,
        "buf_del": 75.42274428811152,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 60000,
        "rtt": 0.7747,
        "rwnd": 68,
        "tcp_eff": 99.95221673571241,
        "tcp_ttr": 0.995484672657881,
        "thpt_avg": 100.05197218365481,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.04535808,
        "tx_bytes": 126,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987314393,
      "endedOn": 1658987369769,
      "mtuDuration": [
        1658987314400,
        1658987314667
      ],
      "rttDuration": [
        1658987314671,
        1658987328976
      ],
      "bdpDuration": [
        1658987334103,
        1658987349246
      ],
      "thptDuration": [
        1658987354382,
        1658987369627
      ],
      "analysisDuration": [
        1658987369629,
        1658987369769
      ],
      "results": {
        "ave_rtt": 0.941,
        "bb": 357,
        "bdp": 262466,
        "buf_del": 27.992383025027202,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7352,
        "rwnd": 32,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92974248384118,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987370527,
      "endedOn": 1658987426036,
      "mtuDuration": [
        1658987370531,
        1658987370885
      ],
      "rttDuration": [
        1658987370890,
        1658987385219
      ],
      "bdpDuration": [
        1658987390340,
        1658987405531
      ],
      "thptDuration": [
        1658987410632,
        1658987425891
      ],
      "analysisDuration": [
        1658987425893,
        1658987426036
      ],
      "results": {
        "ave_rtt": 1.366,
        "bb": 801,
        "bdp": 645525,
        "buf_del": 69.49993795756299,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 106500,
        "rtt": 0.8059,
        "rwnd": 80,
        "tcp_eff": 99.91482908620775,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02746856509987,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987426894,
      "endedOn": 1658987482508,
      "mtuDuration": [
        1658987426902,
        1658987427159
      ],
      "rttDuration": [
        1658987427161,
        1658987441536
      ],
      "bdpDuration": [
        1658987446699,
        1658987462004
      ],
      "thptDuration": [
        1658987467126,
        1658987482360
      ],
      "analysisDuration": [
        1658987482362,
        1658987482508
      ],
      "results": {
        "ave_rtt": 0.938,
        "bb": 373,
        "bdp": 279488,
        "buf_del": 25.18350460429734,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7493,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0010131855058415,
        "thpt_avg": 99.89929348639677,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.9898784,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987483426,
      "endedOn": 1658987539088,
      "mtuDuration": [
        1658987483432,
        1658987483736
      ],
      "rttDuration": [
        1658987483739,
        1658987498193
      ],
      "bdpDuration": [
        1658987503347,
        1658987518476
      ],
      "thptDuration": [
        1658987523593,
        1658987538941
      ],
      "analysisDuration": [
        1658987538943,
        1658987539088
      ],
      "results": {
        "ave_rtt": 1.359,
        "bb": 829,
        "bdp": 674391,
        "buf_del": 67.0559311616472,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 100500,
        "rtt": 0.8135,
        "rwnd": 84,
        "tcp_eff": 99.91987939912323,
        "tcp_ttr": 0.996524886526907,
        "thpt_avg": 100.02398532923013,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.03487232,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987539985,
      "endedOn": 1658987595469,
      "mtuDuration": [
        1658987539992,
        1658987540221
      ],
      "rttDuration": [
        1658987540222,
        1658987554533
      ],
      "bdpDuration": [
        1658987559712,
        1658987574857
      ],
      "thptDuration": [
        1658987579981,
        1658987595326
      ],
      "analysisDuration": [
        1658987595330,
        1658987595469
      ],
      "results": {
        "ave_rtt": 0.949,
        "bb": 365,
        "bdp": 295358,
        "buf_del": 17.276322293623323,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 1500,
        "rtt": 0.8092,
        "rwnd": 36,
        "tcp_eff": 99.99879915091323,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92921285662972,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987596323,
      "endedOn": 1658987651855,
      "mtuDuration": [
        1658987596326,
        1658987596618
      ],
      "rttDuration": [
        1658987596620,
        1658987610994
      ],
      "bdpDuration": [
        1658987616117,
        1658987631268
      ],
      "thptDuration": [
        1658987636390,
        1658987651704
      ],
      "analysisDuration": [
        1658987651712,
        1658987651855
      ],
      "results": {
        "ave_rtt": 1.296,
        "bb": 773,
        "bdp": 643290,
        "buf_del": 55.731795241528474,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 138000,
        "rtt": 0.8322,
        "rwnd": 80,
        "tcp_eff": 99.8896376891706,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02235776401962,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987652706,
      "endedOn": 1658987708156,
      "mtuDuration": [
        1658987652715,
        1658987652962
      ],
      "rttDuration": [
        1658987652967,
        1658987667283
      ],
      "bdpDuration": [
        1658987672444,
        1658987687627
      ],
      "thptDuration": [
        1658987692760,
        1658987708006
      ],
      "analysisDuration": [
        1658987708012,
        1658987708156
      ],
      "results": {
        "ave_rtt": 0.932,
        "bb": 364,
        "bdp": 278605,
        "buf_del": 21.766396655343623,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7654,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92993235156705,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987709033,
      "endedOn": 1658987764715,
      "mtuDuration": [
        1658987709037,
        1658987709399
      ],
      "rttDuration": [
        1658987709402,
        1658987723836
      ],
      "bdpDuration": [
        1658987728992,
        1658987744139
      ],
      "thptDuration": [
        1658987749243,
        1658987764571
      ],
      "analysisDuration": [
        1658987764574,
        1658987764715
      ],
      "results": {
        "ave_rtt": 1.41,
        "bb": 746,
        "bdp": 602395,
        "buf_del": 74.61300309597523,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 258000,
        "rtt": 0.8075,
        "rwnd": 75,
        "tcp_eff": 99.7938865142343,
        "tcp_ttr": 0.9986118496400523,
        "thpt_avg": 100.01084410328164,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.0139008,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987765510,
      "endedOn": 1658987821083,
      "mtuDuration": [
        1658987765526,
        1658987765761
      ],
      "rttDuration": [
        1658987765764,
        1658987780222
      ],
      "bdpDuration": [
        1658987785426,
        1658987800590
      ],
      "thptDuration": [
        1658987805684,
        1658987820952
      ],
      "analysisDuration": [
        1658987820954,
        1658987821083
      ],
      "results": {
        "ave_rtt": 0.958,
        "bb": 352,
        "bdp": 286035,
        "buf_del": 17.89318237755353,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.8126,
        "rwnd": 35,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92914290628565,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987821932,
      "endedOn": 1658987877526,
      "mtuDuration": [
        1658987821935,
        1658987822264
      ],
      "rttDuration": [
        1658987822267,
        1658987836722
      ],
      "bdpDuration": [
        1658987841858,
        1658987856986
      ],
      "thptDuration": [
        1658987862116,
        1658987877380
      ],
      "analysisDuration": [
        1658987877383,
        1658987877526
      ],
      "results": {
        "ave_rtt": 1.39,
        "bb": 782,
        "bdp": 563352,
        "buf_del": 92.94836202109936,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 156000,
        "rtt": 0.7204,
        "rwnd": 70,
        "tcp_eff": 99.87524260514937,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02536817267443,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987878389,
      "endedOn": 1658987933969,
      "mtuDuration": [
        1658987878400,
        1658987878649
      ],
      "rttDuration": [
        1658987878655,
        1658987893100
      ],
      "bdpDuration": [
        1658987898304,
        1658987913453
      ],
      "thptDuration": [
        1658987918564,
        1658987933812
      ],
      "analysisDuration": [
        1658987933814,
        1658987933969
      ],
      "results": {
        "ave_rtt": 0.955,
        "bb": 368,
        "bdp": 244131,
        "buf_del": 43.95538136870666,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.6634,
        "rwnd": 30,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92908294892581,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658987934868,
      "endedOn": 1658987990417,
      "mtuDuration": [
        1658987934872,
        1658987935159
      ],
      "rttDuration": [
        1658987935162,
        1658987949570
      ],
      "bdpDuration": [
        1658987954687,
        1658987969868
      ],
      "thptDuration": [
        1658987974979,
        1658987990263
      ],
      "analysisDuration": [
        1658987990265,
        1658987990417
      ],
      "results": {
        "ave_rtt": 1.361,
        "bb": 787,
        "bdp": 589069,
        "buf_del": 81.83032732130927,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 205500,
        "rtt": 0.7485,
        "rwnd": 73,
        "tcp_eff": 99.83563130631887,
        "tcp_ttr": 0.9998095722696273,
        "thpt_avg": 100.0093754933898,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00190464,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658987991256,
      "endedOn": 1658988047814,
      "mtuDuration": [
        1658987991266,
        1658987991529
      ],
      "rttDuration": [
        1658987991532,
        1658988006986
      ],
      "bdpDuration": [
        1658988012139,
        1658988027282
      ],
      "thptDuration": [
        1658988032428,
        1658988047675
      ],
      "analysisDuration": [
        1658988047677,
        1658988047814
      ],
      "results": {
        "ave_rtt": 0.92,
        "bb": 367,
        "bdp": 275045,
        "buf_del": 22.757671020116252,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.749444,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92947267305082,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988048629,
      "endedOn": 1658988104173,
      "mtuDuration": [
        1658988048633,
        1658988048939
      ],
      "rttDuration": [
        1658988048941,
        1658988063377
      ],
      "bdpDuration": [
        1658988068491,
        1658988083625
      ],
      "thptDuration": [
        1658988088750,
        1658988104023
      ],
      "analysisDuration": [
        1658988104025,
        1658988104173
      ],
      "results": {
        "ave_rtt": 1.369,
        "bb": 764,
        "bdp": 601497,
        "buf_del": 73.88543122062747,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 121500,
        "rtt": 0.7873,
        "rwnd": 75,
        "tcp_eff": 99.90283318285672,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02605829188418,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988105004,
      "endedOn": 1658988160435,
      "mtuDuration": [
        1658988105015,
        1658988105285
      ],
      "rttDuration": [
        1658988105291,
        1658988119634
      ],
      "bdpDuration": [
        1658988124765,
        1658988139917
      ],
      "thptDuration": [
        1658988145039,
        1658988160279
      ],
      "analysisDuration": [
        1658988160282,
        1658988160435
      ],
      "results": {
        "ave_rtt": 0.934,
        "bb": 365,
        "bdp": 277619,
        "buf_del": 22.7977912174599,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7606,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92984241413328,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988161292,
      "endedOn": 1658988216914,
      "mtuDuration": [
        1658988161296,
        1658988161636
      ],
      "rttDuration": [
        1658988161641,
        1658988175965
      ],
      "bdpDuration": [
        1658988181066,
        1658988196211
      ],
      "thptDuration": [
        1658988201348,
        1658988216699
      ],
      "analysisDuration": [
        1658988216704,
        1658988216914
      ],
      "results": {
        "ave_rtt": 1.366,
        "bb": 762,
        "bdp": 612648,
        "buf_del": 69.90049751243781,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 229500,
        "rtt": 0.804,
        "rwnd": 76,
        "tcp_eff": 99.81703803083366,
        "tcp_ttr": 0.996524886526907,
        "thpt_avg": 100.05752578271458,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.03487232,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988217797,
      "endedOn": 1658988273371,
      "mtuDuration": [
        1658988217806,
        1658988218067
      ],
      "rttDuration": [
        1658988218069,
        1658988232517
      ],
      "bdpDuration": [
        1658988237630,
        1658988252872
      ],
      "thptDuration": [
        1658988257971,
        1658988273239
      ],
      "analysisDuration": [
        1658988273241,
        1658988273371
      ],
      "results": {
        "ave_rtt": 0.932,
        "bb": 358,
        "bdp": 262879,
        "buf_del": 26.92360070815744,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7343,
        "rwnd": 32,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92952263790207,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988274295,
      "endedOn": 1658988329726,
      "mtuDuration": [
        1658988274303,
        1658988274608
      ],
      "rttDuration": [
        1658988274613,
        1658988288904
      ],
      "bdpDuration": [
        1658988294029,
        1658988309177
      ],
      "thptDuration": [
        1658988314276,
        1658988329573
      ],
      "analysisDuration": [
        1658988329576,
        1658988329726
      ],
      "results": {
        "ave_rtt": 1.414,
        "bb": 807,
        "bdp": 631074,
        "buf_del": 80.81841432225062,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 156000,
        "rtt": 0.782,
        "rwnd": 78,
        "tcp_eff": 99.87563369416145,
        "tcp_ttr": 0.996524886526907,
        "thpt_avg": 99.99949496373814,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.03487232,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988330559,
      "endedOn": 1658988386012,
      "mtuDuration": [
        1658988330573,
        1658988330831
      ],
      "rttDuration": [
        1658988330834,
        1658988345193
      ],
      "bdpDuration": [
        1658988350294,
        1658988365537
      ],
      "thptDuration": [
        1658988370634,
        1658988385873
      ],
      "analysisDuration": [
        1658988385876,
        1658988386012
      ],
      "results": {
        "ave_rtt": 0.893,
        "bb": 361,
        "bdp": 288114,
        "buf_del": 11.890740508708179,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7981,
        "rwnd": 36,
        "tcp_eff": 100,
        "tcp_ttr": 1.0008042943695614,
        "thpt_avg": 99.9192455149425,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99196352,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988386892,
      "endedOn": 1658988442498,
      "mtuDuration": [
        1658988386901,
        1658988387276
      ],
      "rttDuration": [
        1658988387278,
        1658988401665
      ],
      "bdpDuration": [
        1658988406810,
        1658988421933
      ],
      "thptDuration": [
        1658988427048,
        1658988442332
      ],
      "analysisDuration": [
        1658988442334,
        1658988442498
      ],
      "results": {
        "ave_rtt": 1.451,
        "bb": 771,
        "bdp": 559283,
        "buf_del": 100.02757099531291,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 106500,
        "rtt": 0.7254,
        "rwnd": 69,
        "tcp_eff": 99.91482908620775,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.0266283975445,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988443313,
      "endedOn": 1658988498761,
      "mtuDuration": [
        1658988443324,
        1658988443569
      ],
      "rttDuration": [
        1658988443596,
        1658988457935
      ],
      "bdpDuration": [
        1658988463040,
        1658988478215
      ],
      "thptDuration": [
        1658988483379,
        1658988498606
      ],
      "analysisDuration": [
        1658988498609,
        1658988498761
      ],
      "results": {
        "ave_rtt": 0.935,
        "bb": 359,
        "bdp": 281994,
        "buf_del": 19.03246339910886,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7855,
        "rwnd": 35,
        "tcp_eff": 100,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.03498069033972,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988499643,
      "endedOn": 1658988555327,
      "mtuDuration": [
        1658988499649,
        1658988499963
      ],
      "rttDuration": [
        1658988499967,
        1658988514374
      ],
      "bdpDuration": [
        1658988519508,
        1658988534753
      ],
      "thptDuration": [
        1658988539855,
        1658988555178
      ],
      "analysisDuration": [
        1658988555181,
        1658988555327
      ],
      "results": {
        "ave_rtt": 1.27,
        "bb": 764,
        "bdp": 613797,
        "buf_del": 58.07816778690565,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 342000,
        "rtt": 0.8034,
        "rwnd": 76,
        "tcp_eff": 99.72677979793848,
        "tcp_ttr": 0.9986118496400523,
        "thpt_avg": 100.09655705015503,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.0139008,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988556187,
      "endedOn": 1658988611709,
      "mtuDuration": [
        1658988556196,
        1658988556444
      ],
      "rttDuration": [
        1658988556447,
        1658988570840
      ],
      "bdpDuration": [
        1658988576010,
        1658988591142
      ],
      "thptDuration": [
        1658988596251,
        1658988611576
      ],
      "analysisDuration": [
        1658988611579,
        1658988611709
      ],
      "results": {
        "ave_rtt": 0.923,
        "bb": 364,
        "bdp": 265574,
        "buf_del": 26.507675438596497,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7296,
        "rwnd": 33,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.9295526168368,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988612681,
      "endedOn": 1658988668421,
      "mtuDuration": [
        1658988612686,
        1658988612973
      ],
      "rttDuration": [
        1658988612976,
        1658988627435
      ],
      "bdpDuration": [
        1658988632569,
        1658988647746
      ],
      "thptDuration": [
        1658988652878,
        1658988668210
      ],
      "analysisDuration": [
        1658988668212,
        1658988668421
      ],
      "results": {
        "ave_rtt": 1.295,
        "bb": 810,
        "bdp": 516942,
        "buf_del": 102.9144468818552,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 75000,
        "rtt": 0.6382,
        "rwnd": 64,
        "tcp_eff": 99.94020850680837,
        "tcp_ttr": 0.996524886526907,
        "thpt_avg": 99.99893691855259,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.03487232,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988669278,
      "endedOn": 1658988724773,
      "mtuDuration": [
        1658988669288,
        1658988669525
      ],
      "rttDuration": [
        1658988669529,
        1658988683910
      ],
      "bdpDuration": [
        1658988689050,
        1658988704283
      ],
      "thptDuration": [
        1658988709398,
        1658988724627
      ],
      "analysisDuration": [
        1658988724629,
        1658988724773
      ],
      "results": {
        "ave_rtt": 0.99,
        "bb": 369,
        "bdp": 276122,
        "buf_del": 32.29987972738207,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7483,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92903298451424,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988725677,
      "endedOn": 1658988781194,
      "mtuDuration": [
        1658988725683,
        1658988725961
      ],
      "rttDuration": [
        1658988725965,
        1658988740348
      ],
      "bdpDuration": [
        1658988745504,
        1658988760647
      ],
      "thptDuration": [
        1658988765776,
        1658988781055
      ],
      "analysisDuration": [
        1658988781058,
        1658988781194
      ],
      "results": {
        "ave_rtt": 1.374,
        "bb": 759,
        "bdp": 554297,
        "buf_del": 88.14185950979052,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 172500,
        "rtt": 0.7303,
        "rwnd": 69,
        "tcp_eff": 99.86204711146326,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02782864122989,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988782083,
      "endedOn": 1658988837589,
      "mtuDuration": [
        1658988782091,
        1658988782336
      ],
      "rttDuration": [
        1658988782339,
        1658988796728
      ],
      "bdpDuration": [
        1658988801866,
        1658988817083
      ],
      "thptDuration": [
        1658988822191,
        1658988837432
      ],
      "analysisDuration": [
        1658988837434,
        1658988837589
      ],
      "results": {
        "ave_rtt": 0.937,
        "bb": 358,
        "bdp": 283500,
        "buf_del": 18.323020583406997,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7919,
        "rwnd": 35,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92936275055392,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988838468,
      "endedOn": 1658988894248,
      "mtuDuration": [
        1658988838472,
        1658988838826
      ],
      "rttDuration": [
        1658988838831,
        1658988853209
      ],
      "bdpDuration": [
        1658988858354,
        1658988873573
      ],
      "thptDuration": [
        1658988878713,
        1658988894097
      ],
      "analysisDuration": [
        1658988894100,
        1658988894248
      ],
      "results": {
        "ave_rtt": 1.465,
        "bb": 763,
        "bdp": 695169,
        "buf_del": 60.79464383711996,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 120000,
        "rtt": 0.9111,
        "rwnd": 86,
        "tcp_eff": 99.90413326243456,
        "tcp_ttr": 0.9986118496400523,
        "thpt_avg": 100.0003075733957,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.0139008,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658988895124,
      "endedOn": 1658988950716,
      "mtuDuration": [
        1658988895141,
        1658988895404
      ],
      "rttDuration": [
        1658988895408,
        1658988909776
      ],
      "bdpDuration": [
        1658988914920,
        1658988930161
      ],
      "thptDuration": [
        1658988935257,
        1658988950571
      ],
      "analysisDuration": [
        1658988950573,
        1658988950716
      ],
      "results": {
        "ave_rtt": 0.937,
        "bb": 364,
        "bdp": 295640,
        "buf_del": 15.365673479438563,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.8122,
        "rwnd": 36,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92909294181412,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658988951710,
      "endedOn": 1658989007281,
      "mtuDuration": [
        1658988951715,
        1658988951981
      ],
      "rttDuration": [
        1658988951984,
        1658988966279
      ],
      "bdpDuration": [
        1658988971444,
        1658988986626
      ],
      "thptDuration": [
        1658988991762,
        1658989007133
      ],
      "analysisDuration": [
        1658989007135,
        1658989007281
      ],
      "results": {
        "ave_rtt": 1.374,
        "bb": 765,
        "bdp": 632501,
        "buf_del": 66.18287373004355,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 78000,
        "rtt": 0.8268,
        "rwnd": 79,
        "tcp_eff": 99.93781684708071,
        "tcp_ttr": 0.996524886526907,
        "thpt_avg": 100.04783932800495,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.03487232,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658989008201,
      "endedOn": 1658989064337,
      "mtuDuration": [
        1658989008211,
        1658989008443
      ],
      "rttDuration": [
        1658989008448,
        1658989022826
      ],
      "bdpDuration": [
        1658989028029,
        1658989043241
      ],
      "thptDuration": [
        1658989048911,
        1658989064227
      ],
      "analysisDuration": [
        1658989064229,
        1658989064337
      ],
      "results": {
        "ave_rtt": 0.948,
        "bb": 369,
        "bdp": 274203,
        "buf_del": 27.573677836092042,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.7431,
        "rwnd": 34,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92965254674915,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658989065228,
      "endedOn": 1658989122239,
      "mtuDuration": [
        1658989065232,
        1658989065579
      ],
      "rttDuration": [
        1658989065583,
        1658989079990
      ],
      "bdpDuration": [
        1658989085910,
        1658989101022
      ],
      "thptDuration": [
        1658989106910,
        1658989122147
      ],
      "analysisDuration": [
        1658989122149,
        1658989122239
      ],
      "results": {
        "ave_rtt": 1.418,
        "bb": 801,
        "bdp": 569190,
        "buf_del": 99.54967632986208,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 247500,
        "rtt": 0.7106,
        "rwnd": 71,
        "tcp_eff": 99.80206759470813,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02740855266354,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658989123094,
      "endedOn": 1658989180238,
      "mtuDuration": [
        1658989123100,
        1658989123240
      ],
      "rttDuration": [
        1658989123241,
        1658989137504
      ],
      "bdpDuration": [
        1658989143910,
        1658989158993
      ],
      "thptDuration": [
        1658989164910,
        1658989180137
      ],
      "analysisDuration": [
        1658989180138,
        1658989180238
      ],
      "results": {
        "ave_rtt": 0.979,
        "bb": 377,
        "bdp": 320563,
        "buf_del": 15.135834411384222,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.8503,
        "rwnd": 40,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92903298451424,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658989181124,
      "endedOn": 1658989238268,
      "mtuDuration": [
        1658989181126,
        1658989181315
      ],
      "rttDuration": [
        1658989181317,
        1658989195510
      ],
      "bdpDuration": [
        1658989201910,
        1658989217047
      ],
      "thptDuration": [
        1658989222911,
        1658989238141
      ],
      "analysisDuration": [
        1658989238143,
        1658989238268
      ],
      "results": {
        "ave_rtt": 1.408,
        "bb": 754,
        "bdp": 871247,
        "buf_del": 21.85201211596711,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 129000,
        "rtt": 1.1555,
        "rwnd": 108,
        "tcp_eff": 99.89683523118121,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02673841868318,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658989239088,
      "endedOn": 1658989295618,
      "mtuDuration": [
        1658989239092,
        1658989239236
      ],
      "rttDuration": [
        1658989239239,
        1658989253499
      ],
      "bdpDuration": [
        1658989259911,
        1658989275145
      ],
      "thptDuration": [
        1658989280247,
        1658989295490
      ],
      "analysisDuration": [
        1658989295493,
        1658989295618
      ],
      "results": {
        "ave_rtt": 0.924,
        "bb": 368,
        "bdp": 299993,
        "buf_del": 13.34641805691855,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.8152,
        "rwnd": 37,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.92915289918594,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
  {
    "download": {
      "startedOn": 1658989296521,
      "endedOn": 1658989352345,
      "mtuDuration": [
        1658989296524,
        1658989296809
      ],
      "rttDuration": [
        1658989296814,
        1658989311324
      ],
      "bdpDuration": [
        1658989316432,
        1658989331678
      ],
      "thptDuration": [
        1658989336913,
        1658989352202
      ],
      "analysisDuration": [
        1658989352206,
        1658989352345
      ],
      "results": {
        "ave_rtt": 1.358,
        "bb": 780,
        "bdp": 617682,
        "buf_del": 71.48629877509786,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 181500,
        "rtt": 0.7919,
        "rwnd": 77,
        "tcp_eff": 99.85484956945263,
        "tcp_ttr": 0.9996586125851677,
        "thpt_avg": 100.02690845182809,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 10.00341504,
        "tx_bytes": 125,
        "userid": 1
      }
    },
    "upload": {
      "startedOn": 1658989353167,
      "endedOn": 1658989410203,
      "mtuDuration": [
        1658989353175,
        1658989353407
      ],
      "rttDuration": [
        1658989353409,
        1658989367641
      ],
      "bdpDuration": [
        1658989373910,
        1658989389048
      ],
      "thptDuration": [
        1658989394910,
        1658989410110
      ],
      "analysisDuration": [
        1658989410112,
        1658989410203
      ],
      "results": {
        "ave_rtt": 0.977,
        "bb": 370,
        "bdp": 337699,
        "buf_del": 7.045031226032654,
        "gps_lat": 14.1,
        "gps_lon": 121.1,
        "id": 95,
        "location": "near Tanauan, Batangas, Calabarzon",
        "mtu": 1500,
        "retx_bytes": 0,
        "rtt": 0.9127,
        "rwnd": 42,
        "tcp_eff": 100,
        "tcp_ttr": 1.0007075723045644,
        "thpt_avg": 99.93082174157263,
        "thpt_ideal": 100,
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1ODk4NjM0MiwianRpIjoiNmRmOWViMmYtYTUwZi00OTIwLWFmODUtMmFjMjkyN2EyNDkzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjU4OTg2MzQyLCJleHAiOjE2NTg5ODk5NDJ9.8HeUZp_K1jZGaHP8Yx6Oj4Q4nO-H-fCiSQzMBSc8WNY",
        "transfer_avg": 10,
        "transfer_ideal": 9.99292928,
        "tx_bytes": 125,
        "userid": 1
      }
    }
  },
];