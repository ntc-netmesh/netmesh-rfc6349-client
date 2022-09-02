import os
import sys
import subprocess
import tempfile

import requests

from netmesh_rfc6349_app import app_resource_path

# import pkg_resources


def check_app_latest_version(app):
    current_version = ""
    latest_version = ""

    # APP_DIR = app_resource_path('')

    r = requests.get(app.config['APP_LATEST_GITHUB_RELEASE_URL'])
    latest_version = r.json()['tag_name']
    if latest_version[0] == 'v':
        latest_version = latest_version[1:]

    current_version = get_app_current_version()
    if not current_version:
        current_version = latest_version

    print("latest_version: ", latest_version)
    print("current_version: ", current_version)

    # netmesh_constants.app_version = current_version

    if current_version == latest_version:
        return (False, current_version, latest_version)

    return (True, current_version, latest_version)


def get_app_current_version():
    process = subprocess.Popen("apt-cache policy netmesh-rfc6349-app | grep 'Installed:' | awk -F': ' '{ print $2 }'",
                               shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()

    app_version = None
    if stdout:
        app_version = stdout.decode().strip()

    return app_version


def update_app():
    APP_DIR = app_resource_path('')

    print("Updating to the latest version...")
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
    deb_process = subprocess.Popen(f"cd {APP_DIR} && sudo dpkg -i netmesh-rfc6349-app_*.deb", shell=True,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE)
    stdout, stderr = deb_process.communicate()
    if stdout:
        print(stdout.decode().strip())
    if stderr:
        print(stderr.decode().strip())
        raise Exception(stderr)
    
    print("Removing the package")
    delete_existing_deb_process = subprocess.Popen(f"cd {APP_DIR} && sudo rm netmesh-rfc6349-app_*.deb", shell=True,
                                                   stdout=subprocess.PIPE,
                                                   stderr=subprocess.PIPE)
    stdout, stderr = delete_existing_deb_process.communicate()
    if stdout:
        print(stdout.decode().strip())
    if stderr:
        print(stderr.decode().strip())

    return True

# def upgrade_python_packages():
#     packages = [dist.project_name for dist in pkg_resources.working_set if dist.project_name != 'pkg_resources']
#     subprocess.call(f"python3 -m pip install --upgrade {' '.join(packages)}", shell=True)