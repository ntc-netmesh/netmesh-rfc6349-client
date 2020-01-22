#!/usr/bin/env python3

import os
import hashlib
import eel
import requests
import json
import pkgutil
import tempfile
import sys

'''
import certifi.core
import requests.utils
import requests.adapters

def override_where():
    """ overrides certifi.core.where to return actual location of cacert.pem"""
    # change this to match the location of cacert.pem
    return os.path.abspath("cacert.pem")

os.environ["REQUESTS_CA_BUNDLE"] = override_where()
certifi.core.where = override_where

# delay importing until after where() has been replaced

# replace these variables in case these modules were
# imported before we replaced certifi.core.where
requests.utils.DEFAULT_CA_BUNDLE_PATH = override_where()
requests.adapters.DEFAULT_CA_BUNDLE_PATH = override_where()
'''

eel.init('new_device_web')

def encrypt_string(hash_string):
    sha_signature = \
        hashlib.sha256(hash_string.encode()).hexdigest()
    return sha_signature

@eel.expose
def check_if_registered():
    if os.path.exists("hash.txt"):
        return True
    return False

@eel.expose
def process_submit(user, password, serial, region):
    if check_if_registered():
        eel.alert_debug("Device already registered!")

    else:
        url = "https://www.sago-gulaman.xyz"
        sha_signature = encrypt_string(serial)

        data = {
            "hash": sha_signature
        }

        try:
            r = requests.post(url = url+"/api/register", data = data, auth = (user, password))
            
            if r.status_code == 200:
                eel.alert_debug("Submit success!")
                file = open("hash.txt", "w")
                file.write(sha_signature + "\n")
                file.write(region + "\n")
                file.write(serial)
                file.close()
            elif r.status_code == 400: #work on this
                eel.alert_debug("Hash already exists")
            elif r.status_code == 401:
                eel.alert_debug("Invalid Username/Password")
            elif r.status_code == 404:
                eel.alert_debug("User not authorized. Please login using super admin / staff account.")
            else:
                print("Exiting due to status code %s: %s" % (r.status_code, r.text))

        except Exception as e:
            print(e)

if __name__ == "__main__":
    eel.start('home.html', size=(1024, 600))