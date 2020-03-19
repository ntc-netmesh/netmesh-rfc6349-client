import re
import subprocess

'''
    Retrieves the current IPv4 address of the client
    @RETURN:
        client_ip   :   IPv4 address of the client
'''
def get_client_ip():
    client_ip = ""
    p = subprocess.Popen(["hostname", "-I"], stdout = subprocess.PIPE)
    for line in p.stdout:
        client_ip = re.split(" ", line.decode("utf-8"))[0]
        break
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
                ave_rtt = re.split(" ", temp)[2]
                #ave_rtt = re.split("/", rtt)[2]
    return ave_rtt

#'''
#   Parses the throughput metrics out of throughput process output file
#   @PARAMS:
#        stdout_data     :    filename of the output file
#        rtt             :    Round Trip Time
#
#   @RETURN:
#        bb              :    baseline bandwidth
#        bdp             :    bandwidth delay product
#        rwnd            :    receive window size
#'''
#def parse_iperf3(stdout_data, rtt):
#    return_results = []
#    break_flag = False
#    bb = None
#    bdp = None
#    rwnd = None
#    with open(stdout_data,"r") as f:
#        for line in f:
#            temp = line
#            if "Jitter" in temp:
#                break_flag = True
#                continue
#            if break_flag:
#                entries = re.findall(r'\S+',temp)
#                timecheck = float(re.split("-",entries[2])[1])
#                if timecheck < 10:
#                    print("iPerf UDP incomplete")
#                    break
#                bb = entries[6]
#                bdp = (float(rtt) /1000) * (float(bb)* 1000000)
#                rwnd = bdp/8 / 1000
#                break
#    return bb, bdp, rwnd

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
def parse_shark(stdout_data, recv_window, rtt, res_filter):
    speed_plot = []
    ave_tcp = None
    ave_tt = None
    ide_tt = None
    tcp_ttr = None
    ide_tcp = (float(recv_window) * 8 / (float(rtt)/1000))/(10**6)
    offset = 0
    multiplier = 1

    with open(stdout_data,"r") as f:
        for line in f:
            temp = line
            if res_filter in temp:
                entries = re.findall(r'\S+',temp)
                if "SUM" in temp:
                    offset = 1
                try:
                    ave_tcp = float(entries[6-offset])

                    # average transfer time
                    temp2 = re.split("-",entries[2-offset])
                    ave_tt = float(temp2[1])

                    if "KBytes" in entries[5-offset]:
                        multiplier = 1000

                    ide_tt = ( float(entries[4-offset]) * 8 * multiplier ) / ( ide_tcp )
                    tcp_ttr = ide_tt / ave_tt
                except:
                    pass

    return ave_tcp, ide_tcp, ave_tt, ide_tt, tcp_ttr, speed_plot

