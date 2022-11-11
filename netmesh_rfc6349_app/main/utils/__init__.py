from datetime import datetime, timezone, timedelta

import subprocess

import urllib.request

def connected_to_the_internet(host='https://google.com'):
    try:
        urllib.request.urlopen(host)
        return True
    except:
        return False


def sync_time():
    subprocess.Popen("timedatectl set-ntp TRUE", stdout=subprocess.PIPE, shell=True)
    subprocess.Popen("timedatectl set-timezone Asia/Manila", stdout=subprocess.PIPE, shell=True)

def get_time_now():
    ph_timezone = timezone(offset=timedelta(hours=8))
    datetime_now = datetime.now(ph_timezone)
    # time_from = "local"
    # try:
    #     client = ntplib.NTPClient()
    #     response = client.request('ntp.pagasa.dost.gov.ph')
    #     internet_date_and_time = datetime.fromtimestamp(response.tx_time, ph_timezone)
        
    #     print('\n')
    #     print('Internet date and time as reported by NTP server: ', internet_date_and_time)
        
    #     datetime_now = internet_date_and_time
    #     time_from = "internet"
    # except (OSError, Exception):
    #     print('\n')
    #     print('Internet date and time could not be reported by server.')
    #     print('There is not internet connection.')
    #     print('Local date and time will be used')
        
    return datetime_now


# if __name__ == "__main__":
    # time_info = get_netmesh_time()
    # print(time_info)