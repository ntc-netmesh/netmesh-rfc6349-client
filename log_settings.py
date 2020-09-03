import logging

'''

    returns a formatted logger object

'''
def getStreamLogger():
    formatter = logging.Formatter("%(asctime)s   :   %(levelname)s\n\n%(message)s\n\n")
    logger = logging.getLogger()
    logger.setLevel(logging.ERROR)
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger

def getFileLogger(filename):
    formatter = logging.Formatter("%(asctime)s   :   %(levelname)s\n\n%(message)s\n\n")
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    ch = logging.FileHandler(filename)
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger

