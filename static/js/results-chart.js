const resultsTestNames = Object.freeze({
  MtuTest: "MTU Test",
  RttTest: "RTT Test",
  BdpTest: "BDP Test",
  ThroughputTest: "Throughput Test",
  ThroughputAnalysis: "Throughput Analysis",
})

const resultsParameters = Object.freeze({
  mtu: Object.freeze({
    name: "Maximum Transfer Unit (MTU)",
    test: resultsTestNames.MtuTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000")} bytes`
    },
  }),
  rtt: Object.freeze({
    name: "Round-trip Time (RTT)",
    test: resultsTestNames.RttTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} ms`
    },
  }),
  bb: Object.freeze({
    name: "Baseline Bandwidth (BB)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  bdp: Object.freeze({
    name: "Bandwidth Delay Product (BDP)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000")} bytes`
    },
  }),
  rwnd: Object.freeze({
    name: "Receiver Window (RWND)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} KBytes`
    },
  }),
  tx_bytes: Object.freeze({
    name: "Transmitted Bytes",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} MBytes`
    },
  }),
  retx_bytes: Object.freeze({
    name: "Retransmitted Bytes",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val / 1000000).format("0,000.[000]")} MBytes`
    },
  }),
  thpt_avg: Object.freeze({
    name: "Throughput Average",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  thpt_ideal: Object.freeze({
    name: "Throughput Ideal",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  ave_rtt: Object.freeze({
    name: "Average RTT",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} ms`
    },
  }),
  tcp_ttr: Object.freeze({
    name: "TCP Transfer Time Ratio",
    test: resultsTestNames.ThroughputAnalysis,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.000")}`
    },
  }),
  buf_delay: Object.freeze({
    name: "Buffer Delay",
    test: resultsTestNames.ThroughputAnalysis,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[00]")}%`
    },
  }),
  tcp_eff: Object.freeze({
    name: "TCP Efficiency",
    test: resultsTestNames.ThroughputAnalysis,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.00")}%`
    },
  }),
  transfer_avg: Object.freeze({
    name: "Transfer Average",
    test: resultsTestNames.ThroughputAnalysis,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} sec`
    },
  }),
  transfer_ideal: Object.freeze({
    name: "Transfer Ideal",
    test: resultsTestNames.ThroughputAnalysis,
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} sec`
    },
  }),
});

const ntcBlueColor = '#0038a7';
const ntcRedColor = '#CE1127';
const greenColor = '#38A700';

const uploadColor = '#4824FF';
const downloadColor = '#008ca7';

function getThroughputChartOptions(method, thpt_avg, thpt_ideal, fontSize = 14) {
  const methodColor = method == 'upload' ? uploadColor : downloadColor;

  return {
    series: [
      {
        name: 'Throughput Average',
        data: [
          {
            x: 'Throughput Average',
            y: thpt_avg
          },
        ]
      }
    ],
    chart: {
      animations: {
        enabled: false,
      },
      height: 100,
      type: 'bar',
      toolbar: {
        show: false,
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      },
    },
    grid: {
      padding: {
        right: 0,
      }
    },
    title: {
      text: "TCP Throughtput",
      align: 'center',
      margin: 0,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu'
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'top'
        }
      }
    },
    xaxis: {
      max: Math.max(thpt_avg, thpt_ideal) * 1.33,
      labels: {
        show: false
      },
    },
    colors: [methodColor],
    annotations: {
      xaxis: [
        {
          x: thpt_ideal,
          borderColor: '#000',
          strokeDashArray: 3.6,
          opacity: 0.75,
          label: {
            borderColor: ntcBlueColor,
            orientation: 'horizontal',
            text: `ISR: ${thpt_ideal} Mbps`,
            textAnchor: 'start',
            offsetX: -23,
            offsetY: -6,
            style: {
              color: ntcBlueColor,
              fontSize: `${fontSize * 0.85}px`,
              fontWeight: 'bold',
              fontFamily: 'Ubuntu'
            }
          },
        }
      ]
    },
    dataLabels: {
      formatter: function (val, opts) {
        return `${numeral(val).format("0.[00]")} Mbps`;
      },
      textAnchor: 'start',
      offsetX: fontSize * 2,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu',
        colors: [thpt_avg >= thpt_ideal ? greenColor : ntcRedColor]
      },
      background: {
        enabled: true,
        borderWidth: 0,
      },
    },
    tooltip: {
      enabled: false,
    }
  };
}

