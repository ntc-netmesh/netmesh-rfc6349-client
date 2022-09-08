import requests
import json

from flask import Blueprint, Response, redirect, request, render_template, jsonify, session, url_for, current_app

from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile
from netmesh_rfc6349_app.main.utils.laptop_info import get_ubuntu_version
from netmesh_rfc6349_app.main.utils.netmesh_installer import get_app_current_version
from netmesh_rfc6349_app.main.utils import log_settings

from netmesh_rfc6349_app.users import utils

users = Blueprint('users', __name__)


@users.route('/login')
def login_page():
    config = NetMeshConfigFile()
    # device_config = config.load_device_config()
    # users_config = config.load_users_config()
    
    device_name = config.device_config.get_device_name()
    region = config.device_config.get_device_region()
    if not device_name or not region:
        return redirect(url_for('device_registration.register_device_page'))
    
    return render_template('login.html',
                           logged_users=config.users_config.get_logged_users(),
                           app_version=get_app_current_version(),
                           ubuntu_version=get_ubuntu_version(),
                           device_name=device_name)


@users.route('/check-user-token', methods=['POST'])
def check_user_token():
    user_email = request.form.get("email")
    
    config = NetMeshConfigFile()
    logging_user = config.users_config.get_logged_user(user_email)
    
    if 'token' in logging_user:
        token = logging_user['token']
        try:
            req = requests.get(url=f"{current_app.config['RESULTS_SERVER_API_URI']}/user/myprofile/",
                                headers={
                                    'Authorization': f'Token {token}'
                                })
            req.raise_for_status()
            
            res = req.json()
            utils.save_logged_user(token,
                                   res['email'],
                                   res['first_name'],
                                   res['last_name'],
                                   logging_user['token_expiry'])
            
            return jsonify(url=url_for('main.home_page'), info='Success'), 200
        except requests.exceptions.RequestException as re:
            error = ''
            try:
                error_json = req.json()
                if "detail" in error_json:
                    error = error_json["detail"]
                else:
                    error = json.dumps(error_json)
            except Exception as ex:
                error = re.response.text
                
            return jsonify(url=None, info=error), re.response.status_code
    else:
        return jsonify(url=None, info='User not logged in yet'), 200


@users.route('/login-submit', methods=['POST'])
def login():
    user_email = request.form.get("user-email")
    password = request.form.get("user-password")

    print(user_email, password)

    error = None
    try:
        data = utils.login(user_email, password)
        
        utils.save_logged_user(data['token'],
                               data['user']['email'],
                               data['user']['first_name'],
                               data['user']['last_name'],
                               data['expiry'])
        
        return {"goto": url_for('main.home_page')}, 200
    except requests.exceptions.ConnectionError as ex:
        return jsonify(error="Connection error. Please check your Internet connection"), 400
    except requests.exceptions.Timeout as ex:
        return jsonify(error="Connection timeout. Please try again"), 400
    except requests.exceptions.RequestException as ex:
        error_content = "Unexpected error occured"
        try:
            error_content = ex.response.content
            error_json = json.loads(error_content)
            if error_json and "non_field_errors" in error_json:
                return jsonify(error=error_json["non_field_errors"]), 400
            else:
                return jsonify(error=str(error_content)), 400
        except Exception:
            return jsonify(error=str(error_content)), 400
    except Exception as e:
        print("error", e)
        return jsonify(error=str(e)), 500

@users.route('/refresh-logged-users', methods=['POST'])
def refresh():
    user_email = request.form.get("email")
    
    config = NetMeshConfigFile()
    config.users_config.remove_logged_user(user_email)
    config.save()
    
    return jsonify(url=url_for('users.login_page'))

@users.route('/relogin', methods=['POST'])
def relogin():
    email = session['email']
    password = request.form.get("password")

    print(email)
    print(password)

    error = None
    try:
        token = utils.relogin(email, password)
        session['api_session_token'] = token
        session['email'] = email
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
    # config_file = NetMeshConfigFile()
    
    # user = config_file.users_config.get_logged_user(session['email'])
    # if user:
    #     config_file.users_config.set_logged_user({
    #         "name": user['name'],
    #         "email": session['email']
    #     })
    #     config_file.save()

    session['api_session_token'] = None
    session['email'] = None
    
    return redirect(url_for('users.login_page'))
