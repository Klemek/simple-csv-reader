// === CONFIG ===

//colors

//general
const TIME_STEP = 15; //minutes

//CSV data
const CSV_PATH = './speedtest.csv'; // path accessible by ajax request
const CSV_SIZE = 8; // line max size
const CSV_DATE = 3; // column containing the date
const CSV_COLUMNS = [6, 7];

//Display data
const GRAPH_TITLE = 'Speed-Test';
const COLUMNS_NAME = ['Download', 'Upload'];
const COLUMNS_FACTOR = [1 / 8e6, 1 / 8e6];
const COLUMNS_FIXED = [3, 3];
const COLORS = [
  'rgb(255,99,132)',
  'rgb(54, 162, 235)'
];
const Y_UNIT = 'MBps';

// === ADVANCED CONFIG ===

const MINIMUM_DATA = 5; //hide datasets with too few data
const SAMPLE_SIZE = 1e5; //how many sample data generated

// ==== SCRIPT (do not edit) ===

const datasets = {
  all: {
    name: 'All time',
    max: 100,
  },
  year: {
    name: 'Year',
    max: 12 * 8,
    time: 365.25 * 24 * 60,
    format: 'ddd dd mmm yyyy'
  },
  month: {
    name: 'Month',
    max: 31,
    time: 30.5 * 24 * 60,
    format: 'ddd dd mmm'
  },
  week: {
    name: 'Week',
    max: 7 * 8,
    time: 7 * 24 * 60,
    format: 'HH"H" ddd dd mmm'
  },
  day: {
    name: '24H',
    max: 24,
    time: 24 * 60,
    format: 'HH:MM ddd dd'
  },
  hour: {
    name: '1H',
    max: 60,
    time: 60,
    format: 'HH:MM'
  },
  minute: {
    name: '10m',
    max: 100,
    time: 10,
    format: 'HH:MM:ss'
  },
};

const config = {
  type: 'line',
  data: {
    labels: [], //00:00 00/00/0000
    datasets: COLUMNS_NAME.map((n, i) => ({
      label: COLUMNS_NAME[i],
      borderColor: COLORS[i],
      backgroundColor: COLORS[i],
      fill: false,
      data: []
    })),
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: `${GRAPH_TITLE} (loading)`
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
          labelString: Y_UNIT
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

function updateData(d) {
  config.data.labels = window.data[d].map(l => new Date(l[CSV_DATE]).format(datasets[d].format));
  CSV_COLUMNS.forEach((n, i) => {
    config.data.datasets[i].data = window.data[d].map(l => (parseFloat(l[CSV_COLUMNS[i]]) * COLUMNS_FACTOR[i]).toFixed(COLUMNS_FIXED[i]));
  });
  config.options.title.text = `${GRAPH_TITLE} (${datasets[d].name})${window.data.sample ? ' (Sample data)' : ''}`;
  document.title = config.options.title.text;
  if (window.chart)
    setTimeout(() => {
      window.chart.update();
    });
}

function meanLog(extract) {
  return extract.reduce((a, b) => a.map((v, i) => CSV_COLUMNS.includes(i) ? a[i] + b[i] : v))
    .map((v, i) => CSV_COLUMNS.includes(i) ? v / extract.length : v);
}

function crunch(data, maxLen, queryLen) {
  queryLen = Math.min(queryLen || data.length, data.length);
  const start = data.length - queryLen;
  const fragmentSize = Math.round(queryLen / maxLen);
  if (maxLen >= queryLen || fragmentSize === 1)
    return data.slice(start, data.length);
  const newData = [];
  for (let i = start; i < data.length; i += fragmentSize) {
    newData.push(meanLog(data.slice(i, i + fragmentSize)));
  }
  return newData;
}

function initData(data, sample) {
  window.data = {
    sample: sample,
    raw: data,
  };
  for (let d in datasets) {
    const maxLen = datasets[d].time ? datasets[d].time / TIME_STEP : undefined;
    window.data[d] = crunch(data, datasets[d].max, maxLen);
    if (window.data[d].length < MINIMUM_DATA || (maxLen && maxLen > data.length))
      datasets[d].btn.setAttribute('disabled', '');
    else
      datasets[d].btn.removeAttribute('disabled');
  }

  console.log('data processed');
  updateData('all');
}

function createLog(date, values) {
  const line = new Array(CSV_SIZE).fill(null);
  line[CSV_DATE] = date;
  CSV_COLUMNS.forEach((c, i) => {
    line[c] = values[i];
  });
  return line;
}

function generateSampleData() {
  const sampleData = [];
  let sample = new Array(CSV_COLUMNS.length).fill(0).map((u, i) => 5 / COLUMNS_FACTOR[i]);
  let sampleDate = new Date();
  sampleDate.setMinutes(sampleDate.getMinutes() - sampleDate.getMinutes() % TIME_STEP - TIME_STEP * SAMPLE_SIZE);
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    sample.forEach((s, i) => {
      sample[i] = Math.max(0, s + (Math.random() - 0.5) / COLUMNS_FACTOR[i]);
    });
    sampleDate.setMinutes(sampleDate.getMinutes() + TIME_STEP);
    sampleData.push(createLog(sampleDate.toISOString(), sample));
  }
  return sampleData;
}

window.onload = function () {
  document.title = GRAPH_TITLE;
  const ctx = document.getElementById('graph').getContext('2d');
  window.chart = new Chart(ctx, config);

  for (let d in datasets) {
    const btn = document.createElement('button');
    btn.innerText = datasets[d].name;
    btn.addEventListener('click', () => {
      updateData(d);
    });
    datasets[d].btn = btn;
    document.body.appendChild(btn);
  }

  document.getElementById('reload').addEventListener('click', load);
};

function load() {
  get(CSV_PATH).then((data) => {
    data = data.trim().split('\n').map(l => l.split(','));
    if (data.length === 0 || data[0].length < CSV_SIZE) {
      initData(generateSampleData(), true);
    } else {
      initData(data, false);
    }
  }).catch(() => {
    initData(generateSampleData(), true);
  });
}


load();