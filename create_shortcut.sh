echo "[Desktop Entry]
Type=Application
Terminal=true
Name=rfc6349
Icon=utilities-terminal
Exec=gnome-terminal -- bash -c 'cd $(pwd) && make update && python3 update.py; sleep 5';
#Path=/home/event1/Desktop/6349_App/" > rfc6349.desktop
