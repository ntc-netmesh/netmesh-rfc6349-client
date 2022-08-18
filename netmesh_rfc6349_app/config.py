import os

class Config:
    SECRET_KEY = os.urandom(24)
    RESULTS_SERVER_API_URL = "http://202.90.159.48/api"
    APP_LATEST_GITHUB_RELEASE_URL = "https://api.github.com/repos/ntc-netmesh/netmesh-rfc6349-client/releases/latest"
    APP_TITLE = "NetMesh RFC-6349 App"