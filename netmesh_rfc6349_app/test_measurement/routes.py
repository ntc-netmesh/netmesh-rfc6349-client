from asyncio.log import logger
from datetime import datetime
import sys
import os
import subprocess
import uuid
import socket
import nmap3

import requests
import json

import folium

from flask import Blueprint, Response, render_template, request, redirect, url_for, abort, session, jsonify, current_app, g
from netmesh_rfc6349_app import app_resource_path
from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile


from netmesh_rfc6349_app.test_measurement.utils import calculate_window_size, run_process_script, get_ethernet_connections, get_default_gateway

from netmesh_rfc6349_app.main.utils.netmesh_installer import get_app_current_version
from netmesh_rfc6349_app.main.utils import laptop_info

import netmesh_rfc6349_app.main.utils.log_settings as log_settings

import netmesh_rfc6349_app.main.utils.netmesh_location as netmesh_location

test_measurement = Blueprint('test_measurement', __name__)

@test_measurement.route('/save-rfc-settings', methods=['POST'])
def save_rfc_settings():
    print(request.form.keys())
    thpt_phase_duration_seconds = int(request.form['thptPhaseDuration'])
    
    try:
        config = NetMeshConfigFile()
        config.settings_config.set_thpt_phase_duration_seconds(thpt_phase_duration_seconds)
        config.save()
        
        return jsonify(success=True)
    except Exception as ex:
        return jsonify(success=False, msg=str(ex))

@test_measurement.route('/get-rfc-settings')
def get_rfc_settings():
    try:
        config = NetMeshConfigFile()
        return json.dumps(config.settings_config.get_all_settings())
    
    except Exception as ex:
        return jsonify(success=False, msg=str(ex))

@test_measurement.route('/report-data', methods=['POST'])
def report_data():
    server_name = request.form['serverName']
    isp = request.form['isp']
    started_on = request.form['startedOn']
    finished_on = request.form['finishedOn']
    duration = request.form['duration']
    username = session['email']
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

@test_measurement.route('/get-ntc-office-address')
def get_ntc_office_address():
    try:
        main_url = current_app.config['RESULTS_SERVER_API_URI']
        office_addresses_url = f"{main_url}/nro/office/"
        r = requests.get(
            url=office_addresses_url,
            headers={
                "Authorization": f"Token {session['api_session_token']}"
            }
        )
        r.raise_for_status()
        # local_test_servers = list(filter(lambda x: (x['type'] == "local"), json.loads(r.text)))
        office_addresses = json.loads(r.content)
        print(office_addresses)
        # print("test_servers")
        # print(test_servers)
        return Response(json.dumps(office_addresses[0]) if len(office_addresses) > 0 else {})
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
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"
        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"
        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = "Cannot get office address"
        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
        }), ex.response.status_code)
    except Exception as ex:
        error = "Cannot get office address"
        log_settings.log_error(error + " " + str(ex))

        return Response(json.dumps({
            "error": error
        }), 400)

@test_measurement.route('/report', methods=['POST'])
def report():
    server_name = request.form['serverName']
    started_on = request.form['startedOn']
    finished_on = request.form['finishedOn']
    duration = request.form['duration']
    generated_on = request.form['generatedOn']
    username = session['email']
    methods = json.loads(request.form['methods'])

    results = {}
    for d in methods:
        results[d] = json.loads(session[d+'_test_results'])

    return render_template('report.html',
                           app_version=get_app_current_version(),
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


@test_measurement.route('/map-snippet-data', methods=['POST'])
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


@test_measurement.route('/set-gps-info', methods=['POST'])
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


@test_measurement.route('/get-test-servers', methods=['GET'])
def get_test_servers():
    try:
        main_url = current_app.config['RESULTS_SERVER_API_URI']
        test_servers_url = f"{main_url}/server/"
        r = requests.get(
            url=test_servers_url,
        )
        r.raise_for_status()
        
        rfc_test_servers = list(filter(lambda x: (x['server_type'] == "rfc"), json.loads(r.text)))
        # test_servers = json.loads(r.text)
        if current_app.config['FLASK_DEBUG'] == 1:
            rfc_test_servers.append({
                "id": "custom",
                "hostname": "Custom",
                "nickname": "Custom test server..."
            })
            
        return Response(json.dumps(rfc_test_servers))
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
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = "Cannot get test servers"
        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
        }), ex.response.status_code)
    except Exception as ex:
        error = "Cannot get test servers"
        log_settings.log_error(error + " " + str(ex))

        return Response(json.dumps({
            "error": error
        }), 400)

@test_measurement.route('/connect-to-test-server', methods=['POST'])
def connect_to_test_server():
    try:
        test_server_name = request.form.get('testServerName')
        test_server_url = request.form.get('testServerUrl')
        mode = request.form.get('mode')
        server_id = request.form.get('serverId')
        lat = request.form.get('lat')
        lon = request.form.get('lon')
        
        json_data = {
            "server_id": server_id,
            "lat": lat,
            "lon": lon,
            "email": session['email'],
            "mode": mode
        }
        headers = {
            "Authorization": "Token " + session['api_session_token']
        }
        print(test_server_url)
        
        print(f'{test_server_url}/api/auth/verify-test')
        
        r = requests.post(
            url=f'{test_server_url}/api/auth/verify-test',
            json=json_data,
            headers=headers,
        )
        
        r.raise_for_status()
        return r.text, 200
    except requests.exceptions.HTTPError as ex:
        status_code = ex.response.status_code

        error = f"Cannot connect to server"

        if status_code == 401:
            error_json = json.loads(r.text)
            if "msg" in error_json:
                error = error_json["msg"]
        elif status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), status_code)
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = "Unexpected error"

        log_settings.log_error(error + " " + str(ex))
        return jsonify(error=error, message=str(ex)), ex.response.status_code if ex.response else 400
    except Exception as ex:
        error = "Unexpected error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 400)

@test_measurement.route('/process', methods=['GET', 'POST'])
def process():
    try:
        print(session)
        json_data = {
            "username": session['email']
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

            # if process_id == "analysis":
            # api_url = f'{test_server_url}/api/{mode}/analysis'

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
    except requests.exceptions.HTTPError as ex:
        status_code = ex.response.status_code

        error = f"Cannot proceed to {process_id} test" if request.method == 'GET' else f"Cannot send test measurements"

        if status_code == 401:
            error_json = json.loads(r.text)
            if "msg" in error_json:
                error = error_json["msg"]
        elif status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), status_code)
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = "Unexpected error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), ex.response.status_code)
    except Exception as ex:
        error = "Unexpected error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 400)


@test_measurement.route('/check-status', methods=['GET'])
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
        
        status = r.json()
        
        if status == "failed":
            return Response(json.dumps({
                "error": "Queue failed",
                "message": "Failed to enqueue this client in the server"
            }), 500)
            
        return Response(r.text)
    except requests.exceptions.HTTPError as ex:
        status_code = ex.response.status_code
        error = "HTTP error"

        if status_code == 404:
            error = f"Cannot connect to {test_server_name}"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), status_code)
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = f"Cannot check the queue status of {measurement_test_name}"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), ex.response.status_code)
    except Exception as ex:
        error = f"Cannot check the queue status of {measurement_test_name}"

        log_settings.log_error(error + " " + str(ex))
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 400)

@test_measurement.route('/finish-test', methods=['POST'])
def finish_test():
    try:
        test_server_name = request.form.get('testServerName')
        test_server_url = request.form.get('testServerUrl')
        mode = request.form.get('mode')
        test_number = request.form.get('testNumber')
        
        api_url = f'{test_server_url}/api/{mode}/finish-test'
        
        req = requests.post(
            url=api_url,
            headers={"Authorization": "Bearer "+session['api_session_token']}
        )
        
        req.raise_for_status()
        
        res = req.json()
        method = "download" if mode == "reverse" else "upload"
        
        res.update({
            'method': method,
            'html': render_template('results.html',
                                    test_number=test_number,
                                    results=res['results'],
                                    method=method)
        })
        return json.dumps(res), 200
    except requests.RequestException as ex:
        print(ex)
        return jsonify(error=str(ex)), 400

@test_measurement.route('/get-results', methods=['GET'])
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
        #   url=f"{RESULTS_SERVER_API_URI}/result"
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
    except requests.exceptions.ConnectionError as ex:
        error = "Connection error"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 503)
    except requests.exceptions.Timeout as ex:
        error = "Request timeout"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 408)
    except requests.exceptions.RequestException as ex:
        error = f"Cannot get the test results"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), ex.response.status_code)
    except Exception as ex:
        error = f"Cannot get the test results"

        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error,
            "message": str(ex)
        }), 400)


@test_measurement.route('/get-test-results-template', methods=['GET'])
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


@test_measurement.route('/get-test-summary-template', methods=['POST'])
def get_test_summary_template():
    try:
        methods = json.loads(request.form.get('methods'))
        isr = request.form.get('isr')
        test_results = json.loads(request.form.get('testResults'))

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
                map(lambda result: result[method]['results']['buf_del'], test_results))

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


@test_measurement.route('/run-process-mtu', methods=['POST'])
def run_process_mtu():
    mode = request.form['mode']
    # network_connection_type_name = request.form['networkConnectionTypeName']
    # network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    # network_interface = get_network_interface(
    #     mode, network_connection_type_name, network_prefix)
    ethernet_name = request.form['ethernetName']

    command_array = ['sudo', app_resource_path(
        f"{current_app.static_folder}/client_scripts/normal_mode/mtu.sh"), ethernet_name, server_ip]
    output_params = [
        {'name': 'mtu', 'key': 'mtu'},
    ]

    return run_process_script(mode, command_array, output_params)


@test_measurement.route('/run-process-rtt', methods=['POST'])
def run_process_rtt():
    mode = request.form['mode']
    # network_connection_type_name = request.form['networkConnectionTypeName']
    # network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    # network_interface = get_network_interface(
    #     mode, network_connection_type_name, network_prefix)
    ethernet_name = request.form['ethernetName']

    command_array = ['sudo', './rtt.sh', ethernet_name, server_ip]
    output_params = [
        {'name': 'rtt', 'key': 'rtt'},
    ]

    return run_process_script(mode, command_array, output_params)


@test_measurement.route('/run-process-bdp', methods=['POST'])
def run_process_bdp():
    mode = request.form['mode']
    rtt = request.form['rtt']
    isr = request.form['isr']
    server_ip = request.form['serverIP']
    port = request.form['port']
    
    bitrate = int(isr) / 100

    command_array = ['sudo', './bb.sh', rtt, server_ip, port, mode, str(bitrate)]
    
    print(command_array)
    output_params = [
        {'name': 'bb', 'key': 'bb'},
        {'name': 'bdp', 'key': 'bdp'},
        {'name': 'rwnd', 'key': 'rwnd'},
    ]

    return run_process_script(mode, command_array, output_params)


@test_measurement.route('/run-process-thpt', methods=['POST'])
def run_process_thpt():
    mode = request.form['mode']
    mtu = request.form['mtu']
    rtt = request.form['rtt']
    bdp = int(request.form['bdp'])
    rwnd = request.form['rwnd']
    ideal = request.form['ideal']
    server_ip = request.form['serverIP']
    port = request.form['port']
    
    window = calculate_window_size(bdp)
    print("WINDOW SIZE CALC")
    print("bdp", bdp)
    print("window_size", window)
    
    config = NetMeshConfigFile()
    duration = config.settings_config.get_thpt_phase_duration_seconds()

    command_array = ['sudo', './thpt.sh', f'--mtu={mtu}', f'--rtt={rtt}', f'--rwnd={rwnd}',
                     f'--ideal={ideal}', f'--ip={server_ip}', f'--port={port}', f'--mode={mode}', f'--window={window}', f'--dur={duration}']
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


@test_measurement.route('/run-process-analysis', methods=['POST'])
def run_process_analysis():
    data_sent = request.form['data_sent']
    ideal_thpt = request.form['ideal_thpt']
    ave_thpt = request.form['ave_thpt']
    base_rtt = request.form['base_rtt']
    ave_rtt = request.form['ave_rtt']
    retx_bytes = request.form['retx_bytes']
    
    config = NetMeshConfigFile()
    duration = config.settings_config.get_thpt_phase_duration_seconds()

    command_array = ['sudo', './analysis.sh', f'--data_sent={data_sent}', f'--ideal_thpt={ideal_thpt}',
                     f'--ave_thpt={ave_thpt}', f'--base_rtt={base_rtt}', f'--ave_rtt={ave_rtt}', f'--retx_bytes={retx_bytes}', f'--dur={duration}']
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


@test_measurement.route('/get-isp-info', methods=['GET'])
def get_isp():
    error = None
    try:
        main_url = 'http://ip-api.com/json/?fields=as,query'
        r = requests.get(
            url=main_url,
        )
        r.raise_for_status()
        response = json.loads(r.text)
        
        as_value = response["as"]
        isp = ' '.join(as_value.split(' ')[1:])
        public_ip = response["query"]

        return Response(json.dumps({
            "isp": isp,
            "publicIP": public_ip
        }))
    except:
        return Response(json.dumps({
            "isp": None,
            "publicIP": None
        }))

@test_measurement.route('/get-machine-name', methods=['GET'])
def get_machine_name():
    print("machine name")
    machine_name = ""
    try:
        machine_name = laptop_info.get_machine_name()
    except Exception as e:
        print(e.__cause__)
        return Response(str(e), 400)

    return Response(machine_name)

# ----------------------------------------------------------------
# EXTERNAL DATA
# ----------------------------------------------------------------
@test_measurement.route('/get-ethernets', methods=['GET'])
def get_ethernets():
    return json.dumps(get_ethernet_connections()), 200

@test_measurement.route('/get-gps-coordinates', methods=['POST'])
def get_gps_coordinates():
    print("coordinates")
    coordinates = [None, None]
    try:
        coordinates = netmesh_location.getRawGpsCoordinates()
    except Exception as e:
        print(e.__cause__)
        return Response(str(e), 400)

    return Response(json.dumps(coordinates), mimetype='application/json')


@test_measurement.route('/get-connected-devices', methods=['POST'])
def get_connected_devices():
    try:
        # network_connection_type_name = request.form["networkConnectionTypeName"]
        # network_prefix = request.form["networkPrefix"]

        # get network interface ip
        ethernet_ip = request.form["ethernetIP"]
        scan_duration_seconds = int(request.form["scanDurationSeconds"])


        gateway_ip = get_default_gateway()

        print(f'gateway_ip: {gateway_ip}')
        
        nmap = nmap3.Nmap()
        # ps = nmap3.PortScanner()
        # results = ps.scan(ethernet_ip, arguments='-sT -O', sudo=True)
        # results = nmap.nmap_os_detection(f'{ethernet_ip}/24', f"-sT -O", f"--script-timeout {scan_duration_seconds}")
        element_results = nmap.scan_command(f'{ethernet_ip}/24', 'nmap -O -sT', timeout=scan_duration_seconds)
        results = nmap.parser.os_identifier_parser(element_results)
        runtime = results.pop("runtime")
        stats = results.pop("stats")
        print(results)
        #
        # remove gateway from results
        scanned_ips = {k: v for k,
                       v in results.items() if k != gateway_ip}
        print(scanned_ips)
        return Response(json.dumps({
            "scanned_ips": scanned_ips,
            "runtime": runtime,
            "stats": stats
        }))
    except nmap3.NmapExecutionError as ex:
        print(ex)
        return jsonify(error=str(ex)), 400
    except Exception as ex:
        print(ex)
        return jsonify(error=str(ex)), 400


@test_measurement.route('/send-error', methods=['POST'])
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

@test_measurement.route('/open-downloads-folder', methods=['POST'])
def open_downloads_folder():
    print(laptop_info.get_downloads_folder_path())
    file_name = request.form.get("fileName")
    print(file_name)
    desktop_home_user = laptop_info.get_ubuntu_home_user()
    file_explorer_process = subprocess.Popen(['sudo', '-u', desktop_home_user, 'nautilus', '-s', os.path.join(
        laptop_info.get_downloads_folder_path(), file_name)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = file_explorer_process.communicate()
    if stderr:
        return jsonify(), 500
    return jsonify(), 200

@test_measurement.route('/open-logs-folder', methods=['POST'])
def open_logs_folder():
    file_explorer_process = subprocess.Popen(
        ['nautilus', '--browser', '/var/log/netmesh_rfc6349_app'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = file_explorer_process.communicate()
    if stderr:
        return jsonify(), 500
    return jsonify(), 200
