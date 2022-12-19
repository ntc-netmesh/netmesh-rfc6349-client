from datetime import timedelta
from base64 import b64encode
import os

class Config:
    FLASK_DEBUG = 1
    PERMANENT_SESSION_LIFETIME = timedelta(days=100)
    SECRET_KEY = 'H3kur3WoOqAt3yFIOqTwXog4'
    # SECRET_KEY = b64encode(os.urandom(24)).decode('utf-8')
    RESULTS_SERVER_API_URI = "http://202.90.159.48/api"
    APP_LATEST_GITHUB_RELEASE_URL = "https://api.github.com/repos/ntc-netmesh/netmesh-rfc6349-client/releases/latest"
    APP_TITLE = "NetMesh RFC-6349 App"
    APP_NAME = "netmesh-rfc6349-app"
    #APP_DIRECTORY_PATH = "usr/bin"
    #APP_PATH = f"/{APP_DIRECTORY_PATH}/{APP_NAME}"
    APP_DIRECTORY_PATH = "."
    #APP_PATH = f"/{APP_DIRECTORY_PATH}/{APP_NAME}"
    
