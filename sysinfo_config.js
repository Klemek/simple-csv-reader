// === CONFIG ===

//general
const TIME_STEP = 1; //minutes

//CSV data
const CSV_PATH = './sysinfo.csv'; // path accessible by ajax request
const CSV_SEPARATOR = ',';
const CSV_SIZE = 3; // line max size
const CSV_DATE = 0; // column containing the date
const CSV_COLUMNS = [1, 2];

//Display data
const GRAPH_TITLE = 'System Info';
const COLUMNS_NAME = ['CPU', 'RAM'];
const COLUMNS_FACTOR = [1, 1]; // the 2 firsts need to be scaled down
const COLUMNS_PRECISION = [3, 3];
const COLUMNS_SECONDARY = [false, false]; // the Ping on the secondary axis
const COLORS = [
  'rgb(255,99,132)',
  'rgb(54, 162, 235)'
];
const Y_UNIT = '%';
const Y_SECONDARY_UNIT = '';