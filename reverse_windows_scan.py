import asyncio
import websockets
import subprocess
import re
import sys
import json
import os, stat
from utilities import client_utils
from constants import *
import traceback
from datetime import datetime
import baseline_bandwidth_process
from log_settings import getStreamLogger, getFileLogger
import reverse_throughput_process

LOGFILE = datetime.today().strftime('logfiles/%Y-%m-%d-%H-%M-%S.log')
FALLBACK_LOGGER = getStreamLogger()

'''
    performs the window scan process by invoking the throghput measurement
    proces 4 times with varying receiver window sizes with a multiplier of
    0.25, 0.5, 0.75 and 1 respectively.
        @PARAMS: (keyword arguments)
            SERVER_IP       :   server IPv4 address
            handler_port    :   port number of the application handling the
                                    throughput measurement process
            throughput_port :   port number of the application that performs the
                                    actual throughput measurement process
            recv_window     :   receiver window size
            rtt             :   baseline round trip time value
            logger          :   logger object
        @RETURN:
                            :   list of return values from the throughput
                                    process handler
'''
async def scan_process(**kwargs):
    scan_results = {"WND_SIZES":[], "WND_AVG_TCP":[], "WND_IDEAL_TCP":[], "WND_TCP_EFF":[], "WND_BUF_DEL":[]}
    thpt_process = None
    try:
        for x in range(1,5):
            tempfile = "tempfiles/reverse_mode/"+str(x*0.25)+"_thpt"
            rwnd = kwargs["recv_window"]*x*0.25
            modified_kwargs = {**kwargs}
            modified_kwargs["recv_window"] = rwnd
            modified_kwargs["tempfile"] = tempfile
            thpt_results = await reverse_throughput_process.throughput_process(**modified_kwargs)
            if x < 4:
                scan_results["WND_SIZES"].append(rwnd)
                scan_results["WND_AVG_TCP"].append(thpt_results["THPT_AVG"])
                scan_results["WND_IDEAL_TCP"].append(thpt_results["THPT_IDEAL"])
                scan_results["WND_TCP_EFF"].append(thpt_results["TCP_EFF"])
                scan_results["WND_BUF_DEL"].append(thpt_results["BUF_DELAY"])
            else:
                scan_results = {**scan_results, **thpt_results}
        return scan_results
    except:
        #kwargs["logger"].logger.error(("connection error"))
        #thpt_process.kill()
        raise
        #pass
    #return scan_results
    return

