#!/bin/bash

# set the ethtool flag

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
tshark -w $3 -a duration:60 &
sharkpid=$!
sleep 10;

# run 
./clienttcp $1 $2 &
clientpid=$!

sleep 60;

# kill PIDs
kill -9 $sharkpid;
kill -9 $clientpid;

# analyzer script
python3 rtt_analyzer.py $1 $2 $3;

# cleanup
for i in "${dev_array[@]}"
do
    sudo ethtool -K $i tso on;

done
