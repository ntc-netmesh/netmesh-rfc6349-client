'''
ONLY COUNTS ORIGINAL ACKS FOR NOW, DUPES (SAME SEQ NUM) DISCARDED
'''
from scapy.all import *
import sys
import time

def get_sec(time_str):
	h, m, s = time_str.split(':')
	return int(s)

if len(sys.argv) != 4:
	print ("Usage: python3 buffer-delay.py <pcap_file> <src_ip> <dest_ip>")
	sys.exit(1)

packets = rdpcap(sys.argv[1])
src_ip_addr = sys.argv[2]
dest_ip_addr = sys.argv[3]

packettotal = 0
for packet in packets:
	packettotal = packettotal + 1

count = 0
index = 0
index2 = 0
tcp_pkt_dict = {}
tcp_pkt_actual = []
seen = []
ack = {}

while (count < packettotal):
	pkt1 = packets[count]
	try:
		if IP in pkt1:
			if ((TCP in pkt1)) and (pkt1[IP].src == src_ip_addr):
				tcp_datalen = pkt1[IP].len -(20+(pkt1[TCP].dataofs*4))
				expected_seqnum = pkt1[TCP].seq + tcp_datalen
				tcp_pkt_dict[expected_seqnum] = index
				tcp_pkt_actual.append(pkt1)
				index += 1
			if ((TCP in pkt1)) and (pkt1[IP].src == dest_ip_addr and pkt1[TCP].flags == 'A'):
				if (pkt1[TCP].ack not in seen):
					ack[index2] = pkt1
					seen.append(pkt1[TCP].ack)
					index2 += 1
	except:
		pass
	count += 1

rtt = []

for cnt, i in enumerate(seen):
	if i in tcp_pkt_dict:
		index = tcp_pkt_dict[i]
		start_time = tcp_pkt_actual[index].time
		end_time = ack[cnt].time

		rtt.append(end_time-start_time)

ave_rtt = sum(rtt)/len(rtt)
print(str("{0:.5f}".format(round(ave_rtt*1000,5))) + " ms")
