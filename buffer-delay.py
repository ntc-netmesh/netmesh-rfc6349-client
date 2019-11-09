'''
ONLY COUNTS ORIGINAL ACKS FOR NOW, DUPES (SAME SEQ NUM) DISCARDED
'''
from scapy.all import *
import sys
import time

def get_sec(time_str):
	h, m, s = time_str.split(':')
	return int(s)

if len(sys.argv) != 5:
	print ("Usage: python3 buffer-delay.py <pcap_file> <src_ip> <dest_ip> <base_rtt>")
	sys.exit(1)

packets = rdpcap(sys.argv[1])
src_ip_addr = sys.argv[2]
dest_ip_addr = sys.argv[3]
base_rtt = float(sys.argv[4])

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

##preprocessing
while (count < packettotal):
	pkt1 = packets[count]

	if IP in pkt1:
		#scan for server
		if ((TCP in pkt1)) and (pkt1[IP].src == src_ip_addr):
			tcp_datalen = pkt1[IP].len -(20+(pkt1[TCP].dataofs*4))
			expected_seqnum = pkt1[TCP].seq + tcp_datalen
			tcp_pkt_dict[expected_seqnum] = index
			tcp_pkt_actual.append(pkt1)
			index += 1

		##scan for client acks
		if ((TCP in pkt1)) and (pkt1[IP].src == dest_ip_addr and pkt1[TCP].flags == 'A'):
			if (pkt1[TCP].ack not in seen):
				ack[index2] = pkt1
				seen.append(pkt1[TCP].ack)
				index2 += 1
	count += 1

rtt = []
curr_sec = -1
rtt_plot = []
rtt_cnt = 1
rtt_hold = []


##check for seq that triggers ack
for cnt, i in enumerate(seen):
	'''
	seq_list = tcp_pkt_dict.items()
	for item in seq_list:
		if item[1] == i:
			index = item[0]
			start_time = tcp_pkt_actual[index].time
			end_time = ack[cnt].time
			#print("cnt,index", str(cnt), str(index))
			#print("seq: " + str(item[1]) + "," + str(tcp_pkt_actual[index].seq))
			#print("ack: "+ str(i) + "," + str(ack[cnt].ack))
			#print(end_time,start_time)
			#sprint("RTT: " + str(end_time-start_time) + "ms")
			rtt.append(end_time-start_time)
			break
	'''
	if i in tcp_pkt_dict:
		index = tcp_pkt_dict[i]
		start_time = tcp_pkt_actual[index].time
		end_time = ack[cnt].time

		#handle graphing
		temp = time.strftime('%H:%M:%S', time.localtime(end_time))
		if curr_sec == -1:
			curr_sec = get_sec(temp)
		if get_sec(temp) != curr_sec:
			inst_ave = sum(rtt_hold)/len(rtt_hold)
			rtt_plot.append([rtt_cnt,inst_ave])
			curr_sec = get_sec(temp)
			rtt_cnt += 1
			rtt_hold = []
		else:
			rtt_hold.append(end_time-start_time)


		#print("cnt,index", str(cnt), str(index))
		#print("seq: " + str(index) + "," + str(tcp_pkt_actual[index].seq))
		#print("ack: "+ str(i) + "," + str(ack[cnt].ack))
		#print(end_time,start_time)
		#sprint("RTT: " + str(end_time-start_time) + "ms")
		rtt.append(end_time-start_time)

'''
#add last second average rtt
inst_ave = sum(rtt_hold)/len(rtt_hold)
rtt_plot.append([rtt_cnt,inst_ave])
'''
ave_rtt = sum(rtt)/len(rtt)
print("ave RTT: " + str("{0:.2f}".format(round(ave_rtt*1000,2))) + " ms")
buffer_delay = ( ((sum(rtt)/len(rtt))-base_rtt)/base_rtt ) *100
print("buffer delay: " + str(buffer_delay) + " %")
print("plot:" + str(rtt_plot))
