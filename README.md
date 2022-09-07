# netmesh-rfc6349-client

## Install npm
1. Run command `sudo apt install npm`
2. Go to folder `/netmesh-rfc6349-app/static`
3. Run `npm install`
4. Go back to the project folder (i.e. /var/git/netmesh-rfc6349-client)

## Run via browser (for development)
1. Make sure to install these first via apt: `sudo apt install jq iperf3 adb nmap python3-pip python3-tk`
2. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
3. Run `sudo python3 run.py`. To run on desktop, run `sudo python3 run.py desktop`
4. Go to the link in the output of the above command (usually http://127.0.0.1:5000/)

## Create installer for Ubuntu 20.04 desktop (for release/production)
1. Install tkinter by running this command: `sudo apt install python3-tk`
2. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
3. Run `sudo python3 pack.py`, then enter the version number. The deb package will be created on ./dist folder
