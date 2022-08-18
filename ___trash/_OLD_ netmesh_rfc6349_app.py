from asyncio.log import logger
from datetime import datetime
import sys
import os
import subprocess
import uuid
import socket
import nmap

import requests
import json
import hashlib
import math
import configparser

import folium

import tkinter

if getattr(sys, 'frozen', False):
    import pyi_splash

from flask import Flask, Response, render_template, request, redirect, url_for, abort, session, jsonify

import netmesh_rfc6349_app.main.wrappers as wrappers
import user_auth
import netmesh_rfc6349_app.main.utils.log_settings as log_settings
import netmesh_rfc6349_app.main.utils.pysideflask_ext as pysideflask_ext

import netmesh_constants
import netmesh_rfc6349_app.main.utils.netmesh_location as netmesh_location
import netmesh_utils

from netmesh_config import NetMeshConfig

RESULTS_SERVER_API_URL = "http://202.90.159.48/api"

running_on_desktop = False

if getattr(sys, 'frozen', False):
    template_folder = netmesh_utils.resource_path('templates')
    static_folder = netmesh_utils.resource_path('static')
    app = Flask(__name__,
                template_folder=template_folder,
                static_folder=static_folder)
else:
    app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)

# ----------------------------------------------------------------
# STORED VALUES IN LAPTOP
# ----------------------------------------------------------------


def get_device_name():
    config = NetMeshConfig()
    device_config = config.load_device_config()
    
    return device_config.get_device_name()

# ----------------------------------------------------------------
# PAGES
# ----------------------------------------------------------------


@app.route('/')
def index_page():
    print("Check if app is already running on desktop")

    if running_on_desktop == True:
        return "This app is already running on desktop."

    if 'api_session_token' in session and session['api_session_token'] and 'username' in session and session['username']:
        return redirect(url_for('home_page'))

    config = NetMeshConfig()
    device_config = config.load_device_config()
    
    device_name = device_config.get_device_name()
    if not device_name:
        return register_device_page()

    return login_page()


@app.route('/login')
def login_page():
    config = NetMeshConfig()
    users_config = config.load_users_config()
    
    return render_template('login.html',
                           logged_users=users_config.get_logged_users(),
                           app_version=netmesh_constants.app_version,
                           ubuntu_version=netmesh_utils.get_ubuntu_version(),
                           device_name=get_device_name())

@app.route('/check-user-token', methods=['POST'])
def check_user_token():
    token = request.args.get('user-token')
    if token:
        #check if expired
        session['access-token'] = token
        return redirect(url_for('home_page'))
    else:
        return 
        #ilabas yung popup page

@app.route('/register-device')
def register_device_page():
    session['admin-token'] = None
    return render_template('register_device.html',
                           device_info=netmesh_utils.get_device_info())


@app.route('/home')
@wrappers.require_api_token
def home_page():
    return render_template('home.html', username=session['username'], app_version=netmesh_constants.app_version)


@app.route('/report-data', methods=['POST'])
def report_data():
    server_name = request.form['serverName']
    isp = request.form['isp']
    started_on = request.form['startedOn']
    finished_on = request.form['finishedOn']
    duration = request.form['duration']
    username = session['username']
    methods = json.loads(request.form['methods'])

    results = {}
    for d in methods:
        results[d] = json.loads(session[d+'_test_results'])

    return json.dumps({
        "test_inputs": {
            "mode": session['test_details-mode'],
            "isr": session['test_details-isr'],
            "net": session['test_details-net'],
            "serverName": server_name,
            "lon": session['test_details-lon'],
            "lat": session['test_details-lat'],
        },
        "test_time": {
            "startedOn": started_on,
            "finishedOn": finished_on,
            "duration": duration,
        },
        "test_client": {
            "username": username,
            "userId": results[methods[0]]['userid'],
            "isp": isp
        },
        "results": results,
    })


@app.route('/report', methods=['POST'])
def report():
    server_name = request.form['serverName']
    started_on = request.form['startedOn']
    finished_on = request.form['finishedOn']
    duration = request.form['duration']
    generated_on = request.form['generatedOn']
    username = session['username']
    methods = json.loads(request.form['methods'])

    results = {}
    for d in methods:
        results[d] = json.loads(session[d+'_test_results'])

    return render_template('report.html',
                           app_version=netmesh_constants.app_version,
                           isr=session['test_details-isr'],
                           net=session['test_details-net'],
                           server_name=server_name,
                           mode=session['test_details-mode'],
                           lon=session['test_details-lon'],
                           lat=session['test_details-lat'],
                           started_on=started_on,
                           finished_on=finished_on,
                           duration=duration,
                           methods=methods,
                           directions_text=json.dumps(methods),
                           results=results,
                           username=username,
                           generated_on=generated_on
                           )

    # isr = 35
    # net = "Ethernet"
    # mode = "bidirectional"
    # lon = 14
    # lat = 121
    # server_name = "Sample server"
    # started_on = "2022-01-01 01:14:23"
    # finished_on = "2022-01-01 01:15:52"
    # duration = "1m 29s"
    # methods=["upload", "download"]
    # generated_on = "2022-01-01 01:19:44"
    # username = "sample_user"
    # results = {
    #   "download": {
    #     "ave_rtt": 0,
    #     "bb": 45.2,
    #     "bdp": 358119,
    #     "buf_delay": 0,
    #     "mtu": 1500,
    #     "retx_bytes": 0,
    #     "rtt": 7.923,
    #     "rwnd": 44,
    #     "tcp_eff": 0,
    #     "tcp_ttr": 0.856164383562,
    #     "thpt_avg": 42.8,
    #     "thpt_ideal": 35,
    #     "transfer_avg": 10,
    #     "transfer_ideal": 11.68,
    #     "tx_bytes": 0,
    #   },
    #   "upload": {
    #     "ave_rtt": 0,
    #     "bb": 42.5,
    #     "bdp": 334942,
    #     "buf_delay": 0,
    #     "mtu": 1500,
    #     "retx_bytes": 0,
    #     "rtt": 7.881,
    #     "rwnd": 41,
    #     "tcp_eff": 0,
    #     "tcp_ttr": 0.891038696538,
    #     "thpt_avg": 41.2,
    #     "thpt_ideal": 35,
    #     "transfer_avg": 10,
    #     "transfer_ideal": 11.2228571429,
    #     "tx_bytes": 0,
    #   }
    # }

    # return render_template('report.html',
    #                        app_version=netmesh_config.APP_VERSION,
    #                        isr=isr,
    #                        net=net,
    #                        server_name=server_name,
    #                        mode=mode,
    #                        lon=lon,
    #                        lat=lat,
    #                        started_on=started_on,
    #                        finished_on=finished_on,
    #                        duration=duration,
    #                        methods=methods,
    #                        directions_text=json.dumps(methods),
    #                        results=results,
    #                        username=username,
    #                        generated_on=generated_on
    #                       )


