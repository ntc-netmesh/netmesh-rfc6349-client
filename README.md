# netmesh-rfc6349-client

## Install npm
1. Run
    ```bash
    sudo apt install npm
    ```
2. Go to folder `/netmesh_rfc6349_app/static`
3. Run
    ```bash
    npm install
    ```
4. Go back to the project folder (i.e. /var/git/netmesh-rfc6349-client)

## Use Python virtual environment
1. Create the virtual environment folder (.venv) in the root of this project folder
    ```bash
    python3 -m venv .venv
    ```
2. Activate the virtual environment
    ```bash
    source .venv/bin/activate
    ```
3. Install requirements
    ```bash
    python3 -m pip install -r requirements.txt
    ```

## Run via browser (for development)
1. Install requirements
    ```bash
    sudo apt install jq iperf3 adb nmap python3-pip python3-tk libxcb-xinerama0
    ```
2. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
3. Run:
    ```bash
    sudo python3 run.py
    ```
    To run on desktop:
    ```bash
    sudo python3 run.py -d
    ```
4. Go to the link in the output of the above command (usually http://127.0.0.1:5000/)

## Create installer for Ubuntu 20.04 desktop (for release/production)
1. Install tkinter
    ```bash
    sudo apt install python3-tk
    ```
2. Open a terminal, and make sure you are in the project folder (i.e. /var/git/netmesh-rfc6349-client)
3. Run:
    ```bash
    sudo python3 pack.py [-v VERSION_NUMBER]
    # -v is optional. The default value is the current branch name
    ```
4. After running the command above, go to `./dist` folder to find the deb package installer
