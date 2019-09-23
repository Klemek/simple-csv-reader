const red = 'rgb(255, 99, 132)';
const blue = 'rgb(54, 162, 235)';
const SAMPLE_SIZE = 1e5;
const CSV_SIZE = 8;
const CSV_DATE = 3;
const CSV_DOWNLOAD = 6;
const CSV_UPLOAD = 7;
const TIME_STEP = 15; //minutes

const datasetNames = {
  all: 'All time',
  month: 'Month',
  week: 'Week',
  day: '24H',
};

const datasetButtons = {
  all: 'allTime',
  month: 'lastMonth',
  week: 'lastWeek',
  day: 'lastDay',
};

const config = {
  type: 'line',
  data: {
    labels: [], //00:00 00/00/0000
    datasets: [{
      label: 'Download',
      borderColor: red,
      backgroundColor: red,
      fill: false,
      data: []
    }, {
      label: 'Upload',
      borderColor: blue,
      backgroundColor: blue,
      fill: false,
      data: []
    }],
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Speed-Test (loading)'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        ticks: {display: false},
        scaleLabel: {
          display: true,
          labelString: 'Time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'MBps'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    }
  },
};


function get(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

function updateData(dataset) {
  config.data.labels = window.data[dataset].map(l => l[CSV_DATE].replace(/(\d*)-(\d*)-(\d*)T(\d*):(\d*)(.*)/, '$4:$5 $3/$2/$1')); //00:00 00/00/0000
  config.data.datasets[0].data = window.data[dataset].map(l => (parseFloat(l[CSV_DOWNLOAD]) / 8e6).toFixed(3));
  config.data.datasets[1].data = window.data[dataset].map(l => (parseFloat(l[CSV_UPLOAD]) / 8e6).toFixed(3));
  config.options.title.text = `Speed-Test (${datasetNames[dataset]})${window.data.sample ? ' (Sample data)' : ''}`;
  if (window.chart)
    setTimeout(() => {
      window.chart.update();
    });
}

function createLog(date, download, upload) {
  const line = new Array(CSV_SIZE).fill(null);
  line[CSV_DATE] = date;
  line[CSV_DOWNLOAD] = download;
  line[CSV_UPLOAD] = upload;
  return line;
}

function meanLog(extract) {
  return extract.reduce((a, b) => createLog(a[CSV_DATE], a[CSV_DOWNLOAD] + b[CSV_DOWNLOAD], a[CSV_UPLOAD] + b[CSV_UPLOAD]))
    .map((v, i) => (i === CSV_DOWNLOAD || i === CSV_UPLOAD) ? v / extract.length : v);
}

function crunch(data, maxLen, queryLen) {
  queryLen = Math.min(queryLen || data.length, data.length);
  const start = data.length - queryLen;
  const fragmentSize = Math.round(queryLen / maxLen);
  if (maxLen >= queryLen || fragmentSize === 1) {
    console.log('returning data from ' + start + ' to end');
    return data.slice(start, data.length);
  }
  console.log('computing mean data from ' + start + ' to end with step of ' + fragmentSize);
  const newData = [];
  for (let i = start; i < data.length; i += fragmentSize) {
    newData.push(meanLog(data.slice(i, i + fragmentSize)));
  }
  return newData;
}

function initData(data, sample) {
  console.log(data.slice(99904).map(x => (x[CSV_DOWNLOAD] / 8e6) + ' ' + (x[CSV_UPLOAD] / 8e6)).join('\n'));
  window.data = {
    sample: sample,
    raw: data,
    day: crunch(data, 100, 24 * 60 / TIME_STEP),
    week: crunch(data, 100, 7 * 24 * 60 / TIME_STEP),
    month: crunch(data, 100, 30.5 * 24 * 60 / TIME_STEP),
    all: crunch(data, 100)
  };
  console.log('done');
  updateData('day');
  console.log(data.slice(99904).map(x => (x[CSV_DOWNLOAD] / 8e6) + ' ' + (x[CSV_UPLOAD] / 8e6)).join('\n'));
}

function generateSampleData() {
  const sampleData = [];
  let sampleDownload = 40e6;
  let sampleUpload = 10e6;
  let sampleDate = new Date();
  sampleDate.setMinutes(sampleDate.getMinutes() - sampleDate.getMinutes() % TIME_STEP - TIME_STEP * SAMPLE_SIZE);
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    sampleDownload = Math.max(0, sampleDownload + Math.random() * 1e6 - 0.5e6);
    sampleUpload = Math.max(0, sampleUpload + Math.random() * 1e6 - 0.5e6);
    sampleDate.setMinutes(sampleDate.getMinutes() + TIME_STEP);
    sampleData.push(createLog(sampleDate.toISOString(), sampleDownload, sampleUpload));
  }
  return sampleData;
}

window.onload = function () {
  const ctx = document.getElementById('speedtest').getContext('2d');
  window.chart = new Chart(ctx, config);

  //register events
  Object.keys(datasetButtons).forEach(dataset => {
    document.getElementById(datasetButtons[dataset]).addEventListener('click', () => {
      updateData(dataset);
    });
  });
};

get('./speedtest.csv').then((data) => {
  data = data.trim().split('\n').map(l => l.split(','));
  if (data.length === 0 || data[0].length < CSV_SIZE) {
    initData(generateSampleData(), true);
  } else {
    initData(data, false);
  }
}).catch(() => {
  initData(generateSampleData(), true);
});
