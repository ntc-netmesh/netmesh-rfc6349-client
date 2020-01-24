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
import queue_process
from constants import NORMAL_MODE, REVERSE_MODE

import ADB


# Set web files folder and optionally specify which file types to check for eel.expose()
#   *Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])

@eel.expose
def retrieve_servers():
    response = requests.get("https://sago-gulaman.xyz/api/servers/")
    server_list = response.json()
    index=0
    for i in server_list:
        print(i["nickname"])
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

#Verify test agent user login
@eel.expose
def login(username,password):
    # global dev_hash
    # read_hash()
    # hash_data = {
    #     "hash": dev_hash
    # }

    # try:
    #     # Request for Agent token
    #     r = requests.post(url=url+"/api/gettoken", data=hash_data, auth = (username, password))
    # except Exception as e:
    #     print(e)

    # if r.status_code == 401:
    #     print("Exiting due to status code %s: %s" % (r.status_code, r.text))
    #     eel.alert_debug("Invalid username/password!")
    #     return
    # elif r.status_code == 400:
    #     print("Exiting due to status code %s: %s" % (r.status_code, r.text))
    #     eel.alert_debug("Device not registered. Please register the device using new_dev_reg")
    #     return
    # elif r.status_code != 200:
    #     print("Exiting due to status code %s: %s" % (r.status_code, r.text))
    #     eel.alert_debug("Error occured")
    #     return

    # global token
    # token = ast.literal_eval(r.text)['Token']
    # print(token)
    eel.hide_login()

#Verify if laptop is registered.
def read_hash():
    if os.path.exists("hash.txt"):
        file = open("hash.txt","r")
        global dev_hash
        dev_hash = file.readline()[:-1]
        print(dev_hash)
        global region
        region = file.readline()[:-1]
        print(region)
        file.close()
        return True
    else:
        print("error")
        eel.alert_debug("Device not registered! Please register the device before using.")
    return False

#CHANGE THIS
def parse_results(results,direction):
    for i in results:
        if "MTU" in i:
            mtu = results["MTU"]

        elif "Baseline" in i:
            base_rtt = results["RTT"]

        elif "Bottleneck" in i:
            bb = results["BB"]

        elif "BDP" in i:
            bdp = results["BDP"]

        elif "RWND" in i:
            rwnd = results["RWND"]

        elif "Average TCP Throughput" in i:
            tcp_tput = results["THPT_AVG"]

        elif "Ideal TCP Throughput" in i:
            ideal_tput = results["THPT_IDEAL"]

        elif "Actual Transfer" in i:
            att = results["TRANSFER_AVG"]

        elif "Ideal Transfer" in i:
            itt = results["TRANSFER_IDEAL"]

        elif "TTR" in i:
            ttr = results["TCP_TTR"]

        elif "Transmitted Bytes" in i:
            trans_bytes = results["TRANS_BYTES"]

        elif "Retransmitted" in i:
            retrans_bytes = results["RETX_BYTES"]

        elif "Efficiency" in i:
            eff = results["TCP_EFF"]

        elif "ave RTT" in i:
            ave_rtt = results["AVE_RTT"]

        elif "buffer delay" in i:
            buff_delay = results["BUF_DELAY"]

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

#Send test results to results server
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
lat = ""
lon = ""

###set ip here####
client_ip = ""
p = subprocess.Popen(["hostname", "-I"], stdout = subprocess.PIPE)
for line in p.stdout:
    client_ip = re.split(" ", line.decode("utf-8"))[0]
    break

#Assign location from javascript call
def set_location(x,y):
    global lat
    lat = x
    global lon
    lon = y

