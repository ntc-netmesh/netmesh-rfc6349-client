import subprocess
import re

def getRawGpsCoordinates():
    process = subprocess.Popen(['adb', 'shell', 'dumpsys', 'location', '|', 'grep', 'Longitude'],stdout=subprocess.PIPE, stderr= subprocess.PIPE)
    stdout,stderr = process.communicate()
    if not stdout:
        process = subprocess.Popen(['adb', 'shell', 'dumpsys', 'location', '|', 'grep', '"network: Location"'],stdout=subprocess.PIPE, stderr= subprocess.PIPE)
        stdout,stderr = process.communicate()
        if not stdout:
            raise Exception(stderr.decode())
        data = stdout.decode().split()[2].split(',')
        return data
    if not stderr:
        data = stdout.decode().split(',')
        data = data[0:2]
        data = "".join(data)
        values = re.findall('\d+\.\d+',data)
        if not values:
            raise Exception("No GPS location detected: " + stdout.decode())
        return values
    
    raise Exception("Error: " + stdout.decode())

def parseGpsCoordinates(raw_gps_coordinates):
    data = raw_gps_coordinates
    data = data[0].decode().split(',')
    data = data[0:2]
    data = "".join(data)
    values = re.findall('\d+\.\d+',data)
    if not values:
        return None
    return values
    

if __name__ == "__main__":
    raw_data = getRawGpsCoordinates()
    # data = parseGpsCoordinates(raw_data)
    print(raw_data)
