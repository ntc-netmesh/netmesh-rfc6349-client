import os
import subprocess
import shutil

from string import Template

from netmesh_rfc6349_app.config import Config


def pack():
    main_folder = 'netmesh_rfc6349_app'
    main_directory = f"{os.getcwd()}/{main_folder}"
    
    package_folder = 'dist'
    package_directory = f'{os.getcwd()}/{package_folder}'
    
    app_folder_name = 'netmesh-rfc6349-app'

    version = input(f"Enter package name: {app_folder_name}_")
    deb_package_name = f"{app_folder_name}_{version}_amd64"

    # Remove existing folder
    print(f"Removing existing folder '{package_directory}/{app_folder_name}'...", end=' ')
    try:
        shutil.rmtree(f'{package_directory}/{app_folder_name}')
        print("OK")
    except Exception as ex:
        print("Note: ", ex)

    # Run pyinstaller
    print(f"Creating bundle for {Config.APP_TITLE}...", end=' ')
    build_deb_file_command = f'pyinstaller run.py -n "{app_folder_name}" --clean --splash {main_folder}/static/images/rfc_splash_screen.png  --add-data "{main_folder}/templates:templates" --add-data "{main_folder}/static:static"'
    build_deb_file_process = subprocess.Popen(
        build_deb_file_command, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = build_deb_file_process.communicate()
    if stderr:
        print(f"Failed to bundle the app: ", stderr)
        return
    print("OK")
    
    # Create deb folder
    print(f"Creating deb package folder '{deb_package_name}'...", end=' ')
    try:
        shutil.copytree(f"{package_directory}/base-deb-package", f"{package_directory}/{deb_package_name}")
        print("OK")
    except Exception as ex:
        print("Failed to create deb package: ", ex)
        return
    
    # Move built app to the created deb folder
    print(f"Moving bundle to the deb package folder...", end=' ')
    try:
        shutil.move(f"{package_directory}/{app_folder_name}",
                    f"{package_directory}/{deb_package_name}/usr/bin")
        print("OK")
    except Exception as ex:
        print("Failed to move bundle: ", ex)
        return
    
    # Update DEBIAN/control file
    print(f"Updating DEBIAN/control file...", end=' ')
    try:
        package_info = {
            'package_name': app_folder_name,
            'version': version
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

    # Build deb file
    print(f"Building the .deb file...", end=' ')
    build_deb_file_command = f"dpkg --build {package_directory}/{deb_package_name}"
    build_deb_file_process = subprocess.Popen(
        build_deb_file_command, stdout=subprocess.PIPE, shell=True)
    stdout, stderr = build_deb_file_process.communicate()
    if stderr:
        print(f"Failed to build the .deb file: ", stderr)
        return
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
