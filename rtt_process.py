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
            client_ip   : the ipv4 address of the client
            mtu         : Maximum transmission unit
            o_file      : output file for the RTT value
            o_file      : output pcap file for the RTT value
        @RETURN:
            rtt_process : the rtt subprocess object
'''
def start_baseline_measure(server_ip, client_ip, mtu, o_file, pcap_name):
    rtt_process = None
    try:
        rtt_process = subprocess.Popen(["./rtt_executor.sh",
                                         server_ip,
                                         client_ip,
                                         str(RTT_MEASURE_PORT), 
                                         str(int(mtu)-40), # MSS is MTU - 40
                                         o_file, 
                                         pcap_name
                                        ], stdout = subprocess.PIPE)
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
            client_ip         : IPv4 address of the client 
            mtu               : Maximum Transmission Unit
        @RETURN:
            rtt               : the baseline RTT value
'''
def measure_rtt(server_ip, client_ip, mtu):
    try:
        pcap_name = "tempfiles/normal_mode/rtt_pcap.pcapng"
        fname     = "tempfiles/normal_mode/rtt_temp_file"
        client_utils.file_setter(fname)
        open(fname,"w+").close()
        rtt_proc = start_baseline_measure(server_ip, client_ip, mtu, fname, pcap_name)
        rtt_proc.wait()
        rtt = end_baseline_measure(fname)
        return rtt
    except:
        GLOBAL_LOGGER.error("RTT failed")
        raise
    return

