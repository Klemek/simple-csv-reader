#!/bin/sh
SCRIPT=`realpath -s $0`
DIR=`dirname ${SCRIPT}`
echo `date` started
/usr/local/bin/speedtest-cli --single --csv >> ${DIR}/speedtest.csv
echo `date` done


