import asyncio
import websockets
import subprocess
import re
import sys
import json
import os, stat
from utilities import client_utils
from netmesh_constants import *
import traceback
from datetime import datetime
import baseline_bandwidth_process
from log_settings import getStreamLogger, getFileLogger
import reverse_mtu_process
import reverse_rtt_process
import reverse_windows_scan

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')
FALLBACK_LOGGER = getStreamLogger()

'''
    REMOTE TO LOCAL PROTOCOL HANDLER
    serial steps are as follows (client side view):

        client                                                       server
                               < CONNECTION_ESTABLISHED >
                         ---- send arbitrary start message >>>>      <recv()>
        <recv()>         <<<<  send servers are up signal  ----      <send()>
        <mtu_test>             < CLIENT_PROCESSING_TIME >            <recv()>
        <rtt_test>             < CLIENT_PROCESSING_TIME >            <recv()>
        <BB_test>              < CLIENT_PROCESSING_TIME >            <recv()>
        <windows_scan>         < CLIENT_PROCESSING_TIME >            <recv()>
        <thpt_test>            < CLIENT_PROCESSING_TIME >            <recv()>
        <send()>         ----     send finish message      >>>>      <recv()>
        <analyzers>            < CLIENT_PROCESSING_TIME >            <done>
        <done>                    < OUTPUT_PRINTING >                <done>
                                < CONNECTION_TEARDOWN >
'''
async def reverse_client(logger, SERVER_IP, cir):
    results = {}
    ws_url = "ws://"+SERVER_IP+":3001"
    client_ip = None
    mtu = None
    rtt = None
    bb = None
    rwnd = None
    logf = None
    progress_count = 4
    print("starting reverse client")
    try:
        #eel.printprogress("Initializing...")

        logf = open(LOGFILE,"w+")
        client_ip = client_utils.get_client_ip()
    except:
        try:
            logger.error("cant get client ip")
            traceback.print_exc(file=logf)
        except:
            pass
        return

    try:
        mtu_return = await reverse_mtu_process.mtu_process(SERVER_IP, MTU_HANDLER_PORT, UDP_PORT, logger)
        results = {**results, **json.loads(mtu_return)}
    except:
        logger.error("mtu error")
        try:
            traceback.print_exc(file=logf)
        except:
            pass
    #results["MTU"] = '1500'

    try:
        mss = int(results["MTU"]) - 40
        rtt_return = await reverse_rtt_process.rtt_process(SERVER_IP, RTT_HANDLER_PORT, str(mss), logger)
        results = {**results, **json.loads(rtt_return)}
    except:
        logger.error("rtt error")
        try:
            traceback.print_exc(file=logf)
        except:
            pass

    try:
        mtu = results["MTU"]
        rtt = results["RTT"]
        bb, bdp, mss, rwnd, conn, actual_rwnd = \
                baseline_bandwidth_process.bandwidth_measure(SERVER_IP, cir, rtt, mtu)
        results["BB"]                    = bb
        results["BDP"]                   = bdp
        results["MSS"]                   = mss
        results["RWND"]                  = rwnd
        results["PARALLEL_CONNECTIONS"]  = str(int(conn)+1)
        results["ACTUAL_RWND"]           = actual_rwnd
    except:
        logger.error("bb error")
        try:
            traceback.print_exc(file=logf)
        except:
            pass

    try:
        kwargs = {
                "SERVER_IP"      :SERVER_IP,
                "handler_port"   :THROUGHPUT_HANDLER_PORT,
                "throughput_port":THROUGHPUT_SERVICE_PORT,
                "recv_window"    :results["RWND"],
                "mtu"            :results["MTU"],
                "rtt"            :results["RTT"],
                "connections"    :results["PARALLEL_CONNECTIONS"],
                "mss"            :results["MSS"],
                "logger"         :logger
                }
        scan_return = await reverse_windows_scan.scan_process(**kwargs)
        results = {**results, **scan_return}
    except:
        try:
            logger.error("thpt error")
            traceback.print_exc(file=logf)
        except:
            pass

    return results

'''
    start_reverse_test is a wrapper for retrieving the reverse_mode 
    protocol into a coroutine object and return it
    @PARAMS:
        server_url  :   the IPv4 address of the server hosting the
                        normal_mode's server side protocol
    @RETURN:
        ret_val     :   an async task object that is meant to be awaited
'''
def start_reverse_test(server_ip=DEFAULT_SERVER, cir=10):
    logger = getStreamLogger()
    try:
        client_utils.file_setter(LOGFILE)
        logger = getFileLogger(LOGFILE)
    except:
        pass

    ret_val = asyncio.get_event_loop().create_task(reverse_client(logger, server_ip, cir))
    return ret_val

if __name__ == "__main__":
    ret_val = start_reverse_test(DEFAULT_SERVER)
    print(ret_val)
