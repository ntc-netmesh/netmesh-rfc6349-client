import os

import logging
from datetime import datetime

'''
    shortens a file path
'''
class PathTruncatingFormatter(logging.Formatter):
    def format(self, record):
        if 'pathname' in record.__dict__.keys():
            record.pathname = '{}'.format(record.pathname[20:])
        return super(PathTruncatingFormatter, self).format(record)

'''
    returns a formatted logger object
'''
def getStreamLogger():
    formatter = logging.Formatter("%(asctime)s   :   %(levelname)s\n\n%(message)s\n\n")
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger

def getFileLogger():
    print("getFileLogger")
    LOG_FOLDER_PATH = '/var/log/netmesh_rfc6349_app'
    print(f"{LOG_FOLDER_PATH}")
    if not os.path.isdir(LOG_FOLDER_PATH):
        os.makedirs(LOG_FOLDER_PATH)
    
    ERROR_FILE_NAME = datetime.today().strftime('%Y-%m-%d-%H-%M-%S.log')
    print(f"{LOG_FOLDER_PATH}/{ERROR_FILE_NAME}")
    
    formatter = logging.Formatter("%(asctime)s   :   %(levelname)s\n\n%(pathname)s\n\n%(message)s\n\n")
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    ch = logging.FileHandler(f"{LOG_FOLDER_PATH}/{ERROR_FILE_NAME}")
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    
    logger.addHandler(ch)
    return logger

def log_error(error):
    logger = getFileLogger()
    logger.error(error, exc_info=True)
    
    handlers = logger.handlers[:]
    for handler in handlers:
        handler.close()
        logger.removeHandler(handler)

