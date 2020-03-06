import queue_process
from constants import *
import sys







if __name__ == "__main__":
    n = int(sys.argv[1])
    tempfile = open("temporary_test","w+")
    average_rtt = 0
    average_tcp = 0
    total = 0
    for x in range(0,n):
        #results = queue_process.join_queue(NORMAL_MODE, DEFAULT_SERVER, "random_hash", int(sys.argv[2]))[0][0]
        results = queue_process.join_queue(REVERSE_MODE, DEFAULT_SERVER, "random_hash", int(sys.argv[2]))[0][0]
        try:
            average_rtt += float(results['RTT'])
            average_tcp += float(results['THPT_AVG'])
            total += 1
        except:
            pass
        tempfile.write("\n"+str(results)+"\n")

    print(str(average_rtt/total))
    print(str(average_tcp/total))

