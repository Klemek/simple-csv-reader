import os
import re
import subprocess
import time

response = subprocess.Popen('/usr/local/bin/speedtest-cli --simple', shell=True, stdout=subprocess.PIPE).stdout.read()

ping = re.findall('Ping:\s(.*?)\s', response, re.MULTILINE)
download = re.findall('Download:\s(.*?)\s', response, re.MULTILINE)
upload = re.findall('Upload:\s(.*?)\s', response, re.MULTILINE)

if len(ping) > 0:
    ping[0] = ping[0].replace(',', '.')
    download[0] = download[0].replace(',', '.')
    upload[0] = upload[0].replace(',', '.')
    print('{},{},{},{},{}'.format(time.strftime('%m/%d/%y'), time.strftime('%H:%M'), ping[0], download[0], upload[0]))
else:
    print('{},{},{},{},{}'.format(time.strftime('%m/%d/%y'), time.strftime('%H:%M'), 0,0,0))
