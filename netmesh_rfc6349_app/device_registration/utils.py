import subprocess
import json


def get_device_info():
    device_info = {}

    # "manufacturer": "string",
    # "product": "string",
    # "version": "string",
    # "serial_number": "string",
    # "os": "string",
    # "kernel": "string",
    # "ram": "string",
    # "disk": "string"

    # manufacturer, product, version, serial_number
    process = subprocess.Popen("sudo dmidecode -t system | grep 'Manufacturer:\|Product \|Version:\|Serial ' | awk -F': ' '{print $2}' | jq -Rs 'split(\"\n\")|{manufacturer: .[0], product: .[1], version: .[2], serial_number: .[3]}'", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        output = stdout.decode().strip()
        output_json = json.loads(output)
        for key, value in output_json.items():
            if value is None:
                output_json[key] = ""
        
        device_info.update(output_json)
    else:
        raise Exception(stderr)

    # os
    process = subprocess.Popen("lsb_release -d | awk -F':' '{print $2}'", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        device_info.update({"os": stdout.decode().strip()})
    else:
        raise Exception(stderr)

    # kernel
    process = subprocess.Popen("uname -sr", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        device_info.update({"kernel": stdout.decode().strip()})
    else:
        raise Exception(stderr)

    # ram
    process = subprocess.Popen("free --human --giga | awk -F' ' '/Mem:/ {print $2}'", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        device_info.update({"ram": stdout.decode().strip()})
    else:
        raise Exception(stderr)

    # disk
    process = subprocess.Popen("df -h --total | awk -F' ' END'{print $2}'", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        device_info.update({"disk": stdout.decode().strip()})
    else:
        raise Exception(stderr)

    return device_info
