import re
import subprocess

'''
    Retrieves the current IPv4 address of the client
    @RETURN:
        client_ip   :   IPv4 address of the client
'''
def get_client_ip():
    client_ip = ""
    print("getting Client ip")
    p = subprocess.Popen(["hostname", "-I"], stdout = subprocess.PIPE)
    for line in p.stdout:
        client_ip = re.split(" ", line.decode("utf-8"))[0]
        break
    print("Client IP is : {}".format(client_ip))
    return client_ip


'''
   Sets up a file with name : filename
   @PARAMS:
        filename    :   filename
'''
def file_setter(filename):
    subprocess.call(['sudo', 'rm', filename])
    subprocess.call(['touch', filename])
    subprocess.call(['chmod', '666', filename])

'''
   Parses the MTU out of an mtu process output file
   @PARAMS:
        stdout_data     :    filename of the output file

   @RETURN:
        mtu             :    maximum transmission unit
'''
def parse_mtu(stdout_data):
    mtu = None
    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            if "PLPMTUD" in temp:
                mtu = re.split(" ", temp)[3]
    return mtu

'''
   Parses the RTT out of an rtt process output file
   @PARAMS:
        stdout_data     :    filename of the output file

   @RETURN:
        rtt             :    baseline round trip time
'''
def parse_ping(stdout_data):
    ave_rtt = None
    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            if "avg" in temp:
                rtt = re.split(" ", temp)[3]
                ave_rtt = re.split("/", rtt)[2]
    return ave_rtt

'''
   Parses the throughput metrics out of throughput process output file
   @PARAMS:
        stdout_data     :    filename of the output file
        rtt             :    Round Trip Time

   @RETURN:
        bb              :    baseline bandwidth
        bdp             :    bandwidth delay product
        rwnd            :    receive window size
'''
def parse_iperf3(stdout_data, rtt):
    return_results = []
    break_flag = False
    bb = None
    bdp = None
    rwnd = None
    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            if "Jitter" in temp:
                break_flag = True
                continue
            if break_flag:
                entries = re.findall(r'\S+',temp)
                timecheck = float(re.split("-",entries[2])[1])
                if timecheck < 10:
                    print("iPerf UDP incomplete")
                    break
                bb = entries[6]
                bdp = (float(rtt) /1000) * (float(bb)* 1000000)
                rwnd = bdp/8 / 1000
                break
    return bb, bdp, rwnd

'''
   Parses the throughput metrics out of a throughput process output file
   @PARAMS:
        stdout_data     :    filename of the output file
        recv_window     :    receiver window value
        rtt             :    Round Trip Time value

   @RETURN:
        ave_tcp         :    average TCP throughput
        ide_tcp         :    ideal TCP throughput
        ave_tt          :    average transfer time
        ide_tt          :    ideal transfer time
        tcp_ttr         :    transfer time ratio between
                                average and ideal
        speed_plot      :    N/A
'''
def parse_shark(stdout_data, recv_window, rtt):
    # param = results[0], mtu_param = results[1]
    speed_plot = []
    ave_tcp = None
    ave_tt = None
    ide_tcp = None
    ide_tt = None
    tcp_ttr = None

    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            if "sender" in temp:
                entries = re.findall(r'\S+',temp)
                #check if test ran in 5s
                timecheck = float(re.split("-",entries[2])[1])
                if timecheck < 5:
                    print("iPerf TCP incomplete")
                    return
                ave_tcp = float(entries[6])
                ideal_throughput = (recv_window * 8 / (float(rtt)/1000))/1000
                ide_tcp = ideal_throughput
                #max_throughput = (mtu-40) * 8 * 81274 /1000000 #1500 MTU 8127 FPS based on connection type
                temp2 = re.split("-",entries[2])
                actual = float(temp2[1])
                ave_tt = actual
                ideal = float(entries[4]) * 8 / ideal_throughput
                ide_tt = ideal
                ttr = actual / ideal
                tcp_ttr = ttr

            elif "KBytes" in temp:
                entries = re.findall(r'\S+',temp)
                x_axis = re.split("-",entries[2])
                x_axis = int(float(x_axis[1]))
                speed_plot.append([x_axis,float(entries[6])])
    return ave_tcp, ide_tcp, ave_tt, ide_tt, tcp_ttr, speed_plot

#def efficiency_process(filename, client_ip):
#    scapy_process = subprocess.Popen(["python3",
#                          "scapy-tcp-eff-expt2.py",
#                          filename,
#                          client_ip],
#                         stdout = subprocess.PIPE, stderr = subprocess.PIPE)
#    neff_plot = []
#    results = []
#    scapy_process.wait()
#    for line in scapy_process.stdout:
#        temp = line.decode("utf-8")
#
#        if "plot" in temp:
#            temp = re.split(":", temp)[1]
#            temp = temp[1:-2]
#
#            for i in re.split("], ", temp):
#                temp_list = re.split(", ", i[1:-1])
#                temp_list[0] = int(temp_list[0])
#                temp_list[1] = float(temp_list[1])
#
#                neff_plot.append(temp_list)
#        else:
#            results.append(temp)
#    trans_bytes = results[0]
#    retrans_bytes = results[1]
#    eff = results[2]
#    return trans_bytes, retrans_bytes, eff, neff_plot
#
#def buffer_delay_process(filename, client_ip, server_ip, mtu):
#    ave_rtt = None
#    buffer_delay = None
#    buffer_delay_process = subprocess.Popen(["python3",
#                                             "buffer-delay.py",
#                                             filename,
#                                             client_ip,
#                                             server_ip,
#                                             #re.split(" ", mtu_param)[2]],
#                                             str(mtu)], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
#    results = []
#    nbuffer_plot = []
#    for line in buffer_delay_process.stdout:
#        temp = line.decode("utf-8")
#        if "plot" in temp:
#            temp = re.split(":", temp)[1]
#            temp = temp[1:-2]
#            print(temp)
#
#            for i in re.split("], ", temp):
#                temp_list = re.split(", ", i[1:-1])
#                temp_list[0] = int(temp_list[0])
#                temp_list[1] = float(temp_list[1])
#
#                nbuffer_plot.append(temp_list)
#        else:
#            results.append(temp)
#    ave_rtt = results[0]
#    buffer_delay = results[1]
#    #return results, nbuffer_plot
#    return ave_rtt, buffer_delay, nbuffer_plot


# REVERSE TEST UTILS

#def list_speed_plot(speed_plot):
#    speed_plot_list = []
#    for i in re.split("], ", speed_plot):
#        temp_list = re.split(", ", i[1:-1])
#        temp_list[0] = int(temp_list[0])
#        temp_list[1] = float(temp_list[1])
#        speed_plot_list.append(temp_list)
#    return speed_plot_list