# ----------------------------------------------------------------
# UI COMPONENTS
# ----------------------------------------------------------------
@app.route('/map-snippet-data', methods=['POST'])
def map_snipper_data():
    lat = request.form['lat']
    lon = request.form['lon']

    coords = (lat, lon)
    map = folium.Map(
        location=coords,
        zoom_start=16,
    )
    folium.Marker(
        location=[lat, lon],
    ).add_to(map)

    return map._repr_html_()

# ----------------------------------------------------------------
# AUTH
# ----------------------------------------------------------------


@app.route('/login-submit', methods=['POST'])
def login():
    user_email = request.form.get("user-email")
    password = request.form.get("user-password")

    print(user_email, password)

    error = None
    try:
        token = user_auth.login("user1", password)
        session['api_session_token'] = token
        session['username'] = user_email
    except requests.exceptions.ConnectionError as ce:
        error = "Connection error. Please check your Internet connection"
    except requests.exceptions.Timeout as te:
        error = "Connection timeout. Please try again"
    except requests.exceptions.RequestException as req:
        if str(req) in ("Incorrect username.", "Incorrect password."):
            error = "Invalid username or password"
        else:
            error = str(req)
    except Exception as e:
        error = str(e)

    if error is None:
        return redirect(url_for('home_page'))
    else:
        log_settings.log_error(error)
        return render_template('login.html',
                               app_version=netmesh_constants.app_version,
                               ubuntu_version=netmesh_utils.get_ubuntu_version(),
                               error=error)


@app.route('/relogin', methods=['POST'])
def relogin():
    username = session['username']
    password = request.form.get("password")

    print(username)
    print(password)

    error = None
    try:
        token = user_auth.relogin(username, password)
        session['api_session_token'] = token
        session['username'] = username
    except requests.exceptions.ConnectionError as ce:
        error = "Connection error. Please check your Internet connection"
    except requests.exceptions.Timeout as te:
        error = "Connection timeout. Please try again"
    except requests.exceptions.RequestException as req:
        error = "Cannot login\n" + str(req)
    except Exception as e:
        error = str(e)

    if error is None:
        return Response(json.dumps({}), 200)
    else:
        print("oh no")
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error
        }), 500)


@app.route('/logout')
def logout():
    session['api_session_token'] = None
    session['username'] = None
    return redirect(url_for('login_page'))

# @login_manager.user_loader
# def load_user():
#     return session['username']

# @app.route('/set-test-details', methods=['POST'])
# def setTestDetails():
#   isr = int(request.form["isr"])
#   net = request.form["net"]
#   server_ip = request.form["serverIP"]
#   mode = request.form["mode"]
#   lon = request.form["lon"]
#   lat = request.form["lat"]
#   map_image_uri = request.form["mapImageUri"]
#   client_ip = request.form["clientIP"]
#   client_isp = request.form["clientIsp"]

#   required_fields = isr and net and server_ip and mode and lon and lat

#   if not required_fields:
#     return Response(json.dumps({
#       'field': None,
#       'invalid-feedback': "Incomplete input"
#     }), 400)

#   min_mbps = 1
#   max_mbps = 100
#   if isr < min_mbps or isr > max_mbps:
#     return Response(json.dumps({
#       'field': 'isr',
#       'invalid-feedback': f"Enter between {min_mbps} to {max_mbps} Mbps"
#     }), 400)

#   session['test_details-isr'] = isr
#   session['test_details-net'] = net
#   session['test_details-mode'] = mode
#   session['test_details-lon'] = lon
#   session['test_details-lat'] = lat

#   return Response(json.dumps({
#     'isr': isr,
#     'net': net,
#     'mode': mode,
#     'lon': lon,
#     'lat': lat,
#   }), 200)


