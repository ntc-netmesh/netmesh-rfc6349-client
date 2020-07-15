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

    @RETURNS:
        min_rtt         :   minimum RTT value measured
        max_rtt         :   maximum RTT value measured
        average_rtt     :   average round trip time of packets matched
                            on a SEQ-ACK number condition
'''
def get_average_rtt(filename, client_ip, server_ip, dataoffset):
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
                        # means packet.time is in ms
                        if packet.time - time.time() > 10000:
                            divider = 1000.0
                            divider_flag = True
                    if (not packet[TCP].flags & SYN):
                        if (packet[IP].src == client_ip):# and (not len(packet[TCP].payload) < int(dataoffset) - 300):
                            print(len(packet[TCP].payload))
                            expected_seqnum = packet[TCP].seq + int(dataoffset)
                            client_packets[expected_seqnum] = packet.time
                            expected_seqnum = packet[TCP].seq + int(len(packet[TCP].payload))
                            client_packets[expected_seqnum] = packet.time
                        if (packet[IP].src in server_ip) and (packet[TCP].flags & ACK):
                            if (packet[TCP].ack in client_packets):
                                rtt_lol = (packet.time - client_packets[packet[TCP].ack])/divider
                                if rtt_lol < rtt_min:
                                    rtt_min = rtt_lol
                                if rtt_lol > rtt_max:
                                    rtt_max = rtt_lol
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
        return rtt_min*divider, rtt_max*divider, round(average_rtt*1000,5)
    except:
        raise
    return




if __name__ == "__main__":
    mini, maxi, avg = get_average_rtt(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    mini = "min : "+str(mini)
    maxi = "max : "+str(maxi)
    avg = "avg : "+str(avg)
    open(sys.argv[5],"w+").write(mini+"\n"+maxi+"\n"+avg)

