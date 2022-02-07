let requiredGetParamaters = {
  rtt: null,
  rwnd: null,
};

let measurementTimes = {
  upload: [],
  download: []
};

let currentTestDirection = "";
let currentProcessIndex = 0;

let appState = APP_STATE.Ready;

// $('#net-warning').hide();
// $('#btnGetGpsCoordinates .spinner-grow').hide();
$('#btnStartTest').attr('disabled', true);

// $('#btnSaveAsPdf .spinner-border').hide();
// $('#pdfSaved').hide();
// $('#modalPdfReport .btn-close').hide();
// $('#measurement-card').hide();

// $('#measurement-results').html('');
// $('#measurement-failed-card').hide();

$(function () {
  renderMap();

  $('#btnGetGpsCoordinates').on('click', function () {
    $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', true);
    $('#btnGetGpsCoordinates .spinner-grow').removeClass('d-none');

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
      $('#btnGetGpsCoordinates .spinner-grow').addClass('d-none');
    })
  });

  setTestServers();
  
  $('#netType').html('');
  for (const netType of Object.keys(NETWORK_CONNECTION_TYPES)) {
    $('#netType').append(`
      <option value="${netType}" ${netType == "Ethernet" ? "selected" : ""}> 
        ${netType}
      </option>`
    );
  }
  $('#netType').on('change', function () {
    const selectedNetType = $(this).val();
    if (selectedNetType === "Ethernet") {
      $('#net-warning').addClass('d-none');
    } else {
      $('#net-warning .message').text(`RFC-6349 methodology focuses on Ethernet-terminated services`);
      $('#net-warning').removeClass('d-none');
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

  // $('#isr').focus();

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

  window.onbeforeunload = function (e) {
    console.log("onbeforeunload");
    e = e || window.event;

    let message = "Close this app?";
    switch (appState) {
      case APP_STATE.Testing:
        message = "Test is ongoing.\n\nClose this app anyway?"
        break;
    }

    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = message;
    }

    console.log(message);
    // For Safari
    return message;
  };
  // window.addEventListener('online', (e) => console.log(e, "you're online"));
  // window.addEventListener('offline', (e) => {
    
  // });

  // renderThoughputComparisonChart();
  // renderTransferComparisonChart();
  // const testInputs = {
  //   mode: 'reverse',
  //   isr: 35,
  //   net: "Ethernet",
  //   serverName: 'UP Diliman Department of Computer Science Test Server',
  //   lon: 14.9876,
  //   lat: 121.67895
  // };
  // const testTime = {
  //   startedOn: '2022-01-24 16:17:18',
  //   finishedOn: '2022-01-24 16:19:20',
  //   duration: '2m 02s',
  // };
  // const testClient = {
  //   username: 'hardcoded_user',
  //   ipAddress: 'hardcoded_ip_address',
  // };
  // const sampleResults = {
  //   download: {
  //     ave_rtt: 0,
  //     bb: 42.7,
  //     bdp: 346425,
  //     buf_delay: 0,
  //     mtu: 1500,
  //     retx_bytes: 0,
  //     rtt: 8.113,
  //     rwnd: 43,
  //     tcp_eff: 0,
  //     tcp_ttr: 0.844594594595,
  //     thpt_avg: 43.5,
  //     thpt_ideal: 35,
  //     transfer_avg: 10,
  //     transfer_ideal: 11.84,
  //     tx_bytes: 0
  //   }
  // };
  // setTimeout(function () {
  //   generateReport(testInputs, testTime, testClient, sampleResults);
  // }, 500);
});

