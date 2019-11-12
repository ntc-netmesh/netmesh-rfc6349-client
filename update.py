import json
import requests
import wget
import os
import zipfile
import glob
import shutil
import subprocess

from PyQt5 import QtCore, QtGui, QtWidgets

global dl_link
global MainWindow

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(436, 121)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
        self.update = QtWidgets.QPushButton(self.centralwidget)
        self.update.setGeometry(QtCore.QRect(120, 50, 81, 41))
        self.update.setAutoFillBackground(False)
        self.update.setObjectName("update")
        self.update.clicked.connect(self.update_app)
        self.dont_update = QtWidgets.QPushButton(self.centralwidget)
        self.dont_update.setGeometry(QtCore.QRect(250, 50, 81, 41))
        self.dont_update.setObjectName("dont_update")
        self.dont_update.clicked.connect(QtWidgets.qApp.quit)
        self.label = QtWidgets.QLabel(self.centralwidget)
        self.label.setGeometry(QtCore.QRect(70, 20, 301, 21))
        self.label.setObjectName("label")
        MainWindow.setCentralWidget(self.centralwidget)
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setObjectName("statusbar")
        MainWindow.setStatusBar(self.statusbar)

        self.retranslateUi(MainWindow)
        QtCore.QMetaObject.connectSlotsByName(MainWindow)

    def retranslateUi(self, MainWindow):
        _translate = QtCore.QCoreApplication.translate
        MainWindow.setWindowTitle(_translate("RFC 6349 Application Updater", "RFC 6349 Application Updater"))
        self.update.setText(_translate("RFC 6349 Application Updater", "Yes"))
        self.dont_update.setText(_translate("RFC 6349 Application Updater", "No"))
        self.label.setText(_translate("RFC 6349 Application Updater", "A new update is avalable. Would you like to download it now?"))

    def update_app(self):
        global MainWindow
        MainWindow.close()
        download_update()
        print("done")

def get_latest_release():
    #insert github link here
    url = "https://api.github.com/repos/ntc-netmesh/netmesh-rfc6349-client/releases/latest"

    response = requests.get(url).json()
    version = float(response["tag_name"][1:])

    #open current version file to compare
    file = open("version.txt", "r")
    curr_version = float(file.readline()[1:])
    file.close()

    global dl_link
    dl_link = response["zipball_url"]

    if version > curr_version:
        import sys
        app = QtWidgets.QApplication(sys.argv)
        global MainWindow
        MainWindow = QtWidgets.QMainWindow()
        ui = Ui_MainWindow()
        ui.setupUi(MainWindow)
        MainWindow.show()
        sys.exit(app.exec_())

def download_update():
    dir_path = os.path.dirname(os.path.realpath(__file__)) 
    wget.download(dl_link,dir_path)

    #get name of downloaded file
    for root, dirs, files in os.walk(dir_path): 
        for file in files:   
            if file.endswith('.zip'): 
                #extract contents of zip file
                with zipfile.ZipFile(file, 'r') as zip_ref:
                    zip_ref.extractall()
                os.remove(file)

    #find extracted folder in directory
    root_src_dir = ''
    for x in os.listdir(dir_path):
        if x.startswith("ntc-netmesh"):
            print(x)
            root_src_dir = x

    #move files from folder to working directory
    root_dst_dir = os.path.dirname(os.path.realpath(__file__)) + "/" 

    for src_dir, dirs, files in os.walk(root_src_dir):
        dst_dir = src_dir.replace(root_src_dir, root_dst_dir, 1)
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)
        os.chmod(os.path.join(dst_dir), 0o777)
        for file_ in files:
            src_file = os.path.join(src_dir, file_)
            dst_file = os.path.join(dst_dir, file_)
            if os.path.exists(dst_file):
                # in case of the src and dst are the same file
                if os.path.samefile(src_file, dst_file):
                    continue
                os.remove(dst_file)
            shutil.move(src_file, dst_dir)
            os.chmod(os.path.join(dst_file), 0o777)

    #clean residual files from download
    for x in os.listdir(dir_path):
        if x.startswith("ntc-netmesh"):
            shutil.rmtree(x)

    #install updated files
    p = subprocess.Popen(["sudo", "./update.sh"])
    p.wait()

if __name__ == "__main__":
    get_latest_release()