import os
import requests
import json
import ast

from flask import session

url = "http://netmesh-api.asti.dost.gov.ph"

def login(username, password):
  if not username:
    raise Exception("Username required")

  # global dev_hash
  # __read_hash()

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
  
  # token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0MjY3ODA2NiwianRpIjoiZGNmNzQ5MjgtNzUxMy00NmE1LWI5ZjktODZlMzViMDA1OTNmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjQyNjc4MDY2LCJleHAiOjE2NDI2ODE2NjZ9.N5-z290FwJRdB1VzS_I8ZnjLWLG-QCCqmR-9zIa3s5Y"
  # return token


def login2(username, password):
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