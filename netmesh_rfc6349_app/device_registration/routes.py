import json
import re
import requests

from flask import Blueprint, request, render_template, redirect, url_for, session, current_app, jsonify

from netmesh_rfc6349_app.device_registration.utils import get_device_info
from netmesh_rfc6349_app.main.utils import netmesh_location
from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile

device_registration = Blueprint('device_registration', __name__)


@device_registration.route('/register-api', methods=['POST'])
def register_api():
    admin_email = request.form.get('adminEmail')
    device_owner_info = json.loads(request.form.get('deviceOwnerInfo'))
    device_name = request.form.get('deviceName')

    try:
        device_info = get_device_info()
        device_info.update({"name": device_name})
        device_info.update({"owner": device_owner_info['user_id']})

        req = requests.post(
            url=f"{current_app.config['RESULTS_SERVER_API_URI']}/rfc6349/device/",
            headers={"Authorization": f"Token {session['admin-token']}"},
            json=device_info
        )
        print(device_info)
        req.raise_for_status()

        config = NetMeshConfigFile()

        # device_config = config.load_device_config()
        config.device_config.set_device_name(device_name)
        config.device_config.set_device_nro_id(session['admin-nro-id'])

        config.users_config.set_logged_user({
            "name": device_owner_info['name'],
            "email": device_owner_info['email'],
        })

        config.save()
        
        session['admin-token'] = None
        session['admin-nro-id'] = None
        session['admin-ntc-region-name'] = None

        return jsonify(html=render_template('device_registration_done.html',
                               device_name=device_name,
                               admin_email=admin_email,
                               device_info=get_device_info())), 200
    except requests.exceptions.HTTPError as ex:
        print("http", ex.response.text)
        error = ""
        print(ex.response.status_code)
        try:
            error_json = json.loads(req.text)
            if "detail" in error_json:
                error = error_json["detail"]
            else:
                error = str(ex)
        except ValueError:
            error = str(ex)
            
        return jsonify(error=error), 400
    except requests.exceptions.ConnectionError as e:
        return jsonify(error="Connection error. Please check your Internet, and try again."), 500
    except requests.exceptions.RequestException as ex:
        print(ex)
        return jsonify(error=str(ex)), 400
    except Exception as ex:
        print("ex", ex)
        return jsonify(error=str(ex)), 400


@device_registration.route('/register-device')
def register_device_page():
    session['admin-token'] = None

    config = NetMeshConfigFile()
    # device_config = config.load_device_config()

    device_name = config.device_config.get_device_name()
    nro_id = config.device_config.get_device_nro_id()
    if device_name and nro_id:
        return redirect(url_for('users.login_page'))

    return render_template('register_device.html',
                           device_info=get_device_info())


@device_registration.route('/get-admin-credentials-template', methods=['POST'])
def get_admin_credentials_template():
    return render_template('device_admin_credentials.html')


@device_registration.route('/log-admin', methods=['POST'])
def log_admin():
    # device_name = request.form.get('device-name')
    admin_email = request.form.get('admin-email')
    admin_password = request.form.get('admin-password')

    # print(admin_email, admin_password)

    r = None
    users_response = []
    try:
        r = requests.post(
            url=f"{current_app.config['RESULTS_SERVER_API_URI']}/user/token/",
            json={
                "email": admin_email,
                "password": admin_password,
                "client": "admin"
            }
        )
        r.raise_for_status()

        admin_response = r.json()
        print(admin_response)

        token = admin_response['token']
        # ntc_region = admin_response['user']['nro']['region']
        # ntc_regions = dict(netmesh_location.get_philippine_regions())

        # print("ntc_region", ntc_region)

        session['admin-token'] = token
        session['admin-nro-id'] = str(admin_response['user']['nro']['id'])
        session['admin-ntc-region-name'] = admin_response['user']['nro']['description']
        print(session['admin-ntc-region-name'])

        r = requests.get(
            url=f"{current_app.config['RESULTS_SERVER_API_URI']}/user/manage/",
            params={
                "nro": session['admin-nro-id']
            },
            headers={'Authorization': f"Token { session['admin-token'] }"}
        )
        r.raise_for_status()

        users_response = r.json()
    except requests.exceptions.HTTPError as ex:
        print(ex)
        print("HTTP error")
        error = "Unexpected error"
        try:
            error_json = json.loads(r.content)
            if ex.response.status_code == 400:
                error = "Invalid email or password"
            elif "non_field_errors" in error_json:
                error = error_json["non_field_errors"]
            else:
                error = r.content
        except Exception as ex2:
            print(ex or ex2)
            error = str(ex or ex2)
            
        return render_template('device_admin_credentials.html', error=error, admin_email=admin_email, admin_password=admin_password), 400
    except requests.exceptions.ConnectionError as ex:
        print(ex)
        print(ex.strerror)
        return render_template('device_admin_credentials.html', error=str(ex), admin_email=admin_email, admin_password=admin_password), 400
    except requests.exceptions.RequestException as ex:
        print(ex.response)
        

        return render_template('device_admin_credentials.html', error=str(ex), admin_email=admin_email, admin_password=admin_password), 400

    return render_template('device_details_form.html', region_name=session['admin-ntc-region-name'], users=users_response)


# @device_registration.route('/get-device-details-template', methods=['POST'])
# def get_device_details_template():
#     nro_id = session['admin-nro-id']
#     region_name = session['admin-ntc-region-name']

#     # print("ntc_region", region)
#     print("token", session['admin-token'])

#     # regions = netmesh_location.get_philippine_regions()
#     try:
#         r = requests.get(
#             url=f"{current_app.config['RESULTS_SERVER_API_URI']}/user/manage/",
#             params={
#                 "nro": nro_id
#             },
#             headers={'Authorization': f"Token { session['admin-token'] }"}
#         )
#         r.raise_for_status()

#         print("users")
#         print(r.text)
#     except requests.exceptions.RequestException as re:
#         error = "Unexpected error"
#         try:
#             error_json = json.loads(r.content)
#             if "non_field_errors" in error_json:
#                 error = error_json["non_field_errors"]
#             else:
#                 error = r.content
#         except Exception as ex:
#             print(ex)
#             error = str(re)

#         # TODO: show error on modal admin credentials
#         return render_template('device_details_form.html', error=error), 400

#     return render_template('device_details_form.html', users=r.json(), region_name=region_name)


@device_registration.route('/device-confirmation-template', methods=['POST'])
def device_confirmation_template():
    region_name = session['admin-ntc-region-name']
    laptop_owner = request.form.get('laptopOwner')
    laptop_owner_email = request.form.get('laptopOwnerEmail')
    laptop_name = request.form.get('laptopName')

    return render_template('device_confirmation.html',
                           region_name=region_name,
                           laptop_owner=laptop_owner,
                           laptop_name=laptop_name,
                           laptop_owner_email=laptop_owner_email,
                           device_info=get_device_info())


@device_registration.route('/reset-registration', methods=['POST'])
def reset_registration():
    ini = NetMeshConfigFile()
    try:
        ini.delete()
        return jsonify(), 200
    except Exception as ex:
        return jsonify(error=str(ex)), 400
