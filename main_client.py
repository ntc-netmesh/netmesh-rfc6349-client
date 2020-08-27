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

import time
import ADB
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

# Set web files folder and optionally specify which file types to check for eel.expose()
#   *Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])

queue_place_path = './tempfiles/queue/queue_place'

# Declaration of watchdog event handler
patterns = "*"
ignore_patterns = ""
ignore_directories = False
case_sensitive = True
queue_place_event_handler = PatternMatchingEventHandler(patterns, ignore_patterns, ignore_directories, case_sensitive)

path = "./tempfiles/queue"
go_recursively = False

def on_created(event):
    print("hey, {} has been created!".format(event.src_path))

def on_deleted(event):
    print(f"what the f**k! Someone deleted {event.src_path}!")

def on_modified(event):
    print(f"hey buddy, {event.src_path} has been modified")

    if (event.src_path.split('/')[-1].startswith('.goutputstream')):
        return

    print("aa")
    f = open(event.src_path + "/queue_place", "r")
    f_content = f.read()
    print("content:" + str(f_content))
    global current_queue_place
    current_queue_place = int(f_content)

    if current_queue_place > 0:
        eel.set_queue(current_queue_place)
        print("set queue place to " + str(current_queue_place))
    else:
        eel.close_queue_dialog()
        eel.start_test(test_mode)
        print("queue dialog closed")

        queue_place_observer.stop()
        # queue_place_observer.join()
        

def on_moved(event):
    print(f"ok ok ok, someone moved {event.src_path} to {event.dest_path}")

queue_place_event_handler.on_modified = on_modified
global queue_place_observer
queue_place_observer = None

global current_queue_place
current_queue_place = 0

global test_mode
test_mode = ""

@eel.expose
def retrieve_servers():
    # server_list = []
    response = requests.get("https://netmesh.pregi.net/api/servers/")
    server_list = response.json()
    # index=0
    # for i in server_list:
    #     print(i["nickname"])
    #     if (i["test_method"] == "2"):
    #         location = " - " + i["city"] + ", " + i["province"] + ", "  + i["country"]
    #         eel.add_server(i["nickname"]+location,i["ip_address"] + "," +  i["uuid"])
    eel.add_servers(server_list)

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
url = "https://netmesh.pregi.net"
global server_uuid
server_uuid = ""
global current_username
current_username = ""
global is_results_already_sent
is_results_already_sent = False

