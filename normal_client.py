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

        client                                                       server
                               < CONNECTION_ESTABLISHED >
                         ---- send arbitrary start message >>>>      <recv()>
        <recv()>               < SERVER_PROCESSING_TIME >          <start_udp_server>
        <recv()>               < SERVER_PROCESSING_TIME >         <start_iperf_server>
        <recv()>         <<<<  send servers are up signal  ----      <recv()>
        <mtu_test>             < CLIENT_PROCESSING_TIME >            <recv()>
        <rtt_test>             < CLIENT_PROCESSING_TIME >            <recv()>
        <BB_test>              < CLIENT_PROCESSING_TIME >            <recv()>
        <windows_scan>         < CLIENT_PROCESSING_TIME >            <recv()>
        <thpt_test>            < CLIENT_PROCESSING_TIME >            <recv()>
        <send()>         ----     send finish message      >>>>      <recv()>
        <analyzers>            < CLIENT_PROCESSING_TIME >         <kill_service_apps>
        <done>                    < OUTPUT_PRINTING >                <done>
                                < CONNECTION_TEARDOWN >
'''
async def normal_client(logger):
    results = {}
    ws_url = WEBSOCKET_URL
    client_ip = None
    mtu = None
    rtt = None
    bb = None
    rwnd = None
    logf = None
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
                rtt = rtt_process.measure_rtt(SERVER_IP)
                results["RTT"] = rtt
            except:
                traceback.print_exc(file=logf)

            try:
                bb, bdp, rwnd = baseline_bandwidth_process.bandwidth_measure(SERVER_IP, rtt)
                results["BB"]   = bb
                results["BDP"]  = bdp
                results["RWND"] = rwnd
            except:
                traceback.print_exc(file=logf)

            try:
                param_list = { "client_ip"   : client_ip,
                               "server_ip"   : SERVER_IP,
                               "rtt"         : rtt,
                               "recv_window" : rwnd       }
                window_size, average_tcp, ideal_tcp, neff_plot, nbuffer_plot \
                        = windows_scan.main_window_scan(**param_list)
                results["WND_SIZES"]     = window_size
                results["WND_AVG_TCP"]   = average_tcp
                results["WND_IDEAL_TCP"] = ideal_tcp
                results["EFF_PLOT"]      = neff_plot
                results["BUF_PLOT"]      = nbuffer_plot
            except:
                traceback.print_exc(file=logf)

            try:
                filename = "tempfiles/normal_mode/testresults.pcapng"
                throughput_average, throughput_ideal, transfer_time_average, \
                        transfer_time_ideal, tcp_ttr, speed_plot = \
                        throughput_test.measure_throughput(filename, SERVER_IP, rwnd, rtt)
                results["THPT_AVG"]       = throughput_average
                results["THPT_IDEAL"]     = throughput_ideal
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
                #results["NEFF_PLOT"]   = neff_plot
            except:
                traceback.print_exc(file=logf)

            try:
                filename = "tempfiles/normal_mode/testresults.pcapng"
                average_rtt, buffer_delay =\
                        analyzer_process.analyze_buffer_delay\
                        (filename, client_ip, SERVER_IP, rtt)
                results["AVE_RTT"]   = average_rtt
                results["BUF_DELAY"] = buffer_delay
                #results["NBUF_PLOT"] = nbuffer_plot
            except:
                traceback.print_exc(file=logf)

            #show all results
            logger.debug(str(results))
            await websocket.send("normal test done")
            await websocket.close()
            return results
    except:
        logger.error(("connection error"))
        pass


def start_normal_client():
    logger = getStreamLogger()
    try:
        client_utils.file_setter(LOGFILE)
        logger = getFileLogger(LOGFILE)
    except:
        pass

    ret_val = asyncio.get_event_loop().run_until_complete(normal_client(logger))
    return ret_val


if __name__ == "__main__":
    ret_val = start_normal_client()
    print(ret_val)
