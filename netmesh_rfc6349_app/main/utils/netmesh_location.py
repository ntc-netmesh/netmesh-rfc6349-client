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

def get_philippine_regions():
    return [
        ('NCR', 'NTC Region NCR'),
        ('CAR', 'NTC Region CAR'),
        ('1', 'NTC Region 1'),
        ('2', 'NTC Region 2'),
        ('3', 'NTC Region 3'),
        ('4-A', 'NTC Region 4-A'),
        ('4-B', 'NTC Region 4-B'),
        ('5', 'NTC Region 5'),
        ('6', 'NTC Region 6'),
        ('7', 'NTC Region 7'),
        ('8', 'NTC Region 8'),
        ('9', 'NTC Region 9'),
        ('10', 'NTC Region 10'),
        ('11', 'NTC Region 11'),
        ('12', 'NTC Region 12'),
        ('13', 'NTC Region 13'),
        ('BARMM', 'NTC Region BARMM'),
        ('Central', 'NTC Region Central'),
        ('unknown', 'Unknown')
    ]

if __name__ == "__main__":
    raw_data = getRawGpsCoordinates()
    # data = parseGpsCoordinates(raw_data)
    print(raw_data)
