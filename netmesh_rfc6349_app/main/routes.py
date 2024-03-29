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

    if 'api_session_token' in session and session['api_session_token'] and 'email' in session and session['email']:
        return redirect(url_for('main.home_page'))

    config = NetMeshConfigFile()
    # device_config = config.load_device_config()

    device_name = config.device_config.get_device_name()
    if not device_name:
        return redirect(url_for('device_registration.register_device_page'))
    
    return redirect(url_for('users.login_page'))


@main.route('/home')
@wrappers.require_api_token
def home_page():
    config = NetMeshConfigFile()
    rfc_settings = config.settings_config.get_all_settings()
    
    return render_template('home.html', email=session['email'], full_name=session['name'], app_version=get_app_current_version(), rfc_settings=rfc_settings)
