const chartImageUris = [];

const summaryChartImageUris = Object.seal({
  speedsChartUri: {},
  tcpEfficienciesChartUri: {},
  bufferDelaysChartUri: {}
});

(function () {
  const testInputs = Object.seal({
    isr: null,
    testServer: null,
    // networkConnectionTypeName: null,
    ethernetName: null,
    modeName: null,
    location: {
      lat: null,
      lon: null,
      name: null,
      withinPH: false,
      reverseGeoLicense: "",
    },
    mapImage: {
      dataUri: null,
      width: 0,
      height: 0,
    },
    networkConnectionTypeName: "Network",
    // get networkConnectionType() {
    //   return NETWORK_CONNECTION_TYPES[this.networkConnectionTypeName];
    // },
    autoRepeatCount: 1,
    get mode() {
      return TEST_MODES[this.modeName];
    },
    get coordinates() {
      const latDirection = this.location.lat >= 0 ? "N" : "S";
      const lonDirection = this.location.lon >= 0 ? "E" : "W";
      return `${this.location.lat}°${latDirection}, ${this.location.lon}°${lonDirection}`;
    },
  });

  const getDurationText = (start, end) => {
    const elapsedSeconds = parseFloat(moment(end).diff(moment(start), 'seconds'));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return `${numeral(minutes).format("0")}m ${numeral(seconds).format("00")}s`;
  };

  const testSessionTime = Object.seal({
    startedOn: '',
    finishedOn: '',
    get totalDuration() {
      return getDurationText(this.startedOn, this.finishedOn)
    }
  });

  const testClient = Object.seal({
    email: '',
    fullName: '',
    officeAddress: '',
    machineName: '',
    isp: '',
    publicIP: '',
  });

  let pdfReportFileName = "";

  let testServers = [];

  let autoRepeatIndex = 0;
  let currentTestDuration = Object.seal({
    /**
     * @param {number} val
     */
    totalSeconds: 0,
    get time() {
      const minutes = Math.floor(this.totalSeconds / 60);
      const seconds = Math.floor(this.totalSeconds % 60);
      
      return {minutes, seconds};
    },
    get timeColon() {
      return `${numeral(this.time.minutes).format("0")}:${numeral(this.time.seconds).format("00")}`;
    },
    get timeText() {
      return `${numeral(this.time.minutes).format("0")}m ${numeral(this.time.seconds).format("00")}s`;
    },
    reset() {
      this.totalSeconds = 0;
    }
  });
  let testResults = [];
  
  let requiredGetParamaters = {
    mtu: null,
    rtt: null,
    bdp: null,
    rwnd: null,
    tx_bytes: null,
    ideal_thpt: null,
    thpt_avg: null,
    rtt: null,
    ave_rtt: null,
    retx_bytes: null,
  };
  
  let measurementTimes = {}
  
  let currentTestDirection = "";
  let testNumberStartTime;
  let currentProcessIndex = 0;
  let currentDirectionIndex = 0;
  
  let appState = APP_STATE.Ready;

  let map = null;
  let mapLayer = null;
  let nominatimGetRequest = null;
  let nominatimGetRequestDelay = null;

  $('#btnStartTest').attr('disabled', true);

  $(async function () {
    testClient.fullName = document.getElementById('loggedUserFullName').innerText.trim();
    testClient.email = document.getElementById('loggedUserEmail').innerText;
    
    setTestServers();
    setEthernets();
    renderMap();

    console.table(testClient);

    $('#btn-scan-connected-devices, .btn-rescan-devices').on('click', function() {
      const selectedNetType = `${$('#netType option:selected').data('type')} ${$('#netType').val()}`;
      scanForConnectedDevices(selectedNetType);
    });

    $('.btn-refresh-networks').on('click', function() {
      setEthernets();
    });

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
          $('#gpsError').show();

          $('#gpsError .message').text(err.responseText);
          $('#gpsError').removeClass("d-none");
        },
        complete: function () {
          $('#btnGetGpsCoordinates, #btnStartTest').attr('disabled', false);
          $('#btnGetGpsCoordinates .spinner-grow').addClass('d-none');
        }
      })
    });
    
    $('#gpsError .btn-close').click(function () {
      $('#gpsError').hide();
    })

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
      return await startTest(0);
    });
  
    // Set on click: Close Test button
    $('.btn-close-test').click(function () {
      appState = APP_STATE.Ready;

      // TODO: clear error html after clicking this
      $(`#process-error`).html('');
      $('#mainForm fieldset').attr('disabled', false);

      $('#measurement-card').addClass('d-none');
      // $('#measurement-failed-card').hide();

      $('#net-warning').addClass('d-none');
      $('#mapOptions').removeClass('d-none');
    });
  
    // Set on click: Close Test button
    $('.btn-repeat-test').click(async function () {
      // TODO: clear error html after clicking this
      // TODO: change try again to "RESTART test"
      $(`#process-error`).html('');
      // $('#measurement-failed-card').hide();

      await startTest(0);
    });
  
    // Set on click: Close Test button
    $('.btn-clear-test').click(async function () {
      clearTest();
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

    $('#btnShowRfcSettings').on('click', async function () {
      const request = await fetch('/get-rfc-settings');
      const response = await request.json();

      if (request.ok) {
        if (response.hasOwnProperty('thpt_phase_duration_seconds')) {
          $('#thptDurationRange').val(response['thpt_phase_duration_seconds']).trigger('change');
        } else {
          // show default value
          $('#thptDurationRange').val(15).trigger('change');
        }
      } else {
        alert(response.json());
      }

      $('#modalRfcSettings').modal('show');
    });

    $('#thptDurationRange').on('input change', function (e) {
      const seconds = $(this).val();
      if (seconds < 3) {
        e.preventDefault();
        $(this).val(3);
        return;
      }
      $('#thptDurationText').text(`${seconds}`);
    });

    $('#btnSaveRfcSettings').on('click', async function () {
      const settings = new FormData();
      settings.append('thptPhaseDuration', $('#thptDurationRange').val());

      try {
        const request = await fetch('/save-rfc-settings', {
          method: 'POST',
          body: settings
        });
        const response = await request.json();

        if (request.ok) {
          console.log("rfc-settings", response);
        }
        else {
          alert(response.msg);
        }
      }
      catch (ex) {
        alert(ex);
      }

      $('#modalRfcSettings').modal('hide');
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

    function logOut() {
      $('#modalLogOut').modal('hide');
      $('#modalLoggingOut').modal('show');

      $.ajax({
        url: 'logout',
        method: 'GET',
        dataType: 'html',
        success: function (url) {
          window.location.replace(url);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
        }
      })
    }

    $('#btnLogOut').click(function (e) {
      if (appState == APP_STATE.Testing) {
        $('#modalLogOut .modal-title').text("Ongoing test");
        $('#modalLogOut .message').text("The current test is still executing. Results may not be saved. Do you still want to log out?");
        $('#modalLogOut .btn-primary').text('Keep testing');
        $('#modalLogOut').modal('show');
      } else {
        logOut();
      }
    });

    $('#modalLogOut .btn-outline-secondary').click(function () {
      logOut();
    });

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

    $('#process-error').on('click', 'button.btn-restart-test', async function () {
      await startTestExecution(autoRepeatIndex, true);
    });

    $('#process-error').on('click', 'button.btn-restart-test-2', async function () {
      currentProcessIndex = 0;
      await startTestExecution(autoRepeatIndex, true);
    });
  });

  function scanForConnectedDevices(typeName) {
    if (!$('#netType').val()) {
      return;
    }

    let currentScanDuration = Object.seal({
      maxScanDurationSeconds: 180,
      totalSeconds: 0,
      get remainingTime() {
        const remaining = this.maxScanDurationSeconds - this.totalSeconds + 1;
        const minutes = Math.trunc(remaining / 60);
        const seconds = Math.trunc(remaining % 60);
        
        return {minutes, seconds};
      },
      get remainingTimeText() {
        if (this.totalSeconds >= this.maxScanDurationSeconds) {
          return "Please wait...";
        }
        return `${numeral(this.remainingTime.minutes).format("0")}m ${numeral(this.remainingTime.seconds).format("00")}s`;
      },
      reset() {
        this.totalSeconds = 0;
      }
    });
    
    currentScanDuration.reset();
    $('#nmap-timer-container').show();

    const scanStartedNow = Date.now();
    let scanTimerInterval = setInterval(function () {
      currentScanDuration.totalSeconds = (Date.now() - scanStartedNow) / 1000.0;
      $('#nmap-timer-countdown').text(currentScanDuration.remainingTimeText);
    }, 100);

    $('#modalScanForConnectedDevices').modal('show');

    $('#connected-devices-title').html(`Scanning devices connected to the router...`);
    $('#scanning-devices-progress').removeClass('d-none');
    $('#connected-devices-table-container').addClass('d-none');
    $('#connected-devices-table tbody').html('');
    $('#connected-devices-info').addClass('d-none');
    $('#connected-devices-error-info').addClass('d-none');

    const scanAjax = $.ajax({
      url: 'get-connected-devices',
      method: 'POST',
      dataType: 'json',
      data: {
        ethernetIP: $('#netType').val(),
        scanDurationSeconds: currentScanDuration.maxScanDurationSeconds,
      },
      // data: {
      //   networkConnectionTypeName: typeName,
      //   networkPrefix: NETWORK_CONNECTION_TYPES[typeName].prefix
      // },
      // timeout: MEASUREMENT_TIMEOUT,
      success: function (data) {
        console.log("results", data);
        const scannedIPsCount = Object.keys(data.scanned_ips).length;

        $('#connected-devices-info').removeClass('d-none');
        $('#connected-devices-table-container').removeClass('d-none');
        $('#connected-devices-title').html(scannedIPsCount === 0 ? "" : `Devices connected to the router`);

        $('#nmap-version').text(data.stats.version);
        $('#nmap-scan-started-on').text(data.stats.startstr);

        const scanDuration = parseFloat(data.runtime.elapsed);
        const minutes = parseInt(scanDuration / 60);
        const seconds = Math.round((scanDuration - minutes * 60) * 100) / 100;
        $('#nmap-scan-duration').text(`${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`);

        const scannedDevices = scannedIPsCount === 0 ? {} : Object.assign(...Object.keys(data.scanned_ips)
          .filter(key => data.scanned_ips[key].hostname.filter(h => h.name === '_gateway').length === 0)
            .map(key => ({
              [key]: data.scanned_ips[key]
            })
          )
        );
        console.log(scannedDevices);
        // console.log("vendors", Object.values(scannedDevices).filter(sd => sd.status.state != "down"));
        const numberOfScannedDevices = Object.keys(scannedDevices).length;

        if (numberOfScannedDevices == 1) {
          // $('#connected-devices-card').removeClass('border-warning').addClass('border-primary');
          $('#connected-devices-info').removeClass('border-warning').addClass('border-primary');
          $('#connected-devices-info').removeClass('alert-warning').addClass('alert-primary');
          $('#connected-devices-info-icon').removeClass('bi-exclamation-triangle-fill').addClass('bi-check-circle');
        } else {
          scanAjax?.abort();
          // $('#connected-devices-card').removeClass('border-primary').addClass('border-warning');
          $('#connected-devices-info').removeClass('border-primary').addClass('border-warning');
          $('#connected-devices-info').removeClass('alert-primary').addClass('alert-warning');
          $('#connected-devices-info-icon').removeClass('bi-check-circle').addClass('bi-exclamation-triangle-fill');
        }

        $('#connected-devices-count').html(numberOfScannedDevices == 0 ? "No devices connected to the network" : `${numberOfScannedDevices > 1 ? `<b>${numberOfScannedDevices - 1}</b>` : "No"} other ${numberOfScannedDevices - 1 == 1 ? "device" : "devices" } connected to the network`);
        let counter = 0;
        for (const [ip, device] of Object.entries(scannedDevices)) {
          console.log(device);
          counter++;
          $('#connected-devices-table tbody').append(`<tr>
            <td>${counter}</td>
            <td>${device.hostname.filter(h => h.name).length ? device.hostname[0].name : "<small class='text-muted'>---</small>"}</td>
            <td>${device.osmatch?.length ? device.osmatch[0].name : "<small class='text-muted'>---</small>"}</td>
            <td>${device.osmatch?.length ? device.osmatch[0].osclass.type : "<small class='text-muted'>---</small>"}</td>
            <td>${device.osmatch?.length ? device.osmatch[0].osclass.vendor : "<small class='text-muted'>---</small>"}</td>
            <td>${ip}</td>
            <td>${Object.keys(device.ports).length ? device.ports.filter(p => p.state == 'open').map(p => p.portid).join(', ') : "<small class='text-muted'>---</small>"}</td>
          </tr>`)
        }
      },
      error: function (err) {
        console.log(err);
        $('#connected-devices-info').addClass('d-none');
        $('#connected-devices-error-info').removeClass('d-none');
        $('#connected-devices-error-message').text(err.responseJSON?.error ?? "Unknown error occured");
      },
      complete: function () {
        clearInterval(scanTimerInterval);
        $('#nmap-timer-container').hide();
        $('#scanning-devices-progress').addClass('d-none');
      }
    });

    $('#modalScanForConnectedDevices').on('hide.bs.modal', function () {
      scanAjax?.abort();
    });
  }
  
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

          if ($('#testServers option:selected').val() == "custom") {
            $('.custom-test-server-field').removeClass('d-none');
            $('#custom-server-protocol').focus();
          } else {
            $('.custom-test-server-field').addClass('d-none');
          }
        });
  
        let $testServers = $('#testServers');
        $testServers.html('');
        $testServers.append('<option selected disabled value="">Select a test server...</option>');
  
        testServers = [];
        testServers = data.map(function (server) {
          let hostname = server.hostname;
          const lastChar = hostname.slice(-1);
          console.log(lastChar);
          if (lastChar === '/') {
            hostname = hostname.slice(0, -1);
          }
          server.hostname = hostname;
          return server;
        });
  
        for (let i = 0; i < testServers.length; i++) {
          const server = testServers[i];
          $testServers.append(`
            <option value="${server.id}"> 
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
          <button id="btnReloadTestServers" class="btn btn-sm btn-link text-primary p-0" type="button" role="button">Reload test servers</button>
        </div>`);

        $('#testServersPlaceholder').on('click', '#btnReloadTestServers', function () {
          $('#testServersPlaceholder').html(`<div class="placeholder-wave">
            <span class="placeholder col-12"></span>
          </div>`);
          setTestServers();
        });
      }
    });
  }

  function setEthernets() {
    $('#netType').html('');
    $.ajax({
      url: 'get-ethernets',
      method: 'GET',
      dataType: 'json',
      success: function (ethernets) {
        for (const ethernet of ethernets) {
          $('#netType').append(`
            <option value="${ethernet.ip_address}" data-name="${ethernet.name}" data-type="${ethernet.type}"> 
              ${ethernet.type} ${ethernet.ip_address}
            </option>`
          );
        }
        if (ethernets.length == 0) {
          $('#check-ethernet-connection-alert').show();
          $('#btn-scan-connected-devices').hide();
        } else {
          $('#check-ethernet-connection-alert').hide();
          $('#btn-scan-connected-devices').show();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#check-ethernet-connection-alert').show();
        $('#btn-scan-connected-devices').hide();
        console.error({jqXHR, textStatus, errorThrown})
      }
    });
  }
  
  function createMeasurementProcessesTable(methods, testNumber, isRetry = false) {
    $(`#process-error`).html('');

    if (!isRetry) {
      for (const dName of methods) {
        $(`#measurement-processes-timeline-${testNumber}`).append(`
          <h6 class="small text-uppercase m-1">${dName} test</h6>
          <table id="${dName}-measurement-processes-${testNumber}" class="table table-sm table-borderless table-hover mb-3">
            <tbody class="align-middle">
            </tbody>
          </table>
        `);
      }
    }

    for (const dName of methods) {
      if (methods.indexOf(dName) < currentDirectionIndex) {
        continue;
      }

      const testMethod = TEST_METHODS[dName];
      if (!isRetry) {
        $(`#measurement-results-${testNumber}`).append(`<div id="measurement-results-${testNumber}-${dName}"></div>`);
      }
  
      const directionRgb = dName == "upload" ? '72, 36, 255' : '0, 140, 167';
      $(`#measurement-results-${testNumber}-${dName}`).html(`
        <div class="mt-2" style="border: 1px solid rgba(${directionRgb}, 0.25);">
        <div class="p-2" style="background-color: rgba(${directionRgb}, 0.1);">
          <div class="d-flex align-items-center">
            <h6 class="mb-0">
              <span id="${dName}-test-results-status-${testNumber}" class="me-1">
                <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
              </span>
              ${testMethod.titleCase} Test...
            </h6>
          </div>
        </div>
        <div id="${dName}-measurement-results-${testNumber}">
          
        </div>
      </div>
      `);
    }


    for (const dName of methods) {
      if (methods.indexOf(dName) < currentDirectionIndex) {
        continue;
      }

      console.log(dName);
      const testMethod = TEST_METHODS[dName];
      
      if (currentProcessIndex == 0) {
        for (let i = 0; i < MEASUREMENT_PROCESSES.length; i++) {
          $(`#${testMethod.name}-measurement-processes-${testNumber} tbody`).append(`<tr id="measurement-process-row-${i + 1}-${dName}-test-${testNumber}"></tr>`)
        }
      }

      for (let i = 0; i < MEASUREMENT_PROCESSES.length; i++) {
        if (i < currentProcessIndex) {
          continue;
        }

        const process = MEASUREMENT_PROCESSES[i];
        $(`#measurement-process-row-${i + 1}-${dName}-test-${testNumber}`).html(`
          <td class="p-0 d-flex inline-block" style="min-width: 56px;">
            <span id="${testMethod.name}-process-time-${i}-test-${testNumber}" class="text-muted ms-3 me-2">${dName === methods[0] && i === 0 ? currentTestDuration.timeColon : ""}</span>
          </td>
          <td id="${testMethod.name}-process-status-${i}-test-${testNumber}" class="p-0">
            <i class="bi bi-circle text-muted"></i>
          </td>
          <td class="p-0 w-100">
            <span id="${testMethod.name}-process-label-${i}-test-${testNumber}" class="text-muted mx-2">${process.label}</span>
          </td>
          <td id="${testMethod.name}-process-status-label-${i}-test-${testNumber}" class="p-0 text-end">
            
          </td>
        `);
      }
    }
  
    $(`#summary-test-finished-on-${autoRepeatIndex + 1}`).html(`
      <div class="placeholder-wave">
        <span class="placeholder col-6"></span>
      </div>
    `);
    $(`#summary-test-duration-${autoRepeatIndex + 1}`).html(`
      <div class="placeholder-wave">
        <span class="placeholder col-6"></span>
      </div>
    `);
  }
  
  async function startTest() {
    testInputs.isr = $('#isr').val();
    testInputs.ethernetName = $('#netType option:selected').data('name');
    testInputs.networkConnectionTypeName = $('#netType option:selected').data('type');
    testInputs.modeName = $('input[name="radTestMode"]:checked').val();
    testInputs.location.lat = $('#lat').val();
    testInputs.location.lon = $('#lon').val();
    testInputs.autoRepeatCount = Math.min(30, Math.max(parseInt($('#auto-repeat-count').val()), 1));
    $('#auto-repeat-count').val(testInputs.autoRepeatCount);

    $('#btnStartTest').attr('disabled', true);
    $('#btnStartTest .spinner-border').removeClass('d-none');
  
    $('#btnSaveAsPdf').removeClass('d-none');
    $('#pdfSaved').addClass('d-none');

    if (testInputs.isr && testInputs.isr >= 1 && testInputs.isr <= 1000) {
      $('#isr').removeClass('is-invalid');
    } else {
      $('#isr').addClass('is-invalid');
    }

    if (testInputs.ethernetName) {
      $('#netType').removeClass('is-invalid');
    } else {
      $('#netType').addClass('is-invalid');
    }

    const testServerId = $('#testServers').val();
    if (testServerId == "custom") {
      const customServerProtocol = $('#custom-server-protocol').val();
      const customServerIPAddress = $('#custom-server-ip-address').val();
      const customServerPort = $('#custom-server-port').val();

      let invalidCustomServerFeebacks = [];

      if (!/^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(customServerIPAddress)) {
        $('#custom-server-ip-address').addClass('is-invalid');
        $('#custom-server-ip-address').focus();
        invalidCustomServerFeebacks.push('Invalid IP Address');
      } else {
        $('#custom-server-ip-address').removeClass('is-invalid');
      }

      if (customServerPort) {
        $('#custom-server-port').attr('required', true);
      } else {
        $('#custom-server-port').removeAttr('required');
      }

      const minPort = 1;
      const maxPort = 65535;
      if (customServerPort && (customServerPort < minPort || customServerPort > maxPort)) {
        $('#custom-server-port').addClass('is-invalid');
        $('#custom-server-port').focus();
        invalidCustomServerFeebacks.push(`Enter port between ${minPort} and ${maxPort} or leave it blank`);
      } else {
        $('#custom-server-port').removeClass('is-invalid');
      }

      if (invalidCustomServerFeebacks) {
        $('#validation-custom-server-feedback').text(invalidCustomServerFeebacks.join('; '));
      }

      const url = `${customServerProtocol}://${[customServerIPAddress, customServerPort].filter(Boolean).join(':')}`;
      testInputs.testServer = {
        id: 0,
        nickname: `Custom (${url})`,
        hostname: url,
        ip_address: customServerIPAddress
      }
    } else {
      $('#custom-server-ip-address').removeClass('is-invalid');
      $('#custom-server-port').removeClass('is-invalid');

      testInputs.testServer = testServers.find(ts => ts.id == testServerId);
    }

    if (testInputs.testServer) {
      $('#testServers').removeClass('is-invalid');
    } else {
      $('#testServers').addClass('is-invalid');
    }

    if (testInputs.modeName) {
      $('input[name="radTestModeHidden"]').removeClass('is-invalid');
    } else {
      $('input[name="radTestModeHidden"]').addClass('is-invalid');
    }



    if (!testInputs.location.withinPH) {
      $('input[name="coordinates"]').addClass('is-invalid');
      $('#invalid-feedback-coordinates').text('Cannot test outside the Philippines');
    }
    else if (!(testInputs.location.lat && testInputs.location.lon
      && testInputs.location.lat >= -90 && testInputs.location.lat <= 90
      && testInputs.location.lon >= -180 && testInputs.location.lon <= 180))  {
        $('input[name="coordinates"]').addClass('is-invalid');
        $('#invalid-feedback-coordinates').text('Invalid Location');
    } else {
      $('input[name="coordinates"]').removeClass('is-invalid');
    }
    
    const canStartTest = $('#mainForm').find('.is-invalid')?.length === 0;

    if (!canStartTest) {
      $('#btnStartTest .spinner-border').addClass('d-none');
      $('#btnStartTest').attr('disabled', false);

      return;
    }

    $('#custom-server-ip-address').removeClass('is-invalid');
    $('#custom-server-port').removeClass('is-invalid');

    getIspInfo()
      .then(({isp, publicIP}) => {
        testClient.isp = isp;
        testClient.publicIP = publicIP;
        
        if (isp) {
          $('#summary-isp').text(`${testClient.isp}`);
        } else {
          $('#summary-isp').html('<i class="small text-muted">(undetected)</i>');
        }

        if (publicIP) {
          $('#summary-public-ip').text(`(${testClient.publicIP})`);
        } else {
          $('#summary-public-ip').html('');
        }
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
        $('#summary-public-ip').html('');
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

    $('#connected-devices-card').addClass('d-none');

    $('#btnStartTest').attr('disabled', false);
    $('#mainForm fieldset').attr('disabled', true);

    backToTop();

    $('#summary-isr').text(testInputs.isr + " Mbps");
    $('#summary-net').text(testInputs.networkConnectionTypeName);
    $('#summary-server').text(testInputs.testServer.nickname);
    $('#summary-mode').text(testInputs.mode.titleCase);
    $('#summary-coordinates').text(`${testInputs.coordinates}`);

    $('#btnSaveAsPdf').addClass('d-none');
    $('#measurement-card').removeClass('d-none');
    $('#btnBackToTop').removeClass('d-none');
    $('#btnBackToTop').show();

    $('#mapOptions').addClass("d-none");

    $('#btnStartTest .spinner-border').addClass('d-none');

    // alert(autoRepeatCount);

    testResults = [];
    for (let i = 0; i < testInputs.autoRepeatCount; i++) {
      const methods = {};
      for (const method of testInputs.mode.methods) {
        methods[method] = {};
      }
      testResults.push(methods);
    }
    testNumberStartTime = Date.now();
    testSessionTime.startedOn = moment(testNumberStartTime).format('YYYY-MM-DD HH:mm:ss');

    currentProcessIndex = 0;
    currentDirectionIndex = 0;

    return await startTestExecution(0);
  }

  async function startTestExecution(currentAutoRepeatIndex, isRetry = false) {
    appState = APP_STATE.Testing;

    $("#measurement-card .card-header h5").text(`Testing ${testInputs.mode.titleCase} mode...`);

    // $('#btnCancelTest').addClass('d-none');
    // $('#btnRestartTest').addClass('d-none');
    // $('#btnCloseTest').addClass('d-none');
    $('.test-complete-options').addClass('d-none');

    const autoRepeatCount = testInputs.autoRepeatCount;

    autoRepeatIndex = currentAutoRepeatIndex;

    if (autoRepeatCount > 1) {
      $('#speedtest-pills-tab').removeClass('d-none');
    } else {
      $('#speedtest-pills-tab').addClass('d-none');
    }

    if (autoRepeatIndex == 0 && !isRetry) {
      $('#speedtest-pills-tab').html('');
      $('#speedtest-pills-tabContent').html('');

      for (let i = autoRepeatIndex; i < autoRepeatCount + 1; i++) {
        if (i == autoRepeatCount && autoRepeatCount == 1) {
          break;
        }

        let testNumber = i + 1;
        if (testNumber > autoRepeatCount) {
          testNumber = "summary"
        }
        $('#speedtest-pills-tab').append(`
          <li class="nav-item" role="presentation">
            <button class="nav-link ${testNumber <= autoRepeatIndex + 1 ? "" : "disabled"} px-2 py-1 m-1 position-relative" id="pills-speedtest-${testNumber}-tab" data-test-number="${testNumber}" data-bs-toggle="pill" data-bs-target="#pills-speedtest-${testNumber}" type="button" role="tab" aria-controls="pills-speedtest-${testNumber}" aria-selected="${ testNumber == autoRepeatIndex + 1 ? "true" : "false" }">
              <div class="position-relative">
                <div id="test-executing-indicator-${testNumber}" class="position-absolute top-50 start-50 translate-middle pt-1 d-none">
                  <div class="spinner-border spinner-border text-info" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                <div class="px-1">
                  ${testNumber == "summary" ? "Summary" : testNumber}
                </div>
              </div>
            </button>
          </li>
        `);
        
        $('#speedtest-pills-tabContent').append(`
          <div class="tab-pane fade" id="pills-speedtest-${testNumber}" role="tabpanel" aria-labelledby="pills-speedtest-${testNumber}-tab">
          </div>
        `);
      }
    }
    
    if (!isRetry) {
      for (let i = autoRepeatIndex; i < autoRepeatCount + 1; i++) {
        if (i == autoRepeatCount && autoRepeatCount == 1) {
          break;
        }
  
        let testNumber = i + 1;
        if (testNumber > autoRepeatCount) {
          testNumber = "summary"
        }
  
        $(`#pills-speedtest-${testNumber}`).html('');
      }
    }

    let isFailed = false;
    while (autoRepeatIndex < autoRepeatCount + 1) {
      if (!isRetry) {
        testNumberStartTime = Date.now();
      }
      const testNumber = autoRepeatIndex + 1;

      if (testNumber > 1) {
        $(`#test-executing-indicator-${testNumber - 1}`).addClass('d-none');

        if (autoRepeatCount > 1) {
          $(`#pills-speedtest-${testNumber - 1}-tab`).removeClass('active');
          $(`#pills-speedtest-${testNumber - 1}`).removeClass('show active');
        }

        // $('#btnSavePartialResults').removeClass('d-none');
      }

      if (testNumber > autoRepeatCount) {
        $("#measurement-card .card-header h5").text(`Finished`);

        $('#btnBackToTop').addClass('d-none');
        $('#btnBackToTop').hide();
        $('#btnSaveAsPdf').removeClass('d-none');
        // $('#btnSavePartialResults').addClass('d-none');
        // $('#btnCloseTest').removeClass('d-none');
        $('#test-success-options').removeClass('d-none');
        $('#test-failed-options').addClass('d-none');

        break;
      }

      if (chartImageUris.length == autoRepeatIndex) {
        chartImageUris.push(Object.seal({
          throughputCharts: {},
          transferCharts: {},
          rttCharts: {}
        }));
      }

      if (!isRetry) {
        $(`#pills-speedtest-${testNumber}`).html(`
          <ul class="list-group list-group-flush">
            <li class="list-group-item p-0 pb-3">
              <div id="measurement-processes-timeline-${testNumber}" class="px-2">
              </div>
            </li>
            <li id="test-results-${testNumber}" class="list-group-item py-3 px-2">
            </li>
          </ul>
        `); 
      }

      $(`#test-executing-indicator-${testNumber}`).removeClass('d-none');
      $(`#pills-speedtest-${testNumber}-tab`).removeClass('disabled');

      // check if other tab is selected and last test is not selected
      const selectedTab = $('#speedtest-pills-tab .nav-link.active').first();
      console.log(selectedTab.length > 0);
      if (selectedTab.length > 0) {
        const id = selectedTab.attr('id');
        const tnum = id.split('-')[2];
        if (testNumber - 1 == tnum) {
          $(`#pills-speedtest-${testNumber}-tab`).addClass('active');
          $(`#pills-speedtest-${testNumber}`).addClass('show active');
        }
      } else {
        $(`#pills-speedtest-${testNumber}-tab`).addClass('active');
        $(`#pills-speedtest-${testNumber}`).addClass('show active');
      }

      if (!isRetry) {
        try {
          const response = await $.ajax({
            url: 'get-test-results-template',
            method: 'GET',
            data: {
              testNumber
            },
            dataType: 'html',
          });
  
          $(`#test-results-${testNumber}`).html(response);
        } catch (ex) {
          $(`#test-results-${testNumber}`).html('');
        }
      }

      if (!isRetry) {
        // measurementTimes = {
        //   upload: [],
        //   download: []
        // };
        measurementTimes = {};
        for (const method of testInputs.mode.methods) {
          measurementTimes[method] = [];
          for (let i = 0; i < MEASUREMENT_PROCESSES.length; i++) {
            measurementTimes[method].push([null, null])
          }
        } 
        console.log(measurementTimes);
      }
      
      currentTestDuration.reset();
      const timerInterval = setInterval(function () {
        currentTestDuration.totalSeconds = (Date.now() - testNumberStartTime) / 1000.0;

        $(`#${currentTestDirection}-process-time-${currentProcessIndex}-test-${autoRepeatIndex + 1}`)
          .text(currentTestDuration.timeColon);
      }, 100);

      $(`#summary-test-started-on-${testNumber}`).text(moment(testNumberStartTime).format('YYYY-MM-DD HH:mm:ss'));

      createMeasurementProcessesTable(testInputs.mode.methods, testNumber, isRetry);
      
      if (testInputs.mode.name === "normal" || testInputs.mode.name === "reverse") {
        let methodName = testInputs.mode.methods[0];
        testResults[autoRepeatIndex][methodName]['startedOn'] = testNumberStartTime;

        await executeMeasurements(testInputs.testServer, methodName, currentProcessIndex)
          .then(resultsHtml =>  {
            clearInterval(timerInterval);
            
            const measurementLength = measurementTimes[methodName].length;
            testResults[autoRepeatIndex][methodName]['endedOn'] = measurementTimes[methodName][measurementLength - 1][1];

            setTestFinishTimes(methodName, testNumber);
            testSessionTime.finishedOn = moment(measurementTimes[methodName][measurementLength - 1][1]).format('YYYY-MM-DD HH:mm:ss');

            showTestResults(resultsHtml, methodName, testNumber);

            console.log("testResults", testResults);
            
            currentProcessIndex = 0;

            autoRepeatIndex++;

            isFailed = false;
          })
          .catch(async (err) => {
            console.log("normal/reverse");
            console.log({ err });
            clearInterval(timerInterval);

            isFailed = true;

            await showTestFailed(err, currentProcessIndex, 0, testNumber);
          });

          if (isFailed) {
            break;
          }
      }
      else if (testInputs.mode.name === "bidirectional") {
        for (const methodName of testInputs.mode.methods.slice(currentDirectionIndex)) {
          console.log(testResults);
          if (currentDirectionIndex == 0) {
            testResults[autoRepeatIndex][methodName]['startedOn'] = testNumberStartTime;
          } else if (currentDirectionIndex == 1) {
            testResults[autoRepeatIndex][methodName]['startedOn'] = Date.now();
          }

          await executeMeasurements(testInputs.testServer, methodName, currentProcessIndex)
            .then(async (resultsHtml) => {
              const measurementLength = measurementTimes[methodName].length;
              console.log("bidirectional measurementTimes endedOn", measurementTimes[methodName][measurementLength - 1][1], measurementTimes);
              testResults[autoRepeatIndex][methodName]['endedOn'] = measurementTimes[methodName][measurementLength - 1][1];

              showTestResults(resultsHtml, methodName, testNumber);

              currentDirectionIndex++;
              currentProcessIndex = 0;

              isFailed = false;
            })
            .catch(async (err) => {
              appState = APP_STATE.TestFinished;

              console.log(err);
              clearInterval(timerInterval);
              
              isFailed = true;

              await showTestFailed(err, currentProcessIndex, currentDirectionIndex, testNumber);
            });

            if (isFailed) {
              break;
            }
        }

        if (isFailed) {
          break;
        }

        clearInterval(timerInterval);

        const currentMethodName = testInputs.mode.methods[1];

        const measurementLength = measurementTimes[currentMethodName].length;
        console.log("measurementTimes bidirectional done", measurementTimes, autoRepeatIndex);
        testSessionTime.finishedOn = moment(measurementTimes[currentMethodName][measurementLength - 1][1]).format('YYYY-MM-DD HH:mm:ss');

        setTestFinishTimes(currentMethodName, testNumber);

        autoRepeatIndex++;
        currentDirectionIndex = 0;

        isRetry = false;
        
        function delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        await delay(750);
      }
    }

    if (!isFailed && autoRepeatCount > 1) {
      $(`#pills-speedtest-summary-tab`).removeClass('disabled');
      
      const selectedTab = $('#speedtest-pills-tab .nav-link.active').first();
      console.log("selectedTab", selectedTab);
      if (selectedTab.length > 0) {
        const id = selectedTab.attr('id');
        const tnum = id.split('-')[2];
        console.log("tnum", tnum, autoRepeatCount);
        if (tnum == autoRepeatCount) {
          $(`#pills-speedtest-summary-tab`).addClass('active');
          $(`#pills-speedtest-summary`).addClass('show active');
        }
        else {
          $(`#pills-speedtest-${tnum}-tab`).removeClass('active');
          $(`#pills-speedtest-${tnum}`).removeClass('show active');
          
          $(`#pills-speedtest-summary-tab`).addClass('active');
          $(`#pills-speedtest-summary`).addClass('show active');
        }
      }
      else {
        $(`#pills-speedtest-summary-tab`).addClass('active');
        $(`#pills-speedtest-summary`).addClass('show active');
      }
  
      try {
        const response = await $.ajax({
          url: 'get-test-summary-template',
          method: 'POST',
          data: {
            methods: JSON.stringify(testInputs.mode.methods),
            isr: testInputs.isr,
            testResults: JSON.stringify(testResults),
          },
          dataType: 'html',
        });
  
        console.log("summary-response", response);
        $(`#pills-speedtest-summary`).html(response);
      } catch (ex) {
        $(`#pills-speedtest-summary`).html(`error: ${ex.toString()}`);
      }
    } else {
      $(`#test-executing-indicator-${autoRepeatIndex + 1}`).addClass('d-none');
    }

    appState = APP_STATE.TestFinished;
  
    return false;
  }

  function setTestFinishTimes(methodName, testNumber) {
    const measurementLength = measurementTimes[methodName].length;
    const lastMeasurementTime = measurementTimes[methodName][measurementLength - 1][1];
  
    const finishedOnText = moment(lastMeasurementTime).format('YYYY-MM-DD HH:mm:ss');

    $(`#summary-test-finished-on-${testNumber}`).html(finishedOnText);
    $(`#summary-test-duration-${testNumber}`).html(currentTestDuration.timeText);
  }
  
  async function executeMeasurements(testServer, methodName, processIndex) {
    console.log("autoRepeatIndex", autoRepeatIndex);
    const testMethod = TEST_METHODS[methodName];
    currentTestDirection = methodName;
    currentProcessIndex = processIndex;

    const markAsDone = (process) => {
      console.log("testResults", testResults);
      console.log("chartImageUris", chartImageUris)
      measurementTimes[methodName][currentProcessIndex][1] = Date.now();
      console.log("measurementTimes", measurementTimes);

      const startedOn = moment(measurementTimes[methodName][currentProcessIndex][0]);
      const endedOn = moment(measurementTimes[methodName][currentProcessIndex][1]);

      $(`#${testMethod.name}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="bi bi-check-circle-fill text-success"></i>');

      $(`#${testMethod.name}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(process.label);
      $(`#${testMethod.name}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).removeClass("text-muted").addClass("text-success");

      $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
        <span class="px-2 text-nowrap text-success small" data-bs-toggle="tooltip" data-bs-placement="top" title="${startedOn.format('HH:mm:ss.SSS')} - ${endedOn.format('HH:mm:ss.SSS')}">
          ${startedOn.format('hh:mm:ss a')} - ${endedOn.format('hh:mm:ss a')}
        </span>
      `);

      testResults[autoRepeatIndex][methodName][`${process.processId}Duration`] = measurementTimes[methodName][currentProcessIndex];

      console.log(`Done ${process.label}\n`);

      currentProcessIndex++;
    }

    const connectToServer = (process) => {
      return new Promise(async function (resolve, reject) {
        measurementTimes[methodName][currentProcessIndex][0] = Date.now();
        // measurementTimes[methodName].push([Date.now(), null]);

        $(`#${methodName}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).removeClass("text-muted");
        $(`#${methodName}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small">Connecting...</i>');
        $(`#${methodName}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        `);

        let retryCount = 0;
        const maxRetryCount = 5;
        const testServerAjax = () => {
          $.ajax({
            url: 'connect-to-test-server',
            method: 'POST',
            data: {
              lat: testInputs.location.lat,
              lon: testInputs.location.lon,
              testServerName: testServer.nickname,
              testServerUrl: testServer.hostname,
              mode: testMethod.mode,
              serverId: testServer.id == 0 ? 1 : testServer.id
            },
            dataType: 'json',
            timeout: MEASUREMENT_TIMEOUT,
            success: function (data) {
              console.log(data);
  
              markAsDone(process);
              resolve(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log("connect-to-server error");
              console.log({jqXHR, textStatus, errorThrown});

              retryCount++;
              if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                testServerAjax();
              }
              else {
                reject(jqXHR);
              }
            }
          });
        }
        testServerAjax();
      });
    };
  
    const executeProcess = async (process) =>  {
      console.log({ process });
      console.log(`Current process: ${process.processId} - ${testServer.hostname}/api/${testMethod.mode}/${process.processId}`);
  
      const getProcessInfo = async (processId) => {
        console.log({ processId });
        
        const directExecutions = ['mtu', 'rtt', 'analysis', 'finish-test'];
        return new Promise(async function (resolve, reject) {
          if (directExecutions.includes(processId)) {
            resolve();
            return;
          }

          let retryCount = 0;
          const maxRetryCount = 5;
          const processAjax = () => {
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

                retryCount++;
                if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                  processAjax();
                }
                else {
                  reject(jqXHR);
                }
              }
            });
          }
          processAjax();
        });
      };
  
      const checkStatus = async (jobId) => {
        const statusCheckingInterval = 2 /*seconds*/ * 1000;
        return new Promise((resolve, reject) => {
          if (jobId == null) {
            resolve("started");
          }

          let retryCount = 0;
          const maxRetryCount = 5;
          const checkStatusAjax = () => {
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
                  console.log("yeahhhhh", data);
                  resolve(data);
                }, statusCheckingInterval);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.log("GET checkStatus error");
                console.log({jqXHR, textStatus, errorThrown});

                retryCount++;
                if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                  checkStatusAjax();
                }
                else {
                  reject(jqXHR);
                }
              }
            });
          }
          checkStatusAjax();
        });
      }
  
      let isLooped = false;
      const checkQueue = async (jobId, port) => checkStatus(jobId).then(status => {
        if (status == "started") {
          isLooped = false;
          return Promise.resolve({port, jobId});
        } else {
          const queuePlacement = Number.isInteger(status) ? parseInt(status) + 1 : "...";
          if (!isLooped) {
            $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
              <div class="d-flex justify-content-end">
                <div class="progress h-100 mx-2">
                  <div class="px-3 progress-bar progress-bar-striped progress-bar-animated bg-dark" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                    <span class="fw-bold">
                      <span class="align-middle me-1">Position in QUEUE:</span>
                      <span id="queue-position-${currentProcessIndex}-test-${autoRepeatIndex + 1}" class="align-middle fs-6 lh-sm">${queuePlacement}</span>
                    </span>
                  </div>
                </div>
              </div>
            `);
            isLooped = true;
          }
          else {
            $(`#queue-position-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).text(`${queuePlacement}`);
          }
          return checkQueue(jobId, port);
        }
      });
  
      const runScriptProcess = async (processId, port, jobId) => {
        return new Promise(function (resolve, reject) {
          
          let retryCount = 0;
          const maxRetryCount = 5;
          const runProcessAjax = () => {
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

                retryCount++;
                if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                  // $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`<i class="small text-primary text-nowrap"><span class="text-warning">(Attempt ${retryCount} of ${maxRetryCount})</span> Measuring...</i>`);
                  runProcessAjax();
                }
                else {
                  reject(jqXHR);
                }
              }
            });
          }
          runProcessAjax();
        });
      }
  
      const postProcess = async (scriptData) => {
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
          let processScriptData = scriptData;

          console.log({processScriptData});
          
          let retryCount = 0;
          const maxRetryCount = 1;
          const postProcessAjax = () => {
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

                retryCount++;
                if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                  postProcessAjax();
                }
                else {
                  reject(jqXHR);
                }
              }
            });
          }
          postProcessAjax();
        });
      };
  
      return new Promise((resolve, reject) => {
        $(`#${testMethod.name}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`${process.label}...`);
        $(`#${testMethod.name}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).removeClass("text-muted");
  
        $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small">Connecting to test server...</i>');
        $(`#${testMethod.name}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        `);
  
        getProcessInfo(process.processId)
          .then(response => {
            if (response != null) {
              $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small text-nowrap">Checking queue...</i>');
  
              return checkQueue(response.job_id, response.port);
            }
          })
          .then(response => {
            // measurementTimes[methodName].push([Date.now(), null]);
            measurementTimes[methodName][currentProcessIndex][0] = Date.now();

            $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small text-primary text-nowrap">Measuring...</i>');
            $(`#${testMethod.name}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
              <div class="spinner-grow spinner-grow-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            `);

            return runScriptProcess(process.processId, response?.port, response?.jobId);
          })
          .then(scriptData => {
            $(`#${testMethod.name}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small text-primary text-nowrap">Sending measurements...</i>');
            $(`#${testMethod.name}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            `);
            
            return postProcess(scriptData);
          })
          .then(() => {
            markAsDone(process);
  
            resolve();
          })
          .catch(ex => {
            reject(ex);
          });
      });
    };
  
    const getTestResults = async function (process) {
      return new Promise(function (resolve, reject) {
        // measurementTimes[methodName].push([Date.now(), null]);
        measurementTimes[methodName][currentProcessIndex][0] = Date.now();

        $(`#${methodName}-process-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).removeClass("text-muted").addClass('text-primary');
        $(`#${methodName}-process-status-label-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html('<i class="small text-primary">Getting results...</i>');
        $(`#${methodName}-process-status-${currentProcessIndex}-test-${autoRepeatIndex + 1}`).html(`
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        `);

        setTimeout(() => {
          let retryCount = 0;
          const maxRetryCount = 5;

          const finishTestAjax = () => {
            $.ajax({
              url: 'finish-test',
              method: 'POST',
              data: {
                testServerName: testServer.nickname,
                testServerUrl: testServer.hostname,
                mode: testMethod.mode,
                testNumber: autoRepeatIndex + 1
              },
              dataType: 'json',
              timeout: MEASUREMENT_TIMEOUT,
              success: function (response) {
                console.log({response});
                // console.log(testResults);
                testResults[autoRepeatIndex][response.method]['results'] = response.results;
                
                markAsDone(process);
  
                resolve(response.html);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                retryCount++;
                if (jqXHR.readyState === 0 && retryCount < maxRetryCount) {
                  finishTestAjax();
                }
                else {
                  reject(jqXHR);
                }
              }
            });
          }
          finishTestAjax();
        }, 1000);
      });
    }
  
    return new Promise(async (resolve, reject) => {
      let retryCount = 0;
      const maxRetryCount = 5;

      const execute = () => {
        MEASUREMENT_PROCESSES.slice(currentProcessIndex).reduce(async (previousPromise, nextProcess) => {
          await previousPromise;
  
          if (['verify-test'].includes(nextProcess.processId)) {
            return connectToServer(nextProcess);
          }
  
          if (['finish-test'].includes(nextProcess.processId)) {
            return getTestResults(nextProcess);
          }
          
          return executeProcess(nextProcess);
        }, Promise.resolve())
          .then(results => {
            resolve(results);
          })
          .catch(err => {
            retryCount++;
            if (retryCount < maxRetryCount) {
              execute();
            }
            else {
              reject(err);
            }
          });
      }

      execute();
    })
  }
  
  function getRequiredGetParameters(processId, testMethod) {
    let data = {};
    switch (processId) {
      case "bdp":
        data = {
          rtt: requiredGetParamaters.rtt,
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
          // networkConnectionTypeName: testInputs.networkConnectionTypeName,
          // networkPrefix: testInputs.networkConnectionType.prefix,
          serverIP: testInputs.testServer.ip_address,
          ethernetName: testInputs.ethernetName
        }
        break;
      case "bdp":
        data = {
          mode: testMethod.mode,
          rtt: requiredGetParamaters.rtt,
          isr: testInputs.isr,
          serverIP: testInputs.testServer.ip_address,
          port,
        }
        break;
      case "thpt":
        data = {
          mode: testMethod.mode,
          mtu: requiredGetParamaters.mtu,
          rtt: requiredGetParamaters.rtt,
          bdp: requiredGetParamaters.bdp,
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
  
  function showTestResults(resultsHtml, methodName, testNumber) {
    $(`#${methodName}-measurement-results-${testNumber}`).append(resultsHtml);
  
    const successIconHtml = methodName == "upload"
      ? '<i class="bi bi-arrow-up-circle"></i>'
      : '<i class="bi bi-arrow-down-circle"></i>';
    $(`#${methodName}-test-results-status-${testNumber}`).html(successIconHtml);

    if (testInputs.autoRepeatCount > 1 || testInputs.mode.name == "bidirectional") {
      $(`#btn-save-${methodName}-test-${testNumber}`).show();

      $(`#btn-save-${methodName}-test-${testNumber}`).click(async function () {
        const method = $(this).data('method');
        const testNumber = parseInt($(this).data('test-number'));
        const testIndex = testNumber - 1;
  
        const start = testResults[testIndex][method].startedOn;
        const end = testResults[testIndex][method].endedOn;
        console.log(method, testNumber);
        const pdfReportFileName = await generateReport(testInputs, {
          startedOn: moment(start).format('YYYY-MM-DD HH:mm:ss'),
          finishedOn: moment(end).format('YYYY-MM-DD HH:mm:ss'),
          totalDuration: getDurationText(start, end)
        }, testClient, [method], testResults, testIndex, testNumber, "i", summaryChartImageUris 
        );

        $this = $(this);
        $.post("/open-downloads-folder",
          {
            fileName: pdfReportFileName
          },
          function(data, status){
            $this.attr('disabled', true);
            $this.text("Saved!");
          }
        );
      });

    } else {
      $(`#btn-save-${methodName}-test-${testNumber}`).hide();
    }
  }
  
  async function showTestFailed(err, processIndex, directionIndex, testNumber) {
    const process = MEASUREMENT_PROCESSES[processIndex];
    const testMode = testInputs.mode;
  
    console.log({ process });
  
    const methodName = testMode.methods[directionIndex];
    if (process) {
      $(`#${methodName}-process-status-${processIndex}-test-${testNumber}`).html('<i class="bi bi-x-octagon-fill text-danger"></i>');
      $(`#${methodName}-process-label-${processIndex}-test-${testNumber}`).text(process.label);
      $(`#${methodName}-process-label-${processIndex}-test-${testNumber}`).addClass("text-danger");
      $(`#${methodName}-process-status-label-${processIndex}-test-${testNumber}`).html(`<span class="px-2 text-nowrap text-danger">Failed</span>`);
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
      // $('#btnCancelTest').removeClass('d-none');
      // $('#btnRestartTest').removeClass('d-none');

      $('#test-failed-options').removeClass('d-none');
      $('#test-success-options').addClass('d-none');

      $('#btnBackToTop').addClass('d-none');
      $('#btnBackToTop').hide();
    }
    
    const now = moment();
    const errorFileName = now.format('YYYY-MM-DD-HH-mm-ss');
    testSessionTime.finishedOn = now.format('YYYY-MM-DD HH:mm:ss');

    $(`#summary-test-finished-on-${testNumber}`).html(`<span class="text-secondary">${testSessionTime.finishedOn}</span>`);
    $(`#summary-test-duration-${testNumber}`).html(`<span class="text-secondary">${currentTestDuration.timeText}</span>`);
  
    const autoRepeatCount = $('#auto-repeat-count').val();
    
    $(`#process-error`).html(`
      <div class="border border-danger bg-light mt-1 mx-2">
        <div class="accordion border-0" id="accordionError">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingError">
              <button class="accordion-button bg-danger bg-opacity-10 text-danger" type="button" data-bs-toggle="collapse" data-bs-target="#collapseError" aria-expanded="false" aria-controls="collapseError">
                ${errorTitle}
              </button>
            </h2>
            <div id="collapseError" class="accordion-collapse" aria-labelledby="headingError" data-bs-parent="#accordionError">
              <div class="accordion-body bg-light">
                <table cellpadding="2">
                  <tbody class="card-text font-monospace small">
                    <tr>
                      <td class="align-baseline">Timestamp:</td>
                      <td>${testSessionTime.finishedOn}</td>
                    </tr>
                    <tr>
                      <td class="align-baseline">Server:</td>
                      <td>${testInputs.testServer.nickname}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="d-flex align-content-center mt-2">
                  <button type="button" class="btn-restart-test btn btn-sm btn-primary align-self-center ms-start">
                    Retry ${process.label} - ${TEST_METHODS[methodName].titleCase} Test${autoRepeatCount == 1 ? '' : ` #${testNumber}`}
                  </button>
                  <button type="button" class="btn-restart-test-2 btn btn-sm btn-outline-primary align-self-center ms-1" ${autoRepeatCount == 1 ? "hidden" : ""}>
                    ${`Restart Test #${testNumber}`}
                  </button>
                  <a href="javascript:void(0);" id="btnOpenLogsFolder" class="btn btn-sm btn-link text-primary p-0 align-self-center ms-auto" role="button" onclick="openLogsFolder()">Open logs folder</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mx-2 my-1 mb-2">
      <div class="mx-2 my-1 mb-2">
        ${errorButtonsHtml}
      </div>
    `);
    // <button type="button" class="btn-send-error btn btn-sm btn-outline-primary align-self-center ms-auto me-2" data-error-file-name="${errorFileName}">Send error</button>
  
    for (const dName of testMode.methods) {
      $(`#${dName}-test-results-status-${testNumber}`).html('<i class="bi bi-x-octagon text-danger"></i>');
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
        await startTest(autoRepeatIndex);
      }).catch(() => {
      });
    }
  }
  
  function backToTop() {
    $('html, body').animate({
      scrollTop: $('#measurement-card .card-body').offset().top - 72
    }, 200);
  }
  
  function clearTest() {
    autoRepeatIndex = 0;
    testResults = [];
    appState = APP_STATE.Ready;
  
    $(`#process-error`).html('');
  
    $('#mainForm fieldset').attr('disabled', false);
  
    $("#mainForm").trigger('reset');
    $('#mainForm').removeClass('was-validated');
    $('.custom-test-server-field').addClass('d-none');
  
    $('#measurement-card').addClass('d-none');
    // $('#measurement-failed-card').hide();
  
    $('#net-warning').addClass('d-none');
    
    $('#location-name-container').html('<span>---</span>');
    $('#summary-location-name').html('<i>Locating...</i>');
  
    $('#connected-devices-card').removeClass('d-none');

    renderMap();
    
    $('#isr').focus();
  }
  
  function repeatTest() {
    const confirmRepeat = confirm("Repeat the test?");
    if (!confirmRepeat) {
      return;
    }
  
    $('#measurement-card').addClass('d-none');
    
    startTest(0);
  }
  
  async function saveAsPdf() {
    $('#btnSaveAsPdf').attr('disabled', true);
    $('#btnSaveAsPdf .spinner-border').removeClass('d-none');
    $('#test-success-options button').attr('disabled', true);

    const response = await fetch('get-ntc-office-address');
    
    if (response.ok) {
      const json = await response.json();
      if (json) {
        testClient.officeAddress = json.address;
      }
    }

    pdfReportFileName = await generateReport(testInputs, testSessionTime, testClient, testInputs.mode.methods, testResults, 0, testResults.length, "a", summaryChartImageUris);
  
    $('#btnSaveAsPdf').attr('disabled', false);
    $('#btnSaveAsPdf .spinner-border').addClass('d-none');
    $('#btnSaveAsPdf').addClass('d-none');
    $('#pdfSaved').removeClass('d-none');
    $('#test-success-options button').attr('disabled', false);
  }

  function setManualGpsCoordinates() {
    const latManual = $('#lat_manual').val();
    const lonManual = $('#lon_manual').val();
    
    if ((latManual && lonManual)
        && (!isNaN(latManual) && !isNaN(lonManual))
        && latManual >= -90 && latManual <= 90
        && lonManual >= -180 && lonManual <= 180) {
  
      $('input[name="coordinates"]').removeClass('is-invalid');

      $('#lat').val(latManual);
      $('#lon').val(lonManual).trigger('change');

      $('#gpsManualInput').addClass("d-none");
    } else {
      $('input[name="coordinates"]').addClass('is-invalid');
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
      
      try {
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
      } catch {

      }
      
      $('#map-snippet .spinner-border').remove();
      $('#mapOptions').removeClass('d-none');

      $('#location-name-container').html(`<div class="placeholder-wave"><span class="w-100 placeholder"></span></div>`);
      nominatimGetRequestDelay = setTimeout(function () {
        nominatimGetRequest = $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, function (result) {
          console.log("reverse-geo", result);

          testInputs.location.withinPH = result?.address?.country_code == "ph";

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
    
    $.post("/open-downloads-folder",
      {
        fileName: pdfReportFileName
      },
      function(data, status){
        $('#btnOpenDownloadsFolder').attr('disabled', false);
  
        $('#btnSaveAsPdf').removeClass('d-none');
        $('#pdfSaved').addClass('d-none');
      }
    );
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
        dataType: 'text',
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
      }
    });
  }
})();

function tryAgain() {
}

function resetTest() {
}

async function passwordBeforeStartTest() {
  $('#modalReenterPassword .modal-title').text('Token has expired');
  $('#modalReenterPassword .btn').text('Start Test');

  await passwordModal().then(() => {
    startTest(0);
  }).catch(() => {
  });
}

function openLogsFolder() {
  $('#btnOpenLogsFolder').attr('disabled', true);
  $.post('/open-logs-folder', function () {
    $('#btnOpenLogsFolder').attr('disabled', false);
  });
}