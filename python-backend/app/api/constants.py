#Cache prefixes
NRIS_MAJOR_MINE_LIST = "major_mine_list"
NRIS_TOKEN = "nris:token"
NROS_TOKEN = "nros:token"
VFCBC_COOKIES = "vdcbc_cookies"


def NRIS_COMPLIANCE_DATA(mine_no):
    return f'mine:{mine_no}:api-compliance-data'


def DOWNLOAD_TOKEN(token_guid):
    return f'document-manager:download-token:{token_guid}'


#Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140

#Redis Map Cache
MINE_MAP_CACHE = "MINE_MAP_CACHE"