# ----------------------------------------------------------------
# API
# ----------------------------------------------------------------
@app.route('/set-gps-info', methods=['POST'])
def set_gps_info():
    lat = request.form['lat']
    lon = request.form['lon']
    location = request.form['location']

    try:
        main_url = "http://netmesh-api.asti.dost.gov.ph"
        api_url = f'{main_url}/api/auth/set_gps'

        json_data = {
            "gps_lat": lat,
            "gps_lon": lon,
            "location": location
        }

        headers = {
            "Authorization": "Bearer " + session['api_session_token']
        }

        print(api_url)

        r = requests.post(
            url=api_url,
            json=json_data,
            headers=headers,
        )
        r.raise_for_status()
        print(r.text)
        if r.text != "success":
            return Response(400, json.dumps(r.text))
        else:
            return Response(json.dumps({}))
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = "HTTP error"
        log_settings.log_error(error)

        if status_code == 404:
            error = f"Cannot connect to {main_url}"

        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = "Cannot get test servers"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
        }), 500)
    except Exception as e:
        error = "Cannot get test servers"
        log_settings.log_error(error)

        return Response(json.dumps({
            "error": error
        }), 500)


@app.route('/get-test-servers', methods=['GET'])
def get_test_servers():
    try:
        main_url = "https://netmesh.pregi.net"
        test_servers_url = f'{main_url}/api/servers/'
        r = requests.get(
            url=test_servers_url,
        )
        r.raise_for_status()
        # local_test_servers = list(filter(lambda x: (x['type'] == "local"), json.loads(r.text)))
        test_servers = json.loads(r.text)
        # print("test_servers")
        # print(test_servers)
        return Response(json.dumps(test_servers))
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = "HTTP error"
        log_settings.log_error(error)

        if status_code == 404:
            error = f"Cannot connect to {main_url}"

        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = "Cannot get test servers"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
        }), 500)
    except Exception as e:
        error = "Cannot get test servers"
        log_settings.log_error(error)

        return Response(json.dumps({
            "error": error
        }), 500)


@app.route('/process', methods=['GET', 'POST'])
def process():
    try:
        json_data = {
            "username": session['username']
        }
        headers = {
            "Authorization": "Bearer " + session['api_session_token']
        }

        process_id = ""

        if request.method == 'POST':
            test_server_name = request.form['testServerName']
            test_server_url = request.form['testServerUrl']
            mode = request.form['mode']
            process_id = request.form['processId']
            api_url = f'{test_server_url}/api/{mode}/{process_id}'

            if process_id == "analysis":
                api_url = f'{test_server_url}/api/{mode}/thpt'

            print(api_url)

            script_data = json.loads(request.form['scriptData'])
            json_data["mode"] = mode
            for key in script_data:
                print(key)
                json_data[key] = script_data[key]

            r = requests.post(
                url=api_url,
                json=json_data,
                headers=headers,
            )
            r.raise_for_status()
            return Response(json.dumps({}))

        elif request.method == 'GET':
            test_server_name = request.args.get('testServerName')
            test_server_url = request.args.get('testServerUrl')
            mode = request.args.get('mode')
            process_id = request.args.get('processId')

            api_url = f'{test_server_url}/api/{mode}/{process_id}'

            required_params = json.loads(request.args.get('requiredParams'))
            json_data["mode"] = mode
            for key in required_params:
                json_data[key] = required_params[key]

            r = requests.get(
                url=api_url,
                json=json_data,
                headers=headers
            )
            r.raise_for_status()
            return Response(r.text)
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = f"Cannot proceed to {process_id} test" if request.method == 'GET' else f"Cannot send test measurements"

        if status_code == 401:
            error_json = json.loads(r.text)
            if "msg" in error_json:
                error = error_json["msg"]
        elif status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(str(eh))
        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = "Unexpected error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(e)
        }), 500)
    except Exception as e:
        error = "Unexpected error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(e)
        }), 500)


@app.route('/check-status', methods=['GET'])
def check_status():
    try:
        test_server_name = request.args.get("testServerName")
        test_server_url = request.args.get('testServerUrl')
        mode = request.args.get('mode')
        job_id = request.args.get('jobId')
        measurement_test_name = request.args.get('measurementTestName')

        api_url = f'{test_server_url}/api/{mode}/status/{job_id}'
        print(api_url)

        r = requests.get(
            url=api_url,
            headers={"Authorization": "Bearer "+session['api_session_token']}
        )
        r.raise_for_status()
        return Response(r.text)
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code
        error = "HTTP error"

        if status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as er:
        error = f"Cannot check the queue status of {measurement_test_name}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(er)
        }), 500)
    except Exception as e:
        error = f"Cannot check the queue status of {measurement_test_name}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(e)
        }), 500)


@app.route('/get-results', methods=['GET'])
def get_results():
    try:
        test_server_name = request.args.get('testServerName')
        test_server_url = request.args.get('testServerUrl')
        test_number = request.args.get('testNumber')

        mode = request.args.get('mode')
        method = "upload" if mode == "normal" else "download"

        api_url = f'{test_server_url}/api/{mode}'

        r = requests.get(
            url=api_url,
            headers={"Authorization": "Bearer "+session['api_session_token']}
        )
        r.raise_for_status()
        session[method+'_test_results'] = r.text

        # #SEND RESULTS TO NEW API
        # r = requests.get(
        #   url=f"{RESULTS_SERVER_API_URL}/result"
        # )

        return Response(json.dumps({
            "html": render_template('results.html',
                                    test_number=test_number,
                                    results=json.loads(r.text),
                                    method=method),
            "method": method,
            "results": json.loads(r.text)
        }), 200)

    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = "Cannot get the test results"
        if status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = f"Cannot get the test results"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(e)
        }), 500)
    except Exception as e:
        error = f"Cannot get the test results"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(e)
        }), 500)


@app.route('/get-test-results-template', methods=['GET'])
def get_test_results_template():
    try:
        test_number = request.args.get('testNumber')

        return render_template('test_results.html',
                               test_number=test_number)

    except Exception as e:
        error = "Unexpected error occured"
        log_settings.log_error(error)

        return render_template('test_results.html',
                               test_number=test_number),


@app.route('/get-test-summary-template', methods=['GET'])
def get_test_summary_template():
    try:
        methods = json.loads(request.args.get('methods'))
        isr = request.args.get('isr')
        test_results = json.loads(request.args.get('testResults'))

        test_summary = {}
        for method in methods:
            print("method", method)
            test_summary[method] = {}

            test_started_on_unix_ms = test_results[0][method]["startedOn"]
            test_summary[method]["test_started_on"] = datetime.fromtimestamp(
                test_started_on_unix_ms / 1000)

            speeds = list(
                map(lambda result: result[method]['results']['thpt_avg'], test_results))
            tcp_efficiencies = list(
                map(lambda result: result[method]['results']['tcp_eff'], test_results))
            buffer_delays = list(
                map(lambda result: result[method]['results']['buf_delay'], test_results))

            print("speeds", speeds)
            print("tcp_efficiencies", tcp_efficiencies)
            print("buffer_delays", buffer_delays)

            test_summary[method]["speed"] = {}
            test_summary[method]["speed"]["ave"] = sum(speeds) / len(speeds)
            test_summary[method]["speed"]["min"] = min(speeds)
            test_summary[method]["speed"]["max"] = max(speeds)

            test_summary[method]["tcp_efficiency"] = {}
            test_summary[method]["tcp_efficiency"]["ave"] = sum(
                tcp_efficiencies) / len(tcp_efficiencies)
            test_summary[method]["tcp_efficiency"]["min"] = min(
                tcp_efficiencies)
            test_summary[method]["tcp_efficiency"]["max"] = max(
                tcp_efficiencies)

            test_summary[method]["buffer_delay"] = {}
            test_summary[method]["buffer_delay"]["ave"] = sum(
                buffer_delays) / len(buffer_delays)
            test_summary[method]["buffer_delay"]["min"] = min(buffer_delays)
            test_summary[method]["buffer_delay"]["max"] = max(buffer_delays)

        print("test_summary", test_summary)

        return render_template('summary_results.html',
                               methods=methods,
                               isr=isr,
                               test_results=test_results,
                               test_summary=test_summary)

    except Exception as e:
        error = "Unexpected error occured"
        log_settings.log_error(error)

        return 'error',

# ----------------------------------------------------------------
# SCRIPTS
# ----------------------------------------------------------------


@app.route('/run-process-mtu', methods=['POST'])
def run_process_mtu():
    mode = request.form['mode']
    network_connection_type_name = request.form['networkConnectionTypeName']
    network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    network_interface = get_network_interface(
        mode, network_connection_type_name, network_prefix)

    command_array = ['sudo', netmesh_utils.resource_path(
        "static/client_scripts/normal_mode/mtu.sh"), network_interface, server_ip]
    output_params = [
        {'name': 'mtu', 'key': 'mtu'},
    ]

    return run_process_script(mode, command_array, output_params)


@app.route('/run-process-rtt', methods=['POST'])
def run_process_rtt():
    mode = request.form['mode']
    network_connection_type_name = request.form['networkConnectionTypeName']
    network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    network_interface = get_network_interface(
        mode, network_connection_type_name, network_prefix)

    command_array = ['sudo', './rtt.sh', network_interface, server_ip]
    output_params = [
        {'name': 'rtt', 'key': 'rtt'},
    ]

    return run_process_script(mode, command_array, output_params)


@app.route('/run-process-bdp', methods=['POST'])
def run_process_bdp():
    mode = request.form['mode']
    rtt = request.form['rtt']
    server_ip = request.form['serverIP']
    port = request.form['port']

    command_array = ['sudo', './bb.sh', rtt, server_ip, port, mode]
    output_params = [
        {'name': 'bb', 'key': 'bb'},
        {'name': 'bdp', 'key': 'bdp'},
        {'name': 'rwnd', 'key': 'rwnd'},
    ]

    return run_process_script(mode, command_array, output_params)


@app.route('/run-process-thpt', methods=['POST'])
def run_process_thpt():
    mode = request.form['mode']
    mtu = request.form['mtu']
    rtt = request.form['rtt']
    rwnd = request.form['rwnd']
    ideal = request.form['ideal']
    server_ip = request.form['serverIP']
    port = request.form['port']

    command_array = ['sudo', './thpt.sh', f'--mtu={mtu}', f'--rtt={rtt}', f'--rwnd={rwnd}',
                     f'--ideal={ideal}', f'--ip={server_ip}', f'--port={port}', f'--mode={mode}']
    # name - from script output
    # key - based from Required_User_Body in /thpt POST request
    # Must be IN EXACT ORDER
    output_params = [
        {'name': 'Total Data Sent', 'key': 'tx_bytes'},
        {'name': 'Total Data Retransmitted', 'key': 'retx_bytes'},
        {'name': 'thpt_avg', 'key': 'thpt_avg'},
        {'name': 'thpt_ideal', 'key': 'thpt_ideal'},
        {'name': 'ave_rtt', 'key': 'ave_rtt'}
    ]

    ave_rtt_params = None
    if mode == "reverse":
        ave_rtt_params = {
            "test_server_name": request.form['testServerName'],
            "test_server_url": request.form['testServerUrl'],
            "job_id": request.form['jobId']
        }

    return run_process_script(mode, command_array, output_params, ave_rtt_params)


@app.route('/run-process-analysis', methods=['POST'])
def run_process_analysis():
    data_sent = request.form['data_sent']
    ideal_thpt = request.form['ideal_thpt']
    ave_thpt = request.form['ave_thpt']
    base_rtt = request.form['base_rtt']
    ave_rtt = request.form['ave_rtt']
    retx_bytes = request.form['retx_bytes']

    command_array = ['sudo', './analysis.sh', f'--data_sent={data_sent}', f'--ideal_thpt={ideal_thpt}',
                     f'--ave_thpt={ave_thpt}', f'--base_rtt={base_rtt}', f'--ave_rtt={ave_rtt}', f'--retx_bytes={retx_bytes}']
    # name - from script output
    # key - based from Required_User_Body in /thpt POST request
    # Must be IN EXACT ORDER
    output_params = [
        {'name': 'transfer_avg', 'key': 'transfer_avg'},
        {'name': 'transfer_ideal', 'key': 'transfer_ideal'},
        {'name': 'tcp_ttr', 'key': 'tcp_ttr'},
        {'name': 'buffer_delay', 'key': 'buf_del'},
        {'name': 'tcp_efficiency', 'key': 'tcp_eff'},
    ]

    return run_process_script("", command_array, output_params)


def run_process_script(mode, command_array, output_params, ave_rtt_params=None):
    command = " ".join(command_array)
    process = subprocess.Popen(command_array,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               cwd=netmesh_utils.resource_path(f'static/client_scripts/normal_mode'))
    stdout, stderr = process.communicate()
    if stdout:
        raw_lines = stdout.decode().split('\n')
        lines = list(filter(None, raw_lines))

        if len(lines) == 0:
            error = "Script error: No output"
            log_settings.log_error(f"{error}\n>> {command}\n{stdout.decode()}")
            abort(Response(json.dumps({
                "error": error,
                "message": {
                  "shell_command": command,
                  "shell_output": stdout.decode()
                  }
            }), 400))

        script_data = {}
        if len(lines) != len(output_params):
            error = "Script error: Unexpected output"
            log_settings.log_error(f"{error}\n>> {command}\n{stdout.decode()}")
            abort(Response(json.dumps({
                "error": error,
                "message": {
                  "shell_command": command,
                  "shell_output": stdout.decode()
                  }
            }), 400))

        for index, line in enumerate(lines):
            pName = output_params[index]['name']
            pKey = output_params[index]['key']
            if pKey is None:
                continue

            line_split = line.split(':')
            if mode == "reverse" and pName == 'ave_rtt':
                print("job_id")
                print(ave_rtt_params['job_id'])

                api_url = f"{ave_rtt_params['test_server_url']}/api/reverse/jobresult/{ave_rtt_params['job_id']}"
                print("api_url")
                print(api_url)

                ave_rtt = None
                try:
                    r = requests.get(
                        url=api_url,
                        headers={"Authorization": "Bearer " +
                                 session['api_session_token']}
                    )
                    print("r.text")
                    print(r.text)
                    r.raise_for_status()
                    ave_rtt = json.loads(r.text)["ave_rtt"]

                except requests.exceptions.HTTPError as eh:
                    status_code = eh.response.status_code

                    error = "Cannot get the test results"
                    if status_code == 404:
                        error = f"Cannot connect to {ave_rtt_params['test_server_name']}"

                    log_settings.log_error(error)
                    return Response(json.dumps({
                        "error": error,
                        "message": str(eh)
                    }), status_code)
                except requests.exceptions.ConnectionError as ece:
                    error = "Connection error"

                    log_settings.log_error(error)
                    return Response(json.dumps({
                        "error": error,
                        "message": str(ece)
                    }), 500)
                except requests.exceptions.Timeout as et:
                    error = "Request timeout"

                    log_settings.log_error(error)
                    return Response(json.dumps({
                        "error": error,
                        "message": str(et)
                    }), 500)
                except requests.exceptions.RequestException as e:
                    error = f"Cannot get the test results"

                    log_settings.log_error(error)
                    return Response(json.dumps({
                        "error": error,
                        "message": str(e)
                    }), 500)
                except Exception as e:
                    error = f"Cannot get the test results"

                    log_settings.log_error(error)
                    return Response(json.dumps({
                        "error": error,
                        "message": str(e)
                    }), 500)

                line_split = ['ave_rtt', str(ave_rtt)]

            if len(line_split) != 2:
                error = "Script error: Cannot parse into key-value pair"
                log_settings.log_error(
                    f"{error}\n>> {command}\n{stdout.decode()}")
                abort(Response(json.dumps({
                    "error": error,
                    "message": {
                      "shell_command": command,
                      "shell_output": stdout.decode()
                      }
                }), 400))

            line_key = line_split[0].strip()
            line_value = line_split[1].strip()
            if line_key != pName:
                error = f"Script error: Cannot find output name '{pName}'"
                log_settings.log_error(
                    f"{error}\n>> {command}\n{stdout.decode()}")
                abort(Response(json.dumps({
                    "error": error,
                    "message": {
                      "shell_command": command,
                      "shell_output": stdout.decode()
                      }
                }), 400))

            value_split = line_value.split(' ')
            value_quantity = value_split[0].rstrip("%")
            value_number = float(value_quantity)
            if math.isnan(value_number):
                error = f"Script error: '{pName}' is NaN"
                log_settings.log_error(
                    f"{error}\n>> {command}\n{stdout.decode()}")
                abort(Response(json.dumps({
                    "error": error,
                    "message": {
                      "shell_command": command,
                      "shell_output": stdout.decode()
                      }
                }), 400))

            script_data[pKey] = value_number

        return Response(json.dumps(script_data))
    else:
        error = f"Script error: Command error"
        log_settings.log_error(
            f"{error}\nshell_command: {command}\nshell_output: {stderr.decode()}")
        abort(Response(json.dumps({
            "error": f"Script error: {stderr.decode()}",
            "message": {
              "shell_command": command,
              "shell_output": stderr.decode()
              }
        }), 400))


def get_network_interface(mode, network_connection_type_name, network_prefix):
    process = subprocess.Popen(['./network_interface.sh'],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               cwd=netmesh_utils.resource_path(f'static/client_scripts/normal_mode'))
    stdout, stderr = process.communicate()
    if stdout:
        lines = stdout.decode().split('\n')
        interfaces = list(
            filter(lambda x: (x.startswith(network_prefix)), lines))
        if len(interfaces) > 0:
            return interfaces[0]
        else:
            error = f"{network_connection_type_name} connection not found"
            log_settings.log_error(error)
            abort(Response(json.dumps({
                "error": f"{network_connection_type_name} connection not found"
            }), 500))
    else:
        error = "Network interface error"
        log_settings.log_error(error)
        abort(Response(json.dumps({
            "error": error,
            "message": stderr.decode()
        }), 500))


@app.route('/get-isp-info', methods=['GET'])
def get_isp():
    error = None
    try:
        # main_url = "http://www.speedtest.net/speedtest-config.php"
        main_url = 'http://ip-api.com/json/?fields=org,query'
        r = requests.get(
            url=main_url,
        )
        r.raise_for_status()
        response = json.loads(r.text)

        isp = response["org"]
        public_ip = response["query"]

        return Response(json.dumps({
            "isp": isp,
            "publicIP": public_ip
        }))
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = "HTTP error"
        if status_code == 404:
            error = f"Cannot connect to {main_url}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = "Cannot get ISP"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
        }), 500)
    except Exception as e:
        error = "Cannot get ISP"
        log_settings.log_error(error)

        return Response(json.dumps({
            "error": error
        }), 500)


@app.route('/get-machine-name', methods=['GET'])
def get_machine_name():
    print("machine name")
    machine_name = ""
    try:
        machine_name = netmesh_utils.get_machine_name()
    except Exception as e:
        print(e.__cause__)
        return Response(str(e), 500)

    return Response(json.dumps(machine_name), mimetype='application/json')

# ----------------------------------------------------------------
# EXTERNAL DATA
# ----------------------------------------------------------------


@app.route('/get-gps-coordinates', methods=['POST'])
def get_gps_coordinates():
    print("coordinates")
    coordinates = [None, None]
    try:
        coordinates = netmesh_location.getRawGpsCoordinates()
    except Exception as e:
        print(e.__cause__)
        return Response(str(e), 500)

    return Response(json.dumps(coordinates), mimetype='application/json')


@app.route('/get-connected-devices', methods=['POST'])
def get_connected_devices():
    try:
        network_connection_type_name = request.form["networkConnectionTypeName"]
        network_prefix = request.form["networkPrefix"]

        # get network interface ip
        interface = get_network_interface(
            "normal", network_connection_type_name, network_prefix)
        stdout, stderr = subprocess.Popen(f"ip -br addr list | grep -w {interface} | awk -F' ' '{{print $3}}'",
                                          shell=True,
                                          stdout=subprocess.PIPE,
                                          stderr=subprocess.PIPE,).communicate()
        if stderr:
            print("Error: ", stderr.decode())
            return None

        net_ip = stdout.decode()

        # get gateway ip
        stdout, stderr = subprocess.Popen(f"ip r | grep 'default via' | awk -F' ' '{{print $3}}'",
                                          shell=True,
                                          stdout=subprocess.PIPE,
                                          stderr=subprocess.PIPE,).communicate()
        if stderr:
            print("Error: ", stderr.decode())
            return None

        gateway_ips = stdout.decode().strip()
        gateway_ip = ""
        if gateway_ips:
            gateway_ip = gateway_ips.split("\n")[0]

        print(f'gateway_ip: {gateway_ip}')

        ps = nmap.PortScanner()
        results = ps.scan(net_ip, arguments='-sT -O', sudo=True)
        print(results)
        # remove gateway from results
        scanned_ips = {k: v for k,
                       v in results['scan'].items() if k != gateway_ip}
        print(scanned_ips)
        return Response(json.dumps({
            "nmap": results['nmap'],
            "nmapVersion": ".".join(map(str, ps.nmap_version())),
            "scan": scanned_ips
        }))
    except nmap.nmap.PortScannerError as pse:
        raise pse
    except Exception as e:
        raise e


