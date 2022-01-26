import subprocess
import asyncio
import traceback
import logging
from log_settings import getStreamLogger
from datetime import datetime
from netmesh_config import *
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
    Parses the output file of the mtu subprocess and returns the MTU value
        @PARAMS:
            o_file      : the output filenem of the mtu process
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
        @PARAMS:
            server_ip      : the IPv4 address of the server
            udp_port       : port number of the hosted Application for
                                retrieving the MTU
        @RETURNS:
            mtu            : the Maximum Transmission Unit value of the
                                connection from client to server

'''
def mtu_process(server_ip, udp_port):
    try:
        fname = "tempfiles/normal_mode/mtu_temp_file"
        client_utils.file_setter(fname)
        output_file = open(fname,"r+")
        mtu_proc = start_mtu_process(server_ip+":"+udp_port, output_file)
        mtu_proc.wait()
        output_file.close()
        mtu = end_mtu_process(fname)
        return mtu
    except:
        GLOBAL_LOGGER.error("plpmtu failed")
        raise
    return


if __name__ == "__main__":
    mtu_process(DEFAULT_SERVER, UDP_PORT)

