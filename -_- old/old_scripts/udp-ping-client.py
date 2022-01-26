##################################################
#       Normal Mode - Server to Client Ping
#       Reverse Mode - Client to Server Ping
#
#
#
##################################################

import socket
import subprocess
import sys
from datetime import datetime
import re
from netmesh_constants import *
# ip_addr = '202.92.132.191'
ip_addr = DEFAULT_SERVER
port = 5005

def normal_ping():
    # p = subprocess.Popen(["ping", "202.92.132.191", "-c", "10"], stdout = subprocess.PIPE)
    p = subprocess.Popen(["ping", DEFAULT_SERVER, "-c", "10"], stdout = subprocess.PIPE)
    for line in p.stdout:
        temp = line.decode("utf-8")
        print(temp)
        if "avg" in temp:
                rtt = re.split(" ", temp)[3]
                ave_rtt = re.split("/", rtt)[2]
                print("Average RTT: "+str(ave_rtt))

def ping(client):
    while True:
        try:
            data,addr = client.recvfrom(56)
            client.sendto(data, addr)
            string = data.decode()
            #print(string)
            #data,addr = client.recvfrom(64)
            #rtt = data.decode()
            #print("rtt :" + str(rtt))
            if '9' in string:
                break
        except socket.timeout as e:
                e = "Timeout"
                print(e)
                normal_ping()
                break

def reverse_ping(client):
    for i in range(0,10):
        try:
                pad = ''
                for j in range(0,55):
                    pad += '0'
                data = bytes(pad + str(i),'utf-8')
                client.sendto(data, (ip_addr,port))
                start = datetime.now()

                if client.recv(56):
                        end = datetime.now()

                        rtt = end-start
                        print(rtt)
        except socket.timeout as e:
                e = "Lost"
                print(e)
                normal_ping()
                break

if __name__ == "__main__":
    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    client.settimeout(1)
    #client.connect(("202.92.132.191", 5005))

    #Reverse Mode
    if sys.argv[1] == '-r':
        client.sendto(b'1', (sys.argv[2],port))
        reverse_ping(client)

    #Normal Mode
    else:
        ip_addr = sys.argv[1]
        client.sendto(b'0', (ip_addr,port))
        ping(client)