@app.route('/send-error', methods=['POST'])
def send_error():
    test_server_name = request.form['testServerName']
    test_server_url = request.form['testServerUrl']
    error_file_name = request.form['errorFileName']

    try:
        main_url = f'{test_server_url}/api/handling/upload_log'
        r = requests.post(
            url=main_url,
            headers={"Authorization": "Bearer "+session['api_session_token']},
            files={'file': open(
                f'{"/var/log/netmesh_rfc6349_app"}/{error_file_name}.log', 'rb')}
        )

        # r = requests.post(
        #   url=main_url,
        #   headers={"Authorization":"Bearer "+session['api_session_token']},
        #   files={'file':(f'{error_file_name}.log', open(f'./netmesh_log_files/{error_file_name}.log', 'rb'))}
        # )
        # with app.open_resource(f'./netmesh_log_files/{error_file_name}.log') as fp:

        r.raise_for_status()

        print("na-sent na :D")

        return Response(json.dumps({
            "status": r.status_code,
        }))
    except requests.exceptions.HTTPError as eh:
        status_code = eh.response.status_code

        error = "HTTP error"
        if status_code == 404:
            error = f"Cannot connect to {main_url}"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(eh)
        }), status_code)
    except requests.exceptions.ConnectionError as ece:
        error = "Connection error"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ece)
        }), 500)
    except requests.exceptions.Timeout as et:
        error = "Request timeout"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(et)
        }), 500)
    except requests.exceptions.RequestException as e:
        error = "Cannot send error log"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
        }), 500)
    except Exception as e:
        error = "Cannot send error log"
        log_settings.log_error(error)

        return Response(json.dumps({
            "error": error
        }), 500)


@app.route('/get-admin-credentials-template', methods=['POST'])
def get_admin_credentials_template():
    return render_template('device_admin_credentials.html')


@app.route('/log-admin', methods=['POST'])
def log_admin():
    # device_name = request.form.get('device-name')
    admin_email = request.form.get('admin-email')
    admin_password = request.form.get('admin-password')

    print(admin_email, admin_password)

    r = None
    try:
        r = requests.post(
            url=f'{RESULTS_SERVER_API_URL}/user/token/',
            json={
                "email": admin_email,
                "password": admin_password,
                "client": "admin"
            }
        )
        r.raise_for_status()

        token = r.json()['token']
        session['admin-token'] = token
    except requests.exceptions.RequestException as re:
        error = "Unexpected error"
        try:
            error_json = json.loads(r.content)
            if "non_field_errors" in error_json:
                error = error_json["non_field_errors"]
            else:
                error = r.content
        except Exception as ex:
            print(ex)
            error = str(re)

        return render_template('device_admin_credentials.html', error=error), 400

    return render_template('device_region.html', regions=netmesh_location.get_philippine_regions())


@app.route('/get-device-details-template', methods=['POST'])
def get_device_details_template():
    region = request.form.get('region')
    region_name = request.form.get('regionName')

    print("ntc_region", region)
    print("token", session['admin-token'])

    regions = netmesh_location.get_philippine_regions()
    try:
        r = requests.get(
            url=f'{RESULTS_SERVER_API_URL}/user/',
            params={
                "ntc_region": region
            },
            headers={'Authorization': f"Token { session['admin-token'] }"}
        )
        r.raise_for_status()

        print("users")
        print(r.text)
    except requests.exceptions.RequestException as re:
        error = "Unexpected error"
        try:
            error_json = json.loads(r.content)
            if "non_field_errors" in error_json:
                error = error_json["non_field_errors"]
            else:
                error = r.content
        except Exception as ex:
            print(ex)
            error = str(re)

        return render_template('device_region.html', regions=regions, error=error), 400

    return render_template('device_details_form.html', users=r.json(), region_name=region_name)


@app.route('/device-confirmation-template', methods=['POST'])
def device_confirmation_template():
    region_name = request.form.get('regionName')
    laptop_owner = request.form.get('laptopOwner')
    laptop_owner_email = request.form.get('laptopOwnerEmail')
    laptop_name = request.form.get('laptopName')

    return render_template('device_confirmation.html',
                           region_name=region_name,
                           laptop_owner=laptop_owner,
                           laptop_name=laptop_name,
                           laptop_owner_email=laptop_owner_email,
                           device_info=netmesh_utils.get_device_info())


@app.route('/device-details', methods=['GET'])
def device_details():
    return render_template('device_details_form.html', users=[
        {
            "ntc_region": "3",
            "id": 1_000_001,
            "email": "romano.bourgeois@example.com",
            "first_name": "Romano",
            "last_name": "Bourgeois"
        },
        {
            "ntc_region": "3",
            "id": 1_000_002,
            "email": "peyton.vasquez@example.com",
            "first_name": "Peyton",
            "last_name": "Vasquez"
        },
        {
            "ntc_region": "3",
            "id": 1_000_003,
            "email": "gavin.cole@example.com",
            "first_name": "Gavin",
            "last_name": "Cole"
        },
        {
            "ntc_region": "3",
            "id": 1_000_004,
            "email": "audrey.tucker@example.com",
            "first_name": "Audrey",
            "last_name": "Tucker"
        },
        {
            "ntc_region": "3",
            "id": 1_000_005,
            "email": "jill.pearson@example.com",
            "first_name": "Jill",
            "last_name": "Pearson"
        }
    ])


