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

let requiredGetParamaters = {
  rtt: null,
  rwnd: null,
}

let measurementTimes = {
  upload: [],
  download: []
};
let testDurationText = "";

let currentTestDirection = "";
let currentProcessIndex = 0;

let _cir, _netType, _testServer, _mode, _lon, _lat;
let _netTypeName, _testServerName;
let _testStartedOnText, _testFinishedOnText, _testDurationText;
let _thoughputChartImgURI, _transferChartImgURI;

$('#net-warning').hide();
$('#btnGetGpsCoordinates .spinner-grow').hide();
$('#measurement-card').hide();
$('#measurement-results-card').hide();
$('#measurement-failed-card').hide();

$(function () {
  renderMap();

  $('#btnGetGpsCoordinates').on('click', function () {
    $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', true);
    $('#btnGetGpsCoordinates .spinner-grow').show();

    $.post('/get-gps-coordinates', function (coordinates) {
      const lat = coordinates[0];
      const lon = coordinates[1];

      if (lat && lon) {
        $('#lat').val(lat).change();
        $('#lon').val(lon).change();
      } else {
        $('#modalGpsProblem').modal('show');
      }

      $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', false);
      $('#btnGetGpsCoordinates .spinner-grow').hide();
    })
  });

  $('#server').html('');
  $('#server').append(`
    <option value="${'202.90.158.6:12000'}"> 
      ${'Temporary test server'}
    </option>`
  );

  $('#netType').html('');
  for (const netType of Object.keys(networkConnectionTypes)) {
    $('#netType').append(`
      <option value="${netType}" ${netType == "Ethernet" ? "selected" : ""}> 
        ${netType}
      </option>`
    );
  }
  $('#netType').on('change', function () {
    const selectedNetType = $(this).val();
    if (selectedNetType === "Ethernet") {
      $('#net-warning').hide();
    } else {
      $('#net-warning .message').text(`Measuring with ${selectedNetType} may NOT be accurate`);
      $('#net-warning').show();
    }
  });
  $('#netType').val("Ethernet").trigger('change');

  $('#btnGpsHelp').on('click', function () {
    $('#modalGpsHelp').modal('show');
  });

  $('#lat, #lon').change(function () {
    const lat = $('#lat').val();
    const lon = $('#lon').val();

    if (lat && lon) {
      renderMap(lat, lon);
    }
  });

  $('#cir').focus();

  (function () {
    window.addEventListener('load', function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.querySelectorAll('.needs-validation')
      // Loop over them and prevent submission
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }
            form.classList.add('was-validated')
          }, false)
        });
    }, false);
  })();

  renderThoughputComparisonChart();
  renderTransferComparisonChart();
});

