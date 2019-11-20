#!/usr/bin/env python3

import eel
import asyncio
import websockets
import subprocess
import re
import sys
import os
import signal
from threading import Thread

import store_pcap

import requests
import json
import ast
from datetime import datetime
import random ##for testing purposes only##
import pytz


# Set web files folder and optionally specify which file types to check for eel.expose()
#   *Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])

@eel.expose
def retrieve_servers():
    response = requests.get("https://sago-gulaman.xyz/api/servers/")
    server_list = response.json()
    index=0
    for i in server_list:
        if (i["test_method"] == "2"):
            location = " - " + i["city"] + ", " + i["province"] + ", "  + i["country"]
            eel.add_server(i["nickname"]+location,i["ip_address"] + "," +  i["uuid"])

###results server credentials###
global dev_hash
dev_hash = ""
global region
region = ""
global pcap
pcap = ""
global token
token = ""
global net_type
net_type = ""
url = "https://www.sago-gulaman.xyz"
global server_uuid
server_uuid = ""

@eel.expose
def login(username,password):
    global dev_hash
    read_hash()
    hash_data = {
        "hash": dev_hash
    }

    try:
        # Request for Agent token
        r = requests.post(url=url+"/api/gettoken", data=hash_data, auth = (username, password))
    except Exception as e:
        print(e)

    if r.status_code == 401:
        #print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.alert_debug("Invalid username/password!")
        return
    elif r.status_code == 400:
        #print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.alert_debug("Device not registered. Please register the device using new_dev_reg")
        return
    elif r.status_code != 200:
        #print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.alert_debug("Error occured")
        return

    global token
    token = ast.literal_eval(r.text)['Token']
    eel.hide_login()

def read_hash():
    if os.path.exists("hash.txt"):
        file = open("hash.txt","r")
        global dev_hash
        dev_hash = file.readline()[:-1]
        global region
        region = file.readline()[:-1]
        file.close()
        return True
    else:
        eel.alert_debug("Device not registered! Please register the device before using.")
    return False

def parse_results(results,direction):
    for i in results:
        if "MTU" in i:
            mtu = re.split(": ",i)[1] 

        elif "Baseline" in i:
            temp = re.split(": ",i)[1]
            base_rtt = re.split(" ",temp)[0]

        elif "Bottleneck" in i:
            temp = re.split(": ",i)[1]
            bb = re.split(" ",temp)[0]

        elif "BDP" in i:
            temp = re.split(": ",i)[1]
            bdp = re.split(" ",temp)[0]

        elif "RWND" in i:
            temp = re.split(": ",i)[1]
            rwnd = re.split(" ",temp)[0]

        elif "Average TCP Throughput" in i:
            temp = re.split(": ",i)[1]
            tcp_tput = re.split(" ",temp)[0]

        elif "Ideal TCP Throughput" in i:
            temp = re.split(": ",i)[1]
            ideal_tput = re.split(" ",temp)[0]

        elif "Actual Transfer" in i:
            att = re.split(": ",i)[1]

        elif "Ideal Transfer" in i:
            itt = re.split(": ",i)[1]

        elif "TTR" in i:
            ttr = re.split(": ",i)[1]

        elif "Transmitted Bytes" in i:
            trans_bytes = re.split(": ",i)[1][:-1]

        elif "Retransmitted" in i:
            retrans_bytes = re.split(": ",i)[1][:-1]

        elif "Efficiency" in i:
            eff = re.split(": ",i)[1][:-1]

        elif "ave RTT" in i:
            temp = re.split(": ",i)[1]
            ave_rtt = re.split(" ",temp)[0]

        elif "buffer delay" in i:
            temp = re.split(": ",i)[1]
            buff_delay = re.split(" ",temp)[0]

    data = {
        "ts": datetime.now(),   # TODO: add timezone information, or assume that clients will always send in UTC
        "server": server_uuid,
        "direction": direction,
        "path_mtu": mtu,
        "baseline_rtt": base_rtt,
        "bottleneck_bw": bb,
        "bdp": bdp,
        "min_rwnd": rwnd,
        "ave_tcp_tput": tcp_tput,
        "ideal_tcp_tput": ideal_tput,
        "actual_transfer_time": att,
        "ideal_transfer_time": itt,
        "tcp_ttr": ttr,
        "trans_bytes": trans_bytes,
        "retrans_bytes": retrans_bytes,
        "tcp_eff": eff,
        "ave_rtt": ave_rtt,
        "buffer_delay": buff_delay,
    }

    return data

def send_res(results, mode, lat, lon):
    if mode == 'normal':
        res = {
            "set1": parse_results(results,'forward'),
        }
    elif mode =='reverse':
        res = {
            "set1": parse_results(results,'reverse'),
        }
    elif mode == 'bidirectional':
        res = {
            "set1": parse_results(results[0],'forward'),
            "set2": parse_results(results[1],'reverse'),
        }
    elif mode == 'simultaneous':
        res = {
            "set1": parse_results(results[0],'forward'),
            "set2": parse_results(results[1],'reverse'),
        }

    global pcap
    global net_type
    data_point = {
        "hash": dev_hash,
        "test_type": "RFC6349",
        "network": net_type,
        "pcap": pcap,
        "lat": lat,
        "long": lon,
        "mode": mode,
        "results": res
    }

    global token
    data_json = json.dumps(data_point, default=str)
    status_len = len(data_json)

    headers = {
        "Authorization": "Token %s" % token,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": str(status_len)
    }

    try:
        r = requests.post(url+"/api/submit",
                          headers=headers,
                          data=data_json,
                          timeout=30)

    except Exception as e:
        print("ERROR: %s." % e)

    if r.status_code == 200:
        print("Submit success!")
    else:
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))


ws_url = ""
server_ip = ""

