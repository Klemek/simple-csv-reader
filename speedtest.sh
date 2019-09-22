#!/bin/bash

#*/5 * * * * . /var/www/html/speedtest.sh >> /var/www/html/speedtest.log 2>&1

/usr/bin/python /var/www/html/speedtest.py >> /var/www/html/speedtest.csv
echo done
