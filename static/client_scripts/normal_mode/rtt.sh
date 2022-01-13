#!/bin/bash


#
#   USED TO FIND RTT CLIENT SIDE
#   OUTPUT : rtt: <rtt>
#

export _arg="$1"
export _ip="$2" 
if [[ -z "$_arg" || -z "$_ip" ]]
then
echo "Normal mode RTT finder"
echo "Usage: ./rtt.sh <network_interface> <ip>"
echo "Example: ./rtt.sh enp3s0 127.0.0.1"
exit 1;

fi

# ping 
# | remove non-measurement lines | remove first 5 entries | retrieves RTT value
# | calculates average
ping -c 15 -I $_arg $_ip \
  | grep "time=" | tail -n +6 | awk -F "=" '{print $NF-0}'\
  | awk '{s+=$1}END{print "rtt:",(NR?s/NR:"NaN")}'  
