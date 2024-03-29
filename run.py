import os
import sys
import argparse

import netmesh_rfc6349_app.main.utils.pysideflask_ext as pysideflask_ext

from netmesh_rfc6349_app import create_app, has_pyi_splash
from netmesh_rfc6349_app.main.utils.netmesh_installer import check_app_latest_version
from netmesh_rfc6349_app.main.utils.laptop_info import get_downloads_folder_path


def run_on_desktop():
    app = create_app()
    app.secret_key = os.urandom(24)

    pysideflask_ext.init_gui(application=app, port=5000, width=1440, height=900, download_path=get_downloads_folder_path())
    sys.exit()


def run_in_browser(port):
    app = create_app()

    app.secret_key = 'for-testing-purposes-only'
    app.run(debug=True, port=port)


if __name__ == '__main__':
    user_id = os.geteuid()
    if not user_id == 0:
        print(
            f"Run this script as root :)\nRun: sudo python3 {os.path.basename(__file__)}")
    else:
        parser = argparse.ArgumentParser()
        parser.add_argument('--desktop', '-d', type=str, required=False, nargs='?', const='desktop')
        parser.add_argument('--port', '-p', type=int, required=False, nargs='?', const='')
        args = parser.parse_args()
        
        port = args.port or 5000

        if not args.desktop:
            if getattr(sys, 'frozen', False):
                run_on_desktop()
            else:
                run_in_browser(port)
        else:
            if args.desktop == 'desktop':
                run_on_desktop()
            else:
                run_in_browser(port)
