MINE_OPERATION_STATUS = {
    'abandoned': {
        'value': 'ABN',
        'label': 'Abandoned'
    },
    'closed': {
        'value': 'CLD',
        'label': 'Closed'
    },
    'not_started': {
        'value': 'NS',
        'label': 'Not Started'
    },
    'operating': {
        'value': 'OP',
        'label': 'Operating'
    }
}

MINE_OPERATION_STATUS_REASON = {
    'care_maintenance': {
        'value': 'CM',
        'label': 'Care & Maintenance'
    },
    'reclamation': {
        'value': 'REC',
        'label': 'Reclamation'
    },
    'orphaned': {
        'value': 'ORP',
        'label': 'Orphaned'
    },
    'unknown': {
        'value': 'UN',
        'label': 'Unknown'
    },
    'year_round': {
        'value': 'YR',
        'label': 'Year Round'
    },
    'seasonal': {
        'value': 'SEA',
        'label': 'Seasonal'
    }
}

MINE_OPERATION_STATUS_SUB_REASON = {
    'long_term_maintenance': {
        'value': 'LTM',
        'label': 'Long Term Maintenance'
    },
    'long_term_maintenance_water_treatment': {
        'value': 'LWT',
        'label': 'Long Term Maintenance with Water Treatment'
    },
    'permit_release_pending': {
        'value': 'PRP',
        'label': 'Permit Release Pending'
    },
    'reclamation_not_started': {
        'value': 'RNS',
        'label': 'Reclamation Not Started'
    },
    'site_visit_required': {
        'value': 'SVR',
        'label': 'Site Visit Required'
    }
}

#Cache prefixes
NRIS_MAJOR_MINE_LIST = "major_mine_list"
NRIS_TOKEN = "nris:token"
NRIS_REMOTE_TOKEN = "nris_remote:token"
NROS_TOKEN = "nros:token"
VFCBC_COOKIES = "vdcbc_cookies"


def NRIS_COMPLIANCE_DATA(mine_no):
    return f'mine:{mine_no}:api-compliance-data'


def DOWNLOAD_TOKEN(token_guid):
    return f'document-manager:download-token:{token_guid}'


#Deep Update Special Flag
DELETE_ITEM_FROM_LIST_JSON_KEY = "DELETE_ON_PUT"

#Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140

#Redis Map Cache
MINE_MAP_CACHE = "mds:mines:map-json"
MINE_DETAILS_CSV = "mds:mines:summary-csv"

NOW_APPLICATION_EDIT_GROUP = 'NOW_APPLICATIONS'
PERMIT_EDIT_GROUP = 'PERMIT'
PERMIT_AMENDMENT_EDIT_GROUP = 'PERMIT_AMENDMENTS'
MINE_EDIT_GROUP = 'MINE'
