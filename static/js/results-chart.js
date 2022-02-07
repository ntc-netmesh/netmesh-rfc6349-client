const resultsTestNames = {
  MtuTest: "MTU Test",
  RttTest: "RTT Test",
  BdpTest: "BDP Bandwidth Test",
  ThroughputTest: "Throughput Test",
}

const resultsParameters = {
  mtu: {
    name: "Maximum Transfer Unit (MTU)",
    test: resultsTestNames.MtuTest,
    getMeasurement: function (val) {
      return `${val} bytes`
    },
  },
  rtt: {
    name: "Round-trip Time (RTT)",
    test: resultsTestNames.RttTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} ms`
    },
  },
  bb: {
    name: "Baseline Bandwidth (BB)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${val} Mbits/sec`
    },
  },
  bdp: {
    name: "Bandwidth Delay Product (BDP)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${val} bytes`
    },
  },
  rwnd: {
    name: "Receiver Window (RWND)",
    test: resultsTestNames.BdpTest,
    getMeasurement: function (val) {
      return `${val} KBytes`
    },
  },
  thpt_avg: {
    name: "Throughput Average",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.00")} Mbits/sec`
    },
  },
  thpt_ideal: {
    name: "Throughput Ideal",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${val} Mbits/sec`
    },
  },
  ave_rtt: {
    name: "Average RTT",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.000")} ms`
    },
  },
  buf_delay: {
    name: "Buffer Delay",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[00]")}%`
    },
  },
  transfer_avg: {
    name: "Transfer Average",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} sec`
    },
  },
  transfer_ideal: {
    name: "Transfer Ideal",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} sec`
    },
  },
  tcp_ttr: {
    name: "TCP Transfer Time Ratio",
    test: resultsTestNames.ThroughputTest,
    getMeasurement: function (val) {
      return `${numeral(val).format("0.000")}`
    },
  },
  // tcp_eff: {
  //   name: "TCP Efficiency",
  //   unit: "",
  //   format: "",
  // },
  // tx_bytes: {
  //   name: "Transmitted Bytes",
  //   unit: " bytes",
  //   format: "",
  // },
  // retx_bytes: {
  //   name: "Retransmitted Bytes",
  //   unit: " bytes",
  //   format: "",
  // },
};

const ntcBlueColor = '#0038a7';
const ntcRedColor = '#CE1127';
const greenColor = '#38A700';

const uploadColor = '#4824FF';
const downloadColor = '#008ca7';

function getThroughputChartOptions(method, thpt_avg, thpt_ideal, fontSize = 14) {
  const thptAvgColor = ntcBlueColor;
  const directionColor = method == 'upload' ? uploadColor : downloadColor;

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
    colors: [directionColor],
    annotations: {
      xaxis: [
        {
          x: thpt_ideal,
          borderColor: '#000',
          strokeDashArray: 3.6,
          opacity: 0.75,
          label: {
            borderColor: thptAvgColor,
            orientation: 'horizontal',
            text: `ISR: ${thpt_ideal} Mbps`,
            textAnchor: 'start',
            offsetX: -23,
            offsetY: -6,
            style: {
              color: thptAvgColor,
              fontSize: `${fontSize}px`,
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
      offsetX: fontSize,
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
  const transferColor = ntcBlueColor;
  const directionColor = method == 'upload' ? uploadColor : downloadColor;

  return {
    series: [
      {
        name: 'Transfer Average',
        data: [
          {
            x: 'Transfer Average',
            y: transfer_avg,
            fillColor: directionColor,
          },
          {
            x: 'Transfer Ideal',
            y: transfer_ideal,
            fillColor: transferColor,
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