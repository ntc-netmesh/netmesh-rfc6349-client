#!/bin/bash

# get net devices
net_devs=$(ls /sys/class/net/)
dev_array=($net_devs)

for i in "${dev_array[@]}"
do
    sudo ethtool -K $i tso off;
done
