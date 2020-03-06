import subprocess
import asyncio
import traceback
import logging
from log_settings import getStreamLogger
from datetime import datetime
from constants import *
from utilities import client_utils
from math import floor, ceil

GLOBAL_LOGGER = getStreamLogger()

'''
        Calculates the parameters to be used for the
        throughput testing. These values are derived
        via formulas.
        @PARAMS:
            bdp          : Bandwidth Delay Product
            mtu          : Maximum Transmission Unit
        @RETURN:
            mss          : Maximum segment size
            rwnd         : receive window size
            connections  : number of parallel connections
'''
def find_throughput_params(bdp, mtu):
    try:
        mss = mtu - 40
        x = 1
        rwnd = x*mss
        while(rwnd < bdp):
            x += 1
            rwnd = x*mss

        connections = ceil( rwnd / (64*1024)  )
        return mss, rwnd, connections
    except:
        GLOBAL_LOGGER.error("RWND calculation error")
        raise
    return



'''
        Wraps the entire Baseline Bandwidth
        attainment process into one method
        @PARAMS:
            server_ip : IPv4 Address of the server
            cir       : user input CIR value
            rtt       : baseline RTT value
            mtu       : Maximum Transmission Unit
        @RETURN:
                      : the Baseline bandwidth,
                         Bandwidth Delay Product,
                         Receive window, MSS and
                         connections which are used
                         as parameters for the throughput
                         test.
'''
def bandwidth_measure(server_ip, cir, rtt, mtu):
    try:
        bb_result = int(cir)*(CIR_OVERSHOOT_MULTIPLIER)
        bdp_result = floor( ((bb_result*(10**6))/8) * (float(rtt)/(10**3)) )
        actual_cir = floor( ((int(cir)*(10**6))/8) * (float(rtt)/(10**3)) )
        mss ,rwnd, conn = find_throughput_params(bdp_result, int(mtu))
        _,actual_rwnd,_ = find_throughput_params(actual_cir, int(mtu))
        return bb_result, bdp_result, mss, rwnd, conn, actual_rwnd
    except:
        GLOBAL_LOGGER.error("baseline bandwidth failed")
        raise
    return

