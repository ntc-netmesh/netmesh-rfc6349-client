import re
import subprocess

def get_client_ip():
    client_ip = ""
    p = subprocess.Popen(["hostname", "-I"], stdout = subprocess.PIPE)
    for line in p.stdout:
        client_ip = re.split(" ", line.decode("utf-8"))[0]
        break
    return client_ip

def file_setter(filename):
    subprocess.call(['sudo', 'rm', filename])
    subprocess.call(['touch', filename])
    subprocess.call(['chmod', '+rw', filename])

def parse_mtu(stdout_data):
    return_results = []
    mtu = None
    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            #temp = line.decode("utf-8")

            if "PLPMTUD" in temp:
                mtu = re.split(" ", temp)[3]
                return_results.append("Path MTU: " + mtu)
    #return return_results
    return mtu

def parse_ping(stdout_data):
    return_results = []
    ave_rtt = None
    with open(stdout_data,"r") as f:
        for line in f:
            #temp = line.decode("utf-8")
            temp = line
            if "avg" in temp:
                rtt = re.split(" ", temp)[3]
                ave_rtt = re.split("/", rtt)[2]
                return_results.append("Baseline RTT: " + ave_rtt + " ms")
    #return return_results
    return ave_rtt

def parse_iperf3(stdout_data, rtt):
    return_results = []
    break_flag = False
    bb = None
    bdp = None
    rwnd = None
    with open(stdout_data,"r") as f:
        for line in f:
            #temp = line.decode("utf-8")
            temp = line
            print(temp)
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
                return_results.append("Bottleneck Bandwidth: " + bb + " Mbits/sec")
                #bdp = (float(re.split(" ", bdp_param)[2]) /1000) * (float(bb)* 1000000)
                bdp = (float(rtt) /1000) * (float(bb)* 1000000)
                return_results.append("BDP: " + str(bdp) + " bits")
                rwnd = bdp/8 / 1000
                return_results.append("Min RWND: " + str(bdp/8 / 1000) + " Kbytes")
                break
    #return return_results
    print(return_results)
    return bb, bdp, rwnd

def parse_shark(stdout_data, recv_window, rtt):
    # param = results[0], mtu_param = results[1]
    return_results = []
    ideal_tcp = []
    average_tcp = []
    window_scan_results = []
    speed_plot = []
    ave_tcp = None
    ave_tt = None
    ide_tcp = None
    ide_tt = None
    tcp_ttr = None

    with open(stdout_data,"r") as f:
        for line in f:
            #temp = line.decode("utf-8")
            temp = line
            if "sender" in temp:
                entries = re.findall(r'\S+',temp)

                #check if test ran in 5s
                timecheck = float(re.split("-",entries[2])[1])
                if timecheck < 5:
                    print("iPerf TCP incomplete")
                    return
                return_results.append("Average TCP Throughput: " + entries[6] + " Mbits/s")
                ave_tcp = float(entries[6])

                # param should be results[0]
                #mtu = int(re.split(" ", param)[2])
                #ideal_throughput = (recv_window * 8 / (float(re.split(" ",mtu_param)[2])/1000))/1000
                ideal_throughput = (recv_window * 8 / (float(rtt)/1000))/1000
                ide_tcp = ideal_throughput
                #max_throughput = (mtu-40) * 8 * 81274 /1000000 #1500 MTU 8127 FPS based on connection type
                return_results.append("Ideal TCP Throughput: " + str(ideal_throughput) + " Mbits/s")

                temp2 = re.split("-",entries[2])
                actual = float(temp2[1])
                ave_tt = actual
                return_results.append("Actual Transfer Time: " + str(actual))
                ideal = float(entries[4]) * 8 / ideal_throughput
                ide_tt = ideal
                return_results.append("Ideal Transfer Time: " + str(ideal))
                ttr = actual / ideal
                tcp_ttr = ttr
                return_results.append("TCP TTR: " + str(ttr))

                average_tcp.append(entries[6] + "Mbits/s")
                ideal_tcp.append(str("{0:.2f}".format(round(ideal_throughput,2))) + "Mbits/s")

                window_scan_results.append(average_tcp)
                window_scan_results.append(ideal_tcp)

            elif "KBytes" in temp:
                entries = re.findall(r'\S+',temp)
                x_axis = re.split("-",entries[2])
                x_axis = int(float(x_axis[1]))
                speed_plot.append([x_axis,float(entries[6])])
        #return return_results, ideal_tcp, average_tcp, windows_scan_results, speed_plot
    return ave_tcp, ide_tcp, ave_tt, ide_tt, tcp_ttr, speed_plot

def efficiency_process(filename, client_ip):
    scapy_process = subprocess.Popen(["python3",
                          "scapy-tcp-eff-expt2.py",
                          filename,
                          client_ip],
                         stdout = subprocess.PIPE, stderr = subprocess.PIPE)
    neff_plot = []
    results = []
    scapy_process.wait()
    for line in scapy_process.stdout:
        temp = line.decode("utf-8")

        if "plot" in temp:
            temp = re.split(":", temp)[1]
            temp = temp[1:-2]

            for i in re.split("], ", temp):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                neff_plot.append(temp_list)
        else:
            results.append(temp)
    trans_bytes = results[0]
    retrans_bytes = results[1]
    eff = results[2]
    return trans_bytes, retrans_bytes, eff, neff_plot

def buffer_delay_process(filename, client_ip, server_ip, mtu):
    ave_rtt = None
    buffer_delay = None
    buffer_delay_process = subprocess.Popen(["python3",
                                             "buffer-delay.py",
                                             filename,
                                             client_ip,
                                             server_ip,
                                             #re.split(" ", mtu_param)[2]],
                                             str(mtu)], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
    results = []
    nbuffer_plot = []
    for line in buffer_delay_process.stdout:
        temp = line.decode("utf-8")
        if "plot" in temp:
            temp = re.split(":", temp)[1]
            temp = temp[1:-2]
            print(temp)

            for i in re.split("], ", temp):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                nbuffer_plot.append(temp_list)
        else:
            results.append(temp)
    ave_rtt = results[0]
    buffer_delay = results[1]
    #return results, nbuffer_plot
    return ave_rtt, buffer_delay, nbuffer_plot


# REVERSE TEST UTILS

def list_speed_plot(speed_plot):
    speed_plot_list = []
    for i in re.split("], ", speed_plot):
        temp_list = re.split(", ", i[1:-1])
        temp_list[0] = int(temp_list[0])
        temp_list[1] = float(temp_list[1])
        speed_plot_list.append(temp_list)
    return speed_plot_list
