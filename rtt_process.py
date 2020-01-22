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
        Starts the process for measuring
        baseline rtt, and returns the
        subprocess object
        @PARAMS:
            server_ip   : the ipv4 address of the server
                          whose RTT would be measured from
            o_file      : output file for the RTT value
        @RETURN:
            rtt_process : the rtt subprocess object
'''
def start_baseline_measure(server_ip, o_file):
    rtt_process = None
    try:
        rtt_process = subprocess.Popen(["ping",
                                         server_ip,
                                         "-c","10" # packet count
                                        ], stdout = o_file)
        GLOBAL_LOGGER.debug("BASELINE RTT started")
    except:
        GLOBAL_LOGGER.error("FAILED TO START BASELINE RTT")
        try:
            rtt_process.kill()
        except:
            pass
        raise
    return rtt_process

'''
    Parses output from the output file of the RTT subprocess
        @PARAMS:
            o_file            : output filename of the RTT subprocess
        @RETURN:
            rtt_results       : the baseline RTT value
'''
def end_baseline_measure(o_file):
    rtt_results = None
    try:
        rtt_results = client_utils.parse_ping(o_file)
        GLOBAL_LOGGER.debug("rtt done")
    except:
        GLOBAL_LOGGER.error("rtt parsing error")
        raise
    return rtt_results

'''
        Wraps the entire rtt attainment process
        into one method
        @PARAMS:
            server_ip         : IPv4 address of the server 
        @RETURN:
            rtt               : the baseline RTT value
'''
def measure_rtt(server_ip):
    try:
        fname = "tempfiles/normal_mode/rtt_temp_file"
        client_utils.file_setter(fname)
        output_file = open(fname,"r+")
        rtt_proc = start_baseline_measure(server_ip, output_file)
        rtt_proc.wait()
        output_file.close()
        rtt = end_baseline_measure(fname)
        return rtt
    except:
        GLOBAL_LOGGER.error("RTT failed")
        raise
    return