function setTestServers() {
  $.ajax({
    url: 'get-test-servers',
    method: 'GET',
    dataType: 'json',
    timeout: MEASUREMENT_TIMEOUT,
    success: function (data) {
      $('#testServersPlaceholder').html(`<select class="form-select" id="testServers" required></select>
        <div class="invalid-feedback">Select a test server</div>`);
      $('#testServers').on('change', function () {
        const selectedServer = $('#testServers option:selected').text();
        if (selectedServer) {
          $(this).attr('title', selectedServer.trim());
        }
      });

      let $testServers = $('#testServers');
      $testServers.html('');
      $testServers.append('<option selected disabled value="">Select a test server...</option>');

      testServers = [];
      testServers = data;

      for (let i = 0; i < testServers.length; i++) {
        const server = testServers[i];
        $testServers.append(`
          <option value="${i}"> 
            ${server.nickname}
          </option>`
        );
      }

      $('#btnStartTest').attr('disabled', false);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("GET get-test-servers error");
      console.log({jqXHR, textStatus, errorThrown});
      console.log(errorThrown);

      let errorContent = "Unknown error occured";
      if (jqXHR.readyState == 0) {
        errorContent = "Network error: Please check your internet connection";
      } else if (jqXHR.readyState == 4) {
        errorContent = jqXHR.responseJSON.error ?? jqXHR.responseJSON ?? "Unknown error occured"
      };

      $('#testServersPlaceholder').html(`<div class="alert alert-danger p-2 py-1" role="alert">
        <p class="small mb-0">${errorContent}</p>
        <button class="btn btn-sm btn-link text-primary p-0" onclick="reloadTestServers()" type="button" role="button">Reload test servers</button>
      </div>`);
    }
  });
}

function reloadTestServers() {
  $('#testServersPlaceholder').html(`<div class="placeholder-wave">
    <span class="placeholder col-12"></span>
  </div>`);
  setTestServers();
}

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

  options.chart.width = 640;
  options.chart.height = 100;
  const chart = new ApexCharts(document.querySelector(`#download-thpt-chart`), options);
  chart.render().then(() => {
    setTimeout(function () {
      chart.dataURI({scale: 3}).then(({imgURI}) => {
        chartImageUris.throughputCharts['download'] = imgURI;
      });
      chart.destroy();

      options.chart.width = '100%';
      const chart2 = new ApexCharts(document.querySelector(`#download-thpt-chart`), options);
      chart2.render();
    }, 200);
  });
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

  options.chart.width = 640;
  options.chart.height = 144;
  const chart = new ApexCharts(document.querySelector(`#download-transfer-chart`), options);
  chart.render().then(() => {
    setTimeout(function () {
      chart.dataURI({scale: 3}).then(({imgURI}) => {
        chartImageUris.transferCharts['download'] = imgURI;
      });
      chart.destroy();

      options.chart.width = '100%';
      const chart2 = new ApexCharts(document.querySelector(`#download-transfer-chart`), options);
      chart2.render();
    }, 200);
  });
}

function createMeasurementProcessesTable(methods) {
  $('#measurement-processes-timeline').html('');
  $('#measurement-results').html('');
  $(`#process-error`).html('');

  for (const dName of methods) {
    console.log(dName);
    const testMethod = TEST_METHODS[dName];

    $('#measurement-processes-timeline').append(`
      <h6 class="small text-uppercase m-1">${testMethod.name} test</h6>
      <table id="${testMethod.name}-measurement-processes" class="table table-sm table-borderless table-hover mb-3">
        <tbody class="align-middle">
        </tbody>
      </table>
    `);

    $measurementTimeline = $(`#${testMethod.name}-measurement-processes tbody`);
    $measurementTimeline.html('');
    for (var i = 0; i < MEASUREMENT_PROCESSES.length; i++) {
      const process = MEASUREMENT_PROCESSES[i];
      $measurementTimeline.append(`
        <tr>
          <td class="p-0 d-flex inline-block" style="min-width: 56px;">
            <span id="${testMethod.name}-process-time-${i}" class="text-muted ms-3 me-2">${dName === methods[0] && i === 0 ? "0:00" : ""}</span>
          </td>
          <td id="${testMethod.name}-process-status-${i}" class="p-0">
            <i class="bi bi-circle text-muted"></i>
          </td>
          <td class="p-0 w-100">
            <span id="${testMethod.name}-process-label-${i}" class="text-muted mx-2">${process.label}</span>
          </td>
          <td id="${testMethod.name}-process-status-label-${i}" class="p-0 text-end">
            
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
                ${testMethod.titleCase} Test...
              </h6>
            </div>
          </div>
          <div id="${dName}-measurement-results">
            
          </div>
        </div>
      </div>
    `);
    

    // $(`#${testMethod.name}-measurement-results-table tbody`).html('');
    // for (const [key, value] of Object.entries(resultsParameters)) {
    //   $(`#${testMethod.name}-measurement-results-table tbody`).append(`
    //     <tr>
    //       <td>${value.name}</td>
    //       <td id="${testMethod.name}-results-param-${key}" data-has-value="false">
    //         <div class="placeholder-glow">
    //           <span class="placeholder bg-secondary" style="width: 72px;"></span>
    //         </div>
    //       </td>
    //     </tr>
    //   `);
    // }
  }

  $('#summary-test-finished-on').html(`
    <div class="placeholder-wave">
      <span class="placeholder col-6"></span>
    </div>
  `);
  $('#summary-test-duration').html(`
    <div class="placeholder-wave">
      <span class="placeholder col-6"></span>
    </div>
  `);
}

function startTest() {
  appState = APP_STATE.Testing;

  $('#btnStartTest').attr('disabled', true);
  $('#btnStartTest .spinner-border').removeClass('d-none');

  $('#btnSaveAsPdf').removeClass('d-none');
  $('#pdfSaved').addClass('d-none');

  const isr = $('#isr').val();
  const netTypeName = $('#netType').val();
  
  const testServerIndex = $('#testServers').val();
  const testServer = testServers[testServerIndex];
  
  const modeName = $('input[name="radTestMode"]:checked').val();
  const lon = $('#lon').val();
  const lat = $('#lat').val();

  console.log({
    isr, netTypeName, modeName, testServer, lon, lat
  });

  $.ajax({
    url: 'set-test-details',
    method: 'POST',
    data: {
      isr: isr,
      net: netTypeName,
      mode: modeName,
      serverIP: testServer?.ip_address,
      lon: lon,
      lat: lat,
    },
    dataType: 'json',
    success: async function (response) {
      console.log("response", response);

      $('#summary-isp').html('<i class="small text-muted">(undetected)</i>');
      await getIsp()
        .then(isp => {
          testClient.isp = isp;
        })
        .catch(ex => {
          testClient.isp = "";
          
          const errorJson = JSON.parse(ex.responseText);
          errorMsg = ex.responseText;
          if ("error" in errorJson) {
            errorMsg = errorJson['error'];
          }
          console.log(errorMsg);
        });

      $('#btnStartTest').attr('disabled', false);
      $('#mainForm fieldset').attr('disabled', true);

      testInputs.isr = response['isr'];
      testInputs.networkConnectionTypeName = response['net'];
      testInputs.modeName = response['mode'];
      testInputs.lon = response['lon'];
      testInputs.lat = response['lat'];
      testInputs.testServer = testServer;

      backToTop();

      measurementTimes = {
        upload: [],
        download: []
      };

      $('#summary-isr').text(testInputs.isr + " Mbps");
      $('#summary-net').text(testInputs.networkConnectionTypeName);
      $('#summary-server').text(testInputs.testServer.nickname);
      $('#summary-mode').text(testInputs.mode.titleCase);
      $('#summary-coordinates').text(testInputs.coordinates);

      $('#summary-isp').text(testClient.isp);

      $("#measurement-card .card-header h5").text(`Testing ${testInputs.mode.titleCase} mode...`);

      $('#measurement-card').removeClass('d-none');
      // $('#measurement-results-card').hide();
      // $('#measurement-failed-card').hide();
      $('.btn-test-done-options').addClass('d-none');
      $('#btnBackToTop').removeClass('d-none');
      $('#btnSaveAsPdf').addClass('d-none');

      createMeasurementProcessesTable(testInputs.mode.methods);

      const startTime = Date.now();
      const timerInterval = setInterval(function () {
        const elapsedSeconds = ((Date.now() - startTime)) / 1000.0;
        const minutes = parseInt(elapsedSeconds / 60);
        const seconds = parseInt(elapsedSeconds) % 60;

        testTime.duration = `${numeral(minutes).format("0")}m ${numeral(seconds).format("00")}s`;

        $(`#${currentTestDirection}-process-time-${currentProcessIndex}`).text(`${numeral(minutes).format("0")}:${numeral(seconds).format("00")}`);
      }, 50);

      testTime.startedOn = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
      $('#summary-test-started-on').text(testTime.startedOn );

      switch (testInputs.mode.name) {
        case "normal":
        case "reverse":
          const methodName = testInputs.mode.methods[0];
          executeMeasurements(testInputs.testServer, methodName)
            .then(resultsHtml => {
              appState = APP_STATE.TestFinished;

              clearInterval(timerInterval);

              $("#measurement-card .card-header h5").text(`Finished`);
              
              setTestFinishTimes(methodName);

              showTestResults(resultsHtml, methodName);
            })
            .catch((err) => {
              console.log("normal/reverse");
              console.log({ err });
              clearInterval(timerInterval);
              showTestFailed(err, currentProcessIndex, 0);
            });
          break;
        case "bidirectional":
          let directionIndex = 0;
          executeMeasurements(testInputs.testServer, testInputs.mode.methods[directionIndex])
            .then(resultsHtml => {
              showTestResults(resultsHtml, testInputs.mode.methods[directionIndex]);
              directionIndex++;

              return executeMeasurements(testInputs.testServer, testInputs.mode.methods[directionIndex]);
            })
            .then(resultsHtml => {
              appState = APP_STATE.TestFinished;
              
              clearInterval(timerInterval);
              showTestResults(resultsHtml, testInputs.mode.methods[directionIndex]);

              $("#measurement-card .card-header h5").text(`Finished`);
              setTestFinishTimes(testInputs.mode.methods[directionIndex]);
            })
            .catch(err => {
              appState = APP_STATE.TestFinished;

              console.log(err);
              clearInterval(timerInterval);
              showTestFailed(err, currentProcessIndex, directionIndex);
            });
          break;
      }
    },
    error: function (err) {
      $('#btnStartTest').attr('disabled', false);
    },
    complete: function () {
      $('#btnStartTest .spinner-border').addClass('d-none');
    }
  });

  return false;
}

function setTestFinishTimes(methodName) {
  const measurementLength = measurementTimes[methodName].length;
  const lastMeasurementTime = measurementTimes[methodName][measurementLength - 1][1];

  testTime.finishedOn = moment(lastMeasurementTime).format('YYYY-MM-DD HH:mm:ss');
  $('#summary-test-finished-on').html(testTime.finishedOn);
  $('#summary-test-duration').html(testTime.duration);

  $('#btnBackToTop').addClass('d-none');
  $('#btnSaveAsPdf').removeClass('d-none');
  $('.btn-test-done-options').removeClass('d-none');
}

function executeMeasurements(testServer, methodName) {
  const testMethod = TEST_METHODS[methodName];
  currentTestDirection = methodName;
  currentProcessIndex = 0;

  const executeProcess = (process) => {
    console.log({ process });
    console.log(`Current process: ${process.processId} - ${testServer.hostname}/api/${testMethod.mode}/${process.processId}`);

    const getProcessInfo = (processId) => {
      console.log({ processId });

      const directExecutions = ['mtu', 'rtt'];
      return new Promise(function (resolve, reject) {
      
        if (directExecutions.includes(processId)) {
          resolve();
          return;
        }

        $.ajax({
          url: 'process',
          method: 'GET',
          data: {
            testServerName: testServer.nickname,
            testServerUrl: testServer.hostname,
            mode: testMethod.mode,
            processId: process.processId,
            requiredParams: JSON.stringify(getRequiredGetParameters(processId))
          },
          dataType: 'json',
          timeout: MEASUREMENT_TIMEOUT,
          success: function (data) {
            resolve(data);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("GET process error");
            console.log({jqXHR, textStatus, errorThrown});
            reject(jqXHR);
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
            testServerName: testServer.nickname,
            testServerUrl: testServer.hostname,
            mode: testMethod.mode,
            jobId,
            measurementTestName: process.label
          },
          dataType: 'json',
          timeout: MEASUREMENT_TIMEOUT,
          success: function (data) {
            setTimeout(function () {
              resolve(data);
            }, statusCheckingInterval);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("GET checkStatus error");
            console.log({jqXHR, textStatus, errorThrown});
            reject(jqXHR);
          }
        });
      });
    }

    let isLooped = false;
    const checkQueue = (jobId, port) => checkStatus(jobId).then(status => {
      console.log({status});
      if (Number.isInteger(status)) {
        const queuePlacement = parseInt(status) + 1;
        if (!isLooped) {
          $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html(`
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
        isLooped = false;
        return Promise.resolve(port);
      }
    });

    const runScriptProcess = (processId, port) => {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: `run-process-${processId}`,
          method: 'POST',
          data: getRequiredScriptParameters(processId, port, testMethod),
          dataType: 'json',
          timeout: MEASUREMENT_TIMEOUT,
          success: function (scriptData) {
            resolve(scriptData);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("GET runScriptProcess error");
            console.log({jqXHR, textStatus, errorThrown});
            reject(jqXHR);
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
          $(`#${testMethod.name}-results-param-${key}`).text(`${rParam.getMeasurement(scriptData[key])}`);
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
            testServerName: testServer.nickname,
            testServerUrl: testServer.hostname,
            mode: testMethod.mode,
            processId: process.processId,
            scriptData: JSON.stringify(scriptData)
          },
          dataType: 'json',
          timeout: MEASUREMENT_TIMEOUT,
          success: function () {
            resolve();
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log("GET postProcess error");
            console.log({jqXHR, textStatus, errorThrown});
            reject(jqXHR);
          }
        });
      });
    };

    return new Promise((resolve, reject) => {
      $(`#${testMethod.name}-process-label-${currentProcessIndex}`).html(`${process.label}...`);
      $(`#${testMethod.name}-process-label-${currentProcessIndex}`).removeClass("text-muted");

      $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html('<i class="small">Connecting to test server...</i>');
      $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html(`
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `);

      getProcessInfo(process.processId)
        .then(response => {
          if (response != null) {
            $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html('<i class="small text-nowrap">Checking queue...</i>');

            return checkQueue(response.job_id, response.port);
          }
        })
        .then(port => {
          measurementTimes[methodName].push([Date.now(), null]);

          $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html('<i class="small text-primary text-nowrap">Measuring...</i>');
          $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html(`
            <div class="spinner-grow spinner-grow-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          `);

          return runScriptProcess(process.processId, port)
        })
        .then(scriptData => {
          $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html('<i class="small text-primary text-nowrap">Sending measurements...</i>');
          $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html(`
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          `);
          
          return postProcess(scriptData);
        })
        .then(() => {
          measurementTimes[methodName][currentProcessIndex][1] = Date.now();
          $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html('<i class="bi bi-check-circle-fill text-success"></i>');

          $(`#${testMethod.name}-process-label-${currentProcessIndex}`).html(process.label);
          $(`#${testMethod.name}-process-label-${currentProcessIndex}`).addClass("text-success");

          $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html(`
            <span class="px-2 text-nowrap text-success small" data-bs-toggle="tooltip" data-bs-placement="top" title="${moment(measurementTimes[methodName][currentProcessIndex][0]).format('HH:mm:ss.SSS')} - ${moment(measurementTimes[methodName][currentProcessIndex][1]).format('HH:mm:ss.SSS')}">
              ${moment(measurementTimes[methodName][currentProcessIndex][0]).format('hh:mm:ss a')} - ${moment(measurementTimes[methodName][currentProcessIndex][1]).format('hh:mm:ss a')}
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
            testServerName: testServer.nickname,
            testServerUrl: testServer.hostname,
            mode: testMethod.mode,
          },
          dataType: 'html',
          timeout: MEASUREMENT_TIMEOUT,
          success: function (resultsHtml) {
            resolve(resultsHtml);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('GET get-results error');
            console.log({jqXHR, textStatus, errorThrown});
            reject(jqXHR);
          }
        });
      }, 500);
    });
  }

  const executeAllProcesses = async () => {
    return new Promise((resolve, reject) => {
      MEASUREMENT_PROCESSES.reduce(async (previousPromise, nextProcess) => {
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
  //         $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html('<i class="bi bi-check-circle-fill text-success"></i>');

  //         $(`#${testMethod.name}-process-label-${currentProcessIndex}`).html(process.label);
  //         $(`#${testMethod.name}-process-label-${currentProcessIndex}`).addClass("text-success");

  //         $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html(`
  //           <span class="px-2 text-nowrap text-success small" data-bs-toggle="tooltip" data-bs-placement="top" title="${moment(measurementTimes[methodName][currentProcessIndex][0]).format('HH:mm:ss.SSS')} - ${moment(measurementTimes[methodName][currentProcessIndex][1]).format('HH:mm:ss.SSS')}">
  //             ${moment(measurementTimes[methodName][currentProcessIndex][0]).format('hh:mm:ss a')} - ${moment(measurementTimes[methodName][currentProcessIndex][1]).format('hh:mm:ss a')}
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

function getRequiredScriptParameters(processId, port, testMethod) {
  let data = {};
  switch (processId) {
    case "mtu":
    case "rtt":
      data = {
        mode: testMethod.mode,
        networkConnectionTypeName: testInputs.networkConnectionTypeName,
        networkPrefix: testInputs.networkConnectionType.prefix,
        serverIP: testInputs.testServer.ip_address,
      }
      break;
    case "bdp":
      data = {
        mode: testMethod.mode,
        rtt: requiredGetParamaters.rtt,
        serverIP: testInputs.testServer.ip_address,
        port,
      }
      break;
    case "thpt":
      data = {
        mode: testMethod.mode,
        rtt: requiredGetParamaters.rtt,
        rwnd: requiredGetParamaters.rwnd,
        ideal: testInputs.isr,
        serverIP: testInputs.testServer.ip_address,
        port,
      }
      break;
  }
  return data;
}

function showTestResults(resultsHtml, methodName) {
  $(`#${methodName}-measurement-results`).append(resultsHtml);

  const successIconHtml = methodName == "upload"
    ? '<i class="bi bi-arrow-up-circle"></i>'
    : '<i class="bi bi-arrow-down-circle"></i>';
  $(`#${methodName}-test-results-status`).html(successIconHtml);
}

function showTestFailed(err, processIndex, directionIndex) {
  const process = MEASUREMENT_PROCESSES[processIndex];
  const testMode = testInputs.mode;

  console.log({ process });

  const methodName = testMode.methods[directionIndex];
  if (process) {
    $(`#${methodName}-process-status-${processIndex}`).html('<i class="bi bi-x-octagon-fill text-danger"></i>');
    $(`#${methodName}-process-label-${processIndex}`).text(process.label);
    $(`#${methodName}-process-label-${processIndex}`).addClass("text-danger");
    $(`#${methodName}-process-status-label-${processIndex}`).html(`<span class="px-2 text-nowrap text-danger">Failed</span>`);
  }

  $("#measurement-card .card-header h5").text(`${testMode.titleCase} mode failed`);

  let errorTitle = "Unexpected error occured";
  let errorContent = err.responseText;

  if (err.readyState == 0) {
    errorTitle = "Network error";
    errorContent = err.statusText;
  } else if (err.readyState == 4) {
    const errorJson = err.responseJSON ?? JSON.parse(err.responseText);
    if ("error" in errorJson) {
      errorTitle = errorJson.error;
    }
    if ("message" in errorJson) {
      errorContent = JSON.stringify(errorJson.message);
    }
  }

  const errorTitleLower = errorTitle.toLowerCase();
  let errorButtonsHtml = `
    <button class="btn btn-sm btn-primary" onclick="tryAgain()">Restart test</button>
    <button class="btn btn-sm btn-secondary" onclick="resetTest()">Cancel test</button>
  `;

  if (errorTitleLower.includes("token") && errorTitleLower.includes("expired")) {
    errorButtonsHtml = `
      <a href="/logout" class="btn btn-sm btn-link text-primary" role="button">
        Log in again
      </a>
    `;
  }
  
  testInputs.finishedOn = moment().format('YYYY-MM-DD HH:mm:ss');
  $('#summary-test-finished-on').html(`<span class="text-secondary">${testInputs.finishedOn}</span>`);
  $('#summary-test-duration').html(`<span class="text-secondary">${testInputs.duration}</span>`);

  $('#process-error').html(`
    <div class="card border-danger rounded-0 mt-1 mx-2">
      <div class="card-header bg-danger bg-opacity-10 text-danger p-3">${errorTitle}</div>
      <div class="card-body bg-light monospace">
        <table cellpadding="4">
          <tbody class="card-text font-monospace small">
            <tr>
              <td>Timestamp:</td>
              <td>${testInputs.finishedOn}</td>
            </tr>
            <tr>
              <td>Test Server:</td>
              <td>${testInputs.testServer.nickname}</td>
            </tr>
          </tbody>
        </table>
        <a href="javascript:void(0);" id="btnOpenLogsFolder" class="btn btn-sm btn-link text-primary p-1" role="button" onclick="openLogsFolder()">Open Logs folder</a>
      </div>
    </div>
    <div class="mx-2 my-1 mb-2">
      ${errorButtonsHtml}
    </div>
  `);

  for (const dName of testMode.methods) {
    $(`#${dName}-test-results-status`).html('<i class="bi bi-x-octagon text-danger"></i>');
  }

  for (const [key, _] of Object.entries(resultsParameters)) {
    if ($(`#${methodName}-results-param-${key} div span`).hasClass('placeholder')) {
      $(`#${methodName}-results-param-${key}`).html("<i class='text-muted'>error</i>");
    }
  }
}

function backToTop() {
  $('html, body').animate({
    scrollTop: $('#measurement-card').offset().top - 72
  }, 200);
}

function closeTest() {
  const confirmClose = confirm("Close this test?");
  if (!confirmClose) {
    return;
  }

  appState = APP_STATE.Ready;

  $(`#process-error`).html('');

  $('#mainForm fieldset').attr('disabled', false);

  $("#mainForm").trigger('reset');
  $('#mainForm').removeClass('was-validated');

  $('#measurement-card').addClass('d-none');
  // $('#measurement-failed-card').hide();

  $('#net-warning').addClass('d-none');

  renderMap();
  
  $('#isr').focus();
}

function repeatTest() {
  const confirmRepeat = confirm("Repeat the test?");
  if (!confirmRepeat) {
    return;
  }

  $('#measurement-card').addClass('d-none');
  
  startTest();
}

function tryAgain() {
  // TODO: clear error html after clicking this
  // TODO: change try again to "RESTART test"
  $(`#process-error`).html('');
  // $('#measurement-failed-card').hide();

  startTest();
}

function resetTest() {
  appState = APP_STATE.Ready;

  // TODO: clear error html after clicking this
  $(`#process-error`).html('');
  $('#mainForm fieldset').attr('disabled', false);

  $('#measurement-card').addClass('d-none');
  // $('#measurement-failed-card').hide();

  $('#net-warning').addClass('d-none');
}

function saveAsPdf() {
  $('#btnSaveAsPdf').attr('disabled', true);
  $('#btnSaveAsPdf .spinner-border').removeClass('d-none');

  const methods = testInputs.mode.methods;
  const now = moment();
  const nowProper = now.format('YYYY-MM-DD HH:mm:ss');

  $.ajax({
    url: 'report-data',
    method: 'POST',
    data: {
      methods: JSON.stringify(methods),
      serverName: testInputs.testServer.nickname,
      startedOn: testTime.startedOn,
      finishedOn: testTime.finishedOn,
      duration: testTime.duration,
      isp: testClient.isp
    },
    dataType: 'json',
    success: async function ({testInputs, testTime, testClient, results}) {
      await generateReport(testInputs, testTime, testClient, results);

      $('#btnSaveAsPdf').attr('disabled', false);
      $('#btnSaveAsPdf .spinner-border').addClass('d-none');
      $('#btnSaveAsPdf').addClass('d-none');
      $('#pdfSaved').removeClass('d-none');
    },
    error: function (err) {
      $('#btnSaveAsPdf').attr('disabled', false);
      $('#btnSaveAsPdf .spinner-border').addClass('d-none');
      $('#btnSaveAsPdf').addClass('d-none');
      $('#pdfSaved').removeClass('d-none');

      console.error(err);
    },
    complete: function () {
    }
  });
}

// function saveAsPdf() {
//   $('#btnSaveAsPdf').attr('disabled', true);
//   $('#btnSaveAsPdf .spinner-border').show();

//   const methods = TEST_MODES[_mode].methods;
//   const now = moment();
//   const nowProper = now.format('YYYY-MM-DD HH:mm:ss');

//   $('#modalPdfReport .progress').show();
//   $('#modalPdfReport .btn-close').show();

//   $('#results-pdf').html(`<div class="d-flex justify-content-start">
//     <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//     <h6 class="ms-2">Please wait...</h6>
//   </div>`);

//   $('#modalPdfReport').modal("show");

//   const pdfAjax = $.ajax({
//     url: 'report',
//     method: 'POST',
//     data: {
//       methods: JSON.stringify(methods),
//       serverName: _testServer.nickname,
//       startedOn: _testStartedOnText,
//       finishedOn: _testFinishedOnText,
//       duration: _testDurationText,
//       generatedOn: nowProper
//     },
//     dataType: 'html',
//     success: async function (reportHtml) {
//       $('#modalPdfReport .btn-close').hide();

//       $('#results-pdf').html(reportHtml);

//       const testFinisedOnFileName = moment(_testFinishedOnText).format('YYYY-MM-DD-HHmmss');
//       const defaultFileName = `netmesh_rfc-6349_${_mode}_${testFinisedOnFileName}.pdf`;

//       const opt = {
//         margin: [1, 1],
//         filename: defaultFileName,
//         image: { type: 'jpeg', quality: 0.98 },
//         html2canvas: { scale: 3, letterRendering: true },
//         jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
//         pagebreak: { before: [] }
//       };

//       const pageBreaks = ['#test-results-title'];
//       if (methods && methods.length == 2) {
//         pageBreaks.push(`#${methods[1]}-test-title`);
//       }
//       opt.pagebreak.before = pageBreaks;

//       const element = document.getElementById('results-pdf');

//       setTimeout(function () {
//         html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
//           var totalPages = pdf.internal.getNumberOfPages();
        
//           for (i = 1; i <= totalPages; i++) {
//             const pageWidth = pdf.internal.pageSize.getWidth();
//             const pageHeight = pdf.internal.pageSize.getHeight();
            
//             pdf.setPage(i);
//             pdf.setFontSize(8);
//             pdf.setTextColor(108);
//             pdf.text('Page ' + i + ' of ' + totalPages, pageWidth - 0.5, pageHeight - 0.5, {
//               align: 'right',
//             });
//             pdf.text(`${nowProper} | ISR: ${_cir} Mbps | ${_netTypeName} | ${_testServer.nickname}`, opt.margin[1] - 0.5, pageHeight - 0.5, {
//               align: 'left',
//             });
//           }

//           $('#modalPdfReport .progress').hide();
//           $('#modalPdfReport .btn-close').show();
  
//           $('#btnSaveAsPdf').attr('disabled', false);
//           $('#btnSaveAsPdf .spinner-border').hide();
          
//           $('#results-pdf').html(`<div>
//             <h5 class="text-success">Successfully saved!</h5>
//             <span>${defaultFileName}</span>
//             <a href="javascript:void(0);" id="btnOpenDownloadsFolder" class="btn btn-link text-primary" role="button" onclick="openDownloadsFolder()">Open Downloads folder</a>
//           </div>`);
//         }).save();
//       }, 300);
//     },
//     error: function (err) {
//       $('#modalPdfReport .btn-close').show();
//       $('#modalPdfReport .progress').hide();
  
//       $('#btnSaveAsPdf').attr('disabled', false);
//       $('#btnSaveAsPdf .spinner-border').hide();
//       console.error(err);
//     },
//     complete: function () {
//     }
//   });

//   $('#modalPdfReport').on('hide.bs.modal', function () {
//     pdfAjax.abort();
//   });
// }

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

function openDownloadsFolder() {
  $('#btnOpenDownloadsFolder').attr('disabled', true);
  $.post('/open-downloads-folder', function () {
    $('#btnOpenDownloadsFolder').attr('disabled', false);
  });

  $('#btnSaveAsPdf').removeClass('d-none');
  $('#pdfSaved').addClass('d-none');
}

function openLogsFolder() {
  $('#btnOpenLogsFolder').attr('disabled', true);
  $.post('/open-logs-folder', function () {
    $('#btnOpenLogsFolder').attr('disabled', false);
  });
}

function getIsp() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: 'get-isp',
      method: 'GET',
      success: function (isp) {
        resolve(isp);
      },
      error: function (err) {
        reject(err);
      }
    });
  });
}