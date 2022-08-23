import os
import subprocess

import getpass
import pwd


def get_ubuntu_version():
    ubuntu_version = ""
    process = subprocess.Popen("lsb_release -a | grep Release:", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        ubuntu_version = stdout.decode().split(':')[1].strip()
    else:
        ubuntu_version = stderr.decode()
    return ubuntu_version


def get_laptop_serial_number():
    serial_number = ""
    process = subprocess.Popen("sudo dmidecode -t system | grep Serial ", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        serial_number = stdout.decode().split(':')[1].strip()
    else:
        raise Exception(stderr)

    return serial_number


def get_machine_name():
    machine_name = ""
    process = subprocess.Popen("sudo dmidecode -t system | grep 'Manufacturer:\|Version:\|Serial ' | awk -F': ' '{print $2}'", shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    if stdout:
        machine_info = stdout.decode().strip().split('\n')
        machine_name = "-".join(machine_info)
    else:
        raise Exception(stderr)

    return machine_name


def get_ubuntu_home_user():
    """Try to find the user who called sudo/pkexec."""
    try:
        return os.getlogin()
    except OSError:
        # failed in some ubuntu installations and in systemd services
        pass

    try:
        user = os.environ['USER']
    except KeyError:
        # possibly a systemd service. no sudo was used
        return getpass.getuser()

    if user == 'root':
        try:
            return os.environ['SUDO_USER']
        except KeyError:
            # no sudo was used
            pass

        try:
            pkexec_uid = int(os.environ['PKEXEC_UID'])
            return pwd.getpwuid(pkexec_uid).pw_name
        except KeyError:
            # no pkexec was used
            pass

    return user


if os.name == 'nt':
    import ctypes
    from ctypes import windll, wintypes
    from uuid import UUID

    # ctypes GUID copied from MSDN sample code
    class GUID(ctypes.Structure):
        _fields_ = [
            ("Data1", wintypes.DWORD),
            ("Data2", wintypes.WORD),
            ("Data3", wintypes.WORD),
            ("Data4", wintypes.BYTE * 8)
        ]

        def __init__(self, uuidstr):
            uuid = UUID(uuidstr)
            ctypes.Structure.__init__(self)
            self.Data1, self.Data2, self.Data3, \
                self.Data4[0], self.Data4[1], rest = uuid.fields
            for i in range(2, 8):
                self.Data4[i] = rest >> (8-i-1)*8 & 0xff

    SHGetKnownFolderPath = windll.shell32.SHGetKnownFolderPath
    SHGetKnownFolderPath.argtypes = [
        ctypes.POINTER(GUID), wintypes.DWORD,
        wintypes.HANDLE, ctypes.POINTER(ctypes.c_wchar_p)
    ]

    def _get_known_folder_path(uuidstr):
        pathptr = ctypes.c_wchar_p()
        guid = GUID(uuidstr)
        if SHGetKnownFolderPath(ctypes.byref(guid), 0, 0, ctypes.byref(pathptr)):
            raise ctypes.WinError()
        return pathptr.value

    FOLDERID_Download = '{374DE290-123F-4565-9164-39C4925E467B}'

    def get_downloads_folder_path():
        return _get_known_folder_path(FOLDERID_Download)
else:
    def get_downloads_folder_path():
        username = get_ubuntu_home_user()
        return os.path.join(os.path.expanduser(f'~{username}'), 'Downloads')
