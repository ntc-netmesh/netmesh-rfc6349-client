(function() {
  let map = null;
  let mapLayer = null;
  let nominatimGetRequest = null;
  let nominatimGetRequestDelay = null;

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

    const lsTestInputs = JSON.parse(sessionStorage.getItem("testInputs"));
    lsTestInputs.location.name = null;
    sessionStorage.setItem("testInputs", JSON.stringify(lsTestInputs));

    $('#location-name-container').val('---');
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
      
      $('#location-name-container').val('---');
      
      // if (testServers) {
      //   $('#btnStartTest').attr('disabled', false);
      //   $('#btnStartTest').attr('cursor', 'default');
      // }
  
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
        const lsTestInputs = JSON.parse(sessionStorage.getItem("testInputs"));
        lsTestInputs.mapImage.dataUri =  canvas.toDataURL();
        lsTestInputs.mapImage.width =  dimensions.x;
        lsTestInputs.mapImage.height =  dimensions.y;
        sessionStorage.setItem("testInputs", JSON.stringify(lsTestInputs));
      });
  
      $('#mapOptions').removeClass('d-none');

      $('#location-name-container .placeholder').removeClass('d-none');
      $('#location-name-container .form-control-plaintext').addClass('d-none');

      nominatimGetRequestDelay = setTimeout(function () {
        nominatimGetRequest = $.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, function (result) {
          console.log("reverse-geo", result);

          $('#location-name-container .placeholder').addClass('d-none');
          $('#location-name-container .form-control-plaintext').removeClass('d-none');

          if ("error" in result) {
            $('#location-name-container .form-control-plaintext').val(`(undetected address)`);
            $('#summary-location-name').html(`<div class="w-100 small text-muted">(undetected address)</div>`);

            const lsTestInputs = JSON.parse(sessionStorage.getItem("testInputs"));
            lsTestInputs.location.name = null;
            sessionStorage.setItem("testInputs", JSON.stringify(lsTestInputs));
            return;
          }

          const parts = result.display_name.split(', ');
          const addressName = `near ${parts.splice(0, parts.length - 2).join(', ')}`;

          const lsTestInputs = JSON.parse(sessionStorage.getItem("testInputs"));
          lsTestInputs.location.lat = lat;
          lsTestInputs.location.lon = lon;
          lsTestInputs.location.name = addressName;
          lsTestInputs.location.reverseGeoLicense = result.licence;
          sessionStorage.setItem("testInputs", JSON.stringify(lsTestInputs));

          $('#location-name-container .form-control-plaintext').val(addressName);
          $('#summary-location-name').text(addressName);
        }).fail(function () {
          const lsTestInputs = JSON.parse(sessionStorage.getItem("testInputs"));
          lsTestInputs.location.name = null;
          sessionStorage.setItem("testInputs", JSON.stringify(lsTestInputs));

          $('#location-name-container .form-control-plaintext').val(`(undetected address)`);
          $('#summary-location-name').html(`<div class="w-100 small text-muted">(undetected address)</div>`);
        });
      }, 1000);
    } else {
      $('#gpsInputSelection').removeClass("d-none");
    }
  }
})();