@app.route('/register-api', methods=['POST'])
def register_api():
    admin_email = request.form.get('adminEmail')
    region = request.form.get('region')
    device_owner_info = request.form.get('deviceOwnerInfo')
    device_name = request.form.get('deviceName')

    try:
        # raise Exception("fjwkfhwef fwefywifuwoef wfyuwifywefj ifyweofiy fgiueygf reyfyferufyuiwefy wqoefysregfesruig ye ogoiesryferurfyf goyfgrwey fyewrgf ruei")
        device_info = netmesh_utils.get_device_info()
        device_info.update({"name": device_name})
        device_info.update({"user": device_owner_info['user_id']})

        # r = requests.post(
        #     url=f'{RESULTS_SERVER_API_URL}/user/token/',
        #     json={
        #       "email": admin_email,
        #       "password": admin_password,
        #       "client": device_name
        #     }
        #   )
        # r.raise_for_status()

        # token = r.json()['token']

        r = requests.post(
            url=f'{RESULTS_SERVER_API_URL}/rfc6349/device/',
            headers={"Authorization": f"Token {session['admin-token']}"},
            json=device_info
        )
        print(device_info)
        r.raise_for_status()
        
        config = NetMeshConfig()
        
        device_config = config.load_device_config()
        device_config.set_device_name(device_name)
        
        users_config = config.load_users_config()
        users_config.add_logged_user({
            "name": f"{ device_owner_info['first_name'] } { device_owner_info['last_name'] }",
            "email": device_owner_info['email'],
        })
        
        config.save()

        return render_template('device_registration_done.html',
                               device_name=device_name,
                               admin_email=admin_email,
                               device_info=netmesh_utils.get_device_info())
    except requests.exceptions.HTTPError as he:
        error = ""
        try:
            error_json = json.loads(r.content)
            if "detail" in error_json:
                error = error_json["detail"]
            else:
                error = r.content
        except ValueError:
            error = r.text

        # return render_template('register_device.html',
        #   error=error,
        #   device_name=device_name,
        #   device_info=device_info,
        #   admin_email=admin_email,
        #   region=region)
        print(error)
    except requests.exceptions.RequestException as re:
        # return render_template('register_device.html',
        #   error=str(re),
        #   device_name=device_name,
        #   device_info=device_info,
        #   admin_email=admin_email,
        #   region=region)
        print(error)
    except Exception as ex:
        print(error)


if os.name == 'nt':
    import ctypes
    from ctypes import windll, wintypes
    from uuid import UUID

    # ctypes GUID copied from MSDN sample code
    class GUID(ctypes.Structure):
        _fields_ = [
            ("Data1", wintypes.DWORD),
            ("Data2", wintypes.WORD),
            ("Data3", wintypes.WORD),
            ("Data4", wintypes.BYTE * 8)
        ]

        def __init__(self, uuidstr):
            uuid = UUID(uuidstr)
            ctypes.Structure.__init__(self)
            self.Data1, self.Data2, self.Data3, \
                self.Data4[0], self.Data4[1], rest = uuid.fields
            for i in range(2, 8):
                self.Data4[i] = rest >> (8-i-1)*8 & 0xff

    SHGetKnownFolderPath = windll.shell32.SHGetKnownFolderPath
    SHGetKnownFolderPath.argtypes = [
        ctypes.POINTER(GUID), wintypes.DWORD,
        wintypes.HANDLE, ctypes.POINTER(ctypes.c_wchar_p)
    ]

    def _get_known_folder_path(uuidstr):
        pathptr = ctypes.c_wchar_p()
        guid = GUID(uuidstr)
        if SHGetKnownFolderPath(ctypes.byref(guid), 0, 0, ctypes.byref(pathptr)):
            raise ctypes.WinError()
        return pathptr.value

    FOLDERID_Download = '{374DE290-123F-4565-9164-39C4925E467B}'

    def get_downloads_folder():
        return _get_known_folder_path(FOLDERID_Download)
else:
    def get_downloads_folder():
        username = netmesh_utils.get_user()
        print(username)
        return os.path.join(os.path.expanduser(f'~{username}'), 'Downloads')


def get_downloads_folder_path():
    return get_downloads_folder()


@app.route('/open-downloads-folder', methods=['POST'])
def open_downloads_folder():
    print(get_downloads_folder())
    file_name = request.form.get("fileName")
    print(file_name)
    desktop_username = netmesh_utils.get_user()
    file_explorer_process = subprocess.Popen(['sudo', '-u', desktop_username, 'nautilus', '-s', os.path.join(
        get_downloads_folder(), file_name)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = file_explorer_process.communicate()
    if stderr:
        print(stderr)


@app.route('/open-logs-folder', methods=['POST'])
def open_logs_folder():
    file_explorer_process = subprocess.Popen(
        ['nautilus', '--browser', '/var/log/netmesh_rfc6349_app'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = file_explorer_process.communicate()
    if stderr:
        print(stderr)


def run_on_desktop():
    if getattr(sys, 'frozen', False):
        pyi_splash.update_text("Checking update...")

    has_update, current_version, latest_version = netmesh_utils.has_update()
    netmesh_constants.app_version = current_version

    if getattr(sys, 'frozen', False):
        pyi_splash.update_text("Opening the app...")

    running_on_desktop = True
    pysideflask_ext.init_gui(application=app, port=5000, width=1440, height=900,
                             window_title=f'{netmesh_constants.APP_TITLE} ({netmesh_constants.app_version})',
                             has_update=has_update, latest_version=latest_version, download_path=get_downloads_folder_path())

    sys.exit()
    # if netmesh_utils.has_update():
    #   # GUI popup here asking if user wants to update or not and store it in update_dec
    #   update_dec = True # tentative value, store user decision here if True or False
    #   if update_dec:
    #       # GUI popup here notifying the user that the app is currently updating
    #       netmesh_utils.update() # this function will stall
    #       install_proj()
    #       # GUI popup here notifying user that the app is done updating and to ask them to start the app again
    #       return


def run_in_browser():
    running_on_desktop = False
    app.run(debug=True)


if __name__ == "__main__":
    if getattr(sys, 'frozen', False):
        run_on_desktop()
    else:
        run_in_browser()
    # run_on_desktop()