function renderThoughputComparisonChart() {
  const isrColor = '#4824FF'; //#008ca7 - download
  const ntcBlueColor = '#0038a7';
  var options = {
    series: [
      {
        name: 'Throughput Average',
        data: [
          {
            x: 'Throughput Average',
            y: 50
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
      max: 50 * 1.33,
      labels: {
        show: false
      },
    },
    colors: [isrColor],
    annotations: {
      xaxis: [
        {
          x: 35,
          borderColor: '#000',
          strokeDashArray: 3.6,
          opacity: 0.75,
          label: {
            borderColor: ntcBlueColor,
            orientation: 'horizontal',
            text: 'ISR: 35 Mbps',
            textAnchor: 'start',
            offsetX: -23,
            offsetY: -6,
            style: {
              color: ntcBlueColor,
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
        colors: ['#388E3C']
      },
      background: {
        enabled: true,
        borderWidth: 0
        // foreColor: '#388E3C',
        // borderColor: '#00A020',
      },
    },
    tooltip: {
      enabled: false,
    }
  };

  var chart = new ApexCharts(document.querySelector(`#download-measurement-results .thpt-chart`), options);
  chart.render();
}

function renderTransferComparisonChart() {
  const isrColor = '#4824FF'; //#00B0FF - download
  const ntcBlueColor = '#0038a7';
  var options = {
    series: [
      {
        data: [
          {
            x: 'Transfer Average',
            y: 10,
            fillColor: isrColor,
          },
          {
            x: 'Transfer Ideal',
            y: 10.543,
            fillColor: ntcBlueColor
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
        },
      },
    },
    xaxis: {
      type: 'numeric',
      range: 1,
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
        colors: ['#ce1127', ntcBlueColor]
      },
      background: {
        enabled: true,
        borderWidth: 0
        // foreColor: isrColor,
        // borderColor: isrColor,
      },
    },
    tooltip: {
      enabled: false,
    }
  };

  var chart = new ApexCharts(document.querySelector(`#download-measurement-results .transfer-chart`), options);
  chart.render();
}

function createMeasurementProcessesTable(directions) {
  $('#measurement-processes-timeline').html('');
  $('#measurement-results').html('');
  $(`#process-error`).html('');

  for (const dName of directions) {
    console.log(dName);
    const testDirection = testDirections[dName];

    $('#measurement-processes-timeline').append(`
      <h6 class="small text-uppercase m-1">${testDirection.name} test</h6>
      <table id="${testDirection.name}-measurement-processes" class="table table-sm table-borderless table-hover mb-3">
        <tbody class="align-middle">
        </tbody>
      </table>
    `);

    $measurementTimeline = $(`#${testDirection.name}-measurement-processes tbody`);
    $measurementTimeline.html('');
    for (var i = 0; i < measurementProcesses.length; i++) {
      const process = measurementProcesses[i];
      $measurementTimeline.append(`
        <tr>
          <td class="p-0 d-flex inline-block" style="min-width: 56px;">
            <span id="${testDirection.name}-process-time-${i}" class="text-muted ms-3 me-2">${dName === directions[0] && i === 0 ? "0:00" : ""}</span>
          </td>
          <td id="${testDirection.name}-process-status-${i}" class="p-0">
            <i class="bi bi-circle text-muted"></i>
          </td>
          <td class="p-0 w-100">
            <span id="${testDirection.name}-process-label-${i}" class="text-muted mx-2">${process.label}</span>
          </td>
          <td id="${testDirection.name}-process-status-label-${i}" class="p-0 text-end">
            
          </td>
        </tr>
      `);
    }

    const directionRgb = dName == "upload" ? '72, 36, 255' : '0, 140, 167';
    $('#measurement-results').append(`
      <div>
        <div class="mt-2" style="border: 1px solid rgba(${directionRgb}, 0.25);">
          <div class="p-2" style="background-color: rgba(${directionRgb}, 0.1);">
            <div class="d-flex align-items-center">
              <h6 class="mb-0">
                <span id="${dName}-test-results-status" class="me-1">
                  <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                </span>
                ${testDirection.titleCase} Test...
              </h6>
            </div>
          </div>
          <div id="${dName}-measurement-results">
            
          </div>
        </div>
      </div>
    `);
    

    // $(`#${testDirection.name}-measurement-results-table tbody`).html('');
    // for (const [key, value] of Object.entries(resultsParameters)) {
    //   $(`#${testDirection.name}-measurement-results-table tbody`).append(`
    //     <tr>
    //       <td>${value.name}</td>
    //       <td id="${testDirection.name}-results-param-${key}" data-has-value="false">
    //         <div class="placeholder-glow">
    //           <span class="placeholder bg-secondary" style="width: 72px;"></span>
    //         </div>
    //       </td>
    //     </tr>
    //   `);
    // }
  }

  $('#summary-test-finished-on').html('<span class="placeholder col-6"></span>');
  $('#summary-test-duration').html('<span class="placeholder col-6"></span>');
}

function startTest() {
  const c_cir = $('#cir').val();
  const c_netType = $('#netType').val();
  const c_testServer = $('#server').val();
  const c_selectedTestMode = $('input[name="radTestMode"]:checked').val();
  const c_lat = $('#lat').val();
  const c_lon = $('#lon').val();

  $.ajax({
    url: 'set-test-details',
    method: 'POST',
    data: {
      cir: c_cir,
      net: c_netType,
      server: c_testServer,
      mode: c_selectedTestMode,
      lon: c_lon,
      lat: c_lat
    },
    dataType: 'json',
    success: function (response) {
      console.log(response);

      $('#mainForm fieldset').attr('disabled', true);

      // set current test details
      _cir = response['cir'];
      
      _netType = response['net'];
      _netTypeName = _netType;

      _testServer = response['server'];
      _testServerName = $('#server option:selected').text();

      _mode = response['mode'];
      _lon = response['lon'];
      _lat = response['lat'];
      
      const testMode = testModes[_mode];

      backToTop();

      measurementTimes = {
        upload: [],
        download: []
      };

      $('#summary-cir').text(_cir + " Mbps");
      $('#summary-net').text(_netTypeName);
      $('#summary-server').text(_testServerName);
      $('#summary-mode').text(testMode.titleCase);
      $('#summary-coordinates').text(_lat + ", " + _lon);

      $("#measurement-card .card-header h5").text(`Testing ${testMode.titleCase} mode...`);

      $('#measurement-card').show();
      $('#measurement-results-card').hide();
      $('#measurement-failed-card').hide();
      $('.btn-test-done-options').hide();
      $('#btnBackToTop').show();
      $('#btnSaveAsPdf').hide();

      createMeasurementProcessesTable(testMode.directions);

      const startTime = Date.now();
      const timerInterval = setInterval(function () {
        const elapsedSeconds = ((Date.now() - startTime)) / 1000.0;
        const minutes = parseInt(elapsedSeconds / 60);
        const seconds = parseInt(elapsedSeconds) % 60;

        testDurationText = `${numeral(minutes).format("0")}m ${numeral(seconds).format("00")}s`

        $(`#${currentTestDirection}-process-time-${currentProcessIndex}`).text(`${numeral(minutes).format("0")}:${numeral(seconds).format("00")}`);
      }, 100);

      _testStartedOnText = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      $('#summary-test-started-on').text(_testStartedOnText);

      switch (testMode.name) {
        case "normal":
        case "reverse":
          const directionName = testMode.directions[0];
          executeMeasurements(_testServer, directionName)
            .then(resultsHtml => {
              clearInterval(timerInterval);

              $("#measurement-card .card-header h5").text(`Finished`);
              // $("#measurement-results-card .card-header").text(`${testMode.altTitleCase} mode results`);
              // $('#measurement-results-card').show();
              setTestFinishTimes(directionName);

              // console.log(resultsHtml);

              showTestResults(resultsHtml, directionName);
            })
            .catch((err) => {
              console.log("normal/reverse");
              console.log({ err });
              clearInterval(timerInterval);
              showTestFailed(err, currentProcessIndex, testMode.name, testMode.directions[0]);
            });
          break;
        case "bidirectional":
          const directionName1 = testMode.directions[0];
          const directionName2 = testMode.directions[1];
          executeMeasurements(_testServer, directionName1)
            .then(resultsHtml => {
              // $('#measurement-results-card').show();
              
              showTestResults(resultsHtml, directionName1);

              return executeMeasurements(_testServer, directionName2);
            })
            .then(resultsHtml => {
              clearInterval(timerInterval);
              showTestResults(resultsHtml, directionName2);

              $("#measurement-card .card-header h5").text(`Finished`);
              setTestFinishTimes(directionName2);
              // $("#measurement-results-card .card-header").text(`${testMode.altTitleCase} mode results`);
            })
            .catch(err => {
              console.log(err);
              clearInterval(timerInterval);
              showTestFailed(err, currentProcessIndex, testMode.name, testMode.directions[0]);
            });
          break;
      }
    },
    error: function (err) {
      console.log(err);
      if (err.type === 'mode') {
        alert(err.errmsg);
      }
    }
  });

  // if (!(cir && netType && testServer /*&& lat && lon*/)) {
  //   return;
  // }
  // if (!testMode) {
  //   alert("Select a test mode");
  //   return;
  // }

  
}

function setTestFinishTimes(directionName) {
  const measurementLength = measurementTimes[directionName].length;
  const lastMeasurementTime = measurementTimes[directionName][measurementLength - 1][1];

  _testFinishedOnText = moment(lastMeasurementTime).format('YYYY-MM-DD HH:mm:ss');
  $('#summary-test-finished-on').html(_testFinishedOnText);
  $('#summary-test-duration').html(testDurationText);

  $('#btnBackToTop').hide();
  $('#btnSaveAsPdf').show();
  $('.btn-test-done-options').show();
}

function executeMeasurements(testServerHost, directionName) {
  const testDirection = testDirections[directionName];

  currentTestDirection = directionName;
  currentProcessIndex = 0;

  const executeProcess = (process) => {

    console.log({ process });
    console.log(`Current process: ${process.processId} - http://${testServerHost}/api/${testDirection.mode}/${process.processId}`);

    $(`#${testDirection.name}-process-status-${currentProcessIndex}`).html(`<div class="spinner-border spinner-border-sm text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>`);
    $(`#${testDirection.name}-process-label-${currentProcessIndex}`).html(`${process.label}...`);
    $(`#${testDirection.name}-process-label-${currentProcessIndex}`).removeClass("text-muted");

    const directExecutions = ['mtu', 'rtt'];

    const getProcessInfo = (processId) => {
      console.log({ processId });
      return new Promise(function (resolve, reject) {
        if (directExecutions.includes(processId)) {
          resolve();
          return;
        }

        $.ajax({
          url: 'process',
          method: 'GET',
          data: {
            testServer: testServerHost,
            mode: testDirection.mode,
            processId: process.processId,
            requiredParams: JSON.stringify(getRequiredGetParameters(processId))
          },
          dataType: 'json',
          success: function (response) {
            resolve(response);
          },
          error: function (err) {
            console.log("GET process error");
            console.log(err);
            reject(err);
          }
        });
      });
    };

    const checkStatus = (jobId) => {
      const statusCheckingInterval = 2.5 /*seconds*/ * 1000;
      return new Promise((resolve, reject) => {
        if (jobId == null) {
          resolve("started");
        }

        $.ajax({
          url: 'check-status',
          method: 'GET',
          data: {
            testServer: testServerHost,
            mode: testDirection.mode,
            jobId,
          },
          dataType: 'json',
          success: function (response) {
            setTimeout(function () {
              resolve(response);
            }, statusCheckingInterval);
          },
          error: function (err) {
            console.log("GET checkStatus error");
            console.log(err);
            reject(err);
          }
        });
      });
    }

    let isLooped = false;
    const checkQueue = (jobId, port) => checkStatus(jobId).then(status => {
      if (Number.isInteger(status)) {
        const queuePlacement = parseInt(status) + 1;
        if (!isLooped) {
          $(`#${testDirection.name}-process-status-label-${currentProcessIndex}`).html(`
            <div class="d-flex justify-content-end">
              <div class="progress h-100 mx-2">
                <div class="px-3 progress-bar progress-bar-striped progress-bar-animated bg-dark" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                  <span class="fw-bold">
                    <span class="align-middle me-1">Position in QUEUE:</span>
                    <span id="queue-position-${currentProcessIndex}" class="align-middle fs-6 lh-sm">${queuePlacement}</span>
                  </span>
                </div>
              </div>
            </div>
          `);
          isLooped = true;
        }
        else {
          $(`#queue-position-${currentProcessIndex}`).text(`${queuePlacement}`);
        }
        return checkQueue(jobId, port);
      }
      else {
        return Promise.resolve(port);
      }
    });

    const runScriptProcess = (processId, port) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: `run-process-${processId}`,
          method: 'POST',
          data: getRequiredScriptParameters(processId, port, testDirection),
          dataType: 'json',
          success: function (scriptData) {
            resolve(scriptData);
          },
          error: function (err) {
            console.log("GET runScriptProcess error");
            console.log(err);
            reject(err);
          }
        });
      });
    }

    const postProcess = (scriptData) => {
      console.log({ scriptData });
      for (const key of Object.keys(scriptData)) {
        console.log({ key, requiredGetParamaters });
        if ((key in resultsParameters) && (key in scriptData)) {
          const rParam = resultsParameters[key];
          $(`#${testDirection.name}-results-param-${key}`).text(`${rParam.getMeasurement(scriptData[key])}`);
        }
        if (key in requiredGetParamaters) {
          requiredGetParamaters[key] = scriptData[key];
        }
      }
      return new Promise((resolve, reject) => {
        $.ajax({
          url: 'process',
          method: 'POST',
          data: {
            testServer: testServerHost,
            mode: testDirection.mode,
            processId: process.processId,
            scriptData: JSON.stringify(scriptData)
          },
          dataType: 'json',
          success: function () {
            resolve();
          },
          error: function (err) {
            console.log("GET postProcess error");
            console.log(err);
            reject(err);
          }
        });
      });
    };

    return new Promise((resolve, reject) => {
      getProcessInfo(process.processId)
        .then(response => {
          if (response != null) {
            return checkQueue(response.job_id, response.port);
          }
        })
        .then(port => {
          measurementTimes[directionName].push([Date.now(), null]);
          $(`#${testDirection.name}-process-status-label-${currentProcessIndex}`).html('<i class="small">Processing...</i>');

          return runScriptProcess(process.processId, port)
        })
        .then(scriptData => {
          return postProcess(scriptData);
        })
        .then(() => {
          measurementTimes[directionName][currentProcessIndex][1] = Date.now();
          $(`#${testDirection.name}-process-status-${currentProcessIndex}`).html('<i class="bi bi-check-circle-fill text-success"></i>');

          $(`#${testDirection.name}-process-label-${currentProcessIndex}`).html(process.label);
          $(`#${testDirection.name}-process-label-${currentProcessIndex}`).addClass("text-success");

          $(`#${testDirection.name}-process-status-label-${currentProcessIndex}`).html(`
            <span class="px-2 text-nowrap text-success small" data-bs-toggle="tooltip" data-bs-placement="top" title="${moment(measurementTimes[directionName][currentProcessIndex][0]).format('HH:mm:ss.SSS')} - ${moment(measurementTimes[directionName][currentProcessIndex][1]).format('HH:mm:ss.SSS')}">
              ${moment(measurementTimes[directionName][currentProcessIndex][0]).format('hh:mm:ss a')} - ${moment(measurementTimes[directionName][currentProcessIndex][1]).format('hh:mm:ss a')}
            </span>
          `);

          console.log(`Done ${process.label}\n`);
          currentProcessIndex++;

          resolve();
        })
        .catch(ex => {
          reject(ex);
        });
    });
  };

  const getTestResults = function () {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        $.ajax({
          url: 'get-results',
          method: "GET",
          data: {
            testServer: testServerHost,
            mode: testDirection.mode,
          },
          dataType: 'html',
          success: function (resultsHtml) {
            resolve(resultsHtml);
          },
          error: function (err) {
            reject(err);
          }
        });
      }, 500);
    });
  }

  const executeAllProcesses = async () => {
    return new Promise((resolve, reject) => {
      measurementProcesses.reduce(async (previousPromise, nextProcess) => {
        await previousPromise;
        return executeProcess(nextProcess);
      }, Promise.resolve())
        .then(() => {
          return getTestResults();
        })
        .then(results => {
          resolve(results);
        })
        .catch(err => {
          reject(err);
        });
    })
  }

  return executeAllProcesses();

  /*
.then(() => {
        return getTestResults();
      }).then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
  */

  // const executeNextProcess = async function (process) {
  //   return new Promise(function (resolve, reject) {
  //     executeProcess(process)
  //       .then(() => {
  //         console.log('return executeProcess');
  //         console.log({process});
  //         $(`#${testDirection.name}-process-status-${currentProcessIndex}`).html('<i class="bi bi-check-circle-fill text-success"></i>');

  //         $(`#${testDirection.name}-process-label-${currentProcessIndex}`).html(process.label);
  //         $(`#${testDirection.name}-process-label-${currentProcessIndex}`).addClass("text-success");

  //         $(`#${testDirection.name}-process-status-label-${currentProcessIndex}`).html(`
  //           <span class="px-2 text-nowrap text-success small" data-bs-toggle="tooltip" data-bs-placement="top" title="${moment(measurementTimes[directionName][currentProcessIndex][0]).format('HH:mm:ss.SSS')} - ${moment(measurementTimes[directionName][currentProcessIndex][1]).format('HH:mm:ss.SSS')}">
  //             ${moment(measurementTimes[directionName][currentProcessIndex][0]).format('hh:mm:ss a')} - ${moment(measurementTimes[directionName][currentProcessIndex][1]).format('hh:mm:ss a')}
  //           </span>
  //         `);

  //         console.log(`Done ${process.label}\n`);

  //         currentProcessIndex++;
  //         resolve();
  //       })
  //       .catch((err) => {
  //         console.log('executeProcess');
  //         console.log(err);
  //         reject(err);
  //       });
  //   });
  // }
}

