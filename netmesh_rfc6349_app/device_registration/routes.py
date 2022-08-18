import json
import requests

from flask import Blueprint, request, render_template, session, current_app

from netmesh_rfc6349_app.device_registration.utils import get_device_info
from netmesh_rfc6349_app.main.utils.netmesh_config_file import NetMeshConfigFile

device_registration = Blueprint('device_registration', __name__)

@device_registration.route('/register-api', methods=['POST'])
def register_api():
    admin_email = request.form.get('adminEmail')
    region = request.form.get('region')
    device_owner_info = request.form.get('deviceOwnerInfo')
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
            "name": f"{ device_owner_info['first_name'] } { device_owner_info['last_name'] }",
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
        print(error)
    except Exception as ex:
        print(error)


@device_registration.route('/register-device')
def register_device_page():
    session['admin-token'] = None
    return render_template('register_device.html',
                           device_info=get_device_info())
