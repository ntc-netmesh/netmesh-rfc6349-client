#!/bin/sh
sudo apt-get update
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --yes --force-yes install python3-pip
sudo apt --yes --force-yes install iperf3
pip3 install websockets
pip3 install eel
pip3 install --pre scapy[basic]
apt --yes --force-yes install iperf3
sudo apt --yes --force-yes install traceroute
sudo apt --yes --force-yes install net-tools
sudo apt --yes --force-yes install tshark
sudo apt --yes --force-yes install wireshark
#echo "wireshark-common wireshark-common/install-setuid boolean true" | sudo debconf-set-selections
#sudo DEBIAN_FRONTEND=noninteractive apt-get -y install wireshark
sudo dpkg-reconfigure wireshark-common
sudo usermod -a -G wireshark $1
sudo chmod 4711 `sudo which dumpcap`
sudo chmod 777 /home/netmesh/Desktop/6349_App/plpmtu
sudo chmod 777 /home/netmesh/Desktop/6349_App/start_main_client.desktop
sudo chmod 777 /home/netmesh/Desktop/6349_App/plpmtu-reverse
sudo chmod 777 /home/netmesh/Desktop/6349_App/main_client.py
sudo chmod 777 /home/netmesh/Desktop/6349_App/new_dev_reg
echo "$1 ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers
