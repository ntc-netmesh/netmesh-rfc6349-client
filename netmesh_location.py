import subprocess
import json
import re

def getRawGpsCoordinates():
    process = subprocess.Popen("""adb shell dumpsys location | grep "last location=" | awk -F'=Location' '{print $2}' | grep -Po "(?<=\[).*?(?<=\])" | jq -R 'split(" ")|{mode:.[0], latitude:.[1]|split(",")[0], longitude:.[1]|split(",")[1]}' | jq -s 'limit(1;.[])'""",
        stdout=subprocess.PIPE, stderr= subprocess.PIPE, shell=True)
    stdout,stderr = process.communicate()

    if not stdout:
        if stderr:
            raise Exception(stderr.decode())
        else:
            raise Exception("Error: No GPS coordinates detected")

    gps_json = json.loads(stdout)
    
    if 'latitude' in gps_json and 'longitude' in gps_json:
        return [gps_json['latitude'], gps_json['longitude']]
    else:
        raise Exception(f"Error: No GPS coordinates detected - ({stdout.replace(chr(10), ' ')})")

if __name__ == "__main__":
    raw_data = getRawGpsCoordinates()
    # data = parseGpsCoordinates(raw_data)
    print(raw_data)
