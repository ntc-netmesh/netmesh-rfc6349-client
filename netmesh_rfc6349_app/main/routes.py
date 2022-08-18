from flask import Blueprint, render_template, redirect, session, url_for

import netmesh_rfc6349_app.main.wrappers as wrappers

from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile
from netmesh_rfc6349_app.main.utils.netmesh_installer import get_app_current_version

main = Blueprint('main', __name__)

@main.route('/')
def index_page():
    print("Check if app is already running on desktop")

    # TODO: [Research] check if already running on desktop
    # if running_on_desktop == True:
    #     return "This app is already running on desktop."

    if 'api_session_token' in session and session['api_session_token'] and 'username' in session and session['username']:
        return redirect(url_for('main.home_page'))

    config = NetMeshConfigFile()
    device_config = config.load_device_config()

    device_name = device_config.get_device_name()
    if not device_name:
        return redirect(url_for('device_registration.register_device_page'))

    return redirect(url_for('users.login_page'))


@main.route('/home')
@wrappers.require_api_token
def home_page():
    return render_template('home.html', username=session['username'], app_version=get_app_current_version())