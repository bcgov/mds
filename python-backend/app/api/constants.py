# The following constants are based on seed data found in /migrations/sql/afterMigrate__3__seed_data.sql

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
