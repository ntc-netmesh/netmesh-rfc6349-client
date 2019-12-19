import re
import subprocess
from windows_scans import *

def file_setter(filename):
    subprocess.call(['sudo', 'rm', filename])
    subprocess.call(['touch', filename])
    subprocess.call(['chmod', '+rw', filename])

def parse_plpmtu(stdout_data):
    return_results = []
    for line in stdout_data:
        temp = line.decode("utf-8")
        if "PLPMTUD" in temp:
            mtu = re.split(" ", temp)[3]
            return_results.append("Path MTU: " + mtu)
    return return_results

def parse_ping(stdout_data):
    return_results = []
    for line in stdout_data:
        temp = line.decode("utf-8")
        if "avg" in temp:
            rtt = re.split(" ", temp)[3]
            ave_rtt = re.split("/", rtt)[2]
            return_results.append("Baseline RTT: " + ave_rtt + " ms")
    return return_results

def parse_iperf3(stdout_data, bdp_param):
    return_results = []
    break_flag = False
    for line in stdout_data:
        temp = line.decode("utf-8")
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
            bdp = (float(re.split(" ", bdp_param)[2]) /1000) * (float(bb)* 1000000)
            return_results.append("BDP: " + str(bdp) + " bits")
            return_results.append("Min RWND: " + str(bdp/8 / 1000) + " Kbytes")
            break
    return return_results

def parse_shark(stdout_data, param, recv_window, mtu_param):
    # param = results[0], mtu_param = results[1]
    return_results = []
    ideal_tcp = []
    average_tcp = []
    windows_scan_results = []
    speed_plot = []

    for line in stdout_data:
        temp = line.decode("utf-8")
        if "sender" in temp:
            entries = re.findall(r'\S+',temp)

            #check if test ran in 5s
            timecheck = float(re.split("-",entries[2])[1])
            if timecheck < 5:
                print("iPerf TCP incomplete")
                return
            return_results.append("Average TCP Throughput: " + entries[6] + " Mbits/s")

            # param should be results[0]
            mtu = int(re.split(" ", param)[2])
            ideal_throughput = (recv_window * 8 / (float(re.split(" ",mtu_param)[2])/1000))/1000
            #max_throughput = (mtu-40) * 8 * 81274 /1000000 #1500 MTU 8127 FPS based on connection type
            return_results.append("Ideal TCP Throughput: " + str(ideal_throughput) + " Mbits/s")

            temp2 = re.split("-",entries[2])
            actual = float(temp2[1])
            return_results.append("Actual Transfer Time: " + str(actual))
            ideal = float(entries[4]) * 8 / ideal_throughput
            return_results.append("Ideal Transfer Time: " + str(ideal))
            ttr = actual / ideal
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
    return return_results, ideal_tcp, average_tcp, windows_scan_results, speed_plot

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
            print(temp)

            for i in re.split("], ", temp):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                neff_plot.append(temp_list)
        else:
            results.append(temp)
    return results, neff_plot

def buffer_delay_process(filename, client_ip, server_ip, mtu_param):
    buffer_delay_process = subprocess.Popen(["python3",
                                             "buffer-delay.py",
                                             filename,
                                             client_ip,
                                             server_ip,
                                             re.split(" ", mtu_param)[2]],
                                            stdout = subprocess.PIPE, stderr = subprocess.PIPE)
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
    return results, nbuffer_plot



# REVERSE TEST UTILS

def list_speed_plot(speed_plot):
    speed_plot_list = []
    for i in re.split("], ", speed_plot):
        temp_list = re.split(", ", i[1:-1])
        temp_list[0] = int(temp_list[0])
        temp_list[1] = float(temp_list[1])
        speed_plot_list.append(temp_list)
    return speed_plot_list
