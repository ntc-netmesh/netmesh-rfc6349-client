import subprocess
import asyncio
import traceback
import logging
from log_settings import getStreamLogger
from datetime import datetime
from netmesh_constants import *
from utilities import client_utils

GLOBAL_LOGGER = getStreamLogger()


'''
        Starts throughput measuring subproc instances
        one process for packet measuring (shark)
        one process for producing TCP traffic (iperf3)
        and returns both subproc objects

        @PARAMS:
            filename             : filename for network tracefile (pcapng)
            o_file               : output file for the process output
            server_ip            : IPv4 address of the server
            mss                  : maximum segment size
            connections          : number of parallel connections
            recv_window          : receiver window value

        @RETURNS:
            shark_proc           : shark process object
            throughput_proc      : throughput measurer process object
'''
def start_throughput_measure(filename, server_ip, recv_window, mss, connections, o_file):
    shark_proc = None
    throughput_proc = None
    try:
        client_utils.file_setter(filename)
        shark_proc = subprocess.Popen(["./segmentation_toggler.sh"],stdout = subprocess.PIPE)
        shark_proc = subprocess.Popen(["tshark", "-w", filename, "-a", "duration:30"],stdout = subprocess.PIPE)
        throughput_proc = subprocess.Popen(["iperf3",
                                            "--client", server_ip,
                                            "--time", "10",
                                            "--port", str(THPT_NORMAL_PORT),
                                            "--window", str(recv_window),
                                            "--parallel", str(connections),
                                            "--set-mss", str(mss),
                                            #"--window", "59K",
                                            #"--parallel", "10",
                                            #"--set-mss", "1460",
                                            "--format", "m",
                                            "--bandwidth", "100M"
                                            ], stdout = o_file, stderr = o_file)
        GLOBAL_LOGGER.debug("Throughput test started")
    except:
        GLOBAL_LOGGER.error("FAILED TO START THROUGHPUT TEST")
        try:
            shark_proc.kill()
            throughput_proc.kill()
        except:
            pass
        raise
    return shark_proc, throughput_proc


'''
    Parses the output of the throughput test from a file
        @PARAMS:
            rtt                    : RTT value used for result computation
            recv_window            : Receiver window value
            o_file                 : filename containing the output of 
                                        throughput_proc
            actual_rwnd            : the unmultiplied receive window
                                        calculations

        @RETURNS:
            speed_plot             : a list of plot points for plotting
                                        throughput test results
            throughput_average     : average throughput measured
            throughput_ideal       : calculated ideal throughput
            transfer_time_average  : average transfer time measured
            transfer_time_ideal    : calculated ideal transfer time
            tcp_ttr                : ratio between actual and ideal transfer time
'''
def end_throughput_measure(rtt, recv_window, o_file, actual_rwnd):
    speed_plot = None
    throughput_average = None
    throughput_ideal = None
    transfer_time_average = None
    transfer_time_ideal = None
    tcp_ttr = None
    actual_ideal = None
    try:
        actual_ideal = (actual_rwnd * 8 / (float(rtt)/1000))/(10**6)
        throughput_average, throughput_ideal, transfer_time_average, \
                transfer_time_ideal, tcp_ttr, speed_plot = \
                client_utils.parse_shark(o_file, recv_window, rtt, "sender")
        GLOBAL_LOGGER.debug("throughput test done")
    except:
        GLOBAL_LOGGER.error("throughput parsing error")
        raise
    return throughput_average, throughput_ideal, transfer_time_average, \
            transfer_time_ideal, tcp_ttr, speed_plot, actual_ideal

'''
        Wraps the entire throughput
        attainment process into one method
        @PARAMS:
            filename            : RTT value used for result computation
            server_ip           : IPv4 address of the server
            recv_wnd            : Receiver window value
            rtt                 : baseline round trip time value 
            mss                  : maximum segment size
            connections          : number of parallel connections
        @RETURNS:
                                : output metrics of the TCP throughput process
'''
def measure_throughput(filename, server_ip, recv_wnd, rtt, mss, connections, actual_rwnd):
    try:
        fname = "tempfiles/normal_mode/thpt_temp_file"
        client_utils.file_setter(fname)
        output_file = open(fname,"w+")
        shark_proc, thpt_proc = \
                start_throughput_measure(filename, server_ip, recv_wnd, mss, connections, output_file)
        thpt_proc.wait()
        shark_proc.kill()
        return end_throughput_measure(rtt, recv_wnd, fname, actual_rwnd)
    except:
        GLOBAL_LOGGER.error("throughput test failed")
        raise
    return
