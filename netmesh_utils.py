from asyncio import subprocess
import sys
import os

import subprocess

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
    