###set ip here####
client_ip = ""
p = subprocess.Popen(["hostname", "-I"], stdout = subprocess.PIPE)
for line in p.stdout:
    client_ip = re.split(" ", line.decode("utf-8"))[0]
    break

@eel.expose 
def normal(lat, lon, cir, serv_ip, network_type):
    #print("normal mode")

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    global server_ip
    server_ip = ip[0]
    global net_type
    net_type = network_type


    global ws_url
    ws_url = "ws://" + server_ip + ":3001"

    thread_a = Thread(target=start_normal_thread(lat,lon,cir), daemon=True)
    thread_a.start()

def start_normal_thread(lat, lon, cir):
    asyncio.get_event_loop().run_until_complete(l_to_r(lat, lon, cir))

@eel.expose 
def rev(lat, lon, cir, serv_ip, network_type):
    #print("reverse mode")

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    global server_ip
    server_ip = ip[0]
    global net_type
    net_type = network_type


    global ws_url
    ws_url = "ws://" + server_ip + ":3001"
    
    thread_a = Thread(target=start_reverse_thread(lat,lon, cir), daemon=True)
    thread_a.start()

def start_reverse_thread(lat, lon, cir):
    asyncio.get_event_loop().run_until_complete(r_to_l(lat, lon, cir))

@eel.expose 
def sim(lat, lon, cir, serv_ip, network_type):
    #print("simultaneous mode")

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    global server_ip
    server_ip = ip[0]
    global net_type
    net_type = network_type

    global ws_url
    ws_url = "ws://" + server_ip + ":3001"
    
    thread_a = Thread(target=start_sim_thread(lat,lon, cir), daemon=True)
    thread_a.start()

def start_sim_thread(lat, lon, cir):
    asyncio.get_event_loop().run_until_complete(simultaneous(lat, lon, cir))

def traceroute(server_ip):
    p = subprocess.Popen(["traceroute", server_ip], stdout = subprocess.PIPE)
    p.wait()

    hop_num = 0
    hop = {}
    for line in p.stdout:
        temp = line.decode("utf-8")
        print(temp)
        if hop_num >= 1:
            entries = re.findall(r'\S+',temp)

            curr_hop = entries[0]

            ip_add = ""
            for i in range(1,4):
                if "(" in entries[i]:
                    ip_add = entries[i][1:-1]
                    ip_name = entries[i-1]

            if ip_add == "":
            	continue

            ping = []
            for i in range(3,len(entries)):
                if "ms" in entries[i]:
                    ping.append(float(entries[i-1]))

            route = {}
            route["hostip"] = ip_add
            route["hostname"] = ip_name
            for ix, i in enumerate(ping):
                route["t"+str(ix+1)] = i

            hop[hop_num] = route
        else:
            entries = re.findall(r'\S+',temp)
            dest_name = entries[2]
            dest_ip = entries[3][1:-2]

        hop_num += 1

    ## send readings to result server
    data_point = {
        "dest_ip":dest_ip,
        "dest_name":dest_name,
        "hops": hop
    }

    print(hop)
    
    data_json = json.dumps(data_point, default=str)

    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": str(len(data_json))
    }
    
    try:
        r= requests.post(url=url+"/api/submit/traceroute", data = data_json, headers = headers)
    except Exception as e:
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))

    if r.status_code != 200:
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))    
        #quit()

global flag
flag = 0
@eel.expose
def cancel_test():
    print("in")
    global flag
    flag = 1

                      
