from scapy.all import *
import sys
import time

'''
    Gets the average rtt of a network trace file
    provided with the client and server IPv4 add.
    The average RTT is computed from the perspective
    of the client host.
    @PARAMS:
        filename        :   filename of the pcap/pcapng file
        client_ip       :   IPv4 address of the client host
        server_ip       :   IPv4 address of the server host
        baseline_rtt    :   the baseline RTT to compare the value of
                            the average RTT with

    @RETURNS:
        average_rtt     :   average round trip time of packets matched
                            on a SEQ-ACK number condition
        buffer_delay    :   the increase in RTT from the throughput
                            test compared with the computed baseline
'''
def get_average_rtt(filename, client_ip, server_ip, baseline_rtt):
    packets        = rdpcap(filename)
    packettotal    = len(packets)
    ACK            = 0x10
    client_packets = {}
    server_packets = {}
    rtt            = []
    divider_flag = False
    multiplier = 1000

    for packet in packets:
        try:
            if IP in packet:
                if TCP in packet:
                    if not divider_flag:
                        # means packet.time is in ms
                        if packet.time - time.time() > 10000:
                            multiplier = 1
                            divider_flag = True
                    if (packet[IP].src == client_ip):
                        tcp_datalen     = len(packet[TCP].payload)
                        expected_seqnum = packet[TCP].seq + tcp_datalen
                        client_packets[expected_seqnum] = packet.time
                    if (packet[IP].src == server_ip) and (packet[TCP].flags & ACK):
                        if (packet[TCP].ack not in server_packets):
                            server_packets[packet[TCP].ack] = packet.time
        except:
            pass

    for ack_num, arrival_time in server_packets.items():
        try:
            rtt.append(arrival_time - client_packets[ack_num])
        except:
            pass

    try:
        average_rtt  = sum(rtt)/len(rtt)*1.0
        buffer_delay = (average_rtt - float(baseline_rtt)) / float(baseline_rtt)  
        #return round(average_rtt*1000,5), buffer_delay
        return average_rtt*multiplier, buffer_delay
    except:
        raise
    return




if __name__ == "__main__":
    print(get_average_rtt(sys.argv[1], sys.argv[2], sys.argv[3]))


