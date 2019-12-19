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
        Starts a "plpmtu" subproc instance
        and returns the subproc object
        @PARAM
            server_ip      : IPv4 address of the server
                             this should contain a trailing
                             ":<port_number>"
            o_file         : output file
        @RETURN
            plpmtu_process : mtu measuring subprocess object
'''
def start_mtu_process(server_ip, o_file):
    try:
        plpmtu_process = subprocess.Popen(["sudo", "./plpmtu",
                                           "-p", "udp",
                                           "-s", server_ip
                                          ], stdout = o_file)
        GLOBAL_LOGGER.debug("PLPMTU PROCESS started")
    except:
        try:
            GLOBAL_LOGGER.error("FAILED TO START PLPMTU PROCESS")
            plpmtu_process.kill()
        except:
            pass
        raise
    return plpmtu_process

'''
        Waits for a plpmtu process to end
        and returns its parsed output
        @PARAMS:
            *mtu_proc    : mtu process object
            o_file      : the output file of the mtu process
        @RETURN:
            mtu_results : the mtu value
'''
def end_mtu_process(o_file):
    mtu_results = None
    try:
        mtu_results = client_utils.parse_mtu(o_file)
        GLOBAL_LOGGER.debug("mtu done : "+ mtu_results)
    except:
        GLOBAL_LOGGER.error("mtu parsing error")
        raise
    return mtu_results

'''
        Wraps the entire plpmtu attainment process
        into one method
'''
def mtu_process(server_ip, udp_port):
    try:
        fname = "tempfiles/normal_mode/mtu_temp_file"
        client_utils.file_setter(fname)
        output_file = open(fname,"r+")
        mtu_proc = start_mtu_process(server_ip+":"+udp_port, output_file)
        mtu_proc.wait()
        output_file.close()
        return end_mtu_process(fname)
    except:
        GLOBAL_LOGGER.error("plpmtu failed")
        raise
    return


if __name__ == "__main__":
    mtu_process(SERVER_IP, UDP_PORT)

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
