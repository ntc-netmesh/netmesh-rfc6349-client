#!/bin/bash


#
#   USED TO FIND MTU CLIENT SIDE
#

export _arg="$1"
export _ip="$2" 
if [[ -z "$_arg" || -z "$_ip" ]]
then
echo "Client side MTU finder"
echo "Usage: ./mtu.sh <network_interface> <ip>"
echo "Example: ./mtu.sh enp3s0 127.0.0.1"
exit 1;

fi

# COMPILE C BINARY
gcc -Wall -Wextra ../general_deps/mtu_disc/mtu_discovery.c ../general_deps/mtu_disc/mtu.c -o plpmtu

echo "mtu: $(./plpmtu -p icmp -s $_ip | tail -1 | awk -F" " '{print $4}')"
# old mtu
#echo "mtu: $(netstat -i | tail -n +3 | grep -v lo | grep -i $_arg | awk -F" " '{print $2}')"
