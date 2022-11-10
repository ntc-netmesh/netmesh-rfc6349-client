#!/bin/bash


#
#   USED TO FIND BB, BDP, RWND CLIENT SIDE
#

export _rtt="$1"
export _ip="$2" 
export _port="$3"
export _mode="$4"
export _bitrate="$5"
if [[ -z "$_rtt" || -z "$_ip" || -z "$_port"  || -z "$_mode" || -z "$_bitrate" ]]
then
echo "Normal Mode BB finder"
echo "Usage: ./bb.sh <rtt> <ip> <port>"
echo "<rtt> in milliseconds"
echo "<ip> in server ip"
echo "<port> provided port by server"
echo "<bitrate> bitrate"
echo "Example: ./bb.sh 30 192.168.1.55 8888 5"
exit 1;

fi

if [[ "$_mode" = "normal" ]];
then
  _mode="";
elif [[ "$_mode" = "reverse" ]];
then
  _mode="--reverse";
else
  echo "invalid mode"
  exit 1;
fi
# iperf3 
# | extract results line | retrieve BDP

# OLD UDP IMPLEMENTATION
#BB=$(iperf3 --client $_ip --udp --port $_port --time 10 --format m --bandwidth 1000M \
#  | sed -e '1,/Jitter/ d; /sec/!d' | awk -F" " '{print $7}')
#echo "bb: $BB Mbits/sec"

BB=$(iperf3 $_mode --client $_ip --port $_port --time 10 --omit 5 --bitrate $_bitrate --pacing-timer 100 --format m --bandwidth 1000M \
  | sed -n -e '/sender/p' | awk -F" " '{print $7}')
echo "bb: $BB Mbits/sec"

if [ -z "$BB" ]
then
echo "BB failed"
exit 1;

fi

touch ./bdp_rwnd.py
cat << EOF > bdp_rwnd.py
#!/usr/bin/python3
import sys
rtt = float(sys.argv[1])
bb = float(sys.argv[2])
bdp = int((rtt/1000)*bb*1000000)
print("bdp: " + str(bdp)+" bytes")
rwnd = int(bdp/8/1000)
print("rwnd: " + str(rwnd)+" Kbytes")

EOF
chmod +x bdp_rwnd.py
./bdp_rwnd.py $_rtt $BB
rm bdp_rwnd.py

# BDP and RWND not to be included for now because of
# floating point issues with bash

#BDP=$( echo "($_rtt/1000)*$BB*1000000" | bc )
#echo "Bandwidth Delay Product: $BDP bits"
#RWND=$( echo $BDP/8/1000 | bc )
#echo "Receive Window: $BDP Kbytes"