#CATCH JS CALL FOR NORMAL MODE
@eel.expose 
def normal(lat, lon, cir, serv_ip, network_type):
    print("normal mode")

    eel.printnormal({
        'MTU': 1500,
        'RTT': 9.534,
        'BB': 94.5,
        'BDP': 900963.0000000001,
    })

    return

    # for i in range(1, 7):
    #     if i == 1:
    #         eel.printprogress("Performing PLPMTUD...")
    #     elif i == 2:
    #         eel.printprogress("Measuring Ping...")
    #     elif i == 3:
    #         eel.printprogress("Executing iPerf UDP...")
    #     elif i == 4:
    #         eel.printprogress("Executing iPerf TCP...")
    #     elif i == 5:
    #         eel.printprogress("Measuring TCP Efficiency...")
    #     elif i == 6:
    #         eel.printprogress("Measuring Buffer Delay...")

    #     time.sleep(3)
    #     eel.progress_now(100/6*i)

    # eel.printprogress("Done")
    # eel.progress_now(100)

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    
    global server_ip
    server_ip = ip[0]

    global net_type
    net_type = network_type

    global ws_url
    ws_url = "ws://" + server_ip + ":3001"

    set_location(lat, lon)

    #####CALL NORMAL MODE HERE#####
    global dev_hash
    results = queue_process.join_queue(NORMAL_MODE, server_ip, dev_hash)
    eel.printnormal(results[0][0])
    #CALL eel.printlocal(text) TO ADD RESULT TO TEXTAREA IN APP#

#CATCH JS CALL FOR REVERSE MODE
@eel.expose 
def rev(lat, lon, cir, serv_ip, network_type):
    print("reverse mode")

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    global server_ip
    server_ip = ip[0]
    global net_type
    net_type = network_type

    global ws_url
    ws_url = "ws://" + server_ip + ":3001"
    
    set_location(lat, lon)

    #####CALL REVERSE MODE HERE#####
    #results = queue_process.join_queue(REVERSE_MODE, server_ip)
    global dev_hash
    results = queue_process.join_queue(REVERSE_MODE, server_ip, dev_hash)
    eel.printreverse(results)
    #CALL eel.printremote(text) TO ADD RESULT TO TEXTAREA IN APP#

#CATCH JS CALL FOR SIMULTANEOUS MODE
@eel.expose 
def sim(lat, lon, cir, serv_ip, network_type):
    print("simultaneous mode")

    ip = re.split(",", serv_ip)
    global server_uuid
    server_uuid = ip[1]
    global server_ip
    server_ip = ip[0]
    global net_type
    net_type = network_type

    global ws_url
    ws_url = "ws://" + server_ip + ":3001"
    
    set_location(lat, lon)

    #####CALL SIMULTANEOUS MODE HERE#####
    #CALL eel.printlocal(text) TO ADD RESULT TO LOCAL TEXTAREA IN APP#
    #CALL eel.printremote(text) TO ADD RESULT TO REMOTE TEXTAREA IN APP#

#TRACEROUTE FUNCTION. REPLACE?
def traceroute(server_ip):
    p = subprocess.Popen(["traceroute", server_ip], stdout = subprocess.PIPE)
    p.wait()

    hop_num = 0
    hop = {}
    for line in p.stdout:
        temp = line.decode("utf-8")
        if hop_num >= 1:
            entries = re.findall(r'\S+',temp)

            curr_hop = entries[0]

            for i in range(1,4):
                if "(" in entries[i]:
                    ip_add = entries[i][1:-1]
                    ip_name = entries[i-1]

            ping = []
            for i in range(3,len(entries)):
                if "ms" in entries[i]:
                    ping.append(float(entries[i-1]))

            route = {}
            route["hostip"] = ip_add
            route["hostname"] = ip_name
            for ix, i in enumerate(ping):
                route["t"+str(ix+1)] = i

            hop[curr_hop] = route
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
        quit()

@eel.expose
def get_gps_from_android():
    print("coordinates")
    coordinates = ADB.getRawGpsCoordinates()
    print(coordinates)
    eel.set_gps_from_android(coordinates[0], coordinates[1])

#CATCH CANCEL CALL FROM JS. NOT FULLY WORKING
global flag
flag = 0
@eel.expose
def cancel_test():
    print("in")
    global flag
    flag = 1

eel.start('login.html', size=(1024,768), port=8080)             # Start (this blocks and enters loop)
