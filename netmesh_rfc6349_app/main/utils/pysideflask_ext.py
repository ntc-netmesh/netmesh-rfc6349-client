import os
import subprocess
import re
import sys
import threading
import queue
from time import sleep
import webbrowser

from PySide2 import QtCore, QtWidgets, QtGui, QtWebEngineWidgets, QtNetwork, QtWebEngineCore
from PySide2.QtCore import Qt
from PySide2.QtWidgets import QMessageBox, QProgressDialog
from PySide2.QtGui import QScreen

import socket

from netmesh_rfc6349_app import has_pyi_splash
from netmesh_rfc6349_app.main.utils import connected_to_the_internet, sync_time
from netmesh_rfc6349_app.main.utils.netmesh_installer import check_app_latest_version, get_app_current_version, update_app
from netmesh_rfc6349_app.test_measurement.utils import get_ethernet_connections

if has_pyi_splash():
    import pyi_splash


class ApplicationThread(QtCore.QThread):
    def __init__(self, application, port=5000):
        super(ApplicationThread, self).__init__()
        self.application = application
        self.port = port
        
    def __del__(self):
        self.wait()

    def run(self):
        self.application.run(port=self.port, threaded=True)


class MainGUI(QtWidgets.QMainWindow):
    has_update = False

    def closeEvent(self, event):
        if not self.has_update:
            reply = QtWidgets.QMessageBox.question(self, 'Message',
                                                   "Close this app?", QtWidgets.QMessageBox.Yes, QtWidgets.QMessageBox.No)

            if reply == QtWidgets.QMessageBox.Yes:
                event.accept()
            else:
                event.ignore()


class WebPage(QtWebEngineWidgets.QWebEnginePage):
    def __init__(self, root_url):
        super(WebPage, self).__init__()
        self.root_url = root_url

    def home(self):
        self.load(QtCore.QUrl(self.root_url))

    def acceptNavigationRequest(self, url, kind, is_main_frame):
        """Open external links in browser and internal links in the webview"""
        ready_url = url.toEncoded().data().decode()
        is_clicked = kind == self.NavigationTypeLinkClicked
        if is_clicked and self.root_url not in ready_url:
            QtGui.QDesktopServices.openUrl(url)
            return False
        return super(WebPage, self).acceptNavigationRequest(url, kind, is_main_frame)


def init_gui(application, port=0, width=800, height=600, icon="static/images/netmesh-icon.webp", argv=None, download_path=""):
    try:
        if argv is None:
            argv = sys.argv

        if not '--no-sandbox' in argv:
            argv.append('--no-sandbox')

        if port == 0:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
            sock.close()

        kill_port_process(port)

        print(f"Opening {application.config['APP_TITLE']}")

        # Application Level
        qtapp = QtWidgets.QApplication(argv)
        webapp = ApplicationThread(application, port)
        webapp.start()
        qtapp.aboutToQuit.connect(webapp.terminate)

        print("Application level good")
        
        if application.config['FLASK_DEBUG'] == 0:
            ethernets = get_ethernet_connections(app=application)
            if not ethernets or len(ethernets) == 0:
                QMessageBox.critical(None,
                                    "Please use Ethernet connection",
                                    f"{application.config['APP_TITLE']} requires Ethernet connection. Use an Ethernet cable to connect this laptop to a router. Then, open this app again.")
                return
        
        sync_time()

        if has_pyi_splash():
            pyi_splash.update_text("Checking update...")

        has_update, current_version, latest_version = check_app_latest_version(application)
        app_version = current_version

        if has_pyi_splash():
            pyi_splash.update_text("Opening the app...")
            
        window_title = f"{application.config['APP_TITLE']} ({app_version})"

        # Main Window Level
        window = MainGUI()
        # window.has_update = has_update
        window.has_update = False
        window.resize(width, height)
        window.setWindowTitle(window_title)
        window.setWindowIcon(QtGui.QIcon(icon))
        # Get Screen geometry
        screen_size = QScreen.availableGeometry(
            QtWidgets.QApplication.primaryScreen())
        # Set X Position Center
        windowX = (screen_size.width() - window.width()) / 2
        # Set Y Position Center
        windowY = (screen_size.height() - window.height()) / 2
        # Set Form's Center Location
        window.move(windowX, windowY)

        print("Window level good")

        # WebView Level
        webView = QtWebEngineWidgets.QWebEngineView(None)
        webView.setContextMenuPolicy(Qt.PreventContextMenu)
        webView.setAcceptDrops(False)
        webView.setMinimumSize(800, 600)

        window.setCentralWidget(webView)

        print("webview level good")

        # WebPage Level
        page = WebPage('http://127.0.0.1:{}'.format(port))

        profile = page.profile()
        profile.clearHttpCache()
        profile.clearAllVisitedLinks()
        
        profile.setDownloadPath(download_path)
        profile.downloadRequested.connect(onDownloadRequested)

        # cookie_store = profile.cookieStore()
        # cookie_store.cookieAdded.connect(onCookieAdded)

        # cookie = QtNetwork.QNetworkCookie()
        # cookie.setName("device_name".encode())
        # cookie.setValue("albert-laptop".encode())
        # cookie_store.connect(self, )
        # cookie_store.setCookie(QtNetwork.QNetworkCookie(cookie))

        # sleep(10)
        # print(cookie)
        # onCookieAdded(cookie_store.loadAllCookies())
        
        if has_pyi_splash():
            print("Closing splash...")
            pyi_splash.close()
            
            
        window.show()
            
        # if has_update:
        #     msg = QMessageBox(window)
        #     msg.setWindowTitle(f"Update to {latest_version}")
        #     msg.setText("Do you want to update this app?")
        #     msg.setStandardButtons(QMessageBox.Yes | QMessageBox.No)

        #     reply = msg.exec_()
        #     if reply == QtWidgets.QMessageBox.Yes:
        #         q = queue.Queue()

        #         update_app_progress = QProgressDialog(
        #             f"Updating {application.config['APP_TITLE']}...", "Cancel", 0, 0)
        #         update_app_progress.setWindowTitle(f"Updating to {latest_version}")
        #         update_app_thread = threading.Thread(
        #             target=handle_update_dialog, args=(update_app_progress, q))
        #         update_app_thread.start()

        #         update_app_progress.exec_()

        #         is_successful = q.get()
        #         if is_successful:
        #             update_status_msg = QMessageBox(window)
        #             update_status_msg.setWindowTitle(
        #                 f"Successfully updated to {latest_version}")
        #             update_status_msg.setText(
        #                 "NetMesh RFC-6349 has been successfully updated. Please re-open the app")
        #             update_status_msg.setStandardButtons(QMessageBox.Ok)
        #             update_status_msg.exec_()
        #         else:
        #             update_status_msg = QMessageBox(window)
        #             update_status_msg.setWindowTitle(f"Update failed")
        #             update_status_msg.setText(
        #                 "An error occured during the update of NetMesh RFC-6349.")
        #             update_status_msg.setStandardButtons(QMessageBox.Close)
        #             update_status_msg.exec_()

        #         window.close()
        #         sys.exit()
        #     # else:
        #         # load_page(webView, page)
        #         # must_update_msg = QMessageBox(window)
        #         # must_update_msg.setWindowTitle("Cannot open the app")
        #         # must_update_msg.setText("You must update this app first before using")
        #         # must_update_msg.exec_()

        #         # window.close()
        #         # sys.exit()
        # # else:
        # window.has_update = False
            
        
        web_view_delay_ms = 250
        sleep(web_view_delay_ms / 1000)
        
        load_page(webView, page)

        print("App opened")

        return qtapp.exec_()
    except Exception as ex:
        error = str(ex)
        print(error)
        
        QMessageBox.information(None, "Error", error)


def load_page(webView: QtWebEngineWidgets.QWebEngineView, page: WebPage):
    page.home()
    webView.setPage(page)
    print("page url: ", page.url())


def handle_update_dialog(dialog_box: QProgressDialog, q: queue.Queue):
    is_successful = update_app()
    dialog_box.close()

    q.put(is_successful)


@QtCore.Slot(QtWebEngineWidgets.QWebEngineDownloadItem)
def onDownloadRequested(download):
    download.accept()


def kill_port_process(port):
    pids = set(get_port_pids(port))
    print("pids", pids)
    if pids:
        command = f"sudo kill -9 {' '.join([str(pid) for pid in pids])}"
        os.system(command)


def get_port_pids(port):
    command = "sudo lsof -i :%s | awk '{print $2}'" % port
    pids = subprocess.check_output(command, shell=True)
    pids = pids.decode().strip()
    if pids:
        pids = re.sub(' +', ' ', pids)
        for pid in pids.split('\n'):
            try:
                yield int(pid)
            except:
                pass

# @QtCore.Slot(QtWebEngineWidgets.QWebEngineProfile)


# def onCookieAdded(cookies):
#     cookies_list_info = []
#     for c in cookies:
#         data = {"name": bytearray(c.name()).decode(), "domain": c.domain(), "value": bytearray(c.value()).decode(),
#                 "path": c.path(), "expirationDate": c.expirationDate().toString(Qt.ISODate), "secure": c.isSecure(),
#                 "httponly": c.isHttpOnly()}
#         cookies_list_info.append(data)

#     print("Cookie as list of dictionary:")
#     print(cookies_list_info)
