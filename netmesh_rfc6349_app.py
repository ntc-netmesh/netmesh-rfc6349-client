import os
import sys
import subprocess
import uuid

from re import split

import ast
import json
import hashlib

from flask.helpers import make_response
import requests
import folium
import math

import wrappers
import user_auth
import ADB

from pysideflask_ext import init_gui
from flask import Flask, Response, render_template, request, flash, redirect, url_for, abort, session
from flask_login import LoginManager, login_user, logout_user

import pdfkit

def resource_path(relative_path):
  """ Get absolute path to resource, works for dev and for PyInstaller """
  base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
  return os.path.join(base_path, relative_path)
  
if getattr(sys, 'frozen', False):
  template_folder = resource_path('templates')
  static_folder = resource_path('static')
  app = Flask(__name__,
              template_folder=template_folder,
              static_folder=static_folder)
else:
  app = Flask(__name__)
  
app.config['SECRET_KEY'] = os.urandom(24)

# ui.view.setMinimumSize(800, 600)
# ui.view.setContextMenuPolicy(Qt.PreventContextMenu)
# ui.page.profile().downloadRequested.connect(onDownloadRequested)
# ui.page.profile().clearHttpCache()
# ui.page.profile().clearAllVisitedLinks()
# ui.page.profile().scripts().clear()

login_manager = LoginManager()
login_manager.init_app(app)

@app.route('/')
def login_page():
  if 'api_session_token' in session and session['api_session_token'] and 'username' in session and session['username']:
    print('api_session_token')
    print(session['api_session_token'])
    print('username')
    print(session['username'])
    
    return redirect(url_for('home_page'))
  
  return render_template('login.html')

