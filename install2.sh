#!/bin/sh
sudo apt-get update
tester=$(dpkg -l | grep google-chrome-stable)
if [[ $tester ]]; then
    echo "Google Chrome already installed"
else
	wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
	sudo dpkg -i google-chrome-stable_current_amd64.deb
fi

sudo apt --yes --force-yes install python3-pip
sudo apt --yes --force-yes install iperf3
pip3 install websockets
pip3 install eel
pip3 install --pre scapy[basic]
pip3 install PyQt5
pip3 install requests
pip3 install wget
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
sudo chmod 777 $2/*
echo "$1 ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers
