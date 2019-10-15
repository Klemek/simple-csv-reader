#!/bin/bash
export LANG="en_US.UTF-8"
SCRIPT=`realpath -s $0`
DIR=`dirname ${SCRIPT}`

RAWCPU=`top -n 2 -b |grep "Cpu(s)"`
CPU=(${RAWCPU//:/ })
MEM=(`top -n 1 -b |grep "Mem :"`)

MEMUSED=`printf %.3f "$(echo "100000*${MEM[7]}/${MEM[3]}"|bc)e-3"`

echo "`date` / ${CPU[18]} % / $MEMUSED %"
echo "`date -Is`,${CPU[18]},$MEMUSED" >> ${DIR}/sysinfo.csv
