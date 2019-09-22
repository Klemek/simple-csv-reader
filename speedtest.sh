#!/bin/bash

#*/5 * * * * . /var/www/html/speedtest.sh >> /var/www/html/speedtest.log 2>&1

/usr/local/bin/speedtest-cli --single --csv --bytes >> /var/www/html/speedtest.csv
echo done
