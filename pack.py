import os
import subprocess
import shutil
from time import sleep

from string import Template

from netmesh_rfc6349_app.config import Config
from netmesh_rfc6349_app.main.utils.laptop_info import get_ubuntu_home_user


def pack():
    main_folder = 'netmesh_rfc6349_app'
    main_directory = f"{os.getcwd()}/{main_folder}"

    package_folder = 'dist'
    package_directory = f'{os.getcwd()}/{package_folder}'

    app_folder_name = 'netmesh-rfc6349-app'

    version = input(f"Enter package name: {app_folder_name}_")
    arch = 'amd64'
    deb_package_name = f"{app_folder_name}_{version}_{arch}"

    # Remove existing folder
    print(
        f"Removing existing folder '{package_directory}/{app_folder_name}'...", end=' ')
    sleep(0.3)
    try:
        shutil.rmtree(f'{package_directory}/{app_folder_name}')
        print("OK")
    except Exception as ex:
        print("Note: ", ex)
        
        
    # Install python3-tk
    print(f"Installing python3-tk", end=' ')
    sleep(0.3)
    command = f'sudo apt install python3-tk'
    command_process = subprocess.Popen(
        command, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = command_process.communicate()
    if stderr:
        print(f"Failed to install python3-tk: ", stderr)
        return
    print("OK")

    # Run pyinstaller
    print(f"Creating bundle for {Config.APP_TITLE}...", end=' ')
    sleep(0.3)
    chown_deb_folder = f'pyinstaller run.py -n "{Config.APP_NAME}" --onefile --clean --splash {main_folder}/static/images/rfc_splash_screen.png  --add-data "{main_folder}/templates:templates" --add-data "{main_folder}/static:static"'
    # chown_deb_folder = f"pyinstaller {Config.APP_NAME}.spec"
    chown_deb_folder_process = subprocess.Popen(
        chown_deb_folder, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = chown_deb_folder_process.communicate()
    if stderr:
        print(f"Failed to bundle the app: ", stderr)
        return
    print("OK")

    # Create deb folder
    print(f"Creating deb package folder '{deb_package_name}'...", end=' ')
    sleep(0.3)
    try:
        shutil.copytree(f"{main_folder}/static/base_deb_package",
                        f"{package_directory}/{deb_package_name}")
        print("OK")
    except Exception as ex:
        raise ex

    # # Create app folder
    # print(f"Creating app folder '{deb_package_name}'...", end=' ')
    # try:
    #     os.makedirs(
    #         f"{package_directory}/{deb_package_name}/usr/bin/{app_folder_name}")
    #     print("OK")
    # except Exception as ex:
    #     raise ex

    # Move built app to the created deb folder
    print(f"Moving bundle to the bin folder...", end=' ')
    sleep(0.3)
    try:
        shutil.move(f"{package_directory}/{Config.APP_NAME}",
                    f"{package_directory}/{deb_package_name}/{Config.APP_DIRECTORY_PATH}")
        print("OK")
    except Exception as ex:
        print("Failed to move bundle: ", ex)
        return

    # # Copy requirements.txt
    # print(f"Copying 'requirements.txt'...", end=' ')
    # try:
    #     shutil.copy(f"./requirements.txt",
    #                 f"{package_directory}/{deb_package_name}/usr/bin/{app_folder_name}")
    #     print("OK")
    # except Exception as ex:
    #     print("Failed to move bundle: ", ex)
    #     return

    # Update DEBIAN/control file
    print(f"Updating DEBIAN/control file...", end=' ')
    sleep(0.3)
    try:
        package_info = {
            'package_name': app_folder_name,
            'version': version,
            'arch': arch
        }
        with open(f'{package_directory}/{deb_package_name}/DEBIAN/control', 'r+') as f:
            content = f.read()
            template = Template(content)
            updated_content = template.substitute(**package_info)

            f.seek(0)
            f.write(updated_content)
            f.truncate()
        print("OK")
    except Exception as ex:
        print("Failed to update DEBIAN/control file: ", ex)
        return
    
    # Update policy file
    print(f"Updating .desktop file...", end=' ')
    sleep(0.3)
    try:
        config = {
            'app_title': Config.APP_TITLE,
            'app_path': Config.APP_PATH
        }
        with open(f'{package_directory}/{deb_package_name}/usr/share/applications/netmesh-rfc6349-app.desktop', 'r+') as f:
            content = f.read()
            template = Template(content)
            updated_content = template.substitute(**config)

            f.seek(0)
            f.write(updated_content)
            f.truncate()
        print("OK")
    except Exception as ex:
        print("Failed to update .desktop file: ", ex)
        return
    
    # Update policy file
    print(f"Updating policy file...", end=' ')
    sleep(0.3)
    try:
        config = {
            'app_title': Config.APP_TITLE,
            'app_path': Config.APP_PATH
        }
        with open(f'{package_directory}/{deb_package_name}/usr/share/polkit-1/actions/net.pregi.netmesh.policy', 'r+') as f:
            content = f.read()
            template = Template(content)
            updated_content = template.substitute(**config)

            f.seek(0)
            f.write(updated_content)
            f.truncate()
        print("OK")
    except Exception as ex:
        print("Failed to update policy file: ", ex)
        return

    # Build deb file
    print(f"Building the .deb file...", end=' ')
    sleep(0.3)
    chown_deb_folder = f"dpkg --build {package_directory}/{deb_package_name}"
    chown_deb_folder_process = subprocess.Popen(
        chown_deb_folder, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = chown_deb_folder_process.communicate()
    if stderr:
        print(f"Failed to build the .deb file: ", stderr)
        return
    else:
        print("OK")

    # Change owner to home user
    print(f"Changing owner to home user...", end=' ')
    sleep(0.3)
    owner = get_ubuntu_home_user()
    try:
        shutil.chown(f"{package_directory}/{deb_package_name}.deb", user=owner)
    except Exception as ex:
        print("Failed to change .deb owner to home user: ", ex)

    chown_deb_folder_command = f"chown {owner} {package_directory}/{deb_package_name} -R"
    chown_deb_folder_process = subprocess.Popen(
        chown_deb_folder_command, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = chown_deb_folder_process.communicate()
    if stderr:
        print("Failed to change deb folder owner to home user: ", stderr)
    else:
        print("OK")

    print(f"DONE: {Config.APP_TITLE} built successfully", stdout)


if __name__ == "__main__":
    user_id = os.geteuid()
    if not user_id == 0:
        print(
            f"Run this script as root :)\nRun: sudo python3 {os.path.basename(__file__)}")
    else:
        pack()