function getTransferChartOptions(method, transfer_avg, transfer_ideal, fontSize = 14) {
  const methodColor = method == 'upload' ? uploadColor : downloadColor;

  return {
    series: [
      {
        name: 'Transfer Average',
        data: [
          {
            x: 'Transfer Average',
            y: transfer_avg,
            fillColor: methodColor,
          },
          {
            x: 'Transfer Ideal',
            y: transfer_ideal,
            fillColor: ntcBlueColor,
          },
        ]
      }
    ],
    chart: {
      animations: {
        enabled: false,
      },
      height: 144,
      type: 'bar',
      toolbar: {
        show: false,
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        right: 0,
      }
    },
    title: {
      text: "Transfer Time",
      align: 'center',
      margin: 0,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu'
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: fontSize,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    xaxis: {
      type: 'numeric',
      labels: {
        style: {
          fontSize: fontSize * 0.85
        },
        formatter: function (value, timestamp, opts) {
          const minutes = Math.floor(value / 60);
          const seconds = value % 60;
          return `${minutes}:${numeral(seconds).format('00')}`;
        }
      },
    },
    dataLabels: {
      formatter: function (val, opts) {
        return `${numeral(val).format("0.[000]")} sec`;
      },
      distributed: true,
      textAnchor: 'start',
      offsetX: 0,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu',
        colors: [transfer_ideal >= transfer_avg ? greenColor : ntcRedColor, ntcBlueColor]
      },
      background: {
        enabled: true,
        borderWidth: 0,
      },
    },
    tooltip: {
      enabled: false,
    }
  };
}


function getRttChartOptions(method, ave_rtt, rtt, buf_delay, fontSize = 14) {
  const methodColor = method == 'upload' ? uploadColor : downloadColor;
  const aveRttColor = ave_rtt > rtt ? ntcRedColor : greenColor;

  return {
    series: [
      {
        name: "",
        data: [
          {
            x: "Average RTT",
            y: ave_rtt,
            fillColor: methodColor
          },
          {
            x: "Baseline RTT",
            y: rtt,
            fillColor: ntcBlueColor
          }
        ]
      },
    ],
    chart: {
      animations: {
        enabled: false,
      },
      height: 144,
      type: 'bar',
      // stacked: true,
      // stackType: '100%',
      toolbar: {
        show: false,
      }
    },
    legend: {
      show: false,
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        right: 0,
      }
    },
    title: {
      text: "Round Trip Time",
      align: 'center',
      margin: 0,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu'
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        // borderRadius: fontSize,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    // colors: [methodColor],
    annotations: {
      position: 'back',
      xaxis: [
        {
          x: rtt,
          x2: ave_rtt,
          borderColor: '#000',
          fillColor: aveRttColor,
          strokeDashArray: 3.6,
          opacity: 0.75,
          label: {
            borderColor: aveRttColor,
            orientation: 'horizontal',
            text: `Buffer Delay: ${numeral(buf_delay).format("0.[00]")}%`,
            // text: 'aaa',
            textAnchor: 'middle',
            offsetX: 0,
            offsetY: -12,
            style: {
              color: aveRttColor,
              fontSize: `${fontSize * 0.85}px`,
              fontWeight: 'bold',
              fontFamily: 'Ubuntu'
            }
          },
        },
      ],
    },
    fill: {
      // colors: [methodColor],
      type: 'solid',
    },
    xaxis: {
      // categories: ['Average RTT'],
      // max: Math.max(rtt, ave_rtt),
      labels: {
        show: true,
        style: {
          fontSize: fontSize * 0.85
        },
        formatter: function (value, timestamp, opts) {
          return `${numeral(value).format('0')} ms`;
        }
      },
    },
    // yaxis: {
    //   labels: {
    //     style: {
    //       fontSize: fontSize * 0.85
    //     },
    //     formatter: function (value, timestamp, opts) {
    //       return `${numeral(value).format('0.[000]')} ms`;
    //     }
    //   },
    // },
    dataLabels: {
      enabled: true,
      formatter: function (val, { seriesIndex, dataPointIndex, w }) {
        return `${numeral(val).format("0.000")} ms`;
      },
      textAnchor: 'start',
      distributed: true,
      style: {
        fontSize: `${fontSize}px`,
        fontFamily: 'Ubuntu',
        colors: [aveRttColor, ntcBlueColor]
      },
      background: {
        enabled: true,
        borderWidth: 0,
      },
    },
    tooltip: {
      enabled: false,
    }
  };
}