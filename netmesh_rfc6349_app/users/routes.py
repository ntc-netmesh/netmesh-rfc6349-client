import requests
import json

from flask import Blueprint, Response, redirect, request, render_template, session, url_for, current_app

from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile
from netmesh_rfc6349_app.main.utils.laptop_info import get_ubuntu_version
from netmesh_rfc6349_app.main.utils.netmesh_installer import get_app_current_version
from netmesh_rfc6349_app.main.utils import log_settings

from netmesh_rfc6349_app.users import utils

users = Blueprint('users', __name__)


@users.route('/login')
def login_page():
    config = NetMeshConfigFile()
    device_config = config.load_device_config()
    users_config = config.load_users_config()

    return render_template('login.html',
                           logged_users=users_config.get_logged_users(),
                           app_version=get_app_current_version(),
                           ubuntu_version=get_ubuntu_version(),
                           device_name=device_config.get_device_name())


@users.route('/check-user-token', methods=['POST'])
def check_user_token():
    token = request.args.get('user-token')
    if token:
        # check if expired
        session['access-token'] = token
        return redirect(url_for('main.home_page'))
    else:
        return
        # ilabas yung popup page


@users.route('/login-submit', methods=['POST'])
def login():
    user_email = request.form.get("user-email")
    password = request.form.get("user-password")

    print(user_email, password)

    error = None
    try:
        token = utils.login("user1", password)
        session['api_session_token'] = token
        session['username'] = user_email
    except requests.exceptions.ConnectionError as ce:
        error = "Connection error. Please check your Internet connection"
    except requests.exceptions.Timeout as te:
        error = "Connection timeout. Please try again"
    except requests.exceptions.RequestException as req:
        if str(req) in ("Incorrect username.", "Incorrect password."):
            error = "Invalid username or password"
        else:
            error = str(req)
    except Exception as e:
        error = str(e)

    if error is None:
        return redirect(url_for('main.home_page'))
    else:
        log_settings.log_error(error)
        return render_template('login.html',
                               app_version=get_app_current_version(),
                               ubuntu_version=get_ubuntu_version(),
                               error=error)


@users.route('/relogin', methods=['POST'])
def relogin():
    username = session['username']
    password = request.form.get("password")

    print(username)
    print(password)

    error = None
    try:
        token = utils.relogin(username, password)
        session['api_session_token'] = token
        session['username'] = username
    except requests.exceptions.ConnectionError as ce:
        error = "Connection error. Please check your Internet connection"
    except requests.exceptions.Timeout as te:
        error = "Connection timeout. Please try again"
    except requests.exceptions.RequestException as req:
        error = "Cannot login\n" + str(req)
    except Exception as e:
        error = str(e)

    if error is None:
        return Response(json.dumps({}), 200)
    else:
        print("oh no")
        log_settings.log_error(error)
        return Response(json.dumps({
            "error": error
        }), 500)


@users.route('/logout')
def logout():
    session['api_session_token'] = None
    session['username'] = None
    return redirect(url_for('users.login_page'))
