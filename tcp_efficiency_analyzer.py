from scapy.all import *
import sys
import time


'''

        Processes and retrieves TCP throughput
        metrics from a TCP throughput test.
        @PARAMS:
            filename    :   filename of the network trace file
                            default is pcap
            client_ip   :   the IPv4 address of the client
                            for filtering the packets
        
'''
def get_tcp_metrics(filename, client_ip):

    packets               = rdpcap(filename)
    packettotal           = len(packets)
    transmitted_bytes     = 0
    retransmitted_bytes   = 0
    # RST byte flag for checking retransmissions
    RST = 0x04
    
    for packet in packets:
        if IP in packet:
            if (TCP in packet) and (packet[IP].src == client_ip):
                transmitted_bytes += len(packet)
                if packet['TCP'].flags & RST:
                    retransmitted_bytes += len(packet)
    tcp_efficiency = (transmitted_bytes - retransmitted_bytes)/(transmitted_bytes*1.0)
    return transmitted_bytes, retransmitted_bytes, tcp_efficiency



if __name__ == "__main__":
    print(get_tcp_metrics(sys.argv[1],sys.argv[2]))

