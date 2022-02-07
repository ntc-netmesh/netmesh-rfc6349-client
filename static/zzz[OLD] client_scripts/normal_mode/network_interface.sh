#!/bin/bash

#
# RETURNS ALL NETWORK INTERFACES EXCEPT loopback
#

netstat -i | tail -n +3 | grep -v lo | awk -F" " '{print $1}';