#Verify test agent user login
@eel.expose
def login(username, password):
    eel.disable_login_form()

    global current_username
    current_username = username
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
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.enable_login_form()
        eel.alert_debug("Invalid username/password!")
        return
    elif r.status_code == 400:
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.enable_login_form()
        eel.alert_debug("Device not registered. Please register the device using new_dev_reg")
        return
    elif r.status_code != 200:
        print("Exiting due to status code %s: %s" % (r.status_code, r.text))
        eel.enable_login_form()
        eel.alert_debug("Error occured")
        return

    global token
    token = ast.literal_eval(r.text)['Token']
    print("user-token")
    print(token)

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
@eel.expose
def parse_results(results,direction):
    mtu = base_rtt = bb = bdp = rwnd = tcp_tput = ideal_tput = att = itt = ttr = trans_bytes = retrans_bytes = eff = ave_rtt = buff_delay = None

    # print(results)
    # print('results.keys()')
    # print(results.keys())
    # for i in results:

    if "MTU" in results.keys():
        mtu = results["MTU"]

    if "RTT" in results.keys():
        base_rtt = results["RTT"]

    if "BB" in results.keys():
        bb = results["BB"]

    if "BDP" in results.keys():
        bdp = results["BDP"]

    if "ACTUAL_RWND" in results.keys():
        rwnd = results["ACTUAL_RWND"]

    if "THPT_AVG" in results.keys():
        tcp_tput = results["THPT_AVG"]

    if "THPT_IDEAL" in results.keys():
        ideal_tput = results["THPT_IDEAL"] / 1.2

    if "TRANSFER_AVG" in results.keys():
        att = results["TRANSFER_AVG"]

    if "TRANSFER_IDEAL" in results.keys():
        itt = results["TRANSFER_IDEAL"]

    if "TCP_TTR" in results.keys():
        ttr = results["TCP_TTR"]

    if "TRANS_BYTES" in results.keys():
        trans_bytes = results["TRANS_BYTES"]

    if "RETX_BYTES" in results.keys():
        retrans_bytes = results["RETX_BYTES"]

    if "TCP_EFF" in results.keys():
        eff = round(results["TCP_EFF"] * 100, 2)

    if "AVE_RTT" in results.keys():
        ave_rtt = round(results["AVE_RTT"], 2)

    if "BUF_DELAY" in results.keys():
        buff_delay = results["BUF_DELAY"] * 100

    data = {
        "ts": pytz.utc.localize(datetime.utcnow()),   # TODO: add timezone information, or assume that clients will always send in UTC
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


    # print('data-results')
    # print(data)

    return data

#Send test results to results server
@eel.expose
def send_res(results, mode, lat, lon):
    global is_results_already_sent
    if is_results_already_sent:
        return

    eel.show_sending_results_toast()
    if mode == 'normal':
        res = {
            "set1": parse_results(results[0],'forward'),
        }
    elif mode =='reverse':
        res = {
            "set1": parse_results(results[0],'reverse'),
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

    print("headers")
    print(headers)

    print("data_json")
    print(data_json)

    r = None
    try:
        r = requests.post(url+"/api/submit",
                          headers=headers,
                          data=data_json,
                          timeout=30)
    except Exception as e:
        print("ERROR: %s." % e)

    if r is not None and hasattr(r, "status_code") and r.status_code == 200:
        eel.set_show_sending_results_toast_status(True)
        is_results_already_sent = True
        print("Submit success!")
    else:
        eel.set_show_sending_results_toast_status(False)
        print("Exiting due to status code %s: %s" % (r.status_code if hasattr(r, "status_code") else "(no status code)", r.text if hasattr(r, "text") else "(no text)"))


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

@eel.expose
def check_queue(mode):
    global test_mode
    test_mode = mode
    print("mode:")
    print(test_mode)

    f = open(queue_place_path, "r")
    f_content = f.read()
    print("content:" + str(f_content))
    global current_queue_place
    if (str(f_content).isdigit()):
        current_queue_place = int(f_content)
    else:
        try:
            current_queue_place = int(f_content)
        except:
            current_queue_place = f_content


    if current_queue_place != "CURRENT_TURN":
        eel.set_queue(current_queue_place)
        eel.open_queue_dialog()
        
        global queue_place_observer
        queue_place_observer = None
        queue_place_observer = Observer()
        queue_place_observer.schedule(queue_place_event_handler, path, recursive=go_recursively)
        queue_place_observer.start()
        # queue_place_observer.join()
        
        print("queue_place_observer started")
    else:
        eel.start_test(test_mode)
        print("no queue")

#CATCH JS CALL FOR NORMAL MODE
@eel.expose 
def normal(lat, lon, cir, serv_ip, network_type):
    print("normal mode")
    print(lat)
    print(lon)
    print(cir)
    print(serv_ip)
    print(network_type)

    global is_results_already_sent
    is_results_already_sent = False

    ip = re.split(",", serv_ip)
    if ip is not None:
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
    print("hash: {}\n".format(dev_hash))
    successful_result = False
    try:
        results = queue_process.join_queue(NORMAL_MODE, server_ip, dev_hash, cir)
        if results is not None and results[0][0] is not None:
            eel.printnormal(results[0][0])
            successful_result = True
        else:
            eel.print_test_error("An unexpected error occurred.\nPlease select the test mode again, or refresh this app by pressing F5.")
    except error as Exception:
        eel.print_test_error(error)

    eel.progress_now(100, "true")
    eel.printprogress("Done")

    if successful_result:
        send_res(results[0], 'normal', lat, lon)
    #CALL eel.printlocal(text) TO ADD RESULT TO TEXTAREA IN APP#

#CATCH JS CALL FOR REVERSE MODE
@eel.expose 
def rev(lat, lon, cir, serv_ip, network_type):
    print("reverse mode")

    global is_results_already_sent
    is_results_already_sent = False

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
    print("hash: {}\n".format(dev_hash))
    successful_result = False
    try:
        results = queue_process.join_queue(REVERSE_MODE, server_ip, dev_hash, cir)
        if results is not None and results[0][0] is not None:
            print("RESULTS DOWNLOAD: {}".format(results[0][0]))
            eel.printreverse(results[0][0])
            successful_result = True
        else:
            eel.print_test_error("An unexpected error occurred.\nPlease select the test mode again, or refresh this app by pressing F5.")
    except error as Exception:
        eel.print_test_error(error)

    eel.printprogress("Done")
    eel.progress_now(100, "true")

    if successful_result:
        send_res(results[0], 'reverse', lat, lon)
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
    try:
        coordinates = ADB.getRawGpsCoordinates()
        print(coordinates)
        if coordinates is None:
            eel.set_gps_from_android(None, None)
            return

        eel.set_gps_from_android(coordinates[0], coordinates[1])

    except Exception as e:
        print(e)
        eel.set_gps_from_android(None, None)


#CATCH CANCEL CALL FROM JS. NOT FULLY WORKING
global flag
flag = 0
@eel.expose
def cancel_test():
    print("in")
    global flag
    flag = 1

@eel.expose
def leave_queue():
    print('left queue')
    global current_queue_place
    current_queue_place = -1

    queue_place_observer.stop()
    # queue_place_observer.join()

def close():
    # print("babay")
    pass

@eel.expose
def set_current_username():
    global current_username
    global region
    eel.set_current_username(current_username, region)

eel.start('login.html', size=(1024,768), port=8080, close_callback=close)             # Start (this blocks and enters loop)
