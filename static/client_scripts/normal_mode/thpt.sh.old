#!/bin/bash


#
#   THROUGHPUT TEST
#

export _rtt="$1"
export _rwnd="$2"
export _ideal="$3"
export _ip="$4" 
export _port="$5"
if [[ -z "$_rtt" || -z "$_ip" || -z "$_port" || -z "$_rwnd" || -z "$_ideal" ]]
then
echo "Normal Mode Throughput Test"
echo "Usage: ./thpt.sh <rtt> <rwnd> <ideal> <ip> <port>"
echo "<rtt> in milliseconds"
echo "<rwnd> in KB"
echo "<ideal> subscription plan in Mbps"
echo "<ip> in server ip"
echo "<port> provided port by server"
echo "Example: ./thpt.sh 30 2000 100 127.0.0.1 8888"
exit 1;

fi

# iperf3 
# | extract results line 

# ORIGINAL IMPLEMENTATION (SUBJECT TO REVIEW)
#THPT=$(iperf3 --client $_ip --port $_port --time 5 --window $_rwndK --format m --bandwidth 100M)

OUT=$(iperf3 --client $_ip --port $_port --time 10 --format m --bandwidth 100M\
  | sed -n -e '/sender/p') 

AVE_THPT=$(echo $OUT | awk -F" " '{print $7}')
DATA_SENT=$(echo $OUT | awk -F" " '{print $5}')

if [[ -z "$AVE_THPT" || -z "$DATA_SENT" ]]
then
echo "Throughput Test failed"
exit 1;

fi


echo "Total Data Sent: $DATA_SENT Mbytes"
echo "thpt_avg: $AVE_THPT Mbits/sec"
echo "thpt_ideal: $_ideal Mbits/sec"

touch thpt_extract.py
cat << EOF > thpt_extract.py

import sys
data_sent= float(sys.argv[1])
ideal_thpt= float(sys.argv[2])
actual_thpt= float(sys.argv[3])
ideal_time = data_sent * 8 / ideal_thpt
actual_time = 10
ttr = actual_time / ideal_time
print("transfer_avg: 10 seconds")
print("transfer_ideal: " + str(ideal_time)+" seconds")
print("tcp_ttr: " + str(ttr))

EOF

python thpt_extract.py $DATA_SENT $_ideal $AVE_THPT
rm thpt_extract.py

