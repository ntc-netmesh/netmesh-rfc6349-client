import os
import requests
import json
import ast

from flask import session

url = "http://netmesh-api.asti.dost.gov.ph"

def login(username, password):
  if not username:
    raise Exception("Username required")

  credentrials = {
    "username": username,
    "password": password,
  }

  try:    
    response = requests.post(url=url+"/api/auth/login", json=credentrials)
    response.raise_for_status()
    data = response.json()
    
    token = data['access_token']
    print("token", token)
    return token
  except requests.exceptions.HTTPError as e:
    raise requests.exceptions.RequestException(response.text)


  # print("login-data", data)
  
  # if 'access_token' in data:
  #   token = data['access_token']
  #   print("token", token)
  #   return token
  # elif 'error' in data:
  #   print("Exception data error", data['error'])
  #   raise Exception(data['error'])
  # else:
  #   print("Exception str data", str(data))
  #   raise Exception(str(data))


def relogin(username, password):
  if not username:
    raise Exception("Username required")

  credentrials = {
    "username": username,
    "password": password,
  }

  r = requests.post(url=url+"/api/auth/login", json=credentrials)
  r.raise_for_status()
  data = r.json()
  
  if 'access_token' in data:
    token = data['access_token']
    return token
  elif 'error' in data:
    raise Exception(data['error'])
  else:
    raise Exception(str(data))


#Verify if laptop is registered.
def __read_hash():
  if os.path.exists("hash.txt"):
    file = open("hash.txt","r")
    global dev_hash
    dev_hash = file.readline()[:-1]
    print(dev_hash)
    global region
    region = file.readline()[:-1]
    print(region)
    file.close()
    return True
  else:
    print("error")

  return False