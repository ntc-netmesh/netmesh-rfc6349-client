import asyncio
import websockets
import subprocess
import re
import sys
import json
import os, stat
from utilities import client_utils
from netmesh_config import *
import traceback
from datetime import datetime
import baseline_bandwidth_process
from log_settings import getStreamLogger, getFileLogger

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')
FALLBACK_LOGGER = getStreamLogger()

'''
        retrieves the throughput metrics from
        the server-side handler using iperf3
        @PARAMS:
            tempfile        :   file dump for the Iperf3 client process
            SERVER_IP       :   server IPv4 address
            handler_port    :   port number of the Application handling the
                                    throughput measurement process
            throughput_port :   port number of the Application that performs the
                                    actual throughput measurement process
            recv_window     :   receiver window size
            rtt             :   baseline round trip time value
            logger          :   logger object
        @RETURN:
            thpt_results    :   throughput process metrics in json string format
'''
async def throughput_process(tempfile, SERVER_IP, handler_port, throughput_port, recv_window, mtu, rtt, connections, mss, logger=FALLBACK_LOGGER):
    thpt_process = None
    try:
        client_params = {"MTU":mtu, "RTT":rtt, "SERVER_IP":SERVER_IP}
        websocket_url = "ws://"+SERVER_IP+":"+str(handler_port)
        #async with websockets.connect(websocket_url) as websocket:
        async with websockets.connect(websocket_url, ping_timeout=100) as websocket:
            o_file = open(tempfile, "w+")
            await websocket.send(json.dumps(client_params))
            go_signal = await websocket.recv()
            thpt_process = subprocess.Popen(["iperf3",
                                           "--client", SERVER_IP, 
                                           "--time", "10",
                                           "--port", str(throughput_port),
                                           "--window", str(recv_window),
                                           "--parallel", str(connections),
                                           "--set-mss", str(mss),
                                           "--reverse",
                                           "--bandwidth", "100M",
                                           "--format", "m"
                                           ], stdout = o_file, stderr = o_file) 
            thpt_process.wait()
            await websocket.send("stop")
            #thpt_results = await websocket.recv()
            thpt_results = await asyncio.wait_for(websocket.recv(), timeout=300)
            logger.debug(str(thpt_results))
            thpt_results = json.loads(thpt_results)
            o_file.close()
            # parse file
            ave_tcp, ide_tcp, ave_tt, ide_tt, tcp_ttr, _ =\
                    client_utils.parse_shark(tempfile, float(recv_window), float(rtt), "receiver")
            thpt_results["THPT_AVG"]       = ave_tcp
            thpt_results["THPT_IDEAL"]     = ide_tcp
            thpt_results["TRANSFER_AVG"]   = ave_tt
            thpt_results["TRANSFER_IDEAL"] = ide_tt
            thpt_results["TCP_TTR"]        = tcp_ttr
            try:
                thpt_process.kill()
            except:
                pass
            return thpt_results
    except:
        try:
            logger.error(("connection error"))
            thpt_process.kill()
        except:
            pass
        raise
    return

