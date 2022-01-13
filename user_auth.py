import os
import requests
import json
import ast

from flask import session

url = "http://202.90.158.6:12000"

def login(username, password):
  if not username:
    return {
      "error": "Username required",
    }

  global dev_hash
  __read_hash()

  credentrials = {
    "username": username,
    "password": password,
  }

  try:
    # Request for Agent token
    r = requests.post(url=url+"/api/auth/login", json=credentrials)
    data = r.json()
    
    if 'access_token' in data:
      token = data['access_token']
      session['api_session_token'] = token
      
      return {
        "error": None,
        "token": token
      }
    elif 'error' in data:
      return {
        "error": data["error"]
      }
    else:
      return {
        "error": data
      }
    
    # token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY0MDk1MDk5MCwianRpIjoiZGZiMjljODUtZmM4Ny00MDJiLThhMTctNzlkYjUwMmVmZWYyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNjQwOTUwOTkwLCJleHAiOjE2NDA5NTQ1OTB9.df2b8CVZ6U5hdrd3jlfOMh8EokXukztzYkex3s9w2AI"
    # session['api_session_token'] = token
    # return {
    #   "error": None,
    #   "token": token
    # }
  except requests.exceptions.RequestException as e:
    return {
      "error": e
    }

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