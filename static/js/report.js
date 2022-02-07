const blankImageEncoded = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

// ----------------------------------------------------------------
// INITIALIZE pdfMake
// ----------------------------------------------------------------

pdfMake.fonts = {
  Ubuntu: {
    normal: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Regular.ttf',
    bold: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Bold.ttf',
    italics: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Italic.ttf',
    bolditalics: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-BoldItalic.ttf'
  }
};
pdfMake.tableLayouts = {
  details: {
    hLineWidth: function () {
      return 1;
    },
    hLineColor: function () {
      return '#e0e0e0';
    },
    vLineWidth: function () {
      return 1;
    },
    vLineColor: function () {
      return '#e0e0e0';
    },
  },
  box: {
    hLineWidth: function (i, node) {
      if (i === 0 || i === node.table.body.length) {
        return 1;
      }
      return 0;
    },
    hLineColor: function () {
      return 'gray';
    },
    vLineWidth: function (i, node) {
      if (i === 0 || i === node.table.widths.length) {
        return 1;
      }
      return 0;
    },
    vLineColor: function () {
      return 'gray';
    },
    paddingLeft: function (i) {
      return 5;
    },
    paddingRight: function (i, node) {
      return 5;
    },
    paddingTop: function (i) {
      return 5;
    },
    paddingBottom: function (i, node) {
      return 5;
    }
  },
  horizontalStripes: {
    hLineWidth: function (i, node) {
      return 1;
    },
    hLineColor: function () {
      return 'gray';
    },
    vLineWidth: function (i, node) {
      if (i === 0 || i === node.table.widths.length) {
        return 1;
      }
      return 0;
    },
    vLineColor: function () {
      return 'gray';
    },
    paddingLeft: function (i) {
      return 5;
    },
    paddingRight: function (i, node) {
      return 5;
    },
    paddingTop: function (i) {
      return 5;
    },
    paddingBottom: function (i, node) {
      return 5;
    }
  }
};

