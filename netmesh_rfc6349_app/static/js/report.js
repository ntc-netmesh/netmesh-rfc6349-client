// ----------------------------------------------------------------
// INITIALIZE pdfMake
// ----------------------------------------------------------------

// pdfMake.fonts = {
//   Ubuntu: {
//     normal: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Regular.ttf',
//     bold: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Bold.ttf',
//     italics: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-Italic.ttf',
//     bolditalics: 'http://127.0.0.1:5000/static/fonts/Ubuntu/Ubuntu-BoldItalic.ttf'
//   }
// };
pdfMake.fonts = {
  Ubuntu: {
    normal: 'Ubuntu-Regular.ttf',
    bold: 'Ubuntu-Bold.ttf',
    italics: 'Ubuntu-Italic.ttf',
    bolditalics: 'Ubuntu-BoldItalic.ttf'
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
  innerDetails: {
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

async function generateReport(testInputs, testSessionTime, testClient, results, summaryChartImageUris) {
  const testRepeatCount = results?.length ?? 0;

  const fileNameTimestamp = moment(testSessionTime.startedOn).format("YYYY-MM-DD-HHmmss");
  const defaultFileName = `netmesh-rfc-6349_${testInputs.mode.name}_${fileNameTimestamp}_tr${numeral(testRepeatCount).format("00")}.pdf`;

  let resultsBody = [];
  
  for (let tn = 0; tn < testRepeatCount; tn++) {
    const methods = Object.keys(results[tn]);

    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      const dResults = results[tn][method].results;
  
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
              const relative_tcp_ttr = value < 1 ? 1 / value : value;
              quantityText.push({
                text: "  " + `${value === 1 ? "Same as ideal" : (`${numeral(relative_tcp_ttr).format('0.[000]')} times ${value < 1 ? "faster" : "slower"} than ideal`)}`,
                fontSize: 8,
                color: '#808080',
              });
              break;
            case "buf_del":
              const decimalValue = value / 100;
              console.log("decimalValue", decimalValue);
              const relative_buf_delay = decimalValue == -1 ? NaN : decimalValue >= 0 ? decimalValue : (1 / (1 + decimalValue)) - 1;
              quantityText.push({
                text: "  " + `Average RTT is ${decimalValue === 0 ? "same as" : (`${isNaN(relative_buf_delay) ? "infinitely" : numeral(relative_buf_delay).format('0.[00]%')} ${decimalValue < 0 ? "faster than" : "slower than"} Baseline RTT`)}`,
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
          margin: [0, 0, 0, 15],
        });
      }

      const resultsContent = [
        {
          text: `${method.toUpperCase()} TEST`,
          fontSize: 10,
          bold: true,
        }
      ];

      if (testRepeatCount > 1) {
        resultsContent.push({
          text: `Test #${tn + 1}`,
          fontSize: 9,
          bold: true,
          color: '#606060'
        });  
      }

      resultsContent.push(...[
        {
          text: '',
          margin: [0, 10, 0, 10]
        },
        {
          image: chartImageUris[tn].throughputCharts[method] ?? BLANK_IMAGE_ENCODED,
          height: 62.5,
          width: 400,
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },
        {
          image: chartImageUris[tn].rttCharts[method] ?? BLANK_IMAGE_ENCODED,
          height: 90,
          width: 400,
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },
        {
          image: chartImageUris[tn].transferCharts[method] ?? BLANK_IMAGE_ENCODED,
          height: 90,
          width: 400,
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },
        resultsTables
      ]);

      if ((tn * 2 + i) + 1 < testRepeatCount * methods.length) {
        resultsContent.push({
          text: '',
          pageBreak: 'after'
        });
      }

      resultsBody.push(resultsContent);
    }
  }

  const summaryPage = generateTestExecutionSummaryReport(testInputs.mode.methods, results, summaryChartImageUris);

  // ----------------------------------------------------------------
  // LAYOUT REPORT
  // ----------------------------------------------------------------

  const ntcLogoData = await getBase64ImageFromURLAsync('static/images/ntc_logo.png');

  const pageMarginInches = 0.5;
  const pageMarginPixels = pageMarginInches * 72;

  const reportContent = [];
  reportContent.push(...[
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
            testInputs.mode.titleCase
          ],
          [
            'Internet Subscription Rate (ISR):',
            `${testInputs.isr} Mbps`
          ],
          [
            'Network Connection Type:',
            testInputs.networkConnectionTypeName
          ],
          [
            'Test Server:',
            testInputs.testServer.nickname
          ],
          [
            'Location:',
            [
              {
                text: [
                  testInputs.location.name,
                  '\n',
                  {
                    text: testInputs.coordinates,
                    fontSize: 9,
                    lineHeight: 1.15,
                  }
                ],
                lineHeight: 1.15,
              },
              {
                image: testInputs.mapImage.dataUri ?? BLANK_IMAGE_ENCODED,
                width: testInputs.mapImage.width * 0.6,
                height: testInputs.mapImage.height * 0.6,
                alignment: 'left',
                margin: [0, 0, 0, 6]
              },
              {
                text: '© OpenStreetMap contributors',
                color: 'gray',
                fontSize: 8,
              },
              {
                text: testInputs.location.reverseGeoLicense,
                color: 'gray',
                fontSize: 8,
              },
            ]
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
            'Conducted by:',
            {
              text: [
                `${testClient.fullName} `,
                {
                  text: testClient.email,
                  color: 'gray',
                  fontSize: 9,
                }
              ]
            },
          ],
          [
            'Tested on:',
            {
              text: [
                `${testClient.machineName}`
              ]
            }
          ],
          [
            'ISP:',
            testClient.isp ?? "(undetected)"
          ],
          [
            'Public IP:',
            testClient.publicIP ?? "(undetected)"
          ],
        ]
      },
      margin: [0, 0, 0, 10]
    },
    {
      text: "TEST EXECUTION",
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
            'Count',
            testRepeatCount
          ],
          [
            'Started on:',
            testSessionTime.startedOn
          ],
          [
            'Finished on:',
            testSessionTime.finishedOn
          ],
          [
            'Duration:',
            testSessionTime.totalDuration
          ],
        ]
      },
      margin: [0, 0, 0, 10]
    },
  ]);

  if (testRepeatCount > 1) {
    reportContent.push(...summaryPage);
  }

  reportContent.push(...[
    {
      pageBreak: 'before',
      text: `${testInputs.mode.name.toUpperCase()} MODE MEASUREMENTS`,
      decoration: 'underline',
      fontSize: 11,
      bold: true,
      margin: [0, 0, 0, 11]
    },
    resultsBody,
  ]);

  const docDefinition = {
    pageMargins: [pageMarginPixels, pageMarginPixels + 8, pageMarginPixels, pageMarginPixels + 8],
    defaultStyle: {
      font: 'Ubuntu',
      fontSize: 10
    },
    // ${nowProper} | ISR: ${_cir} Mbps | ${_netTypeName} | ${_testServer.nickname}
    footer: function(currentPage, pageCount) {
      const testInfo = {
        text: `${testSessionTime.finishedOn} | ISR: ${testInputs.isr} Mbps | ${testInputs.networkConnectionTypeName} | ${testInputs.mode.titleCase}\n${testInputs.testServer.nickname}`,
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
    content: reportContent
  };

  // ----------------------------------------------------------------
  // GENERATE PDF
  // ----------------------------------------------------------------
  
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.download(defaultFileName);

  console.log("docDefinition", docDefinition);

  return defaultFileName;
}

function generateTestExecutionSummaryReport(methods, results, summaryChartImageUris) {
  const testRepeatCount = results?.length ?? 0;

  let summaryCharts = [];

  for (const method of methods) {
    const speeds = results.map((result) => {
      return result[method].results.thpt_avg
    });
    const averageSpeed = speeds.reduce((total, speed) => total + speed, 0) / speeds.length;

    const tcpEfficiencies = results.map((result) => {
      return result[method].results.tcp_eff
    });
    const averageTcpEfficiency = tcpEfficiencies.reduce((total, speed) => total + speed, 0) / tcpEfficiencies.length;

    const bufferDelays = results.map((result) => {
      return result[method].results.buf_del
    });
    const averageBufferDelay = bufferDelays.reduce((total, speed) => total + speed, 0) / bufferDelays.length;

    summaryCharts.push([
      {
        image: summaryChartImageUris.speedsChartUri[method] ?? BLANK_IMAGE_ENCODED,
        width: 400 * 0.6,
        height: 240 * 0.6,
        alignment: 'center',
        margin: [0, 0, 0, 24]
      },
      {
        image: summaryChartImageUris.tcpEfficienciesChartUri[method] ?? BLANK_IMAGE_ENCODED,
        width: 400 * 0.6,
        height: 240 * 0.6,
        alignment: 'center',
        margin: [0, 0, 0, 24]
      },
      {
        image: summaryChartImageUris.bufferDelaysChartUri[method] ?? BLANK_IMAGE_ENCODED,
        width: 400 * 0.6,
        height: 240 * 0.6,
        alignment: 'center',
        margin: [0, 0, 0, 24]
      },
      {
        text: `${TEST_METHODS[method].mode} MODE SUMMARY`.toUpperCase(),
        fontSize: 10,
        lineHeight: 1.5,
        bold: true,
      },
      {
        layout: 'details',
        table: {
          headerRows: 0,
          widths: ['auto', 'auto', '*'],
          body: [
            [
              'Count',
              {
                text: testRepeatCount,
                colSpan: 2
              },
              ''
            ],
            [
              'Test Started On',
              {
                text: moment(results[0][method].startedOn).format('YYYY-MM-DD HH:mm:ss'),
                colSpan: 2
              },
              ''
            ],
            [
              {
                text: `${TEST_METHODS[method].titleCase} Speed`,
                rowSpan: 3,
              },
              'Average',
              `${numeral(averageSpeed).format("0.[00]")} Mbps`
            ],
            [
              '',
              {
                text: 'Min',
                fontSize: 9
              },
              {
                text: `${numeral(Math.min(...speeds)).format("0.[00]")} Mbps`,
                fontSize: 9
              }
            ],
            [
              '',
              {
                text: 'Max',
                fontSize: 9
              },
              {
                text: `${numeral(Math.max(...speeds)).format("0.[00]")} Mbps`,
                fontSize: 9
              },
            ],
            [
              {
                text: `TCP Efficiency`,
                rowSpan: 3,
              },
              'Average',
              `${numeral(averageTcpEfficiency).format('0.[00]')}%`
            ],
            [
              '',
              {
                text: 'Min',
                fontSize: 9
              },
              {
                text: `${numeral(Math.min(...tcpEfficiencies)).format("0.[00]")}%`,
                fontSize: 9
              }
            ],
            [
              '',
              {
                text: 'Max',
                fontSize: 9
              },
              {
                text: `${numeral(Math.max(...tcpEfficiencies)).format("0.[00]")}%`,
                fontSize: 9
              },
            ],
            [
              {
                text: `Buffer Delay`,
                rowSpan: 3,
              },
              'Average',
              `${numeral(averageBufferDelay).format("0.[00]")} ms`
            ],
            [
              '',
              {
                text: 'Min',
                fontSize: 9
              },
              {
                text: `${numeral(Math.min(...bufferDelays)).format("0.[00]")} ms`,
                fontSize: 9
              }
            ],
            [
              '',
              {
                text: 'Max',
                fontSize: 9
              },
              {
                text: `${numeral(Math.max(...bufferDelays)).format("0.[00]")} ms`,
                fontSize: 9
              },
            ],
          ]
        },
      },
    ]);
  }

  // const pageMarginInches = 0.5;
  // const pageMarginPixels = pageMarginInches * 72;
  // const docDefinition = {
  //   pageMargins: [pageMarginPixels, pageMarginPixels + 8, pageMarginPixels, pageMarginPixels + 8],
  //   defaultStyle: {
  //     font: 'Ubuntu',
  //     fontSize: 10
  //   },
  //   content: [
  //     {
  //       text: "TEST EXECUTION SUMMARY",
  //       decoration: 'underline',
  //       fontSize: 11,
  //       bold: true,
  //       margin: [0, 0, 0, 11]
  //     },
  //     {
  //       columns: summaryCharts,
  //       columnGap: 24
  //     }
  //   ]
  // };

  return [
    {
      pageBreak: 'before',
      text: "TEST EXECUTION SUMMARY",
      decoration: 'underline',
      fontSize: 11,
      bold: true,
      margin: [0, 0, 0, 11]
    },
    {
      columns: summaryCharts,
      columnGap: 24
    }
  ];

  // console.log(testRepeatCount, results);

  // const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  // // pdfDocGenerator.download(defaultFileName);

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