
all: allow tempfiles icon mov

allow:
	chmod +x *.sh
tempfiles:
	./create_temp_folders.sh
icon:
	./create_shortcut.sh
mov:
	cp rfc6349.desktop ~/Desktop && chmod +x ~/Desktop/rfc6349.desktop

install:
	./install.sh
