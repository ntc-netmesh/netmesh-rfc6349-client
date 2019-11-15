import os
import shutil

def move_pcap(mode):
	file = open("hash.txt", "r")
	file.readline()
	region = file.readline()[:-1]
	serial = file.readline()
	file.close()

	if (mode == "sim"):
		serial = serial + "-sim"
	i=0
	while os.path.exists("pcap-files/" + region + "-" + serial +  "-%s.pcapng" % i):
		i+=1

	filename = region + "-" + serial + "-" + str(i) + ".pcapng"
	shutil.move("testresults.pcapng", "pcap-files/" + filename)

	return filename