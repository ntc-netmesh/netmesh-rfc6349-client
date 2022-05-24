import os
import subprocess
import stat
import sys

import shutil

import netmesh_constants
import netmesh_utils

def run(command):
  process = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
  while True:
    line = process.stdout.readline().rstrip()
    if not line:
      break
    yield line

def install_proj():
  ubuntu_version = netmesh_utils.get_ubuntu_version()

  # MAKE SURE THAT MAIN_DIRECTORY IS AT THE APP BASE
  temp = os.getcwd().split('dist')[0]
  MAIN_DIRECTORY = temp if temp[-1] != '/' else temp[:-1]
  INSTALLED_DIRECTORY = "/usr/bin/netmesh-rfc6349-app"

  app_name = f'netmesh-rfc6349-app'
  app_location = f'{MAIN_DIRECTORY}/netmesh_rfc6349_app.py'
  
  installer_command = f'cd {MAIN_DIRECTORY} && pyinstaller {app_location} -n "{app_name}" --clean --splash ./static/images/rfc_splash_screen.png --add-data "templates:templates" --add-data "static:static"'

  print(f"Removing existing folder '{MAIN_DIRECTORY}/dist/{app_name}'...")
  subprocess.Popen(['sudo', 'rm', '-rf', f'{MAIN_DIRECTORY}/dist/{app_name}'], stdout=subprocess.PIPE).communicate()
  
  # Run pyinstaller
  for line in run(installer_command):
    print(line)
  
  # file_path = f'/usr/share/applications/{app_name}.desktop'
  file_path = f'{MAIN_DIRECTORY}/dist/{app_name}.desktop'
  file_action = 'x'

  if os.path.isfile(file_path):
    file_action = 'w'

  additional_commands = [
    # APT-related scripts (and others) moved to 'preinst' debian installation
    # Insert python-related scripts here
    f"cd {INSTALLED_DIRECTORY} && sudo python3 -m pip install -r requirements.txt",
    "sudo apt-get install -y python3-tk",
  ]

  file_execution_commands = [
    *additional_commands,
    f'cd {INSTALLED_DIRECTORY} && ./{app_name}' # this will open the app
  ]

  with open(file_path, file_action) as f:
    f.write(f"""[Desktop Entry]
Type=Application
Terminal=true
Name={netmesh_constants.APP_TITLE}
Icon={app_name}
Categories=Application;
Exec=gnome-terminal -- bash -c "{' && '.join(file_execution_commands)}";
""")
    f.close()

  subprocess.Popen(['cp', 'requirements.txt', f'{MAIN_DIRECTORY}/dist/{app_name}'], stdout=subprocess.PIPE).communicate()

  os.system("notify-send --urgency=normal --expire-time=10000 'NetMesh Update' 'NetMesh RFC-6349 App has been successfully built'")

if __name__ == "__main__":
  install_proj()