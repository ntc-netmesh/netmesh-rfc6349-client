import subprocess
import asyncio
import traceback
import logging
from log_settings import getStreamLogger
from datetime import datetime
from constants import *
from utilities import client_utils

GLOBAL_LOGGER = getStreamLogger()

'''
        Starts a "iperf3 -c" subproc instance
        and returns the subproc object
        @PARAMS
            server_ip   : IPv4 address of the server
            o_file      : output file of the bb process
'''
def start_bandwidth_measure(server_ip, o_file):
    bb_process = None
    try:
        bb_process = subprocess.Popen(["iperf3",
                                          "--client", server_ip,
                                          "--udp",
                                          "--time", "10",
                                          "--format", "m",
                                          "--bandwidth", "1000M"
                                         ], stdout = o_file)
        GLOBAL_LOGGER.debug("BB started")
    except:
        GLOBAL_LOGGER.error("FAILED TO START BB")
        try:
            bb_process.kill()
        except:
            pass
        raise
    return bb_process

'''
        Waits for the passed process
        to end and returns its parsed output
        @PARAMS:
            *bb_proc      : the process object
            baseline_rtt : baseline rtt value
            o_file       : output file of bb_proc
        @RETURN:
            bb_result    : the baseline bandwidth value
            bdp_result   : bandwidth delay product
            rwnd         : receiver window size
'''
def end_bandwidth_measure(baseline_rtt, o_file):
    rwnd = None
    bb_result = None
    bdp_result = None
    try:
        bb_result, bdp_result, rwnd = client_utils.parse_iperf3(o_file, baseline_rtt)
        GLOBAL_LOGGER.debug("bb done")
    except:
        GLOBAL_LOGGER.error("bb parsing error")
        raise
    return bb_result, bdp_result, rwnd

'''
        Wraps the entire Baseline Bandwidth
        attainment process into one method
'''
def bandwidth_measure(server_ip, rtt):
    try:
        fname = "tempfiles/normal_mode/bb_temp_file"
        client_utils.file_setter(fname)
        output_file = open(fname,"r+")
        bb_proc = start_bandwidth_measure(server_ip, output_file)
        bb_proc.wait()
        output_file.close()
        return end_bandwidth_measure(rtt, fname)
    except:
        GLOBAL_LOGGER.error("baseline bandwidth failed")
        raise
    return

#async def mtu_reverse_test():
#    try:
#        mtu_reverse_proc = mtu_procs.start_mtu_reverse()
#        await websocket.send("plpmtu started")
#        mtu_result = mtu_procs.end_mtu_reverse(mtu_reverse_proc)
#    except:
#        GLOBAL_LOGGER.("plpmtu failed")
#        await websocket.send("mtu error")
#        traceback.print_exc()
#
#
