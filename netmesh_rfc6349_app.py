from asyncio.log import logger
import sys
import os
import webbrowser
import subprocess
import uuid
from importlib_metadata import files

import requests
import json
import hashlib
import math

import folium

import tkinter

if getattr(sys, 'frozen', False):
  import pyi_splash

from flask import Flask, Response, render_template, request, flash, redirect, url_for, abort, session
from flask_login import LoginManager, login_user, logout_user

import wrappers
import user_auth
import ADB
import log_settings
import pysideflask_ext

import netmesh_constants
import netmesh_utils
# import netmesh_updater
from netmesh_install import install_proj

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

app.config['MAIL_SERVER']='smtp.gmail.com'  
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'netmesh.dev@gmail.com'
app.config['MAIL_PASSWORD'] = 'n3Tm3$sh!@#dev'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

login_manager = LoginManager()
login_manager.init_app(app)

# ----------------------------------------------------------------
# PAGES
# ----------------------------------------------------------------
@app.route('/')
def login_page():
  print("Check if app is already running on desktop")
  
  if running_on_desktop == True:
    return "This app is already running on desktop."
    
  if 'api_session_token' in session and session['api_session_token'] and 'username' in session and session['username']:
    return redirect(url_for('home_page'))
  
  return render_template('login.html',
                         app_version=netmesh_constants.app_version,
                         ubuntu_version=netmesh_utils.get_ubuntu_version())

@app.route('/register-device')
def register_device_page():
  serial_number = ""
  try:
    serial_number = netmesh_utils.get_laptop_serial_number()
  except Exception as e:
    return render_template('register_device.html',
      error=str(e))
  
  return render_template('register_device.html', serial_number=serial_number)

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
  # methods = ["upload", "download"]
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
  username = request.form.get("uname")
  password = request.form.get("psw")
  
  error = None
  try:
    token = user_auth.login(username, password)
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
    print("token: {}".format(session['api_session_token']))
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
    token = user_auth.login2(username, password)
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
    print("yeah yeah")
    print("token: {}".format(session['api_session_token']))
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

@login_manager.user_loader
def load_user():
    return session['username']
    
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
      headers={"Authorization":"Bearer "+session['api_session_token']}
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
    
    mode = request.args.get('mode')
    method = "upload" if mode == "normal" else "download"
    
    api_url = f'{test_server_url}/api/{mode}'
  
    r = requests.get(
      url=api_url,
      headers={"Authorization":"Bearer "+session['api_session_token']}
    )
    r.raise_for_status()
    session[method+'_test_results'] = r.text
    
    return Response(json.dumps({
      "html": render_template('results.html',
                            results=json.loads(r.text),
                            method=method),
      "method": method,
      "results": json.loads(r.text)
    }), 200)
    
    # return render_template('results.html',
    #                         results=json.loads(session[method+'_test_results']),
    #                         method=method)
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

# ----------------------------------------------------------------
# SCRIPTS
# ----------------------------------------------------------------
@app.route('/run-process-mtu', methods=['POST'])
def run_process_mtu():
  mode = request.form['mode']
  network_connection_type_name = request.form['networkConnectionTypeName']
  network_prefix = request.form['networkPrefix']
  server_ip = request.form['serverIP']
  network_interface = get_network_interface(mode, network_connection_type_name, network_prefix)
  
  command_array = ['sudo', './mtu.sh', network_interface, server_ip]
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
  network_interface = get_network_interface(mode, network_connection_type_name, network_prefix)
  
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
  
  command_array = ['sudo', './thpt.sh', f'--mtu={mtu}', f'--rtt={rtt}', f'--rwnd={rwnd}', f'--ideal={ideal}', f'--ip={server_ip}', f'--port={port}', f'--mode={mode}']
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
  
  command_array = ['sudo', './analysis.sh', f'--data_sent={data_sent}', f'--ideal_thpt={ideal_thpt}', f'--ave_thpt={ave_thpt}', f'--base_rtt={base_rtt}', f'--ave_rtt={ave_rtt}', f'--retx_bytes={retx_bytes}']
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



def run_process_script(mode, command_array, output_params, ave_rtt_params = None):
  command = " ".join(command_array)
  process = subprocess.Popen(command_array,
                            stdout=subprocess.PIPE,
                            stderr= subprocess.PIPE,
                            cwd=netmesh_utils.resource_path(f'static/client_scripts/normal_mode'))
  stdout,stderr = process.communicate()
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
            headers={"Authorization":"Bearer "+session['api_session_token']}
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
        log_settings.log_error(f"{error}\n>> {command}\n{stdout.decode()}")
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
        log_settings.log_error(f"{error}\n>> {command}\n{stdout.decode()}")
        abort(Response(json.dumps({
          "error": error,
          "message": {
            "shell_command": command,
            "shell_output": stdout.decode()
          }
        }), 400))
      
      value_split = line_value.split(' ')
      value_quantity  = value_split[0].rstrip("%")
      value_number = float(value_quantity)
      if math.isnan(value_number):
        error = f"Script error: '{pName}' is NaN"
        log_settings.log_error(f"{error}\n>> {command}\n{stdout.decode()}")
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
    log_settings.log_error(f"{error}\nshell_command: {command}\nshell_output: {stderr.decode()}")
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
                             stderr= subprocess.PIPE,
                             cwd=netmesh_utils.resource_path(f'static/client_scripts/normal_mode'))
  stdout,stderr = process.communicate()
  if stdout:
    lines = stdout.decode().split('\n')
    interfaces = list(filter(lambda x: (x.startswith(network_prefix)), lines))
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

