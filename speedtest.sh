#!/bin/sh
#*/5 * * * * /var/www/html/speedtest.sh >> /var/www/html/speedtest.log 2>&1
echo "started"
/usr/local/bin/speedtest-cli --single --csv >> /var/www/html/speedtest.csv
echo "done"


