from asyncio import subprocess
import sys
import os

import subprocess
import requests
import netmesh_constants
from netmesh_constants import APP_TAG_URL

# ----------------------------------------------------------------
# Flask
# ----------------------------------------------------------------
def resource_path(relative_path):
  """ Get absolute path to resource, works for dev and for PyInstaller """
  base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
  return os.path.join(base_path, relative_path)

# ----------------------------------------------------------------
# OS & Devices
# ----------------------------------------------------------------
def get_ubuntu_version():
  ubuntu_version = ""
  process = subprocess.Popen("lsb_release -a | grep Release:", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout,stderr = process.communicate()
  if stdout:
    ubuntu_version = stdout.decode().split(':')[1].strip()
  else:
    ubuntu_version = stderr.decode()
  return ubuntu_version

def get_laptop_serial_number():
  serial_number = ""
  process = subprocess.Popen("sudo dmidecode -t system | grep Serial ", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout,stderr = process.communicate()
  if stdout:
    serial_number = stdout.decode().split(':')[1].strip()
  else:
    raise Exception(stderr)
  
  return serial_number
    
def get_machine_name():
  machine_name = ""
  process = subprocess.Popen("sudo dmidecode -t system | grep 'Manufacturer:\|Version:\|Serial ' | awk -F': ' '{print $2}'", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout,stderr = process.communicate()
  if stdout:
    machine_info = stdout.decode().strip().split('\n')
    machine_name = "-".join(machine_info)
  else:
    raise Exception(stderr)
  
  return machine_name

# ----------------------------------------------------------------
# UPDATER
# ----------------------------------------------------------------

def has_update():
  current_version = ""
  APP_DIR = resource_path('')
  process = subprocess.Popen("apt-cache policy netmesh-rfc6349-app | grep 'Installed:' | awk -F': ' '{ print $2 }'", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout, stderr = process.communicate()
  if stdout:
    current_version = stdout.decode().strip()
    netmesh_constants.app_version = current_version
  else:
    raise Exception(stderr)

  r = requests.get(APP_TAG_URL)
  latest_version = r.json()['tag_name']
  print("latest_version: ", latest_version)
  print("current_version: ", current_version)
  if current_version == latest_version:
      return (False, current_version, latest_version)
  return (True, current_version, latest_version)

def update():
  APP_DIR = resource_path('')
  RSYNC_URL = "netmesh-rsync@netmesh-api.asti.dost.gov.ph::netmesh-latest-deb-release"
  process = subprocess.Popen(f"export RSYNC_PASSWORD='netmeshlatestcc2022'; rsync -a {RSYNC_URL} {APP_DIR}", shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout, stderr = process.communicate()
  if stdout:
      print(stdout.decode().strip())
  if stderr:
      print(stderr.decode().strip())
      raise Exception(stderr)

  # EXECUTE THE DEB FILE HERE
  return



def old_update_github():
  r = requests.get(APP_TAG_URL)
  APP_DIR = resource_path('')
  print(r.json())
  latest_tag = r.json()['tag_name']
  process = subprocess.Popen(f'git checkout tags/{latest_tag}', shell=True,
                          stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE)
  stdout,stderr = process.communicate()
  if stdout:
      print(stdout.decode().strip())
  if stderr:
      print(stderr.decode().strip())
  #if not stdout:
  #  raise Exception(stderr)

#if __name__ == "__main__":
#  update()
#  #mn = get_machine_name()
#  #print("mn")
#  #print(mn)
