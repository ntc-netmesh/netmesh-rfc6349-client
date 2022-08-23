import json
import requests

from flask import Blueprint, request, render_template, redirect, url_for, session, current_app

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
        # raise Exception("fjwkfhwef fwefywifuwoef wfyuwifywefj ifyweofiy fgiueygf reyfyferufyuiwefy wqoefysregfesruig ye ogoiesryferurfyf goyfgrwey fyewrgf ruei")
        device_info = get_device_info()
        device_info.update({"name": device_name})
        device_info.update({"user": device_owner_info['user_id']})

        r = requests.post(
            url=f"{current_app.config['RESULTS_SERVER_API_URL']}/rfc6349/device/",
            headers={"Authorization": f"Token {session['admin-token']}"},
            json=device_info
        )
        print(device_info)
        r.raise_for_status()

        config = NetMeshConfigFile()

        device_config = config.load_device_config()
        device_config.set_device_name(device_name)

        users_config = config.load_users_config()
        users_config.add_logged_user({
            "name": device_owner_info['name'],
            "email": device_owner_info['email'],
        })

        config.save()

        return render_template('device_registration_done.html',
                               device_name=device_name,
                               admin_email=admin_email,
                               device_info=get_device_info())
    except requests.exceptions.HTTPError as he:
        error = ""
        try:
            error_json = json.loads(r.content)
            if "detail" in error_json:
                error = error_json["detail"]
            else:
                error = r.content
        except ValueError:
            error = r.text

        print(error)
    except requests.exceptions.RequestException as re:
        print(re)
    except Exception as ex:
        print(ex)


@device_registration.route('/register-device')
def register_device_page():
    session['admin-token'] = None

    config = NetMeshConfigFile()
    device_config = config.load_device_config()

    device_name = device_config.get_device_name()
    if device_name:
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

    print(admin_email, admin_password)

    r = None
    users_response = []
    try:
        r = requests.post(
            url=f"{current_app.config['RESULTS_SERVER_API_URL']}/user/token/",
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
        ntc_region = admin_response['user']['ntc_region']
        ntc_regions = dict(netmesh_location.get_philippine_regions())
        
        print("ntc_region", ntc_region)

        session['admin-token'] = token
        session['admin-ntc-region'] = ntc_region
        session['admin-ntc-region-name'] = ntc_regions[ntc_region]
        print(session['admin-ntc-region-name'])
        
        r = requests.get(
            url=f"{current_app.config['RESULTS_SERVER_API_URL']}/user/",
            params={
                "ntc_region": ntc_region
            },
            headers={'Authorization': f"Token { session['admin-token'] }"}
        )
        r.raise_for_status()
        
        users_response = r.json()
    except requests.exceptions.RequestException as re:
        error = "Unexpected error"
        try:
            error_json = json.loads(r.content)
            if "non_field_errors" in error_json:
                error = error_json["non_field_errors"]
            else:
                error = r.content
        except Exception as ex:
            print(ex)
            error = str(re)

        return render_template('device_admin_credentials.html', error=error), 400

    return render_template('device_details_form.html', region_name=session['admin-ntc-region-name'], users=users_response)

@device_registration.route('/get-device-details-template', methods=['POST'])
def get_device_details_template():
    region = session['admin-ntc-region']
    region_name = session['admin-ntc-region-name']

    print("ntc_region", region)
    print("token", session['admin-token'])

    regions = netmesh_location.get_philippine_regions()
    try:
        r = requests.get(
            url=f"{current_app.config['RESULTS_SERVER_API_URL']}/user/",
            params={
                "ntc_region": region
            },
            headers={'Authorization': f"Token { session['admin-token'] }"}
        )
        r.raise_for_status()

        print("users")
        print(r.text)
    except requests.exceptions.RequestException as re:
        error = "Unexpected error"
        try:
            error_json = json.loads(r.content)
            if "non_field_errors" in error_json:
                error = error_json["non_field_errors"]
            else:
                error = r.content
        except Exception as ex:
            print(ex)
            error = str(re)
        
        # TODO: show error on modal admin credentials
        return render_template('device_region.html', regions=regions, error=error), 400

    return render_template('device_details_form.html', users=r.json(), region_name=region_name)


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


@device_registration.route('/device-details', methods=['GET'])
def device_details():
    return render_template('device_details_form.html', users=[
        {
            "ntc_region": "3",
            "id": 1_000_001,
            "email": "romano.bourgeois@example.com",
            "first_name": "Romano",
            "last_name": "Bourgeois"
        },
        {
            "ntc_region": "3",
            "id": 1_000_002,
            "email": "peyton.vasquez@example.com",
            "first_name": "Peyton",
            "last_name": "Vasquez"
        },
        {
            "ntc_region": "3",
            "id": 1_000_003,
            "email": "gavin.cole@example.com",
            "first_name": "Gavin",
            "last_name": "Cole"
        },
        {
            "ntc_region": "3",
            "id": 1_000_004,
            "email": "audrey.tucker@example.com",
            "first_name": "Audrey",
            "last_name": "Tucker"
        },
        {
            "ntc_region": "3",
            "id": 1_000_005,
            "email": "jill.pearson@example.com",
            "first_name": "Jill",
            "last_name": "Pearson"
        }
    ])
