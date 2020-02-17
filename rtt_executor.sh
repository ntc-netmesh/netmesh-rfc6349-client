#!/bin/bash

# Params
# $1 server_ip 
# $2 client_ip
# $3 rtt service port number
# $4 MSS
# $5 temp file name
# $6 pcap file name
SERVER_IP=$1
CLIENT_IP=$2
PORT_NO=$3
MSS=$4
TEMPFILE=$5
PCAP_FILE=$6

# get net devices
net_devs=$(ls /sys/class/net/)
dev_array=($net_devs)

for i in "${dev_array[@]}"
do
    sudo ethtool -K $i tso off;
done

# compile c client
gcc -o clienttcp clienttcp.c;

# run shark
tshark -w $PCAP_FILE -a duration:20 &
sharkpid=$!
sleep 5;

# run 
./clienttcp $SERVER_IP $PORT_NO $MSS &
clientpid=$!

sleep 20;

# kill PIDs
kill -9 $sharkpid;
kill -9 $clientpid;

# analyzer script
python3 rtt_analyzer.py $PCAP_FILE $CLIENT_IP $SERVER_IP $(($MSS-12)) $TEMPFILE;

# cleanup
for i in "${dev_array[@]}"
do
    sudo ethtool -K $i tso on;
done
