import os
import sys

from flask import Flask

from netmesh_rfc6349_app.config import Config

from netmesh_rfc6349_app.main.utils.netmesh_installer import app_resource_path


def create_app(config_class=Config):
    app = Flask(__name__)
    if getattr(sys, 'frozen', False):
        template_folder = app_resource_path(
            "netmesh-rfc6349-app/templates")
        static_folder = app_resource_path(
            "netmesh-rfc6349-app/static")
        app = Flask(__name__,
                    template_folder=template_folder,
                    static_folder=static_folder)

    app.config.from_object(Config)

    # from netmesh_rfc6349_app import routes
    from netmesh_rfc6349_app.device_registration.routes import device_registration
    from netmesh_rfc6349_app.users.routes import users
    from netmesh_rfc6349_app.test_measurement.routes import test_measurement
    from netmesh_rfc6349_app.main.routes import main

    app.register_blueprint(device_registration)
    app.register_blueprint(users)
    app.register_blueprint(test_measurement)
    app.register_blueprint(main)

    return app
