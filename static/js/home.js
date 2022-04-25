const chartImageUris = Object.seal({
  throughputCharts: {},
  transferCharts: {},
  rttCharts: {}
});

(function () {
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

  const testTime = Object.seal({
    startedOn: '',
    finishedOn: '',
    duration: ''
  });

  const testClient = Object.seal({
    username: $('#loggedUsername').text(),
    machineName: '',
    isp: '',
    publicIP: '',
  });


  let testServers = [];
  let testResults = {};
  
  let requiredGetParamaters = {
    mtu: null,
    rtt: null,
    rwnd: null,
    tx_bytes: null,
    ideal_thpt: null,
    thpt_avg: null,
    rtt: null,
    ave_rtt: null,
    retx_bytes: null,
  };

  let postThoughputScriptData = {};
  
  let measurementTimes = {
    upload: [],
    download: []
  };
  
  let currentTestDirection = "";
  let currentProcessIndex = 0;
  
  let appState = APP_STATE.Ready;
  
  let map = null;
  let mapLayer = null;
  let nominatimGetRequest = null;
  let nominatimGetRequestDelay = null;
  
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

    setTestServers();
    renderMap();
    
    // Render Network Connection Type selection
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
  
    // Render Get Location button
    $('#btnGetGpsCoordinates').on('click', function () {
      $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', true);
      $('#btnGetGpsCoordinates .spinner-grow').removeClass('d-none');
  
      $.ajax({
        url: '/get-gps-coordinates',
        method: 'POST',
        success: function (coordinates) {
          const lat = coordinates[0];
          const lon = coordinates[1];
    
          if (lat && lon) {
            $('#lat').val(lat);
            $('#lon').val(lon).change();
          } else {
            $('#modalGpsProblem').modal('show');
          }
  
          $('#gpsError').addClass("d-none");
        },
        error: function (err) {
          console.log(err.responseText);
          $('#gpsError').text(err.responseText);
          $('#gpsError').removeClass("d-none");
        },
        complete: function () {
          $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', false);
          $('#btnGetGpsCoordinates .spinner-grow').addClass('d-none');
        }
      })
    });

    // Set on click: Show Location Help button
    $('#btnGpsHelp').on('click', function () {
      $('#modalGpsHelp').modal('show');
    });

    // Set on click: Enter GPS Coordinates Manually button
    $('#btnEnterGpsManually').on('click', function () {
      enterGpsCoordinatesManually();
    });

    // Set on click: Clear Map button, Enter GPS Coordinates Manually - Back button
    $('#btnMapClear, #btnManualGpsCancel').on('click', function () {
      backToGpsInputSelection();
    });

    // Set on click: Enter GPS Coordinates Manually - OK button
    $('#btnManualGpsOK').on('click', function () {
      setManualGpsCoordinates();
    });
  
    // Set on change: GPS coordinates
    $('#lat, #lon').change(function () {
      const lat = $('#lat').val();
      const lon = $('#lon').val();
  
      renderMap(lat, lon);
    });

    // Press enter key to confirm manual GPS coordinates input
    $('#lat_manual, #lon_manual').on('keydown', function (e) {
      if (e.keyCode == 13) {
        setManualGpsCoordinates();
        e.preventDefault();
      }
    });

    // Set on submit: Test Input form
    $('#mainForm').submit(async function (e) {
      e.preventDefault();
      return await startTest();
    });
  
    // Set on click: Close Test button
    $('#btnCancelTest').click(function () {
      appState = APP_STATE.Ready;

      // TODO: clear error html after clicking this
      $(`#process-error`).html('');
      $('#mainForm fieldset').attr('disabled', false);

      $('#measurement-card').addClass('d-none');
      // $('#measurement-failed-card').hide();

      $('#net-warning').addClass('d-none');
    });
  
    // Set on click: Close Test button
    $('#btnRestartTest').click(async function () {
      // TODO: clear error html after clicking this
      // TODO: change try again to "RESTART test"
      $(`#process-error`).html('');
      // $('#measurement-failed-card').hide();

      await startTest();
    });
  
    // Set on click: Close Test button
    $('#btnCloseTest').click(async function () {
      $('#modalReenterPassword .modal-title').text('Conduct New Test');
      $('#modalReenterPassword .btn').text('Submit');
  
      await passwordModal().then(() => {
        closeTest();
      }).catch((e) => {
        console.log("baka nga error", e);
      });
    });
  
    // Set on click: Back to Top button
    $('#btnBackToTop').on('click', function () {
      backToTop();
    });
  
    // Set on click: Save as PDF button
    $('#btnSaveAsPdf').on('click', async function () {
      await saveAsPdf();
    });

    // Set on click: Open Downloads Folder button
    $('#btnOpenDownloadsFolder').on('click', function () {
      openDownloadsFolder();
    });

    // Focus on ISR field when window is loaded
    $('#isr').focus();
  
    // Set validation
    (function () {
      window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation');
  
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
  
    // Prompt when window is being reloaded
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
  
    // $('#modalReenterPassword').modal('show');
  
    // $.ajax({
    //   url: '/user-password-modal',
    //   method: 'GET',
    //   success: function (modalHtml) {
    //     $('#modalContainer').html(modalHtml);
    //   },
    //   error: function (err) {
    //     console.error(err);
    //   }
    // });
    
    // window.addEventListener('online', (e) => console.log(e, "you're online"));
    // window.addEventListener('offline', (e) => {
      
    // });
  
    // renderThoughputComparisonChart();
    // renderTransferComparisonChart();
    // const options = getRttChartOptions("download", 9.956, 7.614);
    // const options = getRttChartOptions("download", 7, 6.968);
    // const options = getRttChartOptions("download", 4.815, 6.145);
    // options.chart.width = 640;
    // options.chart.height = 128;
    // const chart = new ApexCharts(document.querySelector(`#download-rtt-chart`), options);
    // chart.render().then(() => {
    //   setTimeout(function () {
    //     chart.dataURI({scale: 3}).then(({imgURI}) => {
    //       chartImageUris.transferCharts['download'] = imgURI;
    //     });
    //     chart.destroy();
  
    //     options.chart.width = '100%';
    //     const chart2 = new ApexCharts(document.querySelector(`#download-rtt-chart`), options);
    //     chart2.render();
    //   }, 200);
    // });
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
        // testServers.push({
        //   nickname: 'Local server ni Jean Jay :D',
        //   hostname: 'http://192.168.90.20:5000',
        //   ip_address: '192.168.90.20'
        // });
  
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
        /* HARDCODED SERVER */
        // $('#testServersPlaceholder').html(`<select class="form-select" id="testServers" required></select>
        //   <div class="invalid-feedback">Select a test server</div>`);

        // $('#testServers').on('change', function () {
        //   const selectedServer = $('#testServers option:selected').text();
        //   if (selectedServer) {
        //     $(this).attr('title', selectedServer.trim());
        //   }
        // });
  
        // let $testServers = $('#testServers');
        // $testServers.html('');
        // $testServers.append('<option selected disabled value="">Select a test server...</option>');

        // testServers = [
        //   {
        //     nickname: 'Down pa yung results server kaya hardcoded muna yung selection ng test server hahaha - ibalik sa dati yung code ah baka makalimutan haha',
        //     hostname: 'http://202.90.158.6:12000',
        //     ip_address: '202.90.158.6'
        //   }
        // ]
  
        // for (let i = 0; i < testServers.length; i++) {
        //   const server = testServers[i];
        //   $testServers.append(`
        //     <option value="${i}"> 
        //       ${server.nickname}
        //     </option>`
        //   );
        // }
  
        // $('#btnStartTest').attr('disabled', false);
        // return;
        /* END */

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
          <button id="btnReloadTestServers" class="btn btn-sm btn-link text-primary p-0" type="button" role="button">Reload test servers</button>
        </div>`);
      }
    });
  }
  
  $('#testServersPlaceholder').on('click', '#btnReloadTestServers', function () {
    $('#testServersPlaceholder').html(`<div class="placeholder-wave">
      <span class="placeholder col-12"></span>
    </div>`);
    setTestServers();
  });
  
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
  
  async function startTest() {
    appState = APP_STATE.Testing;
  
    $('#btnStartTest').attr('disabled', true);
    $('#btnStartTest .spinner-border').removeClass('d-none');
  
    $('#btnSaveAsPdf').removeClass('d-none');
    $('#pdfSaved').addClass('d-none');
  
    // const isr = $('#isr').val();
    // const netTypeName = $('#netType').val();
    
    // const testServerIndex = $('#testServers').val();
    // const testServer = testServers[testServerIndex];
    
    // const modeName = $('input[name="radTestMode"]:checked').val();
    // const lon = $('#lon').val();
    // const lat = $('#lat').val();

    testInputs.isr = $('#isr').val();
    testInputs.networkConnectionTypeName = $('#netType').val();
    
    const testServerIndex = $('#testServers').val();
    testInputs.testServer = testServers[testServerIndex];
    
    testInputs.modeName = $('input[name="radTestMode"]:checked').val();
    testInputs.location.lat = $('#lat').val();
    testInputs.location.lon = $('#lon').val();

    
    if (!(testInputs.isr
        && testInputs.networkConnectionTypeName
        && testInputs.testServer
        && testInputs.modeName
        && testInputs.location.lat
        && testInputs.location.lon)) {

      $('#btnStartTest .spinner-border').addClass('d-none');
      $('#btnStartTest').attr('disabled', false);

      return;
    }

    getIspInfo()
      .then(({isp, publicIP}) => {
        testClient.isp = isp;
        testClient.publicIP = publicIP;

        $('#summary-isp').text(`${testClient.isp}`);
        $('#summary-public-ip').text(`${testClient.publicIP}`);
      })
      .catch(ex => {
        testClient.isp = "";
        testClient.publicIP = "";
        
        const errorJson = JSON.parse(ex.responseText);
        errorMsg = ex.responseText;
        if ("error" in errorJson) {
          errorMsg = errorJson['error'];
        }

        $('#summary-isp').html('<i class="small text-muted">(undetected)</i>');
        $('#summary-public-ip').html('<i class="small text-muted">(undetected)</i>');
        console.log(errorMsg);
      });

      getMachineName()
        .then((machineName) => {
          testClient.machineName = machineName;

          // $('#machine-name').text(`${testClient.machineName}`);
        })
        .catch(ex => {
          testClient.machineName = "";
          
          const errorJson = JSON.parse(ex.responseText);
          errorMsg = ex.responseText;
          if ("error" in errorJson) {
            errorMsg = errorJson['error'];
          }

          // $('#machine-name').html('<i class="small text-muted">(undetected)</i>');
          console.log(errorMsg);
      });

    $('#btnStartTest').attr('disabled', false);
    $('#mainForm fieldset').attr('disabled', true);

    backToTop();

    measurementTimes = {
      upload: [],
      download: []
    };

    $('#summary-isr').text(testInputs.isr + " Mbps");
    $('#summary-net').text(testInputs.networkConnectionTypeName);
    $('#summary-server').text(testInputs.testServer.nickname);
    $('#summary-mode').text(testInputs.mode.titleCase);
    $('#summary-coordinates').text(`${testInputs.coordinates}`);

    $("#measurement-card .card-header h5").text(`Testing ${testInputs.mode.titleCase} mode...`);

    $('#measurement-card').removeClass('d-none');
    $('#btnCancelTest').addClass('d-none');
    $('#btnRestartTest').addClass('d-none');
    $('#btnCloseTest').addClass('d-none');
    $('#btnBackToTop').removeClass('d-none');
    $('#btnSaveAsPdf').addClass('d-none');

    $('#mapOptions').addClass("d-none");

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
          .then(resultsHtml =>  {
            appState = APP_STATE.TestFinished;

            clearInterval(timerInterval);

            $("#measurement-card .card-header h5").text(`Finished`);
            
            setTestFinishTimes(methodName);

            showTestResults(resultsHtml, methodName);
          })
          .catch(async (err) => {
            console.log("normal/reverse");
            console.log({ err });
            clearInterval(timerInterval);
            await showTestFailed(err, currentProcessIndex, 0);
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
          .catch(async (err) => {
            appState = APP_STATE.TestFinished;

            console.log(err);
            clearInterval(timerInterval);
            await showTestFailed(err, currentProcessIndex, directionIndex);
          });
        break;
    }

    $('#btnStartTest .spinner-border').addClass('d-none');

    // $.ajax({
    //   url: 'set-test-details',
    //   method: 'POST',
    //   data: {
    //     isr: isr,
    //     net: netTypeName,
    //     mode: modeName,
    //     serverIP: testServer?.ip_address,
    //     lon: lon,
    //     lat: lat,
    //   },
    //   dataType: 'json',
    //   success: async function (response) {
    //     console.log("response", response);
  
    //     $('#summary-isp').html('<i class="small text-muted">(undetected)</i>');
    //     await getIspInfo()
    //       .then(({isp, publicIP}) => {
    //         testClient.isp = isp;
    //         testClient.publicIP = publicIP;
  
    //         $('#summary-isp').text(`${testClient.isp} (${testClient.publicIP})`);
    //       })
    //       .catch(ex => {
    //         testClient.isp = "";
    //         testClient.publicIP = "";
            
    //         const errorJson = JSON.parse(ex.responseText);
    //         errorMsg = ex.responseText;
    //         if ("error" in errorJson) {
    //           errorMsg = errorJson['error'];
    //         }
    //         console.log(errorMsg);
    //       });
  
    //     $('#btnStartTest').attr('disabled', false);
    //     $('#mainForm fieldset').attr('disabled', true);
  
    //     testInputs.isr = response['isr'];
    //     testInputs.networkConnectionTypeName = response['net'];
    //     testInputs.modeName = response['mode'];
    //     testInputs.lon = response['lon'];
    //     testInputs.lat = response['lat'];
    //     testInputs.testServer = testServer;
  
    //     backToTop();
  
    //     measurementTimes = {
    //       upload: [],
    //       download: []
    //     };
  
    //     $('#summary-isr').text(testInputs.isr + " Mbps");
    //     $('#summary-net').text(testInputs.networkConnectionTypeName);
    //     $('#summary-server').text(testInputs.testServer.nickname);
    //     $('#summary-mode').text(testInputs.mode.titleCase);
    //     $('#summary-coordinates').text(testInputs.coordinates);
  
    //     $("#measurement-card .card-header h5").text(`Testing ${testInputs.mode.titleCase} mode...`);
  
    //     $('#measurement-card').removeClass('d-none');
    //     $('.btn-test-done-options').addClass('d-none');
    //     $('#btnBackToTop').removeClass('d-none');
    //     $('#btnSaveAsPdf').addClass('d-none');
  
    //     $('#mapOptions').addClass("d-none");
  
    //     createMeasurementProcessesTable(testInputs.mode.methods);
  
    //     const startTime = Date.now();
    //     const timerInterval = setInterval(function () {
    //       const elapsedSeconds = ((Date.now() - startTime)) / 1000.0;
    //       const minutes = parseInt(elapsedSeconds / 60);
    //       const seconds = parseInt(elapsedSeconds) % 60;
  
    //       testTime.duration = `${numeral(minutes).format("0")}m ${numeral(seconds).format("00")}s`;
  
    //       $(`#${currentTestDirection}-process-time-${currentProcessIndex}`).text(`${numeral(minutes).format("0")}:${numeral(seconds).format("00")}`);
    //     }, 50);
  
    //     testTime.startedOn = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
    //     $('#summary-test-started-on').text(testTime.startedOn );
  
    //     switch (testInputs.mode.name) {
    //       case "normal":
    //       case "reverse":
    //         const methodName = testInputs.mode.methods[0];
    //         executeMeasurements(testInputs.testServer, methodName)
    //           .then(resultsHtml =>  {
    //             appState = APP_STATE.TestFinished;
  
    //             clearInterval(timerInterval);
  
    //             $("#measurement-card .card-header h5").text(`Finished`);
                
    //             setTestFinishTimes(methodName);
  
    //             showTestResults(resultsHtml, methodName);
    //           })
    //           .catch(async (err) => {
    //             console.log("normal/reverse");
    //             console.log({ err });
    //             clearInterval(timerInterval);
    //             await showTestFailed(err, currentProcessIndex, 0);
    //           });
    //         break;
    //       case "bidirectional":
    //         let directionIndex = 0;
    //         executeMeasurements(testInputs.testServer, testInputs.mode.methods[directionIndex])
    //           .then(resultsHtml => {
    //             showTestResults(resultsHtml, testInputs.mode.methods[directionIndex]);
    //             directionIndex++;
  
    //             return executeMeasurements(testInputs.testServer, testInputs.mode.methods[directionIndex]);
    //           })
    //           .then(resultsHtml => {
    //             appState = APP_STATE.TestFinished;
                
    //             clearInterval(timerInterval);
    //             showTestResults(resultsHtml, testInputs.mode.methods[directionIndex]);
  
    //             $("#measurement-card .card-header h5").text(`Finished`);
    //             setTestFinishTimes(testInputs.mode.methods[directionIndex]);
    //           })
    //           .catch(async (err) => {
    //             appState = APP_STATE.TestFinished;
  
    //             console.log(err);
    //             clearInterval(timerInterval);
    //             await showTestFailed(err, currentProcessIndex, directionIndex);
    //           });
    //         break;
    //     }
    //   },
    //   error: function (err) {
    //     $('#btnStartTest').attr('disabled', false);
    //   },
    //   complete: function () {
    //     $('#btnStartTest .spinner-border').addClass('d-none');
    //   }
    // });
  
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
    $('#btnCloseTest').removeClass('d-none');
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
  
        const directExecutions = ['mtu', 'rtt', 'analysis'];
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
              requiredParams: JSON.stringify(getRequiredGetParameters(processId, testMethod))
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
          return Promise.resolve({port, jobId});
        }
      });
  
      const runScriptProcess = (processId, port, jobId) => {
        return new Promise(function (resolve, reject) {
          $.ajax({
            url: `run-process-${processId}`,
            method: 'POST',
            data: getRequiredScriptParameters(processId, port, testMethod, jobId),
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
          let processScriptData = {};

          if (process.processId == "analysis") {
            // processScriptData = {
            //   mode: testMethod.mode,
            //   rtt: requiredGetParamaters.rtt
            // };
            postThoughputScriptData = Object.assign(postThoughputScriptData, scriptData);
            processScriptData = postThoughputScriptData;
          } else if (process.processId == "thpt") {
            postThoughputScriptData = scriptData;
            resolve();
          }
          else {
            processScriptData = scriptData;
          }
          console.log({processScriptData});
          console.log({postThoughputScriptData});
          
          $.ajax({
            url: 'process',
            method: 'POST',
            data: {
              testServerName: testServer.nickname,
              testServerUrl: testServer.hostname,
              mode: testMethod.mode,
              processId: process.processId,
              scriptData: JSON.stringify(processScriptData)
            },
            dataType: 'json',
            timeout: MEASUREMENT_TIMEOUT,
            success: function () {
              resolve();
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log("POST postProcess error");
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
          .then(response => {
            measurementTimes[methodName].push([Date.now(), null]);
  
            $(`#${testMethod.name}-process-status-label-${currentProcessIndex}`).html('<i class="small text-primary text-nowrap">Measuring...</i>');
            $(`#${testMethod.name}-process-status-${currentProcessIndex}`).html(`
              <div class="spinner-grow spinner-grow-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            `);

            return runScriptProcess(process.processId, response?.port, response?.jobId);
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
            dataType: 'json',
            timeout: MEASUREMENT_TIMEOUT,
            success: function (response) {
              testResults[response.method] = response.results;
              resolve(response.html);
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
      postThoughputScriptData = {};
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
  
  function getRequiredGetParameters(processId, testMethod) {
    let data = {};
    switch (processId) {
      case "bdp":
        data = {
          rtt: requiredGetParamaters.rtt
        }
        break;
      case "thpt":
        data = {
          mode: testMethod.mode,
          rtt: requiredGetParamaters.rtt,
          rwnd: requiredGetParamaters.rwnd
        }
        break;
    }
    return data;
  }
  
  function getRequiredScriptParameters(processId, port, testMethod, jobId) {
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
          mtu: requiredGetParamaters.mtu,
          rtt: requiredGetParamaters.rtt,
          rwnd: requiredGetParamaters.rwnd,
          ideal: testInputs.isr,
          serverIP: testInputs.testServer.ip_address,
          testServerName: testInputs.testServer.nickname,
          testServerUrl: testInputs.testServer.hostname,
          port,
          jobId,
        }
        break;
      case "analysis":
        data = {
          data_sent: requiredGetParamaters.tx_bytes,
          ideal_thpt: testInputs.isr,
          ave_thpt: requiredGetParamaters.thpt_avg,
          base_rtt: requiredGetParamaters.rtt,
          ave_rtt: requiredGetParamaters.ave_rtt,
          retx_bytes: requiredGetParamaters.retx_bytes,
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
  
  async function showTestFailed(err, processIndex, directionIndex) {
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
      console.log("err.readyState", err);
      const errorJson = err.responseJSON ?? JSON.parse(err.responseText);
      if ("error" in errorJson) {
        errorTitle = errorJson.error;
      }
      if ("message" in errorJson) {
        errorContent = JSON.stringify(errorJson.message);
      }
    }
  
    const errorTitleLower = errorTitle.toLowerCase();
    // let errorButtonsHtml = `
    //   <button class="btn btn-sm btn-primary" onclick="tryAgain()">Restart test</button>
    //   <button class="btn btn-sm btn-secondary" onclick="resetTest()">Cancel test</button>
    // `;
    let errorButtonsHtml = "";
  
    const isTokenExpired = errorTitleLower.includes("token") && errorTitleLower.includes("expired");
  
    if (isTokenExpired) {
      errorButtonsHtml = `
        <button id="btnReenterPassword" type="button" class="btn btn-sm btn-link text-primary" onclick="passwordBeforeStartTest()">
          Re-enter password
        </button>
      `;
    } else {
      $('#btnCancelTest').removeClass('d-none');
      $('#btnRestartTest').removeClass('d-none');
    }
    
    const now = moment();
    const errorFileName = now.format('YYYY-MM-DD-HH-mm-ss');
    testTime.finishedOn = now.format('YYYY-MM-DD HH:mm:ss');
    $('#summary-test-finished-on').html(`<span class="text-secondary">${testTime.finishedOn}</span>`);
    $('#summary-test-duration').html(`<span class="text-secondary">${testTime.duration}</span>`);
  
    $('#process-error').html(`
      <div class="border border-danger bg-light mt-1 mx-2">
        <div class="accordion border-0" id="accordionError">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingError">
              <button class="accordion-button bg-danger bg-opacity-10 text-danger" type="button" data-bs-toggle="collapse" data-bs-target="#collapseError" aria-expanded="false" aria-controls="collapseError">
                ${errorTitle}
              </button>
            </h2>
            <div id="collapseError" class="accordion-collapse collapse" aria-labelledby="headingError" data-bs-parent="#accordionError">
              <div class="accordion-body bg-light">
                <table cellpadding="2">
                  <tbody class="card-text font-monospace small">
                    <tr>
                      <td class="align-baseline">Timestamp:</td>
                      <td>${testTime.finishedOn}</td>
                    </tr>
                    <tr>
                      <td class="align-baseline">Server:</td>
                      <td>${testInputs.testServer.nickname}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="d-flex align-content-center mt-2">
                  <button type="button" class="btn-send-error btn btn-sm btn-primary align-self-center" data-error-file-name="${errorFileName}">Send error</button>
                  <a href="javascript:void(0);" id="btnOpenLogsFolder" class="btn btn-sm btn-link text-primary p-0 align-self-center ms-auto" role="button" onclick="openLogsFolder()">Open logs folder</a>
                </div>
              </div>
            </div>
          </div>
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
  
    if (isTokenExpired) {
      $('#modalReenterPassword .modal-title').text('Token has expired');
      $('#modalReenterPassword .btn').text('Start Test');
  
      await passwordModal().then(async () => {
        await startTest();
      }).catch(() => {
      });
    }
  }
  
  function backToTop() {
    $('html, body').animate({
      scrollTop: $('#measurement-card').offset().top - 72
    }, 200);
  }
  
  function closeTest() {
    testResults = {};
    appState = APP_STATE.Ready;
  
    $(`#process-error`).html('');
  
    $('#mainForm fieldset').attr('disabled', false);
  
    $("#mainForm").trigger('reset');
    $('#mainForm').removeClass('was-validated');
  
    $('#measurement-card').addClass('d-none');
    // $('#measurement-failed-card').hide();
  
    $('#net-warning').addClass('d-none');
    
    $('#location-name-container').html('<span>---</span>');
    $('#summary-location-name').html('<i>Locating...</i>');
  
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
  
  async function saveAsPdf() {
    $('#btnSaveAsPdf').attr('disabled', true);
    $('#btnSaveAsPdf .spinner-border').removeClass('d-none');

    await generateReport(testInputs, testTime, testClient, testResults);

    $('#btnSaveAsPdf').attr('disabled', false);
    $('#btnSaveAsPdf .spinner-border').addClass('d-none');
    $('#btnSaveAsPdf').addClass('d-none');
    $('#pdfSaved').removeClass('d-none');
  
    // $.ajax({
    //   url: 'report-data',
    //   method: 'POST',
    //   data: {
    //     methods: JSON.stringify(methods),
    //     serverName: testInputs.testServer.nickname,
    //     startedOn: testTime.startedOn,
    //     finishedOn: testTime.finishedOn,
    //     duration: testTime.duration,
    //     isp: testClient.isp
    //   },
    //   dataType: 'json',
    //   success: async function ({test_inputs, test_time, test_client, results}) {
    //     test_inputs['mapImage'] = testInputs.mapImage;
    //     test_inputs['coordinates'] = testInputs.coordinates;
    //     await generateReport(test_inputs, test_time, test_client, results);
  
    //     $('#btnSaveAsPdf').attr('disabled', false);
    //     $('#btnSaveAsPdf .spinner-border').addClass('d-none');
    //     $('#btnSaveAsPdf').addClass('d-none');
    //     $('#pdfSaved').removeClass('d-none');
    //   },
    //   error: function (err) {
    //     $('#btnSaveAsPdf').attr('disabled', false);
    //     $('#btnSaveAsPdf .spinner-border').addClass('d-none');
    //     $('#btnSaveAsPdf').addClass('d-none');
    //     $('#pdfSaved').removeClass('d-none');
  
    //     console.error(err);
    //   },
    //   complete: function () {
    //   }
  }
  
  function setManualGpsCoordinates() {
    const latManual = $('#lat_manual').val();
    const lonManual = $('#lon_manual').val();
  
    if ((latManual && lonManual) &&
      (!isNaN(latManual) && !isNaN(lonManual))) {
  
      $('#lat').val(latManual);
      $('#lon').val(lonManual).trigger('change');
    
      $('#gpsManualInput').addClass("d-none");
    }
  }
  
  function backToGpsInputSelection() {
    $('#gpsManualInput').addClass("d-none");
    $('#mapOptions').addClass("d-none");
  
    $('#gpsInputSelection').removeClass("d-none");
  
    $('#lat').val(null);
    $('#lon').val(null).trigger('change');

    mapLayer?.off('load');
    mapLayer = null;

    const $map = $('#map-snippet');
    $map .html('');
    $map.removeClass();
    map?.remove();
    map = null;

    clearInterval(nominatimGetRequestDelay);
    nominatimGetRequest?.abort();

    testInputs.location.name = null;

    $('#location-name-container').html('<span>---</span>');
    $('#summary-location-name').text('Locating...');
  }
  
  function enterGpsCoordinatesManually() {
    $('#gpsManualInput').removeClass("d-none");
    $('#gpsInputSelection').addClass("d-none");
    $('#gpsError').addClass("d-none");
    
    $('#lat_manual').focus();
  }
  
  function renderMap(lat = null, lon = null) {
    const $map = $('#map-snippet');
  
    $map.html('');
    $map.removeClass();
    map?.off();
    map?.remove();
    map = null;
  
    if (lat && lon) {
      $('#gpsInputSelection').addClass("d-none");
  
      $map.html(`<div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>`);
  
      $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('disabled', true);
      $('#lat, #lon, #btnGetGpsCoordinates, #btnStartTest').attr('cursor', 'progress');
  
      $('#lat, #lon, #btnGetGpsCoordinates').attr('disabled', false);
      $('#lat, #lon, #btnGetGpsCoordinates').attr('cursor', 'default');
      
      $('#location-name-container').html('<span>---</span>');
      
      if (testServers) {
        $('#btnStartTest').attr('disabled', false);
        $('#btnStartTest').attr('cursor', 'default');
      }
  
      map = L.map('map-snippet', {
        center: [lat, lon],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        tap: false,
        doubleClickZoom: false,
        boxZoom: false
      });
      
      const layerInstance = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 16,
        maxZoom: 16,
      }).addTo(map);

      layerInstance.on('load', function (e) {
        $('#map-snippet .spinner-border').remove();
      });
  
      L.marker([lat, lon], {
        keyboard: false,
      }).addTo(map);

      leafletImage(map, function(err, canvas) {
        if (!map) {
          return;
        }
        
        const dimensions = map.getSize();
        testInputs.mapImage.dataUri =  canvas.toDataURL();
        testInputs.mapImage.width =  dimensions.x;
        testInputs.mapImage.height =  dimensions.y;
      });
  
      $('#mapOptions').removeClass('d-none');

      $('#location-name-container').html(`<div class="placeholder-wave"><span class="w-100 placeholder"></span></div>`);
      nominatimGetRequestDelay = setTimeout(function () {
        nominatimGetRequest = $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, function (result) {
          console.log("reverse-geo", result);

          if ("error" in result) {
            $('#location-name-container').html(`<span class="w-100 small text-muted">(undetected address)</span>`);
            $('#summary-location-name').html(`<div class="w-100 small text-muted">(undetected address)</div>`);

            testInputs.location.name = null;
            return;
          }

          const parts = result.display_name.split(', ');
          const addressName = `near ${parts.splice(0, parts.length - 2).join(', ')}`;

          testInputs.location.name = addressName;
          testInputs.location.reverseGeoLicense = result.licence;
  
          $('#location-name-container').html(`<span class="w-100">${addressName}</span>`);
          $('#summary-location-name').text(addressName);
        }).fail(function () {
          testInputs.location.name = null;

          $('#location-name-container').html(`<span class="w-100 small text-muted">(undetected address)</span>`);
          $('#summary-location-name').html(`<div class="w-100 small text-muted">(undetected address)</div>`);
        });
      }, 1000);
    } else {
      $('#gpsInputSelection').removeClass("d-none");
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
  
  function getIspInfo() {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: 'get-isp-info',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
          console.log("response", response);
          resolve(response);
        },
        error: function (err) {
          reject(err);
        }
      });
    });
  }

  function getMachineName() {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: 'get-machine-name',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
          console.log("response", response);
          resolve(response);
        },
        error: function (err) {
          reject(err);
        }
      });
    });
  }
  
  function passwordModal() {
    return new Promise(function (resolve, reject) {
      let isPasswordValid = false;
    
      $('#modalReenterPassword').on('hide.bs.modal', function () {
        if (isPasswordValid) {
          $('#modalReenterPassword').off('hide.bs.modal');
          $('#modalReenterPassword').off('shown.bs.modal');
          $('#modalReenterPassword .btn').off('click');
          resolve();
        } else {
          reject("hindi valid yung password");
        }
      });
  
      $('#modalReenterPassword').on('shown.bs.modal', function () {
        $('#reenterPassword').focus();
      });
  
      $('#modalReenterPassword .btn').click(function () {
        $.ajax({
          url: 'relogin',
          method: 'POST',
          data: {
            password: $('#reenterPassword').val()
          },
          success: function (result) { 
            console.log("password-result", result);
            isPasswordValid = true;
  
            setTimeout(function () {
              $('#modalReenterPassword .alert-danger').addClass("d-none");
              $('#modalReenterPassword').modal('hide');
            }, 100);
          },
          error: function (err) {
            console.log("invalid passwoooooooooooord", err);
            const responseJSON = JSON.parse(err.responseText);
            $('#modalReenterPassword .alert-danger').text(responseJSON?.error ?? "Unexpected error occured");
            $('#modalReenterPassword .alert-danger').removeClass("d-none");
          }
        });
      });
  
      $('#modalReenterPassword').modal('show');
    });
  }

  function sendError() {
    const errorFileName = $('#btnOpenSendErrorLog').data('error-file-name');
    $.ajax({
      url: 'send-error-logs',
      method: 'POST',
      data: {
        testServerName: testInputs.testServer.nickname,
        testServerUrl: testInputs.testServer.hostname,
        errorFileName: errorFileName
      },
      success: function (result) { 
        alert(result);
        // $('#modalReenterPassword').modal('hide');
      },
      error: function (err) {
        console.log(err);
        // const responseJSON = JSON.parse(err.responseText);
        // $('#modalReenterPassword .alert-danger').text(responseJSON?.error ?? "Unexpected error occured");
        // $('#modalReenterPassword .alert-danger').removeClass("d-none");
      }
    });
  }

  $('#process-error').on('click', '.btn-send-error', function () {
    let sendingErrorAjax = null;

    $('#modalSendingError').on('hide.bs.modal', function () {
      sendingErrorAjax?.abort();
      $('#modalSendingError').off('hide.bs.modal');
    });

    $('#modalSendingError .modal-body').html(`<div class="progress">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
    </div>`);

    $('#modalSendingError').modal('show');

    $('#modalSendingError .modal-title').html("Sending error...");

    const errorFileName = $('#process-error .btn-send-error').data('error-file-name');
    sendingErrorAjax = $.ajax({
      url: 'send-error',
      method: 'POST',
      data: {
        testServerName: testInputs.testServer.nickname,
        testServerUrl: testInputs.testServer.hostname,
        errorFileName: errorFileName
      },
      success: function (result) {
        // alert(result);
        console.log("na-send");
        $('#modalSendingError .modal-title').html("Success");
        $('#modalSendingError .modal-body').html(`Error log "${errorFileName}.txt" was sent successfully.`);
      },
      error: function (err) {
        console.log(err);
        $('#modalSendingError .modal-title').html("Failed");
        // $('#modalSendingError .modal-title').html("Send error");
        $('#modalSendingError .modal-body').html("Cannot send error log");
      }
    });
  });
})();

function tryAgain() {
}

function resetTest() {
}

async function passwordBeforeStartTest() {
  $('#modalReenterPassword .modal-title').text('Token has expired');
  $('#modalReenterPassword .btn').text('Start Test');

  await passwordModal().then(() => {
    startTest();
  }).catch(() => {
  });
}

function openLogsFolder() {
  $('#btnOpenLogsFolder').attr('disabled', true);
  $.post('/open-logs-folder', function () {
    $('#btnOpenLogsFolder').attr('disabled', false);
  });
}

// $('#modalSendingError .btn-close').click(function () {
//   alert("ba't mo iko-close???")
//   // $.ajax({
//   //   url: 'send-error',
//   //   method: 'POST',
//   //   data: {
//   //     email: $('#errorEmail').val(),
//   //     // password: $('#errorEmailPassword').val(),
//   //     problem: $('#textareaErrorProblem').val(),
//   //     errorFileName: errorFileName
//   //   },
//   //   success: function (result) { 
//   //     alert(result);

//   //     // $('#modalReenterPassword').modal('hide');
//   //   },
//   //   error: function (err) {
//   //     console.log(err);
//   //     // const responseJSON = JSON.parse(err.responseText);
//   //     // $('#modalReenterPassword .alert-danger').text(responseJSON?.error ?? "Unexpected error occured");
//   //     // $('#modalReenterPassword .alert-danger').removeClass("d-none");
//   //   }
//   // });
// });