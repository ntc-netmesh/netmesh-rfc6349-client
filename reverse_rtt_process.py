import asyncio
import websockets
import subprocess
import re
import sys
import json
import os, stat
import time
from utilities import client_utils
import windows_scan
from constants import *
import traceback
from datetime import datetime
import baseline_bandwidth_process
from log_settings import getStreamLogger, getFileLogger

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')
FALLBACK_LOGGER = getStreamLogger()

'''
        retrieves the RTT from the server-side handler
        using the udp-ping-client python script
        @PARAMS:
            SERVER_IP       :   server IPv4 address
            handler_port    :   port number of the application handling the
                                    rtt measurement process
            logger          :   logger object
        @RETURN:
            rtt             :   Baseline Round Trip Time in json string format
'''
async def rtt_process(SERVER_IP, handler_port, mss, logger=FALLBACK_LOGGER):
    rtt_process = None
    try:
        websocket_url = "ws://"+SERVER_IP+":"+str(handler_port)
        async with websockets.connect(websocket_url, ping_timeout=150) as websocket:
            await websocket.send(json.dumps({"MSS":str(mss)}))
            go_signal = await websocket.recv()
            subprocess.run(["gcc","-o","reverse_rtt_client","reverse_clienttcp.c"])
            rtt_process = subprocess.Popen(["./reverse_rtt_client",
                                            SERVER_IP,
                                            str(RTT_MEASURE_PORT),
                                            str(mss)
                                            ], stdout = subprocess.PIPE,
                                               stderr = subprocess.PIPE)
            rtt = await websocket.recv()
            try:
                rtt_process.kill()
            except:
                pass
            return rtt
    except:
        logger.error(("connection error"))
        rtt_process.kill()
        raise
    return

