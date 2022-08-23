import os

from datetime import datetime, timezone

import json

import configparser

from netmesh_rfc6349_app.main.utils.laptop_info import get_ubuntu_home_user


class NetMeshConfigFile:
    __CONFIG_FILE_DIRECTORY = f'/home/{get_ubuntu_home_user()}/.config/netmesh-rfc6349-app'
    __CONFIG_FILE_PATH = f'{__CONFIG_FILE_DIRECTORY}/nmrfc.ini'

    def __init__(self) -> None:
        # set directory and file
        if not os.path.isdir(self.__CONFIG_FILE_DIRECTORY):
            os.mkdir(self.__CONFIG_FILE_DIRECTORY)

        if not os.path.isfile(self.__CONFIG_FILE_PATH):
            with open(self.__CONFIG_FILE_PATH, 'x') as cf:
                cf.close()

        self._config = configparser.ConfigParser()
        self._config.read(self.__CONFIG_FILE_PATH)

    def save(self):
        with open(self.__CONFIG_FILE_PATH, 'w') as cf:
            self._config.write(cf)

    def load_device_config(self):
        device_config = self._NetMeshDeviceConfig(self._config)
        return device_config

    def load_users_config(self):
        users_config = self._NetMeshUsersConfig(self._config)
        return users_config

    class _NetMeshDeviceConfig:
        _SECTION_NAME = "DEVICE"

        def __init__(self, config: configparser.ConfigParser) -> None:
            self._config = config

        def set_device_name(self, device_name: str):
            if not self._SECTION_NAME in self._config.sections():
                self._config.add_section(self._SECTION_NAME)

            self._config.set(self._SECTION_NAME, "device_name", device_name)

        def get_device_name(self):
            device_name = ""
            try:
                device_name = self._config.get(
                    self._SECTION_NAME, "device_name")
            except Exception as ex:
                print(ex)
                
            return device_name

    class _NetMeshUsersConfig:
        _SECTION_NAME = "USERS"

        def __init__(self, config: configparser.ConfigParser):
            self._config = config

        def _load_logged_users(self):
            if not self._SECTION_NAME in self._config.sections():
                self._config.add_section(self._SECTION_NAME)
                return []

            logged_users_config = self._config.get(
                self._SECTION_NAME, "logged_users")
            raw_logged_users: list = json.loads(logged_users_config)

            return raw_logged_users

        def get_logged_users(self):
            logged_users = []
            try:
                logged_users = self._load_logged_users()

                user: dict
                for i, user in enumerate(logged_users):
                    if "token_expiry" in user:
                        utc_now = datetime.now(
                            timezone.utc).replace(tzinfo=None)
                        extracted_datetime = datetime.strptime(
                            user['token_expiry'], "%Y-%m-%dT%H:%M:%S.%fZ")
                        token_expiry_seconds = (
                            extracted_datetime - utc_now).total_seconds()

                        user.update(
                            {'token_expiry_seconds': token_expiry_seconds})
                        logged_users[i] = user
            except Exception as ex:
                print(ex)

            return logged_users

        def add_logged_user(self, user: dict):
            logged_users = self._load_logged_users()
            logged_users.append(user)

            self._config.set("USERS", "logged_users", json.dumps(logged_users))

        def delete_logged_user(self, user_email: str):
            logged_users = self._load_logged_users()
            remaining_logged_users = [
                u for u in logged_users if u['email'] != user_email]

            self._config.set("USERS", "logged_users",
                             json.dumps(remaining_logged_users))