@app.route('/register-device')
def register_device_page():
  serial_number = ""
  process = subprocess.Popen("sudo dmidecode -t system | grep Serial ", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout,stderr = process.communicate()
  if stdout:
    serial_number = stdout.decode().split(':')[1].strip()
  else:
    return render_template('register_device.html',
      error=stderr)
    
  return render_template('register_device.html', serial_number=serial_number)

# ********************************
# PAGES
# ********************************
@app.route('/home')
@wrappers.require_api_token
def home_page():
  print(session['api_session_token'])
  return render_template('home.html', name=session['username'])

@app.route('/report', methods=['POST'])
def report():  
  server_name = request.form['serverName']
  started_on = request.form['startedOn']
  finished_on = request.form['finishedOn']
  duration = request.form['duration']
  generated_on = request.form['generatedOn']
  username = session['username']
  directions = json.loads(request.form['directions'])
  
  results = {}
  for d in directions:
    results[d] = json.loads(session[d+'_test_results'])
  
  return render_template('report.html',
                         cir=session['test_details-cir'],
                         net=session['test_details-net'],
                         server_name=server_name,
                         mode=session['test_details-mode'],
                         lon=session['test_details-lon'],
                         lat=session['test_details-lat'],
                         started_on=started_on,
                         finished_on=finished_on,
                         duration=duration,
                         directions=directions,
                         directions_text=json.dumps(directions),
                         results=results,
                         username=username,
                         generated_on=generated_on
                        )
  
  
  
# ********************************
# COMPONENTS
# ********************************
@app.route('/render-map', methods=['POST'])
def map_html():
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


# ********************************
# AUTH
# ********************************
@app.route('/login-submit', methods = ['POST'])
def login():
  username = request.form.get("uname")
  password = request.form.get("psw")

  result = user_auth.login(username, password)
  error = result['error']
  if error is None:
    session['username'] = username
    return redirect(url_for('home_page'))
  else:
    return render_template('login.html',
      error=error)

@app.route('/logout')
def logout():
  session['api_session_token'] = None
  session['username'] = None
  return redirect(url_for('login_page'))

@login_manager.user_loader
def load_user():
    return session['username']
    
@app.route('/set-test-details', methods=['POST'])
def setTestDetails():
  cir = request.form.get("cir")
  net = request.form.get("net")
  server = request.form.get("server")
  mode = request.form.get("mode")
  lon = request.form.get("lon")
  lat = request.form.get("lat")
  
  try:
    if not (cir and net and server):
      abort(400, {
        'type': 'others',
        'errmsg': 'Incomplete details',
      })
    
    if not mode:
      abort(400, {
        'type': 'mode',
        'errmsg': 'Select test mode',
      })
      
    session['test_details-cir'] = cir
    session['test_details-net'] = net
    session['test_details-server'] = server
    session['test_details-mode'] = mode
    session['test_details-lon'] = lon
    session['test_details-lat'] = lat
    
    return Response(json.dumps({
      'cir': cir,
      'net': net,
      'server': server,
      'mode': mode,
      'lon': lon,
      'lat': lat
    }), 200)
  except Exception as e:
    return Response(json.dumps(e))
  

# ********************************
# API
# ********************************
@app.route('/process', methods=['GET', 'POST'])
def process():
  try:
    json_data = {
      "mode": "normal",
      "username": session['username']
    }
    headers = {
      "Authorization": "Bearer " + session['api_session_token']
    }
    
    if request.method == 'POST':
      test_server = request.form['testServer']
      mode = request.form['mode']
      process_id = request.form['processId']
      
      api_url = f'http://{test_server}/api/{mode}/{process_id}'
      print(api_url)
      
      script_data = json.loads(request.form['scriptData'])
      for key in script_data:
        json_data[key] = script_data[key]
      
      r = requests.post(
        url=api_url,
        json=json_data,
        headers=headers
      )
      
      if r.status_code == 200:
        return Response(json.dumps({}))
      else:
        abort(r.status_code, r.text)
        
    elif request.method == 'GET':
      test_server = request.args.get('testServer')
      mode = request.args.get('mode')
      process_id = request.args.get('processId')
      
      api_url = f'http://{test_server}/api/{mode}/{process_id}'
      
      required_params = json.loads(request.args.get('requiredParams'))
      for key in required_params:
        json_data[key] = required_params[key]
        
      r = requests.get(
        url=api_url,
        json=json_data,
        headers=headers
      )
      if r.status_code == 200:
        return Response(r.text)
      else:
        abort(r.status_code, r.text)
    else:
      abort(400, 'POST or GET request only')
  except Exception as e:
    return str(e)


@app.route('/check-status', methods=['GET'])
def check_status():
  try:
    test_server = request.args.get('testServer')
    mode = request.args.get('mode')
    job_id = request.args.get('jobId')
    
    api_url = f'http://{test_server}/api/{mode}/status/{job_id}'
    print(api_url)
    
    r = requests.get(
      url=api_url,
      headers={"Authorization":"Bearer "+session['api_session_token']}
    )
    if r.status_code == 200:
      return Response(r.text)
    else:
      abort(r.status_code, r.text)
  except Exception as e:
    return str(e)


@app.route('/get-results', methods=['GET'])
def get_results():
  try:
    test_server = request.args.get('testServer')
    if not is_test_server_ip_valid(test_server):
      raise abort(400, "Invalid IP address")  
    
    mode = request.args.get('mode')
    direction = "upload" if mode == "normal" else "download"
    
    api_url = f'http://{test_server}/api/{mode}'
  
    r = requests.get(
      url=api_url,
      headers={"Authorization":"Bearer "+session['api_session_token']}
    )
    if r.status_code == 200:
      # return Response(r.text)
      session[direction+'_test_results'] = r.text
      return render_template('results.html',
                             results=json.loads(session[direction+'_test_results']),
                             direction=direction)
    else:
      abort(r.status_code, r.text)
  except Exception as e:
    return str(e)


def is_test_server_ip_valid(ip_address):
  return ip_address == '202.90.158.6:12000'
    

# ********************************
# SCRIPTS
# ********************************
@app.route('/run-process-mtu', methods=['POST'])
def run_process_mtu():
  try:
    mode = request.form['mode']
    network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    network_interface = get_network_interface(mode, network_prefix)
    
    command_array = ['sudo', './mtu.sh', network_interface, server_ip]
    output_params = [
      {'name': 'mtu', 'key': 'mtu'},
    ]
    
    return run_process_script(mode, command_array, output_params)
  except Exception as e:
    messages = '\n'.join(list(e.args))
    return f"{type(e).__name__}: {messages}"



@app.route('/run-process-rtt', methods=['POST'])
def run_process_rtt():
  try:
    mode = request.form['mode']
    network_prefix = request.form['networkPrefix']
    server_ip = request.form['serverIP']
    network_interface = get_network_interface(mode, network_prefix)
    
    command_array = ['sudo', './rtt.sh', network_interface, server_ip]
    output_params = [
      {'name': 'rtt', 'key': 'rtt'},
    ]
    
    return run_process_script(mode, command_array, output_params)
  except Exception as e:
    messages = '\n'.join(list(e.args))
    return f"{type(e).__name__}: {messages}"



@app.route('/run-process-bdp', methods=['POST'])
def run_process_bdp():
  try:
    mode = request.form['mode']
    rtt = request.form['rtt']
    server_ip = request.form['serverIP']
    port = request.form['port']
    
    command_array = ['sudo', './bb.sh', rtt, server_ip, port]
    output_params = [
      {'name': 'bb', 'key': 'bb'},
      {'name': 'bdp', 'key': 'bdp'},
      {'name': 'rwnd', 'key': 'rwnd'},
    ]
    
    return run_process_script(mode, command_array, output_params)
  except Exception as e:
    return str(e)



@app.route('/run-process-thpt', methods=['POST'])
def run_process_thpt():
  try:
    mode = request.form['mode']
    rtt = request.form['rtt']
    rwnd = request.form['rwnd']
    ideal = request.form['ideal']
    server_ip = request.form['serverIP']
    port = request.form['port']
    
    command_array = ['sudo', './thpt.sh', rtt, rwnd, ideal, server_ip, port]
    output_params = [
      {'name': 'Total Data Sent', 'key': None},
      {'name': 'thpt_avg', 'key': 'thpt_avg'},
      {'name': 'thpt_ideal', 'key': 'thpt_ideal'},
      {'name': 'transfer_avg', 'key': 'transfer_avg'},
      {'name': 'transfer_ideal', 'key': 'transfer_ideal'},
      {'name': 'tcp_ttr', 'key': 'tcp_ttr'},
    ]
    
    return run_process_script(mode, command_array, output_params)
  except Exception as e:
    return str(e)



def run_process_script(mode, command_array, output_params):
  command = " ".join(command_array)
  process = subprocess.Popen(command_array,
                            stdout=subprocess.PIPE,
                            stderr= subprocess.PIPE,
                            cwd=resource_path(f'static/client_scripts/{mode}_mode'))
  stdout,stderr = process.communicate()
  if stdout:
    raw_lines = stdout.decode().split('\n')
    lines = list(filter(None, raw_lines))
    
    if len(lines) == 0:
      raise ValueError("No output:", "Command executed:", command)
      
    script_data = {}
    if len(lines) != len(output_params):
      raise ValueError(f"Must have {len(output_params)} lines:", stdout.decode(), "Command executed:", command)
    
    for index, line in enumerate(lines):
      pName = output_params[index]['name']
      pKey = output_params[index]['key']
      if pKey is None:
        continue
      
      line_split = line.split(':')
      if len(line_split) != 2:
        raise ValueError("Incorrect output format:", line, "Command executed:", command)
        
      line_key = line_split[0].strip()
      line_value = line_split[1].strip()
      if line_key != pName:
        raise ValueError(f"Not '{pName}'", line, "Command executed:", command)
      
      value_split = line_value.split(' ')
      value_quantity  = value_split[0]
      value_number = float(value_quantity)
      if math.isnan(value_number):
        raise ValueError(f"'{pName}' is NaN", "Command executed:", command)
      
      script_data[pKey] = value_number
      
    return Response(json.dumps(script_data))
  else:
    raise RuntimeError(stderr, "Command executed:", command)



def get_network_interface(mode, network_prefix):
  process = subprocess.Popen(['./network_interface.sh'],
                             stdout=subprocess.PIPE,
                             stderr= subprocess.PIPE,
                             cwd=resource_path(f'static/client_scripts/{mode}_mode'))
  stdout,stderr = process.communicate()
  if stdout:
    lines = stdout.decode().split('\n')
    interfaces = list(filter(lambda x: (x.startswith(network_prefix)), lines))
    if len(interfaces) > 0:
      return interfaces[0]
    else:
      abort(400, "No interfaces found")
  else:
    abort(400, stderr)

# ********************************
# EXT DATA
# ********************************
@app.route('/get-gps-coordinates', methods = ['POST'])
def get_gps_coordinates():
  print("coordinates")
  coordinates = [None, None]
  try:
    coordinates = ADB.getRawGpsCoordinates()
    print(coordinates)
    if coordinates is None:
      coordinates = [None, None]
  except Exception as e:
    print(e.__cause__)
    coordinates = [None, None]
  return Response(json.dumps(coordinates), mimetype='application/json')

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
    print("not existintig tey")
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

# @QtCore.Slot(QtWebEngineWidgets.QWebEngineDownloadItem)
# def onDownloadRequested(self, download):
#   print("yeah yeah yeah")
#   if download.state() == QtWebEngineWidgets.QWebEngineDownloadItem.DownloadRequested:
#     path, _ = QtWidgets.QFileDialog.getSaveFileName(
#       self, self.tr("Save as"), download.path()
#     )
#     if path:
#       download.setPath(path)
#       download.accept()
      
if __name__ == "__main__":
  # app.run(debug=True)
  init_gui(application=app, width=1280, height=720, window_title="NetMesh RFC-6349 App")
  