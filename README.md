# netmesh-rfc6349-client

## Run via browser (for development)
1. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
2. Run `sudo python3 run.py`. To run on desktop, run `sudo python3 run.py desktop`
3. Go to the link in the output of the above command (usually http://127.0.0.1:5000/)

## Create installer for Ubuntu 20.04 desktop (for release/production)
1. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
2. Run `sudo python3 pack.py`, then enter the version number. The deb package will be created on ./dist folder