async def l_to_r(lat, lon, cir):
    global server_ip
    traceroute(server_ip)

    results = []
    async with websockets.connect(ws_url) as websocket:

        try:
            
            await websocket.send("normal")
            eel.mode("Normal Mode")
            #mtu test
            state = await websocket.recv()
            print(state)
            if state == "plpmtu started":
                eel.printprogress("PLPMTUD started")

                max_retr = 0
                while True:
                    p = subprocess.Popen(["sudo", "./plpmtu", "-p", "udp", "-s", server_ip +":3002"], stdout = subprocess.PIPE)
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "PLPMTUD" in temp:
                            mtu = re.split(" ", temp)[3]
                            results.append("Path MTU: " + mtu)

                    max_retr  += 1
                    if max_retr >=5:
                        print("Cannot perform PLPMTUD")
                        return
                    
                    try:
                        if results[0]:
                            break
                    except IndexError:
                        pass
                await websocket.send("plpmtu done")
                eel.progress_now(100/6)

            #ping
            state = await websocket.recv()
            print(state)
            if state == "mtu done":
                eel.printprogress("Ping started")
                max_retr = 0
                while True:
                    p = subprocess.Popen(["ping", server_ip, "-c", "10"], stdout = subprocess.PIPE)
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "avg" in temp:
                            rtt = re.split(" ", temp)[3]
                            ave_rtt = re.split("/", rtt)[2]
                            results.append("Baseline RTT: " + ave_rtt + " ms")

                    max_retr += 1
                    if max_retr >=5:
                        print("Cannot perform Ping")
                        return

                    try:
                        if results[1]:
                            break
                    except IndexError:
                        pass

                await websocket.send("ping done")
                eel.progress_now(100/6*2)
            
            #iperf udp and tcp mode
            state = await websocket.recv()
            print(state)
            if state == "iperf server started":
                eel.printprogress("iPerf UDP started")
                #UDP mode
                max_retr = 0
                while True:
                    p = subprocess.Popen(["iperf3", "-c", server_ip, "-u", "-t", "10", "-f", "m", "-b", "1000M"], stdout = subprocess.PIPE)
                    p.wait()
                    flag=0
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "Jitter" in temp:
                            flag = 1
                            continue
                        if flag == 1:
                            entries = re.findall(r'\S+',temp)

                            #check if test ran in 10s
                            timecheck = float(re.split("-",entries[2])[1])
                            if timecheck < 10:
                                print("iPerf UDP incomplete")
                                break

                            bb = entries[6]
                            results.append("Bottleneck Bandwidth: " + bb + " Mbits/sec")
                            bdp = (float(re.split(" ", results[1])[2]) /1000) * (float(bb)* 1000000)
                            results.append("BDP: " + str(bdp) + " bits")
                            results.append("Min RWND: " + str(bdp/8 / 1000) + " Kbytes")
                            break

                    max_retr += 1
                    if max_retr >= 5:
                        print("Cannot perform iPerf")
                        return
                    try:
                        if results[2] and results[3] and results[4]:
                            eel.progress_now(100/6*3)
                            break
                    except IndexError:
                        pass


                #TCP window scans
                eel.printprogress("iPerf TCP started")
                rwnd = float(re.split(" ", results[4])[2])
                wnd_scan_res = []

                wnd_size = ["Window Size"]
                for i in range(1,5):
                    temp = rwnd*i*1000/4
                    wnd_size.append(str("{0:.2f}".format(round(temp,2))))

                wnd_scan_res.append(wnd_size)
                ave_tcp = ["Average TCP THPT"]
                ideal_tcp = ["Ideal TCP THPT"]
                wnd_eff = ["TCP Efficiency"]
                wnd_rtt = ["Average RTT"]
                wnd_graph = []

                #step 1 - 25%
                data_point = {}
                temp = rwnd*1000/4
                data_point["wnd_size"] = str("{0:.2f}".format(round(temp,2)))
                if os.path.exists("wnd_25_percent.pcapng"):
                    os.remove("wnd_25_percent.pcapng")
                t = subprocess.Popen(["tshark", "-w", "wnd_25_percent.pcapng"])
                await asyncio.sleep(3)
                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-w", str(rwnd/4)+"K" , "-f", "m", "-b", "1000M"], stdout = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    if "sender" in temp:
                        entries = re.findall(r'\S+',temp)

                        #check if test ran in 5s
                        timecheck = float(re.split("-",entries[2])[1])
                        if timecheck < 5:
                            print("iPerf TCP incomplete")
                            t.kill()
                            break
                            
                        print("25%:" + entries[6] + "Mbits/s")
                        ave_tcp.append(entries[6] + "Mbits/s")
                        ideal_thput = ((rwnd/4) * 8 / (float(re.split(" ", results[1])[2])/1000))/1000
                        ideal_tcp.append(str("{0:.2f}".format(round(ideal_thput,2))) + "Mbits/s")
                        data_point["actual"] = entries[6]
                        data_point["ideal"] = str("{0:.2f}".format(round(ideal_thput,2)))

                        wnd_graph.append(data_point)
                t.kill()
                p = subprocess.Popen(["python3", "scapy-tcp-eff-simple.py", "wnd_25_percent.pcapng", client_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_eff.append(temp)

                p = subprocess.Popen(["python3", "buffer-delay-simple.py", "wnd_25_percent.pcapng", client_ip, server_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_rtt.append(temp)


                #step 2 - 50%
                data_point = {}
                temp = rwnd*2*1000/4
                data_point["wnd_size"] = str("{0:.2f}".format(round(temp,2)))
                if os.path.exists("wnd_50_percent.pcapng"):
                    os.remove("wnd_50_percent.pcapng")
                t = subprocess.Popen(["tshark", "-w", "wnd_50_percent.pcapng"])
                await asyncio.sleep(3)
                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-w", str(rwnd/2)+"K" , "-f", "m", "-b", "1000M"], stdout = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    if "sender" in temp:
                        entries = re.findall(r'\S+',temp)

                        #check if test ran in 5s
                        timecheck = float(re.split("-",entries[2])[1])
                        if timecheck < 5:
                            print("iPerf TCP incomplete")
                            t.kill()
                            break
                            
                        print("50%:" + entries[6] + "Mbits/s")
                        ave_tcp.append(entries[6] + "Mbits/s")
                        ideal_thput = ((rwnd/2) * 8 / (float(re.split(" ", results[1])[2])/1000))/1000
                        ideal_tcp.append(str("{0:.2f}".format(round(ideal_thput,2))) + "Mbits/s")

                        data_point["actual"] = entries[6]
                        data_point["ideal"] = str("{0:.2f}".format(round(ideal_thput,2)))

                        wnd_graph.append(data_point)
                t.kill()
                p = subprocess.Popen(["python3", "scapy-tcp-eff-simple.py", "wnd_50_percent.pcapng", client_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_eff.append(temp)

                p = subprocess.Popen(["python3", "buffer-delay-simple.py", "wnd_50_percent.pcapng", client_ip, server_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_rtt.append(temp)


                #step 3 - 75%
                data_point = {}
                temp = rwnd*3*1000/4
                data_point["wnd_size"] = str("{0:.2f}".format(round(temp,2)))
                if os.path.exists("wnd_75_percent.pcapng"):
                    os.remove("wnd_75_percent.pcapng")
                t = subprocess.Popen(["tshark", "-w", "wnd_75_percent.pcapng"])
                await asyncio.sleep(3)
                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-w", str(rwnd*3/4)+"K" , "-f", "m", "-b", "1000M"], stdout = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    if "sender" in temp:
                        entries = re.findall(r'\S+',temp)

                        #check if test ran in 5s
                        timecheck = float(re.split("-",entries[2])[1])
                        if timecheck < 5:
                            print("iPerf TCP incomplete")
                            t.kill()
                            break
                            
                        print("75%:" + entries[6] + "Mbits/s")
                        ave_tcp.append(entries[6] + "Mbits/s")
                        ideal_thput = ((rwnd*3/4) * 8 / (float(re.split(" ", results[1])[2])/1000))/1000
                        ideal_tcp.append(str("{0:.2f}".format(round(ideal_thput,2))) + "Mbits/s")

                        data_point["actual"] = entries[6]
                        data_point["ideal"] = str("{0:.2f}".format(round(ideal_thput,2)))

                        wnd_graph.append(data_point)
                t.kill()
                p = subprocess.Popen(["python3", "scapy-tcp-eff-simple.py", "wnd_75_percent.pcapng", client_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_eff.append(temp)

                p = subprocess.Popen(["python3", "buffer-delay-simple.py", "wnd_75_percent.pcapng", client_ip, server_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    wnd_rtt.append(temp)


                #TCP mode - run for 5s to keep pcap small
                max_retr = 0
                
                while True:

                    if os.path.exists("testresults.pcapng"):
                        os.remove("testresults.pcapng")

                    t = subprocess.Popen(["tshark", "-w", "testresults.pcapng"])
                    await asyncio.sleep(3)
                    #rwnd = re.split(" ", results[4])[2]
                    p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-w", str(rwnd)+"K" , "-f", "m", "-b", "1000M"], stdout = subprocess.PIPE)
                    speed_plot = []
                    p.wait()
                    data_point = {}
                    temp = rwnd*1000
                    data_point["wnd_size"] = str("{0:.2f}".format(round(temp,2)))
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "sender" in temp:
                            entries = re.findall(r'\S+',temp)

                            #check if test ran in 5s
                            timecheck = float(re.split("-",entries[2])[1])
                            if timecheck < 5:
                                print("iPerf TCP incomplete")
                                t.kill()
                                break
                            
                            results.append("Average TCP Throughput: " + entries[6] + " Mbits/s")

                            mtu = int(re.split(" ", results[0])[2])
                            ideal_throughput = (rwnd * 8 / (float(re.split(" ", results[1])[2])/1000))/1000
                            #max_throughput = (mtu-40) * 8 * 81274 /1000000 #1500 MTU 8127 FPS based on connection type
                            results.append("Ideal TCP Throughput: " + str(ideal_throughput) + " Mbits/s")

                            data_point["actual"] = entries[6]
                            data_point["ideal"] = str("{0:.2f}".format(round(ideal_throughput,2)))

                            wnd_graph.append(data_point)


                            temp2 = re.split("-",entries[2])
                            actual = float(temp2[1])
                            results.append("Actual Transfer Time: " + str(actual))
                                    
                            ideal = float(entries[4]) * 8 / ideal_throughput
                            results.append("Ideal Transfer Time: " + str(ideal))
                                
                            ttr = actual / ideal
                            results.append("TCP TTR: " + str(ttr))

                            ave_tcp.append(entries[6] + "Mbits/s")
                            ideal_tcp.append(str("{0:.2f}".format(round(ideal_throughput,2))) + "Mbits/s")

                            wnd_scan_res.append(ave_tcp)
                            wnd_scan_res.append(ideal_tcp)

                        elif "KBytes" in temp:
                            entries = re.findall(r'\S+',temp)
                            x_axis = re.split("-",entries[2])
                            x_axis = int(float(x_axis[1]))
                            speed_plot.append([x_axis,float(entries[6])])

                    max_retr += 1
                    if max_retr >= 5:
                        print("Cannot perform iPerf")
                        return
                    try:
                        if results[5] and results[6] and results[7] and results[8] and results[9]:
                            eel.progress_now(100/6*4)
                            break
                    except IndexError:
                        pass

                await websocket.send("iperf done")
                eel.printprogress("iPerf done")
                t.kill()

                eel.wnd_scan_graph(wnd_graph)

                #TCP Efficiency Processing... takes some time
                print("Processing Efficiency")
                #subprocess.Popen(["sudo", "chmod", "777", "testresults.pcapng"])
                eel.printprogress("Processing Efficiency")
                max_retr = 0
                while True:
                    p = subprocess.Popen(["python3", "scapy-tcp-eff-expt2.py", "testresults.pcapng", client_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                    p.wait()
                    for line in p.stdout:
                        temp = line.decode("utf-8")

                        if "plot" in temp:
                            temp = re.split(":", temp)[1]
                            temp = temp[1:-2]
                            print(temp)

                            neff_plot = []
                            for i in re.split("], ", temp):
                                temp_list = re.split(", ", i[1:-1])
                                temp_list[0] = int(temp_list[0])
                                temp_list[1] = float(temp_list[1])

                                neff_plot.append(temp_list)
                        else:
                            results.append(temp)
                    
                    max_retr += 1
                    if max_retr >=5:
                        print("Cannot process PCAP efficiency")
                        return

                    try:
                        if results[10] and results[11] and results[12]:
                            eel.progress_now(100/6*5)
                            break
                    except IndexError:
                        pass

                #Buffer Delay Processing... takes some time
                print("Processing Buffer Delay")
                eel.printprogress("Processing Buffer Delay")
                max_retr = 0
                while True:
                    p = subprocess.Popen(["python3", "buffer-delay.py", "testresults.pcapng", client_ip, server_ip, re.split(" ", results[1])[2]], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "plot" in temp:
                            temp = re.split(":", temp)[1]
                            temp = temp[1:-2]
                            print(temp)

                            nbuffer_plot = []
                            for i in re.split("], ", temp):
                                temp_list = re.split(", ", i[1:-1])
                                temp_list[0] = int(temp_list[0])
                                temp_list[1] = float(temp_list[1])

                                nbuffer_plot.append(temp_list)
                        else:
                            results.append(temp)

                    max_retr += 1
                    if max_retr >=5:
                        print("Cannot process PCAP buffer delay")
                        return

                    try:
                        if results[13] and results[14]:
                            break
                    except IndexError:
                        pass

            #show all results
            eel.printlocal("CIR: " + cir)
            for line in results:
                print(line)
                eel.printlocal(line)

            temp = re.split(" ", results[12])
            wnd_eff.append(temp[2])
            temp = re.split(" ", results[13])
            wnd_rtt.append(temp[2] + " ms")

            wnd_scan_res.append(wnd_eff)
            wnd_scan_res.append(wnd_rtt)

            eel.create_table_local_window(wnd_scan_res)

            eel.lgraph(speed_plot)
            eel.legraph(neff_plot)
            eel.lbgraph(nbuffer_plot)
            eel.printprogress("Done")
            eel.progress_now(100)

            #store pcap file to pcap-files directory
            global pcap
            pcap = store_pcap.move_pcap("normal")

            send_res(results,'normal', lat, lon)

        except (websockets.exceptions.ConnectionClosed, websockets.exceptions.ConnectionClosedError) :
            print("connection closed")
            eel.alert_debug("Cannot connect to selected server. Please connect to a different server or try again later.")
            pass

async def r_to_l(lat, lon, cir):
    global server_ip
    traceroute(server_ip)

    results = []
    async with websockets.connect(ws_url, ping_timeout=600) as websocket:

        try:
            await websocket.send("reverse")
            eel.mode("Reverse Mode")

            #mtu test
            state = await websocket.recv()
            print(state)
            if state == "plpmtu started":
                eel.printprogress("PLPMTUD started")
                max_retr = 0
                while True:
                    p = subprocess.Popen(["sudo", "./plpmtu-reverse", "-p", "udp", "-s", server_ip + ":3002"])
                    #await websocket.send("plpmtu done")
                    state = await websocket.recv()
                    print(state)
                    if state == "mtu done":
                        eel.progress_now(100/6)
                        break
                    elif state == "mtu error":
                        print("Cannot perform PLPMTUD")
                        return

                    max_retr += 1
                    if max_retr >=5 :
                        print("Cannot perform PLPMTUD")
                        return

            #ping
            max_retr = 0
            while True:
                state = await websocket.recv()
                print(state)
                if state == "start ping":
                    eel.printprogress("Ping started")

                    p = subprocess.Popen(["python3", "udp-ping-client.py", server_ip])

                state = await websocket.recv()
                print(state)
                if state == "ping done":
                    eel.progress_now(100/6*2)
                    break
                elif state == "ping error":
                    print("Cannot perform Ping")
                    return

                max_retr += 1
                if max_retr >=5 :
                    print("Cannot perform PLPMTUD")
                    return

            max_retr = 0
            while True:
                #iperf udp and tcp mode
                state = await websocket.recv()
                print(state)
                if state == "iperf server started":
                    #UDP mode
                    eel.printprogress("iPerf UDP started")
                    ####ADD -b 100M#####
                    p = subprocess.Popen(["iperf3", "-c", server_ip, "-u", "-R", "-b", "1000M", "-t", "10", "-f", "m"], stdout = subprocess.PIPE)
                    p.wait()
                    await websocket.send("iperf udp done")

                elif state == "iPerf UDP done":
                    eel.progress_now(100/6*3)
                    break

                max_retr += 1
                if max_retr >=5 :
                    print("Cannot perform iPerf UDP")
                    return

            #TCP window scans

            #receive window sizes for results
            wnd_scan_res = []
            wnd_size = ["Window Size"]
            ave_tcp = ["Average TCP THPT"]
            ideal_tcp = ["Ideal TCP THPT"]
            wnd_eff = ["TCP Efficiency"]
            wnd_rtt = ["Average RTT"]
            wnd_graph = []

            for i in range(0,4):
                state = await websocket.recv()
                print(state)
                wnd_size.append(state)
                state = await websocket.recv()
                print(state)
                ideal_tcp.append(state)

            wnd_scan_res.append(wnd_size)

            #step 1 - 25%
            data_point = {}
            data_point["wnd_size"] = wnd_size[1]
            state = await websocket.recv()
            print(state)
            if "start iperf tcp" in state:
                rwnd = float(re.split(" ", state)[3])

                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-b", "1000M", "-w", str(rwnd)+"K", "-R", "-f", "m"], stdout = subprocess.PIPE)
                p.wait()
                await websocket.send("iperf tcp done")
                state = await websocket.recv()
                print(state)
                ave_tcp.append(state + "Mbits/s")
                data_point["actual"] = state
                temp = re.split(" ", ideal_tcp[1])[0]
                data_point["ideal"] = str("{0:.2f}".format(round(float(temp),2)))

                wnd_graph.append(data_point)

                state = await websocket.recv()
                print(state)
                wnd_eff.append(state)

                state = await websocket.recv()
                print(state)
                wnd_rtt.append(state)



            #step 2 - 50%
            data_point = {}
            data_point["wnd_size"] = wnd_size[2]
            state = await websocket.recv()
            print(state)
            if "start iperf tcp" in state:
                rwnd = float(re.split(" ", state)[3])

                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-b", "1000M", "-w", str(rwnd)+"K", "-R", "-f", "m"], stdout = subprocess.PIPE)
                p.wait()
                await websocket.send("iperf tcp done")
                state = await websocket.recv()
                print(state)
                ave_tcp.append(state + "Mbits/s")
                data_point["actual"] = state
                temp = re.split(" ", ideal_tcp[2])[0]
                data_point["ideal"] = str("{0:.2f}".format(round(float(temp),2)))

                wnd_graph.append(data_point)

                state = await websocket.recv()
                print(state)
                wnd_eff.append(state)

                state = await websocket.recv()
                print(state)
                wnd_rtt.append(state)


            #step 3 - 75%
            data_point = {}
            data_point["wnd_size"] = wnd_size[3]
            state = await websocket.recv()
            print(state)
            if "start iperf tcp" in state:
                rwnd = float(re.split(" ", state)[3])

                p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-b", "1000M", "-w", str(rwnd)+"K", "-R", "-f", "m"], stdout = subprocess.PIPE)
                p.wait()
                await websocket.send("iperf tcp done")
                state = await websocket.recv()
                print(state)
                ave_tcp.append(state + "Mbits/s")
                data_point["actual"] = state
                temp = re.split(" ", ideal_tcp[3])[0]
                data_point["ideal"] = str("{0:.2f}".format(round(float(temp),2)))

                wnd_graph.append(data_point)

                state = await websocket.recv()
                print(state)
                wnd_eff.append(state)

                state = await websocket.recv()
                print(state)
                wnd_rtt.append(state)

            data_point = {}
            data_point["wnd_size"] = wnd_size[4]
            max_retr = 0
            while True:
                state = await websocket.recv()
                print(state)
                if "start iperf tcp" in state:
                    rwnd = re.split(" ", state)[3]

                    #TCP mode - run for 5s to keep pcap small
                    eel.printprogress("iPerf TCP started")
                    p = subprocess.Popen(["iperf3", "-c", server_ip, "-t", "5", "-b", "1000M", "-w", rwnd+"K", "-R", "-f", "m"], stdout = subprocess.PIPE)
                    p.wait()
                    await websocket.send("iperf tcp done")

                    state = await websocket.recv()
                    print(state)
                    ave_tcp.append(state + "Mbits/s")
                    data_point["actual"] = state
                    temp = re.split(" ", ideal_tcp[4])[0]
                    data_point["ideal"] = str("{0:.2f}".format(round(float(temp),2)))
                    wnd_graph.append(data_point)

                    wnd_scan_res.append(ave_tcp)
                    wnd_scan_res.append(ideal_tcp)
                    

                elif "iPerf TCP done" in state:
                    eel.progress_now(100/6*4)
                    break

                max_retr += 1
                if max_retr >= 5:
                    print("Cannot perform iPerf TCP")
                    return
            
            state = await websocket.recv()
            print(state)
            if "Processing Efficiency" in state:
                eel.printprogress("Processing Efficiency")

            state = await websocket.recv()
            print(state)
            if "Cannot process TCP Efficiency" in state:
                print("Cannot process TCP Efficiency")
                return

            
            state = await websocket.recv()
            print(state)
            eel.printprogress("Processing Buffer Delay")
            eel.progress_now(100/6*5)

            state = await websocket.recv()
            print(state)
            if "Cannot process Buffer Delay" in state:
                print("Cannot process Buffer Delay")
                return

            file = open("hash.txt", "r")
            file.readline()
            region = file.readline()[:-1]
            serial = file.readline()
            file.close()
            await websocket.send(region)
            await websocket.send(serial)
            global pcap
            pcap = await websocket.recv()

            state = await websocket.recv()
            print(state)
            wnd_eff.append(state)

            state = await websocket.recv()
            print(state)
            wnd_rtt.append(state + " ms")

            wnd_scan_res.append(wnd_eff)
            wnd_scan_res.append(wnd_rtt)
            eel.create_table_remote_window(wnd_scan_res)

            eel.rev_wnd_scan_graph(wnd_graph)
            
            #print results
            eel.printlocal("CIR: " + cir)
            while True:
                line = await websocket.recv()
                print(line)
                results.append(line)
                eel.printremote(line)
                if "buffer" in line:
                    break

            #Receive speed plot and format to list of list for graph function
            speed_plot  = await websocket.recv()
            speed_plot  = speed_plot[1:-1]
            
            speed_plot_list = []
            for i in re.split("], ", speed_plot):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                speed_plot_list.append(temp_list)

            eel.rgraph(speed_plot_list)

            #efficiency
            await websocket.send("speed_plot received")

            reff_plot  = await websocket.recv()
            reff_plot = re.split(":", reff_plot)[1]
            reff_plot  = reff_plot[1:-2]
            print(reff_plot)

            
            reff_plot_list = []
            for i in re.split("], ", reff_plot):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                reff_plot_list.append(temp_list)


            #buffer delay
            await websocket.send("reff_plot received")
            rbuffer_plot  = await websocket.recv()
            rbuffer_plot = re.split(":", rbuffer_plot)[1]
            rbuffer_plot  = rbuffer_plot[1:-2]
            print(rbuffer_plot)

            rbuffer_plot_list = []
            for i in re.split("], ", rbuffer_plot):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                rbuffer_plot_list.append(temp_list)


            print("speed:" + str(speed_plot_list))
            eel.regraph(reff_plot_list)
            eel.rbgraph(rbuffer_plot_list)
            eel.printprogress("Done")
            eel.progress_now(100)

            send_res(results,'reverse', lat, lon)
            
        except websockets.exceptions.ConnectionClosed:
            print("connection closed")
            eel.alert_debug("Cannot connect to selected server. Please connect to a different server or try again later.")
            pass

async def simultaneous(lat, lon, cir):
    global server_ip
    traceroute(server_ip)

    results = []
    results_reverse = []
    async with websockets.connect(ws_url, ping_timeout=600) as websocket:
        try:
            await websocket.send("simultaneous")
            eel.mode("Simultaneous Mode")

            #mtu test
            state = await websocket.recv()
            print(state)
            if state == "plpmtu started":
                eel.printprogress("PLPMTUD started")

                max_retr = 0
                while True:
                    p = subprocess.Popen(["sudo", "./plpmtu", "-p", "udp", "-s", server_ip+":3002"], stdout = subprocess.PIPE)
                    for line in p.stdout:
                        temp = line.decode("utf-8")
                        if "PLPMTUD" in temp:
                            mtu = re.split(" ", temp)[3]
                            results.append("Path MTU: " + mtu)

                    max_retr += 1
                    if max_retr >=5:
                        print("Cannot perform PLPMTUD")
                        return

                    try:
                        if results[0]:
                            break
                    except IndexError:
                        pass

                await websocket.send("plpmtu done")

            #mtu reverse mode
            state = await websocket.recv()
            print(state)
            if state == "plpmtu_reverse started":
                eel.printprogress("PLPMTUD started")
                max_retr = 0
                while True:
                    p = subprocess.Popen(["sudo", "./plpmtu-reverse", "-p", "udp", "-s", server_ip+":3002"])

                    state = await websocket.recv()
                    print(state)

                    if state == "mtu done":
                        break
                    elif state == "mtu error":
                        print("Cannot perform reverse PLPMTUD")
                        return

                    max_retr += 1
                    if max_retr >= 5:
                        print("Cannot perform reverse PLPMTUD")
                        return

                    #await websocket.send("plpmtu_reverse done")

            eel.progress_now(100/6)
            #ping
            #state = await websocket.recv()
            #print(state)
            #if state == "mtu done":
            eel.printprogress("Ping started")
            #####ADD -b 1000M AFTER DEBUGGING#######
            max_retr = 0
            while True:
                p = subprocess.Popen(["ping", server_ip, "-c", "10"], stdout = subprocess.PIPE)
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    if "avg" in temp:
                        rtt = re.split(" ", temp)[3]
                        ave_rtt = re.split("/", rtt)[2]
                        results.append("Baseline RTT: " + ave_rtt + " ms")
                    
                max_retr += 1
                if max_retr >= 5:
                    print("Cannot perform Ping")
                    return

                try:
                    if results[1]:
                        break
                except IndexError:
                    pass

            await websocket.send("ping done")

            
            #ping reverse
            max_retr = 0
            while True:
                state = await websocket.recv()
                print(state)
                if state == "start ping":
                    eel.printprogress("Ping started")
                    p = subprocess.Popen(["python3", "udp-ping-client.py", server_ip])

                state = await websocket.recv()
                print(state)
                if state == "ping done":
                    break
                elif state == "ping error":
                    print("Cannot perform reverse Ping")
                    return

                max_retr += 1
                if max_retr >= 5:
                    print("Cannot perform reverse Ping")
                    return

            eel.progress_now(100/6*2)
            
            #iperf
            eel.printprogress("iPerf UDP started")
            max_retr = 0
            while True:
                state = await websocket.recv()
                print(state)
                if state == "iperf udp started":
                    command = [
                        'iperf3 -c ' + server_ip + ' -p 4001 -u -b 1000M -f m',
                        'iperf3 -c ' + server_ip + ' -p 4002 -u -b 1000M -R -f m'
                    ]

                    process = [subprocess.Popen(cmd, shell = True, stdout = subprocess.PIPE) for cmd in command]
                    for p in process:
                        p.wait()

                    await websocket.send("iperf udp done")

                    udp_res = []
                    flag = 0
                    for line in process[0].stdout:
                        temp = line.decode("utf-8")
                        if "Jitter" in temp:
                            flag = 1
                            continue
                        if flag == 1:
                            entries = re.findall(r'\S+',temp)

                            #check if test ran in 10s
                            timecheck = float(re.split("-",entries[2])[1])
                            if timecheck < 10:
                                print("iPerf UDP incomplete")
                                break

                            bb = entries[6]
                            udp_res.append("Bottleneck Bandwidth: " + bb + " Mbits/sec")
                            bdp = (float(re.split(" ", results[1])[2]) /1000) * (float(bb)* 1000000)
                            udp_res.append("BDP: " + str(bdp) + " bits")
                            normal_wnd_size = bdp/8 / 1000
                            udp_res.append("Min RWND: " + str(normal_wnd_size) + " Kbytes")
                            break

                    #accept results if reading is valid
                    state = await websocket.recv()
                    print(state)
                    if ("udp success" in state) and udp_res:
                        await websocket.send("udp success")
                        for i in udp_res:
                            results.append(i)
                        break

                    else:
                        await websocket.send("udp fail")

                max_retr += 1
                if max_retr >= 5:
                    print("Cannot perform iPerf UDP")
                    return

            await websocket.send("send rwnd")
            state = await websocket.recv()
            print(state)
            if "rwnd" in state:
                eel.printprogress("iPerf TCP started")
                reverse_wnd_size = re.split(": ",state)[1]

                command = [
                    'iperf3 -c ' + server_ip + ' -p 4001 -t 5 -w ' + str(normal_wnd_size) + 'K -f m',
                    'iperf3 -c ' + server_ip + ' -p 4002 -t 5 -w ' + reverse_wnd_size + 'K -R -f m', 
                ]

                max_retr = 0
                while True:
                    state = await websocket.recv()
                    if state == "start tcp":
                        if os.path.exists("testresults.pcapng"):
                            os.remove("testresults.pcapng")

                        t = subprocess.Popen(["tshark", "-w", "testresults.pcapng"])
                        await asyncio.sleep(3)

                        process = [subprocess.Popen(cmd, shell = True, stdout = subprocess.PIPE, preexec_fn = os.setsid) for cmd in command]

                        process[0].wait()

                        t.kill()

                        await websocket.send("iperf tcp done")

                        speed_plot = []
                        tcp_res = []
                        for line in process[0].stdout:
                            temp = line.decode("utf-8")
                            if "sender" in temp:
                                entries = re.findall(r'\S+',temp)

                                #check if test ran in 10s
                                timecheck = float(re.split("-",entries[2])[1])
                                if timecheck < 5:
                                    print("iPerf TCP incomplete")
                                    break

                                tcp_res.append("Average TCP Throughput: " + entries[6] + " Mbits/s")

                                mtu = int(re.split(" ", results[0])[2])
                                ideal_throughput = (normal_wnd_size * 8 / (float(re.split(" ", results[1])[2])/1000))/1000
                                tcp_res.append("Ideal TCP Throughput: " + str(ideal_throughput) + " Mbits/s")
                                
                                temp2 = re.split("-",entries[2])
                                actual = float(temp2[1])
                                tcp_res.append("Actual Transfer Time: " + str(actual))
                                            
                                ideal = float(entries[4]) * 8 / ideal_throughput
                                tcp_res.append("Ideal Transfer Time: " + str(ideal))
                                        
                                ttr = actual / ideal
                                tcp_res.append("TCP TTR: " + str(ttr))

                            elif "KBytes" in temp:
                                entries = re.findall(r'\S+',temp)
                                x_axis = re.split("-",entries[2])
                                x_axis = int(float(x_axis[1]))
                                speed_plot.append([x_axis,float(entries[6])])

                    #accept results if reading is valid
                    state = await websocket.recv()
                    print(state)
                    if ("tcp success" in state) and tcp_res:
                        await websocket.send("tcp success")
                        for i in tcp_res:
                            results.append(i)
                        break

                    else:
                        await websocket.send("tcp fail")

                    max_retr += 1
                    if max_retr >= 5:
                        print("Cannot perform iPerf TCP")
                        return

            eel.progress_now(100/6*4)
            #TCP Efficiency Processing... takes some time
            print("Processing Efficiency")
            #subprocess.Popen(["sudo", "chmod", "777", "testresults.pcapng"])
            eel.printprogress("Processing Efficiency")
            max_retr = 0
            while True:
                p = subprocess.Popen(["python3", "scapy-tcp-eff-expt2.py", "testresults.pcapng", client_ip], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                p.wait()
                for line in p.stdout:
                    temp = line.decode("utf-8")

                    if "plot" in temp:
                        temp = re.split(":", temp)[1]
                        temp = temp[1:-2]

                        neff_plot = []
                        for i in re.split("], ", temp):
                            temp_list = re.split(", ", i[1:-1])
                            temp_list[0] = int(temp_list[0])
                            temp_list[1] = float(temp_list[1])

                            neff_plot.append(temp_list)
                    else:
                        results.append(temp)

                max_retr += 1
                if max_retr >=5:
                    print("Cannot Process PCAP efficiency")
                    return

                try:
                    if results[10] and results[11] and results[12]:
                        break
                except IndexError:
                    pass

            ###check if reverse also success
            await websocket.send("send eff status")
            state = await websocket.recv()
            print(state)
            if "eff fail" in state:
                print("Cannot process reverse TCP efficiency")
                return

            eel.progress_now(100/6*5)
            #Buffer Delay Processing... takes some time
            print("Processing Buffer Delay")
            eel.printprogress("Processing Buffer Delay")
            max_retr = 0
            while True:
                p = subprocess.Popen(["python3", "buffer-delay.py", "testresults.pcapng", client_ip, server_ip, re.split(" ", results[1])[2]], stdout = subprocess.PIPE, stderr = subprocess.PIPE)
                for line in p.stdout:
                    temp = line.decode("utf-8")
                    if "plot" in temp:
                        temp = re.split(":", temp)[1]
                        temp = temp[1:-2]
                        print(temp)

                        nbuffer_plot = []
                        for i in re.split("], ", temp):
                            temp_list = re.split(", ", i[1:-1])
                            temp_list[0] = int(temp_list[0])
                            temp_list[1] = float(temp_list[1])

                            nbuffer_plot.append(temp_list)
                    else:
                        results.append(temp)

                max_retr += 1
                if max_retr >= 5:
                    print("Cannot process Buffer Delay")
                    return
                    
                try:
                    if results[13] and results[14]:
                        break
                except IndexError:
                    pass

            ###check if reverse also success
            await websocket.send("send buffer status")
            state = await websocket.recv()
            print(state)
            if "buffer fail" in state:
                print("Cannot process reverse Buffer Delay")
                return

            #store pcap file to pcap-files directory
            global pcap
            pcap = store_pcap.move_pcap("sim")

            file = open("hash.txt", "r")
            file.readline()
            region = file.readline()[:-1]
            serial = file.readline()
            file.close()
            await websocket.send(region)
            await websocket.send(serial)
            await websocket.recv()

            #show all results
            for line in results:
                print(line)
                eel.printlocal(line)

            eel.lgraph(speed_plot)
            eel.legraph(neff_plot)
            eel.lbgraph(nbuffer_plot)


            eel.printprogress("Receiving reverse mode results")
            await websocket.send("send results")

            while True:
                line = await websocket.recv()
                print(line)
                
                results_reverse.append(line)
                eel.printremote(line)
                if "buffer" in line:
                    break

            #Receive speed plot and format to list of list for graph function
            await websocket.send("bandwidth")
            speed_plot_reverse  = await websocket.recv()
            speed_plot_reverse  = speed_plot_reverse[1:-1]
            print(speed_plot_reverse)

            speed_plot_list = []
            for i in re.split("], ", speed_plot_reverse):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                speed_plot_list.append(temp_list)



            #efficiency
            await websocket.send("speed_plot received")
            reff_plot  = await websocket.recv()
            reff_plot = re.split(":", reff_plot)[1]
            reff_plot  = reff_plot[1:-2]
            print(reff_plot)

            
            reff_plot_list = []
            for i in re.split("], ", reff_plot):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                reff_plot_list.append(temp_list)

            #buffer delay
            await websocket.send("reff_plot received")
            rbuffer_plot  = await websocket.recv()
            rbuffer_plot = re.split(":", rbuffer_plot)[1]
            rbuffer_plot  = rbuffer_plot[1:-2]
            print(rbuffer_plot)

            rbuffer_plot_list = []
            for i in re.split("], ", rbuffer_plot):
                temp_list = re.split(", ", i[1:-1])
                temp_list[0] = int(temp_list[0])
                temp_list[1] = float(temp_list[1])

                rbuffer_plot_list.append(temp_list)


            eel.rgraph(speed_plot_list)
            eel.regraph(reff_plot_list)
            eel.rbgraph(rbuffer_plot_list)
            eel.printprogress("Done")
            eel.progress_now(100)

            send_res([results,results_reverse],'simultaneous', lat, lon)

        except websockets.exceptions.ConnectionClosed:
            print("connection closed")
            eel.alert_debug("Cannot connect to selected server. Please connect to a different server or try again later.")
            pass

eel.start('hello.html', size=(1100,600), port=8080)             # Start (this blocks and enters loop)
