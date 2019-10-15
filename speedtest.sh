#!/bin/sh
SCRIPT=`realpath -s $0`
DIR=`dirname ${SCRIPT}`
echo `date` started
#/bin/kill `ps aux|grep speedtest|grep -v grep|awk '{print $2}'`
/usr/local/bin/speedtest-cli --single --csv >> ${DIR}/speedtest.csv
echo `date` done


