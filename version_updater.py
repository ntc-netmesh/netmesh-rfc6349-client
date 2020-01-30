import requests

if __name__ ==  "__main__":
    url = "https://api.github.com/repos/ntc-netmesh/netmesh-rfc6349-client/releases/latest"
    response = requests.get(url).json()
    version = response["tag_name"]
    with open("version.txt", "w+") as f:
        f.write(str(version))
        f.close()
