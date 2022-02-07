import os

import logging
from datetime import datetime

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
    LOG_FOLDER_PATH = f'{os.getcwd()}/log_files'
    print(f"{LOG_FOLDER_PATH}")
    if not os.path.isdir(LOG_FOLDER_PATH):
        os.makedirs(LOG_FOLDER_PATH)
    
    ERROR_FILE_NAME = datetime.today().strftime('%Y-%m-%d-%H-%M-%S.log')
    print(f"{LOG_FOLDER_PATH}/{ERROR_FILE_NAME}")
    
    formatter = logging.Formatter("%(asctime)s   :   %(levelname)s\n\n%(message)s\n\n")
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

