import asyncio
import websockets
import subprocess
import re
import sys
import os, stat
from utilities import client_utils
import windows_scan
from constants import *
import traceback
from datetime import datetime
from log_settings import getStreamLogger, getFileLogger
import mtu_process, rtt_process, baseline_bandwidth_process, \
        windows_scan, throughput_test, analyzer_process

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')

'''
    LOCAL TO REMOTE PROTOCOL HANDLER
    serial steps are as follows (client side view):

        client                                                                   server
                                         < CONNECTION_ESTABLISHED >
                                   ---- send arbitrary start message >>>>        <recv()>
        <recv()>                         < SERVER_PROCESSING_TIME >            <start_udp_server>
        <recv()>                         < SERVER_PROCESSING_TIME >           <start_iperf_server>
        <recv()>                   <<<<  send servers are up signal  ----        <recv()>
        <mtu_test>                       < CLIENT_PROCESSING_TIME >              <recv()>
        <rtt_test>                       < CLIENT_PROCESSING_TIME >              <recv()>
        <BB_test>                        < CLIENT_PROCESSING_TIME >              <recv()>
        <windows_scan>                   < CLIENT_PROCESSING_TIME >              <recv()>
        <thpt_test>                      < CLIENT_PROCESSING_TIME >              <recv()>
        <send()>                   ----     send finish message      >>>>        <recv()>
        <efficiency_analyzer>            < CLIENT_PROCESSING_TIME >              <done>
        <buffer_delay_analyzer>          < CLIENT_PROCESSING_TIME >              <done>
        <done>                              < OUTPUT_PRINTING >                  <done>
                                           < CONNECTION_TEARDOWN >
'''
async def normal_client(logger, SERVER_IP):
    results = {}
    ws_url = "ws://"+SERVER_IP+":3001"
    client_ip = None
    mtu = None
    rtt = None
    bb = None
    rwnd = None
    logf = None
    mss = None
    conn = None
    actual_rwnd = None
    try:
        logf = open(LOGFILE,"w+")
        client_ip = client_utils.get_client_ip()
    except:
        logger.error("cant get client ip")
        traceback.print_exc(file=logf)
        return

    try:
        async with websockets.connect(ws_url) as websocket:

            await websocket.send("normal test start")
            state = await websocket.recv()

            try:
                mtu = mtu_process.mtu_process(SERVER_IP, UDP_PORT)
                results["MTU"] = mtu
            except:
                traceback.print_exc(file=logf)

            try:
                rtt = rtt_process.measure_rtt(SERVER_IP, client_ip, mtu)
                results["RTT"] = rtt
            except:
                traceback.print_exc(file=logf)

            try:
                bb, bdp, mss, rwnd, conn, actual_rwnd = baseline_bandwidth_process.bandwidth_measure(SERVER_IP, 10, rtt, mtu)
                results["BB"]                    = bb
                results["BDP"]                   = bdp
                results["MSS"]                   = mss
                results["RWND"]                  = rwnd
                results["PARALLEL_CONNECTIONS"]  = conn
                results["ACTUAL_RWND"]           = actual_rwnd
            except:
                traceback.print_exc(file=logf)

            try:
                param_list = { "client_ip"   : client_ip,
                               "server_ip"   : SERVER_IP,
                               "rtt"         : rtt,
                               "mss"         : mss,
                               "connections" : conn,
                               "actual_rwnd" : actual_rwnd,
                               "recv_window" : rwnd       }
                window_size, average_tcp, ideal_tcp, neff_plot, nbuffer_plot, actual_ideal \
                        = windows_scan.main_window_scan(**param_list)
                results["WND_SIZES"]     = window_size
                results["WND_AVG_TCP"]   = average_tcp
                results["WND_IDEAL_TCP"] = ideal_tcp
                results["EFF_PLOT"]      = neff_plot
                results["BUF_PLOT"]      = nbuffer_plot
                results["ACTUAL_IDEAL"]  = actual_ideal
            except:
                traceback.print_exc(file=logf)

            try:
                filename = "tempfiles/normal_mode/testresults.pcapng"
                throughput_average, throughput_ideal, transfer_time_average, \
                        transfer_time_ideal, tcp_ttr, speed_plot, actual_ideal = \
                        throughput_test.measure_throughput(filename, SERVER_IP, rwnd, rtt, mss, conn, actual_rwnd)
                results["THPT_AVG"]       = throughput_average
                results["THPT_IDEAL"]     = throughput_ideal
                results["ACTUAL_IDEAL"]   = actual_ideal
                results["TRANSFER_AVG"]   = transfer_time_average
                results["TRANSFER_IDEAL"] = transfer_time_ideal
                results["TCP_TTR"]        = tcp_ttr
                results["SPEED_PLOT"]     = speed_plot
            except:
                traceback.print_exc(file=logf)

            try:
                filename = "tempfiles/normal_mode/testresults.pcapng"
                transmitted_bytes, retransmitted_bytes, tcp_efficiency = \
                        analyzer_process.analyze_efficiency(filename, client_ip)
                results["TRANS_BYTES"] = transmitted_bytes
                results["RETX_BYTES"]  = retransmitted_bytes
                results["TCP_EFF"]     = tcp_efficiency
            except:
                traceback.print_exc(file=logf)

            try:
                filename = "tempfiles/normal_mode/testresults.pcapng"
                average_rtt, buffer_delay =\
                        analyzer_process.analyze_buffer_delay\
                        (filename, client_ip, SERVER_IP, rtt)
                results["AVE_RTT"]   = average_rtt
                results["BUF_DELAY"] = buffer_delay
            except:
                traceback.print_exc(file=logf)

            #show all results
            logger.debug(str(results))
            await websocket.send("normal test done")
            await websocket.close()
            return results
    except:
        logger.error("connection error")
        pass


'''
    start_normal_client is a wrapper for retrieving the normal_mode 
    protocol into a coroutine object and return it
    @PARAMS:
        server_url  :   the IPv4 address of the server hosting the
                        normal_mode's server side protocol
    @RETURN:
        ret_val     :   an async task object that is meant to be awaited
'''
def start_normal_client(server_url=DEFAULT_SERVER):
    logger = getStreamLogger()
    try:
        client_utils.file_setter(LOGFILE)
        logger = getFileLogger(LOGFILE)
    except:
        pass

    ret_val = asyncio.get_event_loop().create_task(normal_client(logger, server_url))
    return ret_val


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    group = asyncio.gather(start_normal_client())
    all_groups = asyncio.gather(group)
    results = loop.run_until_complete(all_groups)
    loop.close()
    print(results)
