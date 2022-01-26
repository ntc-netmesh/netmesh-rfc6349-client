import sys
import os
import webbrowser
import subprocess
import uuid

import requests
import json
import hashlib
import math

import folium

import pysideflask_ext
from flask import Flask, Response, render_template, request, flash, redirect, url_for, abort, session
from flask_login import LoginManager, login_user, logout_user

import netmesh_config
import netmesh_utils
import wrappers
import user_auth
import ADB
  
if getattr(sys, 'frozen', False):
  template_folder = netmesh_utils.resource_path('templates')
  static_folder = netmesh_utils.resource_path('static')
  app = Flask(__name__,
              template_folder=template_folder,
              static_folder=static_folder)
else:
  app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)

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
  
  return render_template('login.html',
                         app_version=netmesh_config.APP_VERSION,
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
    

# ----------------------------------------------------------------
# PAGES
# ----------------------------------------------------------------
@app.route('/home')
@wrappers.require_api_token
def home_page():
  return render_template('home.html', username=session['username'], app_version=netmesh_config.APP_VERSION)


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
                         app_version=netmesh_config.APP_VERSION,
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

  # cir = 35
  # net = "Ethernet"
  # mode = "bidirectional"
  # lon = 14
  # lat = 121
  # server_name = "Sample server"
  # started_on = "2022-01-01 01:14:23"
  # finished_on = "2022-01-01 01:15:52"
  # duration = "1m 29s"
  # directions = ["upload", "download"]
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
  #                        cir=cir,
  #                        net=net,
  #                        server_name=server_name,
  #                        mode=mode,
  #                        lon=lon,
  #                        lat=lat,
  #                        started_on=started_on,
  #                        finished_on=finished_on,
  #                        duration=duration,
  #                        directions=directions,
  #                        directions_text=json.dumps(directions),
  #                        results=results,
  #                        username=username,
  #                        generated_on=generated_on
  #                       )
  
  
# ----------------------------------------------------------------
# UI COMPONENTS
# ----------------------------------------------------------------
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

# ----------------------------------------------------------------
# AUTH
# ----------------------------------------------------------------
@app.route('/login-submit', methods=['POST'])
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
      app_version=netmesh_config.APP_VERSION,
      ubuntu_version=netmesh_utils.get_ubuntu_version(),
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
  cir = int(request.form.get("cir"))
  net = request.form.get("net")
  server_ip = request.form.get("serverIP")
  mode = request.form.get("mode")
  lon = request.form.get("lon")
  lat = request.form.get("lat")
  
  required_fields = cir and net and server_ip and mode and lon and lat
  
  if not required_fields:
    return Response(json.dumps({
      'field': None,
      'invalid-feedback': "Incomplete input"
    }), 400)
  
  min_mbps = 1
  max_mbps = 100
  if cir < min_mbps or cir > max_mbps:
    return Response(json.dumps({
      'field': 'cir',
      'invalid-feedback': f"Enter between {min_mbps} to {max_mbps} Mbps"
    }), 400)
    
  session['test_details-cir'] = cir
  session['test_details-net'] = net
  session['test_details-mode'] = mode
  session['test_details-lon'] = lon
  session['test_details-lat'] = lat
  
  return Response(json.dumps({
    'cir': cir,
    'net': net,
    'mode': mode,
    'lon': lon,
    'lat': lat
  }), 200)
  

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
    
    # local_test_servers = list(filter(lambda x: (x['type'] == "local"), json.loads(r.text)))
    test_servers = json.loads(r.text)
    print("test_servers")
    print(test_servers)
    
    if r.status_code == 200:
      return Response(json.dumps(test_servers))
    elif r.status_code == 404:
      return Response(json.dumps({
        "error": f"Cannot connect to {main_url}"
      }), r.status_code)
  except requests.exceptions.ConnectionError as ece:
    return Response(json.dumps({
      "error": "Connection error",
      "message": str(ece)
    }), 500)
  except requests.exceptions.Timeout as et:
    return Response(json.dumps({
      "error": "Request timeout",
      "message": str(et)
    }), 500)
  except requests.exceptions.RequestException as e:
    return Response(json.dumps({
      "error": "Cannot get test servers",
    }), 500)
  except Exception as e:
    return Response(json.dumps({
      "error": "Cannot get test servers"
    }), 500)

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
      test_server_name = request.form['testServerName']
      test_server_url = request.form['testServerUrl']
      mode = request.form['mode']
      process_id = request.form['processId']
      
      api_url = f'{test_server_url}/api/{mode}/{process_id}'
      print(api_url)
      
      script_data = json.loads(request.form['scriptData'])
      for key in script_data:
        json_data[key] = script_data[key]
      
      r = requests.post(
        url=api_url,
        json=json_data,
        headers=headers,
      )
      
      if r.status_code == 200:
        return Response(json.dumps({}))
      elif r.status_code == 401:
        error_json = json.loads(r.text)
        error_content = ""
        if "msg" in error_json:
          error_content = error_json["msg"]
        else:
          error_content = r.text
        return Response(json.dumps({
          "error": error_content
        }), r.status_code)
      elif r.status_code == 404:
        return Response(json.dumps({
          "error": f"Cannot connect to {test_server_name}"
        }), r.status_code)
      else:
        print("r.status_code")
        print(r.status_code)
        return Response(json.dumps({
          "error": f"Cannot send the measurements",
          "message": r.text
        }), r.status_code)
        
    elif request.method == 'GET':
      test_server_name = request.args.get('testServerName')
      test_server_url = request.args.get('testServerUrl')
      mode = request.args.get('mode')
      process_id = request.args.get('processId')
      
      api_url = f'{test_server_url}/api/{mode}/{process_id}'
      
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
      elif r.status_code == 404:
        return Response(json.dumps({
          "error": f"Cannot connect to {test_server_name}"
        }), r.status_code)
      else:
        print("ERROR IN Get /process (not exception)")
        return Response(json.dumps({
          "error": f"Test failed",
          "message": r.text
        }), r.status_code)
    else:
      return Response(json.dumps({
        "error": "POST or GET request only"
      }), 400)
  except requests.exceptions.ConnectionError as ece:
    print(ece.args)
    print(ece.__class__)
    print(ece.__dict__)
    print(ece.__cause__)
    return Response(json.dumps({
      "error": "Connection error",
      "message": str(ece)
    }), 500)
  except requests.exceptions.Timeout as et:
    return Response(json.dumps({
      "error": "Request timeout",
      "message": str(et)
    }), 500)
  except requests.exceptions.RequestException as e:
    return Response(json.dumps({
      "error": "Unexpected error",
      "message": str(e)
    }), 500)
  except Exception as e:
    return Response(json.dumps({
      "error": "Unexpected error",
      "message": str(e)
    }), 500)


@app.route('/check-status', methods=['GET'])
def check_status():
  try:
    test_server_name = request.args.get("testServerName")
    test_server_url = request.args.get('testServerUrl')
    mode = request.args.get('mode')
    job_id = request.args.get('jobId')
    
    api_url = f'{test_server_url}/api/{mode}/status/{job_id}'
    print(api_url)
    
    r = requests.get(
      url=api_url,
      headers={"Authorization":"Bearer "+session['api_session_token']}
    )
    if r.status_code == 200:
      return Response(r.text)
    elif r.status_code == 404:
      return Response(json.dumps({
        "error": f"Cannot connect to {test_server_name}"
      }), r.status_code)
    else:
      return Response(json.dumps({
        "error": f"Cannot check the status of this process",
        "message": r.text
      }), r.status_code)
  except requests.exceptions.ConnectionError as ece:
    return Response(json.dumps({
      "error": "Connection error",
      "message": str(ece)
    }), 500)
  except requests.exceptions.Timeout as et:
    return Response(json.dumps({
      "error": "Request timeout",
      "message": str(et)
    }), 500)
  except requests.exceptions.RequestException as e:
    return Response(json.dumps({
      "error": f"Cannot check the status of this process",
      "message": str(e)
    }), 500)
  except Exception as e:
    return Response(json.dumps({
      "error": f"Cannot check the status of this process",
      "message": str(e)
    }), 500)

@app.route('/get-results', methods=['GET'])
def get_results():
  try:
    test_server_name = request.args.get('testServerName')
    test_server_url = request.args.get('testServerUrl')
    
    mode = request.args.get('mode')
    direction = "upload" if mode == "normal" else "download"
    
    api_url = f'{test_server_url}/api/{mode}'
  
    r = requests.get(
      url=api_url,
      headers={"Authorization":"Bearer "+session['api_session_token']}
    )
    if r.status_code == 200:
      session[direction+'_test_results'] = r.text
      return render_template('results.html',
                             results=json.loads(session[direction+'_test_results']),
                             direction=direction)
    elif r.status_code == 404:
      return Response(json.dumps({
        "error": f"Cannot connect to {test_server_name}"
      }), r.status_code)
    else:
      return Response(json.dumps({
        "error": f"Cannot get the test results",
        "message": r.text
      }), r.status_code)
  except requests.exceptions.ConnectionError as ece:
    return Response(json.dumps({
      "error": "Connection error",
      "message": str(ece)
    }), 500)
  except requests.exceptions.Timeout as et:
    return Response(json.dumps({
      "error": "Request timeout",
      "message": str(et)
    }), 500)
  except requests.exceptions.RequestException as e:
    print("e.args")
    print(e.args)
    return Response(json.dumps({
      "error": f"Cannot get the test results",
      "message": str(e)
    }), 500)
  except Exception as e:
    return Response(json.dumps({
      "error": f"Cannot get the test results",
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
  
  command_array = ['sudo', './bb.sh', rtt, server_ip, port]
  output_params = [
    {'name': 'bb', 'key': 'bb'},
    {'name': 'bdp', 'key': 'bdp'},
    {'name': 'rwnd', 'key': 'rwnd'},
  ]
  
  return run_process_script(mode, command_array, output_params)



@app.route('/run-process-thpt', methods=['POST'])
def run_process_thpt():
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



def run_process_script(mode, command_array, output_params):
  command = " ".join(command_array)
  process = subprocess.Popen(command_array,
                            stdout=subprocess.PIPE,
                            stderr= subprocess.PIPE,
                            cwd=netmesh_utils.resource_path(f'static/client_scripts/{mode}_mode'))
  stdout,stderr = process.communicate()
  if stdout:
    raw_lines = stdout.decode().split('\n')
    lines = list(filter(None, raw_lines))
    
    if len(lines) == 0:
      abort(Response(json.dumps({
        "error": "Script error: No output",
        "message": {
          "shell_command": command,
          "shell_output": stdout.decode()
        }
      }), 400))
      
    script_data = {}
    if len(lines) != len(output_params):
      abort(Response(json.dumps({
        "error": f"Script error: Unexpected output",
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
      if len(line_split) != 2:
        abort(Response(json.dumps({
          "error": "Script error: Cannot parse into key-value pair",
          "message": {
            "shell_command": command,
            "shell_output": stdout.decode()
          }
        }), 400))
        
      line_key = line_split[0].strip()
      line_value = line_split[1].strip()
      if line_key != pName:
        abort(Response(json.dumps({
          "error": f"Script error: Cannot find key '{pName}'",
          "message": {
            "shell_command": command,
            "shell_output": stdout.decode()
          }
        }), 400))
      
      value_split = line_value.split(' ')
      value_quantity  = value_split[0]
      value_number = float(value_quantity)
      if math.isnan(value_number):
        abort(Response(json.dumps({
          "error": f"Script error: '{pName}' is NaN",
          "message": {
            "shell_command": command,
            "shell_output": stdout.decode()
          }
        }), 400))
      
      script_data[pKey] = value_number
      
    return Response(json.dumps(script_data))
  else:
    abort(Response(json.dumps({
      "error": f"Script error: {stderr.decode()}",
      "message": {
        "shell_command": command,
        "shell_output": stdout.decode()
      }
    }), 400))



def get_network_interface(mode, network_connection_type_name, network_prefix):
  process = subprocess.Popen(['./network_interface.sh'],
                             stdout=subprocess.PIPE,
                             stderr= subprocess.PIPE,
                             cwd=netmesh_utils.resource_path(f'static/client_scripts/{mode}_mode'))
  stdout,stderr = process.communicate()
  if stdout:
    lines = stdout.decode().split('\n')
    interfaces = list(filter(lambda x: (x.startswith(network_prefix)), lines))
    if len(interfaces) > 0:
      return interfaces[0]
    else:
      abort(Response(json.dumps({
        "error": f"{network_connection_type_name} connection not found"
      }), 500))
  else:
    abort(Response(json.dumps({
      "error": f"Network interface error",
      "message": stderr.decode()
    }), 500))

# ----------------------------------------------------------------
# EXTERNAL DATA
# ----------------------------------------------------------------
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

@app.route('/open-downloads-folder', methods=['GET'])
def open_downloads_folder():
  webbrowser.open('file:///' + get_downloads_folder())


if __name__ == "__main__":
  app.run(debug=True)
  # pysideflask_ext.init_gui(application=app, width=1280, height=720, window_title=netmesh_config.APP_TITLE)
  