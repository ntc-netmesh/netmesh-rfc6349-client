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
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000")} bytes`
    },
  }),
  rtt: Object.freeze({
    name: "Round-trip Time (RTT)",
    test: resultsTestNames.RttTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} ms`
    },
  }),
  bb: Object.freeze({
    name: "Bottleneck Bandwidth (BB)",
    test: resultsTestNames.BdpTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  bdp: Object.freeze({
    name: "Bandwidth Delay Product (BDP)",
    test: resultsTestNames.BdpTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000")} bytes`
    },
  }),
  rwnd: Object.freeze({
    name: "Receiver Window (RWND)",
    test: resultsTestNames.BdpTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} KBytes`
    },
  }),
  thpt_avg: Object.freeze({
    name: "Throughput Average",
    test: resultsTestNames.ThroughputTest,
    description: "Average network speed measured in the test. The value shows the average bandwidth the connection has",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  thpt_ideal: Object.freeze({
    name: "Throughput Ideal",
    test: resultsTestNames.ThroughputTest,
    description: "Maximum achievable network speed. In an ideal network condition, the bandwidth should be at the most this speed",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[00]")} Mbits/sec`
    },
  }),
  tx_bytes: Object.freeze({
    name: "Transmitted Bytes",
    test: resultsTestNames.ThroughputTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} MBytes`
    },
  }),
  retx_bytes: Object.freeze({
    name: "Retransmitted Bytes",
    test: resultsTestNames.ThroughputTest,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val / 1000000).format("0,000.[000]")} MBytes`
    },
  }),
  ave_rtt: Object.freeze({
    name: "Average RTT",
    test: resultsTestNames.ThroughputTest,
    description: "Average delay of sending data to a server and receive a reply. Important metric for online gaming as high ping results to lag",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} ms`
    },
  }),
  transfer_avg: Object.freeze({
    name: "Transfer Average",
    test: resultsTestNames.ThroughputAnalysis,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} sec`
    },
  }),
  transfer_ideal: Object.freeze({
    name: "Transfer Ideal",
    test: resultsTestNames.ThroughputAnalysis,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.[000]")} sec`
    },
  }),
  tcp_ttr: Object.freeze({
    name: "TCP Transfer Time Ratio",
    test: resultsTestNames.ThroughputAnalysis,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0,000.000")}`
    },
  }),
  tcp_eff: Object.freeze({
    name: "TCP Efficiency",
    test: resultsTestNames.ThroughputAnalysis,
    description: "Reliability of the internet connection as low efficiency results to substantial amount of data retransmitted",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.00")}%`
    },
  }),
  buf_delay: Object.freeze({
    name: "Buffer Delay",
    test: resultsTestNames.ThroughputAnalysis,
    description: "",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[00]")}%`
    },
  }),
});

function getThroughputChartOptions(method, thpt_avg, thpt_ideal, fontSize = 14) {
  const methodColor = method == 'upload' ? NETMESH_COLORS.uploadColor : NETMESH_COLORS.downloadColor;

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
      text: "TCP Throughput",
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
            borderColor: NETMESH_COLORS.ntcBlueColor,
            orientation: 'horizontal',
            text: `ISR: ${thpt_ideal} Mbps`,
            textAnchor: 'start',
            offsetX: -23,
            offsetY: -6,
            style: {
              color: NETMESH_COLORS.ntcBlueColor,
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
        colors: [thpt_avg < thpt_ideal ? NETMESH_COLORS.ntcRedColor : NETMESH_COLORS.greenColor]
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
  const methodColor = method == 'upload' ? NETMESH_COLORS.uploadColor : NETMESH_COLORS.downloadColor;

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
            fillColor: NETMESH_COLORS.ntcBlueColor,
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
        colors: [transfer_ideal >= transfer_avg ? NETMESH_COLORS.greenColor : NETMESH_COLORS.ntcRedColor, NETMESH_COLORS.ntcBlueColor]
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
  const methodColor = method == 'upload' ? NETMESH_COLORS.uploadColor : NETMESH_COLORS.downloadColor;
  const aveRttColor = ave_rtt > rtt ? NETMESH_COLORS.ntcRedColor : NETMESH_COLORS.greenColor;

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
            fillColor: NETMESH_COLORS.ntcBlueColor
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
        colors: [aveRttColor, NETMESH_COLORS.ntcBlueColor]
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