function getRequiredGetParameters(processId) {
  let data = {};
  switch (processId) {
    case "bdp":
      data = {
        rtt: requiredGetParamaters.rtt
      }
      break;
    case "thpt":
      data = {
        rtt: requiredGetParamaters.rtt,
        rwnd: requiredGetParamaters.rwnd
      }
      break;
  }
  return data;
}

function getRequiredScriptParameters(processId, port, testDirection) {
  // const cir = $('#cir').val();

  // const testServerIP = $('#server').val();

  // const selectedNetType = $('#netType').val();
  const netConnectionType = networkConnectionTypes[_netType];

  let data = {};
  switch (processId) {
    case "mtu":
    case "rtt":
      data = {
        mode: testDirection.mode,
        networkPrefix: netConnectionType.prefix,
        // remove port for a while
        serverIP: _testServer.split(':')[0],
      }
      break;
    case "bdp":
      data = {
        mode: testDirection.mode,
        rtt: requiredGetParamaters.rtt,
        // remove port for a while
        serverIP: _testServer.split(':')[0],
        port,
      }
      break;
    case "thpt":
      data = {
        mode: testDirection.mode,
        rtt: requiredGetParamaters.rtt,
        rwnd: requiredGetParamaters.rwnd,
        ideal: _cir,
        // remove port for a while
        serverIP: _testServer.split(':')[0],
        port,
      }
      break;
  }
  return data;
}

