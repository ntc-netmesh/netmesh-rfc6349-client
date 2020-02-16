from scapy.all import *
import traceback
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
def get_average_rtt(filename, client_ip, server_ip, baseline_rtt, dataoffset):
    packets        = rdpcap(filename)
    packettotal    = len(packets)
    rtt_min = 100000
    rtt_max = 0
    ACK            = 0x10
    SYN            = 0x02
    client_packets = {}
    server_packets = {}
    rtt            = []
    counter        = 0
    divider_flag = False
    divider = 1.0

    for packet in packets:
        try:
            if IP in packet:
                if TCP in packet:
                    if not divider_flag:
                        if packet.time - time.time() > 10000:
                            divider = 1000.0
                            divider_flag = True
                    if (not packet[TCP].flags & SYN):
                        if (packet[IP].src == client_ip) and (not len(packet[TCP].payload) < int(dataoffset)):
                            tcp_datalen     = len(packet[TCP].payload)
                            expected_seqnum = packet[TCP].seq + tcp_datalen
                            expected_seqnum = packet[TCP].seq + int(dataoffset)
                            #print("client : "+str(expected_seqnum))
                            if expected_seqnum in client_packets:
                                print("retr : "+str(expected_seqnum))
                            client_packets[expected_seqnum] = packet.time
                        if (packet[IP].src in server_ip) and (packet[TCP].flags & ACK):
                            #print("ack : "+str(expected_seqnum))
                            if (packet[TCP].ack in client_packets):
                                rtt_lol = (packet.time - client_packets[packet[TCP].ack])/divider
                                if rtt_lol < rtt_min:
                                    rtt_min = rtt_lol
                                if rtt_lol > rtt_max:
                                    rtt_max = rtt_lol
                                if rtt_lol*1000 > 10.0:
                                    pass
                                    #print(str(packet[TCP].ack))
                                    #print(counter)
                                rtt.append(rtt_lol)
                                del client_packets[packet[TCP].ack] 
                counter += 1

                        #if (packet[TCP].ack not in server_packets):
                        #    server_packets[packet[TCP].ack] = packet.time
        except:
            traceback.print_exc()
            pass

    try:
        average_rtt  = sum(rtt)/len(rtt)#*1.0
        #buffer_delay = (average_rtt - float(baseline_rtt)) / float(baseline_rtt)  
        buffer_delay = 0
        print("min rtt : "+str(rtt_min*1000))
        print("max rtt : "+str(rtt_max*1000))
        return round(average_rtt*1000,5), buffer_delay
    except:
        raise
    return




if __name__ == "__main__":
    print(get_average_rtt(sys.argv[1], sys.argv[2], sys.argv[3], 1, sys.argv[4]))


