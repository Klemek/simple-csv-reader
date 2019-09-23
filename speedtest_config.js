// === CONFIG ===

//general
const TIME_STEP = 15; //minutes

//CSV data
const CSV_PATH = './speedtest.csv'; // path accessible by ajax request
const CSV_SEPARATOR = ',';
const CSV_SIZE = 8; // line max size
const CSV_DATE = 3; // column containing the date
const CSV_COLUMNS = [6, 7, 5];

//Display data
const GRAPH_TITLE = 'Speed-Test';
const COLUMNS_NAME = ['Download', 'Upload', 'Ping'];
const COLUMNS_FACTOR = [1 / 8e6, 1 / 8e6, 1]; // the 2 firsts need to be scaled down
const COLUMNS_PRECISION = [3, 3, 3];
const COLUMNS_SECONDARY = [false, false, true]; // the Ping on the secondary axis
const COLORS = [
  'rgb(255,99,132)',
  'rgb(54, 162, 235)',
  'rgb(255, 159, 64)'
];
const Y_UNIT = 'MBps';
const Y_SECONDARY_UNIT = 'ms';