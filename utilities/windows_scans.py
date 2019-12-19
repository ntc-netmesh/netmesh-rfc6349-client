import os
import re
import client_utils

def scapy_tcp_efficiency(filename, client_ip):
    window_efficiency = []
    window_eff = None
    scapy_process = subprocess.Popen(["python3",
                                      "scapy-tcp-eff-simple.py",
                                      filename,
                                      client_ip
                                     ],stdout = subprocess.PIPE, stderr = subprocess.PIPE)
    scapy_process.wait()
    for line in scapy_process.stdout:
        temp = line.decode("utf-8")
        window_efficiency.append(temp)
        window_eff = temp
    #return window_efficiency
    return window_eff

def buffer_delay_simple(filename, client_ip, server_ip):
    window_rtt = []
    rtt_res = None
    buffer_delay_process = subprocess.Popen(["python3",
                                             "buffer-delay-simple.py",
                                             filename,
                                             client_ip,
                                             server_ip
                                            ],stdout = subprocess.PIPE, stderr = subprocess.PIPE)
    for line in buffer_delay_process.stdout:
        temp = line.decode("utf-8")
        window_rtt.append(temp)
        rtt_res = temp
    #return window_rtt
    return rtt_res

def iperf_parser(stdout, mtu_param, recv_window):
    average_tcp = []
    ideal_tcp = []
    average_thpt = None
    ideal_thput = None
    for line in stdout:
        temp = line.decode("utf-8")
        if "sender" in temp:
            entries = re.findall(r'\S+',temp)

            #check if test ran in 5s
            timecheck = float(re.split("-",entries[2])[1])
            if timecheck < 5:
                print("Windows scan Iperf TCP incomplete")
                return
            print("25%:" + entries[6] + "Mbits/s")
            average_thpt = entries[6]
            average_tcp.append(entries[6] + "Mbits/s")
            # mtu_param is results[1]
            ideal_thput = (recv_window * 8 / (float(re.split(" ", mtu_param)[2])/1000))/1000
            ideal_tcp.append(str("{0:.2f}".format(round(ideal_thput,2))) + "Mbits/s")
    #return average_tcp, ideal_tcp
    return average_thpt, ideal_thput

'''
        Starts a windows scan iperf3 client
        subproc instance and returns the subproc object
        @PARAMS:
            server_ip    : ipv4 address of the iperf3 server
            recv_window  : specified receive window size
                           of the iperf3 server.
'''
def start_window_throughput(server_ip, recv_window):
    thpt_process = None
    try:
        thpt_process = subprocess.Popen([ "iperf3",
                                          "--client", server_ip,
                                          "--time","5",
                                          "--window", str(recv_window)+"K",
                                          "--format","m",
                                          "--bandwidth","1000M"
                                         ], stdout = subprocess.PIPE)
        print("WINDOW SCAN THROUGHPUT CLIENT started")
    except:
        try:
            print("FAILED TO START WINDOW SCAN THROUGHPUT CLIENT")
            thpt_process.kill()
        except:
            pass
        raise
    return thpt_process

'''
        Waits for a windows scan throughput process
        to end and returns its parsed output
        @PARAMS:
            thpt_proc : throughput process object
'''
def end_window_throughput(thpt_proc, mtu, recv_window):
    average_thpt = None
    ideal_thpt = None
    try:
        thpt_proc.wait()
        average_thpt, ideal_thpt = iperf_parser(thpt_process.stdout, mtu, recv_window)
        print("thpt done")
    except:
        print("thpt parsing error")
        raise
    return average_thpt, ideal_thpt

'''
        Starts a "tshark" subproc instance
        and returns the subproc object
        @PARAMS:
            filename    : the filename of the pcapng outfile
'''
def start_window_shark(filename):
    tshark_process = None
    try:
        tshark_process = subprocess.Popen(["tshark",
                                           "-w", filename])
        print("WINDOW SCAN SHARK started")
    except:
        try:
            print("FAILED TO START WINDOW SCAN SHARK")
            tshark_process.kill()
        except:
            pass
        raise
    return tshark_process

'''
        Ends a shark process
        @PARAMS:
            shark_proc   : shark process object
'''
def end_window_shark(shark_proc):
    try:
        shark_proc.kill()
    except:
        raise
    return

def window_scan(filename, client_ip, server_ip, recv_window, mtu):
    average_thpt = None
    ideal_thpt = None
    window_efficiency = None
    window_rtt = None
    try:
        client_utils.file_setter(filename)
        tshark_proc = start_window_shark(filename)
        thpt_proc   = start_window_throughput(server_ip, recv_window)
        average_thpt, ideal_thpt = end_window_throughput(thpt_proc, mtu, recv_window)
        end_window_shark(tshark_proc)
        try:
            window_efficiency = scapy_tcp_efficiency(filename, client_ip)
            window_rtt = buffer_delay_simple(filename, client_ip, server_ip)
        except:
            print("error doing window_eff/window rtt")
            raise
    except:
        print("error doing window scan")
        raise
    return average_thpt, ideal_thpt, window_efficiency, window_rtt

def main_window_scan(**kwargs):
    average_tcp = []
    ideal_tcp = []
    neff_plot = []
    nbuffer_plot = []
    window_size = []
    try:
        kwargs["recv_window"] /= 1000.0
        for wnd_size_percent in range(1,5):
            x = wnd_size_percent
            kwargs["filename"] = "wnd_"+str(x)+"_percent.pcapng"
            kwargs["recv_window"] *= 0.25*x
            ave, ide, eff, buf = window_scan(**param_list)
            window_size.append(kwargs["recv_window"])
            average_tcp.append(ave)
            ideal_tcp.append(ide)
            neff_plot.append(eff)
            nbuffer_plot.append(buf)
        print("all windows scan test done")
    except:
        print("all windows scan test error")
        raise
    return window_size, average_tcp, ideal_tcp, neff_plot, nbuffer_plot