async function generateReport(testInputs, testTime, testClient, results) {
  const methods = Object.keys(results);
  const testMode = TEST_MODES[testInputs.mode];

  const fileNameTimestamp = moment(testTime.finishedOn).format("YYYY-MM-DD-HHmmss");
  const defaultFileName = `netmesh-rfc-6349_${testMode.name}_${fileNameTimestamp}.pdf`;

  let resultsBody = [];
  
  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    const dResults = results[method];

    let resultsGrouped = {};
    for (const [key, measurement] of Object.entries(resultsParameters)) {
      if (!resultsGrouped[measurement.test]) {
        resultsGrouped[measurement.test] = {};
      }
      resultsGrouped[measurement.test][key] = measurement;
    }

    let resultsTables = [];
    for (const [groupName, groupResults] of Object.entries(resultsGrouped)) {
      let tablesBody = [];
      for (const [key, measurement] of Object.entries(groupResults)) {
        if (!Object.keys(groupResults).includes(key)) {
          continue;
        }

        const value = numeral(dResults[key]).value();
        let measurementText = "";
        if (key in groupResults) {
          measurementText = `${measurement.getMeasurement(value)}`;
        }
    
        let quantityText = [measurementText];
        switch (key) {
          case "tcp_ttr":
            const relative = value < 1 ? 1 / value : value;
            quantityText.push({
              text: "  " + `${value === 1 ? "Same as ideal" : `${numeral(relative).format('0.[00]')} times ${value < 1 ? "faster" : "slower"} than ideal`}`,
              fontSize: 8,
              color: '#808080',
            });
            break;
          case "buf_delay":
            const absolute = Math.abs(value);
            quantityText.push({
              text: "  " + `Average RTT is ${value === 1 ? "same as RTT" : `${numeral(absolute).format('0.[00]')}% ${value < 1 ? "faster" : "slower"} than RTT`}`,
              fontSize: 8,
              color: '#808080',
              margin: [8, 0, 0, 0]
            });
            break;
        }
        tablesBody.push([
          {
            text: measurement.name,
            fontSize: 10
          },
          {
            text: quantityText,
            fontSize: 10
          }
        ]);
      }
      
      resultsTables.push({
        text: groupName,
        bold: true,
        lineHeight: 1.5,
      });
      
      resultsTables.push({
        layout: 'details',
        table: {
          headerRows: 0,
          widths: [150, '*'],
          body: tablesBody,
        },
        margin: [0, 0, 0, 15]
      });
    }

    resultsBody.push([
      {
        text: `${method.toUpperCase()} TEST`,
        fontSize: 10,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      {
        image: chartImageUris.throughputCharts[method] ?? blankImageEncoded,
        height: 62.5,
        width: 400,
        alignment: 'center',
        margin: [0, 0, 0, 12]
      },
      {
        image: chartImageUris.transferCharts[method] ?? blankImageEncoded,
        height: 90,
        width: 400,
        alignment: 'center',
        margin: [0, 0, 0, 12]
      },
      resultsTables
    ]);

    if (i + 1 < methods.length) {
      resultsBody.push({
        text: '',
        pageBreak: 'before',
      })
    }
  }

  // ----------------------------------------------------------------
  // LAYOUT REPORT
  // ----------------------------------------------------------------

  const ntcLogoData = await getBase64ImageFromURLAsync('static/images/ntc_logo.png');

  const pageMarginInches = 0.5;
  const pageMarginPixels = pageMarginInches * 72;

  const docDefinition = {
    pageMargins: [pageMarginPixels, pageMarginPixels + 8, pageMarginPixels, pageMarginPixels + 8],
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10
    },
    // ${nowProper} | ISR: ${_cir} Mbps | ${_netTypeName} | ${_testServer.nickname}
    footer: function(currentPage, pageCount) {
      const testInfo = {
        text: `${testTime.finishedOn} | ISR: ${testInputs.isr} Mbps | ${testInputs.net} | ${testMode.titleCase}\n${testInputs.serverName}`,
        width: '*',
      };
      const pageInfo = {
        text: `\nPage ${currentPage.toString()} of ${pageCount}`,
        alignment: 'right',
        fontSize: 8,
      };

      return  {
        columns: [testInfo, pageInfo],
        color: 'gray',
        fontSize: 8,
        margin: [pageMarginPixels, 0, pageMarginPixels, 0]
      }
    },
    content: [
      {
        columns: [
          {
            image: ntcLogoData,
            width: 0.8 * 72,
            height: 0.8 * 72,
          },
          [
            {
              text: "Republic of the Philippines",
              lineHeight: 1.15,
              margin: [0, 6, 0, 0]
            },
            {
              text: "NATIONAL TELECOMMUNICATIONS COMMISSION",
              lineHeight: 1.15,
              bold: true
            },
            // {
            //   text: "Address",
            //   lineHeight: 1.15,
            // }
          ]
        ],
        columnGap: 10,
        margin: [0, 0, 0, 10]
      },
      {
        text: "RFC-6349 TEST RESULTS",
        fontSize: 12,
        alignment: 'center',
        bold: true,
        margin: [0, 0, 0, 12]
      },
      {
        text: "TEST DETAILS",
        decoration: 'underline',
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 11]
      },
      {
        text: "TEST INPUTS",
        fontSize: 10,
        lineHeight: 1.5,
        bold: true,
      },
      {
        layout: 'box',
        table: {
          headerRows: 0,
          widths: [150, '*'],
          body: [
            [
              'Test Mode:',
              testMode.titleCase
            ],
            [
              'Internet Subscription Rate (ISR):',
              `${testInputs.isr} Mbps`
            ],
            [
              'Network Connection Type:',
              testInputs.net
            ],
            [
              'Test Server:',
              testInputs.serverName
            ],
            [
              'Coordinates:',
              `${testInputs.lon}, ${testInputs.lat}`
            ],
          ]
        },
        margin: [0, 0, 0, 10]
      },
      {
        text: "TEST TIME",
        fontSize: 10,
        lineHeight: 1.5,
        bold: true,
      },
      {
        layout: 'box',
        table: {
          headerRows: 0,
          widths: [150, '*'],
          body: [
            [
              'Started on:',
              testTime.startedOn
            ],
            [
              'Finished on:',
              testTime.finishedOn
            ],
            [
              'Duration:',
              testTime.duration
            ],
          ]
        },
        margin: [0, 0, 0, 10]
      },
      {
        text: "TEST CLIENT",
        fontSize: 10,
        lineHeight: 1.5,
        bold: true,
      },
      {
        layout: 'box',
        table: {
          headerRows: 0,
          widths: [150, '*'],
          body: [
            [
              'Performed by:',
              {
                text: [
                  testClient.username,
                  // {
                  //   text: testClient.userId,
                  //   color: 'gray',
                  //   fontSize: 9
                  // }
                ]
              },
            ],
            [
              'ISP:',
              testClient.isp
            ],
          ]
        },
        margin: [0, 0, 0, 10]
      },
      {
        pageBreak: 'before',
        text: `${testMode.name.toUpperCase()} MODE MEASUREMENTS`,
        decoration: 'underline',
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 11]
      },
      resultsBody,
    ]
  };

  // ----------------------------------------------------------------
  // GENERATE PDF
  // ----------------------------------------------------------------
  
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.download(defaultFileName);
  // pdfDocGenerator.getDataUrl((dataUrl) => {
  //   const iframe = document.querySelector('#pdfPreview');
  //   iframe.src = dataUrl;
  // });
}

async function getBase64ImageFromURLAsync(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = error => {
      reject(error);
    };
    img.src = url;
  });
}