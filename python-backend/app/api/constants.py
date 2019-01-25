# Outlines the tenure type code to which each disturbance applies
# Exclusive disturbance codes are invalid in combination with other disturbance
# codes under the same tenure
METALS_AND_MINERALS = [
    'AE',
    'AT',
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


# Status Code for party_type_code
PARTY_STATUS_CODE = {
    'per': 'PER',
    'org': 'ORG'
}


# Status Code for permit_status_code
PERMIT_STATUS_CODE = {
    'choices': ['O', 'C'],
    'open': 'O',
    'closed': 'C'
}


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


MINE_STATUS_OPTIONS = [
    {
        'value': MINE_OPERATION_STATUS['abandoned']['value'],
        'label': MINE_OPERATION_STATUS['abandoned']['label'],
        'children': []
    },
    {
        'value': MINE_OPERATION_STATUS['closed']['value'],
        'label': MINE_OPERATION_STATUS['closed']['label'],
        'children': [
            {
                'value': MINE_OPERATION_STATUS_REASON['care_maintenance']['value'],
                'label': MINE_OPERATION_STATUS_REASON['care_maintenance']['label'],
                'children': []
            },
            {
                'value': MINE_OPERATION_STATUS_REASON['reclamation']['value'],
                'label': MINE_OPERATION_STATUS_REASON['reclamation']['label'],
                'children': [
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['label']
                    },
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance_water_treatment']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance_water_treatment']['label']
                    },
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['permit_release_pending']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['permit_release_pending']['label']
                    }
                ]
            },
            {
                'value': MINE_OPERATION_STATUS_REASON['orphaned']['value'],
                'label': MINE_OPERATION_STATUS_REASON['orphaned']['label'],
                'children': [
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['label']
                    },
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance_water_treatment']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance_water_treatment']['label']
                    },
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['reclamation_not_started']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['reclamation_not_started']['label']
                    },
                    {
                        'value': MINE_OPERATION_STATUS_SUB_REASON['site_visit_required']['value'],
                        'label': MINE_OPERATION_STATUS_SUB_REASON['site_visit_required']['label']
                    }
                ]
            },
            {
                'value': MINE_OPERATION_STATUS_REASON['unknown']['value'],
                'label': MINE_OPERATION_STATUS_REASON['unknown']['label'],
                'children': []
            },
        ]
    },
    {
        'value': MINE_OPERATION_STATUS['not_started']['value'],
        'label': MINE_OPERATION_STATUS['not_started']['label'],
        'children': []
    },
    {
        'value': MINE_OPERATION_STATUS['operating']['value'],
        'label': MINE_OPERATION_STATUS['operating']['label'],
        'children': [
            {
                'value': MINE_OPERATION_STATUS_REASON['year_round']['value'],
                'label': MINE_OPERATION_STATUS_REASON['year_round']['label'],
                'children': []
            },
            {
                'value': MINE_OPERATION_STATUS_REASON['seasonal']['value'],
                'label': MINE_OPERATION_STATUS_REASON['seasonal']['label'],
                'children': []
            }
        ]
    }
]


#Region Code
MINE_REGION_OPTIONS = [
    {
        'value': 'SW',
        'label': 'South West'
    },
    {
        'value': 'SC',
        'label': 'South Central'
    },
     {
        'value': 'NW',
        'label': 'North West'
    },
    {
        'value': 'NE',
        'label': 'North East'
    },
    {
        'value': 'SE',
        'label': 'South East'
    }
]



#Redis Map Cache
MINE_MAP_CACHE = "MINE_MAP_CACHE"