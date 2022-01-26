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
from log_settings import getStreamLogger, getFileLogger

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')
FALLBACK_LOGGER = getStreamLogger()

'''
        retrieves the MTU from the server-side handler
        using the ./plpmtu-reverse C binary
        @PARAMS:
            SERVER_IP       :   server IPv4 address
            handler_port    :   port number of the Application handling the
                                    mtu measurement process
            udp_port        :   port number of the Application that performs the
                                    actual mtu process
            logger          :   logger object
        @RETURN:
            mtu             :   Maximum transmission unit in json string format
'''
async def mtu_process(SERVER_IP, handler_port, udp_port, logger=FALLBACK_LOGGER):
    plpmtu_process = None
    try:
        websocket_url = "ws://"+SERVER_IP+":"+str(handler_port)
        async with websockets.connect(websocket_url) as websocket:
            await websocket.send("start")
            go_signal = await websocket.recv()
            fname = "tempfiles/reverse_mode/mtu_temp_file"
            tempfile = open(fname,"w+")
            plpmtu_process = subprocess.Popen(["sudo",
                                               "./plpmtu-reverse",
                                               "-p", "udp",
                                               "-s", SERVER_IP+":"+udp_port
                                              ], stdout = tempfile)
            mtu = await websocket.recv()
            try:
                plpmtu_process.kill()
            except:
                pass
            return mtu
    except:
        logger.error(("connection error"))
        plpmtu_process.kill()
        raise
    return

