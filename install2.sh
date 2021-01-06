#!/bin/sh
sudo apt-get update
tester=$(dpkg -l | grep google-chrome-stable)
if [[ $tester ]]; then
    echo "Google Chrome already installed"
else
	wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
	sudo dpkg -i google-chrome-stable_current_amd64.deb
fi

sudo apt --yes --assume-yes install python3-pip
sudo apt --yes --assume-yes install iperf3
python3 -m pip install --upgrade pip
python3 -m pip install websockets eel PyQt5 requests wget
python3 -m  install --pre scapy[basic]
sudo apt --yes --assume-yes install traceroute
sudo apt --yes --assume-yes install net-tools
sudo apt --yes --assume-yes install tshark
sudo apt --yes --assume-yes install wireshark
sudo apt install ethtool adb
#echo "wireshark-common wireshark-common/install-setuid boolean true" | sudo debconf-set-selections
#sudo DEBIAN_FRONTEND=noninteractive apt-get -y install wireshark
sudo dpkg-reconfigure wireshark-common
sudo usermod -a -G wireshark $1
sudo chmod 4711 `sudo which dumpcap`
sudo chmod 777 $2/*
sudo python3 $2/version_updater.py $2
echo "$1 ALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers
