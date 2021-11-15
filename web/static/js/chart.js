var options = {
  series: [
    {
      name: "Average TCP Throughput",
      data: [7.6, 4.93, 7.160, 4.99]
    },
    {
      name: "Efficiency",
      data: [1, .995, .984, .998]
    }
  ],
  chart: {
    width: '60%',
    height: 360,
    type: 'line',
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  markers: {
    size: 4,
  },
  stroke: {
    width: 3,
    curve: 'straight',
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  colors: ['#40C4FF', '#536DFE'],
  xaxis: {
    categories: ['Step 1', 'Step 2', 'Step 3', 'THPT'],
  },
  yaxis: [
    {
      title: {
        text: 'Mbps',
      },
      labels: {
        formatter: function (value) {
          return `${numeral(value).format("0.[000]")}`;
        },
      },
    },
    {
      min: 0,
      max: 1,
      opposite: true,
      labels: {
        formatter: function (value) {
          return `${numeral(value).format("0.[000]%")}`;
        },
      },
    }
  ],
  tooltip: {
    y: {
      formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
        if (seriesIndex == 0) {
          return `${numeral(value).format('0.[000]')} Mbps`;
        } else if (seriesIndex == 1) {
          return `${numeral(value).format('0.[000]%')}`;
        }
      },
    },
    style: {
      fontSize: '14px',
    },
  }
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();

function showSettingsModal() {
  $('#exampleModal').modal('show');
}