function showTestResults(resultsHtml, directionName) {
  $(`#${directionName}-measurement-results`).append(resultsHtml);

  const successIconHtml = directionName == "upload"
    ? '<i class="bi bi-arrow-up-circle"></i>'
    : '<i class="bi bi-arrow-down-circle"></i>';
  $(`#${directionName}-test-results-status`).html(successIconHtml);
}

function showTestFailed(err, processIndex, modeName, directionName) {
  const process = measurementProcesses[processIndex];
  const testMode = testModes[modeName];

  console.log({ process });

  $(`#${directionName}-process-status-${processIndex}`).html('<i class="bi bi-x-octagon-fill text-danger"></i>');
  $(`#${directionName}-process-label-${processIndex}`).text(process.label);
  $(`#${directionName}-process-label-${processIndex}`).addClass("text-danger");
  $(`#${directionName}-process-status-label-${processIndex}`).html(`<span class="px-2 text-nowrap text-danger">Failed</span>`);

  $("#measurement-card .card-header h5").text(`${testMode.titleCase} mode failed`);

  $('#process-error').html(`
    <div class="border border-danger bg-light mt-1 mx-2">
      <div class="accordion border-0" id="accordionError">
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingError">
            <button class="accordion-button collapsed bg-danger bg-opacity-10 text-danger" type="button" data-bs-toggle="collapse" data-bs-target="#collapseError" aria-expanded="true" aria-controls="collapseError">
              An error occured
            </button>
          </h2>
          <div id="collapseError" class="accordion-collapse collapse" aria-labelledby="headingError" data-bs-parent="#accordionError">
            <div class="accordion-body bg-light">
              <span class="font-monospace small">
                ${err.responseText?.replace(/\n/g, "<br />")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mx-2 my-1 mb-2">
      <button class="btn btn-sm btn-primary" onclick="tryAgain()">Restart test</button>
      <button class="btn btn-sm btn-secondary" onclick="resetTest()">Cancel test</button>
    </div>
  `);

  for (const [key, _] of Object.entries(resultsParameters)) {
    if ($(`#${directionName}-results-param-${key} div span`).hasClass('placeholder')) {
      $(`#${directionName}-results-param-${key}`).html("<i class='text-muted'>error</i>");
    }
  }
}

