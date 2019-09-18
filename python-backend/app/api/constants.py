# Outlines the tenure type code to which each disturbance applies
# Exclusive disturbance codes are invalid in combination with other disturbance
# codes under the same tenure
METALS_AND_MINERALS = [
    'AE',
    'AL',
    'AI',
    'AM',
    'AY',
    'AD',
    'AA',
    'AN',
    'SB',
    'AP',
    'AR',
    'AS',
    'AB',
    'BA',
    'BN',
    'BY',
    'BE',
    'BI',
    'BM',
    'BS',
    'CD',
    'CA',
    'CI',
    'CC',
    'CE',
    'CS',
    'CR',
    'CH',
    'CY',
    'CO',
    'CU',
    'CM',
    'DI',
    'DE',
    'DS',
    'DO',
    'DY',
    'ER',
    'EU',
    'EV',
    'ES',
    'FD',
    'FC',
    'FS',
    'FL',
    'FR',
    'GD',
    'GA',
    'GN',
    'GS',
    'GE',
    'AU',
    'GR',
    'GT',
    'GY',
    'HF',
    'HS',
    'HM',
    'IN',
    'IR',
    'FE',
    'JD',
    'KA',
    'KY',
    'LA',
    'PB',
    'LS',
    'LI',
    'LU',
    'MT',
    'MG',
    'MS',
    'MA',
    'MN',
    'MB',
    'MR',
    'HG',
    'MI',
    'MW',
    'MO',
    'ND',
    'NS',
    'NI',
    'NB',
    'OC',
    'OL',
    'OP',
    'OS',
    'PD',
    'PA',
    'PE',
    'PP',
    'PH',
    'PT',
    'PO',
    'KK',
    'KN',
    'PZ',
    'PR',
    'PU',
    'PY',
    'PL',
    'QZ',
    'RD',
    'RA',
    'RN',
    'RB',
    'RS',
    'RE',
    'RH',
    'RO',
    'RM',
    'RY',
    'RU',
    'SM',
    'SV',
    'SP',
    'SC',
    'SE',
    'SK',
    'SH',
    'SI',
    'SL',
    'AG',
    'SG',
    'ST',
    'SZ',
    'SX',
    'NA',
    'SO',
    'NC',
    'SS',
    'SR',
    'SU',
    'TC',
    'TA',
    'TE',
    'TB',
    'TL',
    'TH',
    'TM',
    'SN',
    'TI',
    'TR',
    'TT',
    'WO',
    'UR',
    'VA',
    'VM',
    'VL',
    'VG',
    'WL',
    'YB',
    'YR',
    'ZE',
    'ZN',
    'ZR'
]

COMMODITY_CODES_CONFIG = {
    'TO': {
        'mine_tenure_type_codes': ['COL'],
        'exclusive_ind': True
    },
    'MC': {
        'mine_tenure_type_codes': ['COL'],
        'exclusive_ind': True
    },
    'CG': {
        'mine_tenure_type_codes': ['BCL'],
        'exclusive_ind': False
    },
    'SA': {
        'mine_tenure_type_codes': ['BCL'],
        'exclusive_ind': False
    }
}

for code in METALS_AND_MINERALS:
    COMMODITY_CODES_CONFIG[code] = {
        'mine_tenure_type_codes': ['MIN', 'PLR'],
        'exclusive_ind': False
    }

DISTURBANCE_CODES_CONFIG = {
    'SUR': {
        'mine_tenure_type_codes': ['COL', 'MIN', 'PLR', 'BCL'],
        'exclusive_ind': False
    },
    'UND': {
        'mine_tenure_type_codes': ['COL', 'MIN', 'PLR'],
        'exclusive_ind': False
    },
    'CWA': {
        'mine_tenure_type_codes': ['COL'],
        'exclusive_ind': True
    },
    'MIL': {
        'mine_tenure_type_codes': ['PLR'],
        'exclusive_ind': True
    }
}

#Cache prefixes
NRIS_MAJOR_MINE_LIST = "major_mine_list"
NRIS_TOKEN = "nris:token"
NROS_TOKEN = "nros:token"
VFCBC_COOKIES = "vdcbc_cookies"
def NRIS_COMPLIANCE_DATA(mine_no): return f'mine:{mine_no}:api-compliance-data'
def DOWNLOAD_TOKEN(token_guid): return f'document-manager:download-token:{token_guid}'

#Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140

#Redis Map Cache
MINE_MAP_CACHE = "MINE_MAP_CACHE"


