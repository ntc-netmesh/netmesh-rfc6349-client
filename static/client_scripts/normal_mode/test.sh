#!/bin/bash

total=0
rm retx_temp.pcapng
touch retx_temp.pcapng
#tempfile=$(mktemp)
tempfile=retx_temp.pcapng
sudo tshark -i wlp3s0 -f "tcp port 5201" -w $tempfile &
tspid=$!

sleep 20;

sudo kill -9 $tspid

exit 1;


for i in $(sudo tshark -i wlp3s0 -f "tcp port 5201" -T fields -e "tcp.len" -Y "tcp.analysis.retransmission || tcp.analysis.fast_retransmission"); do
    echo "$i"
done

#while read line
#do
#  if [[ "$line" =~ ^[0-9]+$ ]]; then
#    total=$(($total + $line))
#    echo $total > retx_temp
#  fi
#done < "${1:-/dev/stdin}"

