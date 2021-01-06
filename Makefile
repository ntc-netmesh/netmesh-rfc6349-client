
all: allow install tempfiles icon mov reg

allow:
	chmod +x *.sh
tempfiles:
	./create_temp_folders.sh
icon:
	./create_shortcut.sh
mov:
	cp rfc6349.desktop ~/Desktop && chmod +x ~/Desktop/rfc6349.desktop
reg:
	python3 hash.py

install:
	./install.sh

update:
	git pull origin master