@app.route('/get-machine-name', methods = ['GET'])
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
@app.route('/get-gps-coordinates', methods = ['POST'])
def get_gps_coordinates():
  print("coordinates")
  coordinates = [None, None]
  try:
    coordinates = ADB.getRawGpsCoordinates()
  except Exception as e:
    print(e.__cause__)
    return Response(str(e), 500)
    
  return Response(json.dumps(coordinates), mimetype='application/json')


@app.route('/send-error', methods = ['POST'])
def send_error():
  test_server_name = request.form['testServerName']
  test_server_url = request.form['testServerUrl']
  error_file_name = request.form['errorFileName']
  
  try:
    main_url = f'{test_server_url}/api/handling/upload_log'
    r = requests.post(
        url=main_url,
        headers={"Authorization":"Bearer "+session['api_session_token']},
        files={'file':open(f'./netmesh_log_files/{error_file_name}.log', 'rb')}
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

def sample_function():
  print("yehey")

@app.route('/register')
def register_api():
  if check_if_registered():
    return render_template('register_device.html',
      error="Device aleady registered")
  else:
    reg_file = open("~/.config/netmesh-rfc6349/hash.txt","r")
    dev_hash = reg_file.readline()[:-1]
    reg_file.close()
    
    url = "https://netmesh.pregi.net"
    # sha_signature = encrypt_string(serial)

    # data = {
    #   "hash": sha_signature
    # }

    try:
      # r = requests.post(url = url+"/api/register", data = data, auth = (user, password))
      pass
      # if r.status_code == 200:
      #     # eel.alert_debug("Submit success!")
      #     # file = open("hash.txt", "w")
      #     # file.write(sha_signature + "\n")
      #     # file.write(region + "\n")
      #     # file.write(serial)
      #     # file.close()
      # elif r.status_code == 400: #work on this
      #     # eel.alert_debug("Hash already exists")
      #     pass
      # elif r.status_code == 401:
      #     # eel.alert_debug("Invalid Username/Password")
      #     pass
      # elif r.status_code == 404:
      #     # eel.alert_debug("User not authorized. Please login using super admin / staff account.")
      #     pass
      # else:
      #     # print("Exiting due to status code %s: %s" % (r.status_code, r.text))
      #     pass
    except Exception as ee:
      pass
      # print(e)

def check_if_registered():
  parent_dir = "/etc"
  folder = "netmesh-rfc6349"
  registration_file = "hash.txt"
  
  if not os.path.exists(f"{parent_dir}/{folder}"):
    os.mkdir(f"{parent_dir}/{folder}", mode=0o777)

  if not os.path.exists(f"{parent_dir}/{folder}/{registration_file}"):
    return False
    # Creates a new file
    # with open(f"{parent_dir}/{folder}/{registration_file}", 'w') as fp:
    # To write data to new file uncomment
    # this fp.write("New file created")
  
  return True

def encrypt_string(hash_string):
  sha_signature = \
      hashlib.sha256(hash_string.encode()).hexdigest()
  return sha_signature

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
              self.Data4[i] = rest>>(8-i-1)*8 & 0xff

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

  @app.route('/open-downloads-folder', method=['POST'])
  def get_downloads_folder():
      return _get_known_folder_path(FOLDERID_Download)
else:
  def get_downloads_folder():
    home = os.path.expanduser("~")
    return os.path.join(home, "Downloads")

@app.route('/open-downloads-folder', methods=['POST'])
def open_downloads_folder():
  webbrowser.open('file:///' + get_downloads_folder())

@app.route('/open-logs-folder', methods=['POST'])
def open_logs_folder():
  webbrowser.open('file:///' + os.getcwd() + '/netmesh_log_files')
 
def run_on_desktop():
  if getattr(sys, 'frozen', False):
    pyi_splash.update_text("Checking update...")
  
  has_update, current_version, latest_version = netmesh_utils.has_update()
  netmesh_constants.app_version = current_version
  
  
  if getattr(sys, 'frozen', False):
    pyi_splash.update_text("Opening the app...")
  
  running_on_desktop = True
  pysideflask_ext.init_gui(application=app, port=5000, width=1280, height=720,
                           window_title=f'{netmesh_constants.APP_TITLE} ({netmesh_constants.app_version})',
                           has_update=has_update, latest_version=latest_version)

  exit()
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
