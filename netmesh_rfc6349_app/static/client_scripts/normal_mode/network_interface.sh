#!/bin/bash

#
# RETURNS ALL NETWORK INTERFACES EXCEPT loopback
#

ip -br addr list | grep -v lo | awk -F" " '{print $1}';
