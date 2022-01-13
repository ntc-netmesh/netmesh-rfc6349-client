

const resultsParameters = {
  mtu: {
    name: "Maximum Transfer Unit (MTU)",
    getMeasurement: function (val) {
      return `${val} bytes`
    },
  },
  rtt: {
    name: "Round-trip Time (RTT)",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} ms`
    },
  },
  bb: {
    name: "Baseline Bandwidth (BB)",
    getMeasurement: function (val) {
      return `${val} Mbits/sec`
    },
  },
  bdp: {
    name: "Bandwidth Delay Product (BDP)",
    getMeasurement: function (val) {
      return `${val} bytes`
    },
  },
  rwnd: {
    name: "Receiver Window (RWND)",
    getMeasurement: function (val) {
      return `${val} KBytes`
    },
  },
  thpt_avg: {
    name: "Throughput Average",
    getMeasurement: function (val) {
      return `${val} Mbits/sec`
    },
  },
  thpt_ideal: {
    name: "Throughput Ideal",
    getMeasurement: function (val) {
      return `${val} Mbits/sec`
    },
  },
  transfer_avg: {
    name: "Transfer Average",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} sec`
    },
  },
  transfer_ideal: {
    name: "Transfer Ideal",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.[000]")} sec`
    },
  },
  tcp_ttr: {
    name: "TCP Transfer Time Ratio",
    getMeasurement: function (val) {
      return `${numeral(val).format("0.000")}`
    },
  },
  // tcp_eff: {
  //   name: "TCP Efficiency",
  //   unit: "",
  //   format: "",
  // },
  // buf_delay: {
  //   name: "Buffer Delay",
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

function getThroughputChartOptions(direction, thpt_avg, thpt_ideal) {
  const thptAvgColor = ntcBlueColor;
  const directionColor = direction == 'upload' ? uploadColor : downloadColor;

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
              fontSize: '14px',
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
      offsetX: 14,
      style: {
        fontSize: '14px',
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

function getTransferChartOptions(direction, transfer_avg, transfer_ideal) {
  const transferColor = ntcBlueColor;
  const directionColor = direction == 'upload' ? uploadColor : downloadColor;

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
        fontFamily: 'Ubuntu'
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 14,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    xaxis: {
      type: 'numeric',
      labels: {
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
        fontSize: '14px',
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