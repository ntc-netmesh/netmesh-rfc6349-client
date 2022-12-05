import math
from socket import AddressFamily
import subprocess

import json
import requests

import psutil
import netifaces

import math

from flask import Response, abort, session, jsonify, current_app

from netmesh_rfc6349_app import app_resource_path
import netmesh_rfc6349_app.main.utils.log_settings as log_settings

def run_process_script(mode, command_array, output_params, ave_rtt_params=None):
    command = " ".join(command_array)
    process = subprocess.Popen(command_array,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               cwd=app_resource_path(f'{current_app.static_folder}/client_scripts/normal_mode'))
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


def get_network_interface(network_connection_type_name, network_prefix):
    process = subprocess.Popen(['./network_interface.sh'],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE,
                               cwd=app_resource_path(f'{current_app.static_folder}/client_scripts/normal_mode'))
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
        
def get_ethernet_connections(app=current_app):
    addresses = psutil.net_if_addrs()
    stats = psutil.net_if_stats()
    
    connection_types = {
        "en": "Ethernet",
    }
    # if app.config['FLASK_DEBUG'] == 1:
    #     connection_types.update({
    #         "wl": "Wi-Fi"
    #     })
        
    ethernets = []
    for intface, addr_list in addresses.items():
        if any(getattr(addr, 'address').startswith("169.254") for addr in addr_list):
            continue
        elif intface in stats and any([intface.startswith(ct) for ct in connection_types.keys()]) and getattr(stats[intface], "isup"):
            ip_address = next(map(lambda a: a.address, filter(lambda n: n.family == AddressFamily.AF_INET, addresses[intface])), None)
            if not ip_address:
                continue
            ethernets.append({
                "name": intface,
                "type": connection_types[intface[0:2]] if intface[0:2] in connection_types.keys() else "Network",
                "ip_address": ip_address
            })
    
    return ethernets


def get_default_gateway():
    gateways = netifaces.gateways()
    if not gateways or not 'default' in gateways or not netifaces.AF_INET in gateways['default']:
        return None

    return gateways['default'][netifaces.AF_INET][0]

def calculate_window_size(bdp):
    # mss = 1460
    # 64240 = (65535 // mss) * mss
    min_window_size = 560
    
    max_iteration = 0 if bdp == 0 else math.floor(math.log(bdp / 64240, 2))
    
    return max(min_window_size, math.trunc(64240 * (2 ** max_iteration)))