function backToTop() {
  $('html, body').animate({
    scrollTop: $('#measurement-card').offset().top
  }, 200);
}

function closeTest() {
  const confirmClose = confirm("Close this test?");
  if (!confirmClose) {
    return;
  }

  $(`#process-error`).html('');

  $('#mainForm fieldset').attr('disabled', false);

  $("#mainForm").trigger('reset');
  $('#mainForm').removeClass('was-validated');

  $('#measurement-card').hide();
  $('#measurement-failed-card').hide();

  $('#net-warning').hide();

  renderMap();
  
  $('#cir').focus();
}

function repeatTest() {
  const confirmRepeat = confirm("Repeat the test?");
  if (!confirmRepeat) {
    return;
  }

  startTest();
}

function tryAgain() {
  // TODO: clear error html after clicking this
  // TODO: change try again to "RESTART test"
  $(`#process-error`).html('');
  $('#measurement-failed-card').hide();

  startTest();
}

function resetTest() {
  // TODO: clear error html after clicking this
  $(`#process-error`).html('');
  $('#mainForm fieldset').attr('disabled', false);

  $('#measurement-card').hide();
  $('#measurement-failed-card').hide();

  $('#net-warning').hide();
}

function saveAsPdf() {
  // $('#modalPdfReport').modal('show');
  
  const directions = testModes[_mode].directions;
  const now = moment();
  const nowProper = now.format('YYYY-MM-DD HH:mm:ss');
  const nowFileName = now.format('YYYY-MM-DD-HHmmss');

  $.ajax({
    url: 'report',
    method: 'POST',
    data: {
      directions: JSON.stringify(directions),
      serverName: _testServerName,
      startedOn: _testStartedOnText,
      finishedOn: _testFinishedOnText,
      duration: testDurationText,
      generatedOn: nowProper
    },
    dataType: 'html',
    success: async function (reportHtml) {
      $('#results-pdf').html(reportHtml);

      const defaultFileName = `netmesh_rfc-6349_${_mode}_${nowFileName}.pdf`;

      const opt = {
        margin: [1, 1],
        filename: defaultFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { before: [] }
      };

      const pageBreaks = ['#test-results-title'];
      if (directions && directions.length == 2) {
        pageBreaks.push(`#${directions[1]}-test-title`);
      }
      opt.pagebreak.before = pageBreaks;

      const element = document.getElementById('results-pdf');

      html2pdf().from(element).set(opt).toPdf().get('pdf').then(function (pdf) {
        var totalPages = pdf.internal.getNumberOfPages();
      
        for (i = 1; i <= totalPages; i++) {
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(108);
          pdf.text('Page ' + i + ' of ' + totalPages, pageWidth - 0.5, pageHeight - 0.5, {
            align: 'right',
          });
          pdf.text(`${nowProper} | ISR: ${_cir} Mbps | ${_netTypeName} | ${_testServerName}`, opt.margin[1] - 0.5, pageHeight - 0.5, {
            align: 'left',
          });
        }

        $('#results-pdf').html('');
      }).save();
    },
    error: function (err) {
      console.error(err);
    }
  })
}

function renderMap(lat = null, lon = null) {
  const $map = $('#map-snippet');

  if (lat && lon) {
    $map.html(`<div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>`);

    $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('disabled', true);
    $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('cursor', 'progress');

    const mapPromise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        $.ajax({
          url: 'render-map',
          method: 'POST',
          data: {
            lat, lon
          },
          dataType: 'html',
          success: function (html) {
            resolve(html)
          },
          error: function (err) {
            reject(err);
          }
        });
      }, 2000);
    });

    mapPromise.then(html => {
      $map.html(html);
    }).catch(err => {
      $map.html(err);
    }).finally(() => {
      $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('disabled', false);
      $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('cursor', 'default');
    });
  } else {
    $map.html('');
  }
}