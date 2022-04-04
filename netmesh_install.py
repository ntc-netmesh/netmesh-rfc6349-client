import os
import subprocess
import stat

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
  # Run pyinstaller
  ubuntu_version = netmesh_utils.get_ubuntu_version()
  
  app_name = f'netmesh-rfc-6349-app_{netmesh_constants.APP_VERSION}_u{ubuntu_version}'
  installer_command = f'pyinstaller netmesh_rfc6349_app.py -n "{app_name}" -s -F --clean --add-data "templates:templates" --add-data "static:static"'
  
  for line in run(installer_command):
    print(line)
  
  # Create .desktop file
  file_path = f'{os.getcwd()}/dist/{app_name}.desktop'
  file_action = 'x'
  
  print(file_path)
  
  if os.path.isfile(file_path):
    file_action = 'w'
  
  additional_commands = [
    "sudo apt-get install jq",
    # Insert additional commands if necessary (ie. APT dependencies)
  ]
  
  file_execution_commands = [
    *additional_commands,
    f"cd $(dirname %k) && ./{app_name}" # this will open the app
  ]
    
  with open(file_path, file_action) as f:
    f.write(f"""[Desktop Entry]
Type=Application
Terminal=true
Name={app_name}
Icon=utilities-terminal
Categories=Application;
Exec=gnome-terminal -- bash -c "{' && '.join(file_execution_commands)}";
""")
    f.close()
    
  # Allow .desktop file to execute
  st = os.stat(file_path)
  os.chmod(file_path, st.st_mode | 0o111)
  

if __name__ == "__main__":
  install_proj()