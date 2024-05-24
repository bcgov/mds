now_party_appt_schema = {
    'mine_party_appt_type_code': {
        'nullable': True,
        'type': 'string',
    },
    'mine_party_appt_type_code_description': {
        'nullable': True,
        'type': 'string',
    },
    'now_application': {
        'nullable': True,
        'type': 'dict',
        'schema': {
            'now_application_guid': {
                'nullable': True,
                'type': 'string',
            },
            'now_number': {
                'nullable': True,
                'type': 'string',
            },
            'submitted_date': {
                'nullable': True,
                'type': 'string',
            },
        },
    },
    'now_party_appointment_id': {
        'nullable': True,
        'type': 'number',
    },
    'party_guid': {
        'nullable': True,
        'type': 'string',
    },
}

# Project Summary Schema
project_summary_base_schema = {
    'agent': {
        'nullable': True,
        'type': 'dict',
    },
    'documents': {
        'nullable': True,
        'type': 'list',
        'schema': {
            'type': 'dict',
            'schema': {
                'document_manager_guid': {
                    'required': True,
                    'type': 'string',
                },
                'document_name': {
                    'required': True,
                    'type': 'string',
                },
            }
        }
    },
    'mine_guid': {
        'nullable': True,
        'type': 'string',
    },
    'mine_name': {
        'nullable': True,
        'type': 'string',                  
    },
    'mrc_review_required': {
        'nullable': True,
        'type': 'boolean',
    },
    'project_guid': {
        'nullable': True,
        'type': 'string',
    },
    'project_summary_id': {
        'nullable': True,
        'type': 'number',
    },
    'project_summary_guid': {
        'nullable': True,
        'type': 'string',
    },
    'status_code': {
        'required': True,
        'type': 'string',
    },
    'is_billing_address_same_as_mailling_address': {
        'nullable': True,
        'type': 'boolean',
    },
    'is_legal_address_same_as_mailing_address': {
        'nullable': True,
        'type': 'boolean',
    },
    'expected_draft_irt_submission_date': {
        'nullable': True,
        'type': 'date',
    },
    'expected_permit_application_date': {
        'nullable': True,
        'type': 'date',
    },
    'expected_permit_receipt_date': {
        'nullable': True,
        'type': 'date',
    },
    'expected_project_start_date': {
        'nullable': True,
        'type': 'date',       
    },    
}

# Address Schemas
base_address_schema = {
                    'address_line_1': {
                    'type': 'string',
                    'required': True,
                    },
                    'city': {
                        'type': 'string',
                        'required': True,
                    },
                    'address_line_2': {
                        'type': 'string',
                        'nullable': True,
                    },
                    'suite_no': {
                        'type': 'string',
                        'nullable': True,
                    },
        }

primary_address_schema = base_address_schema | {
    'address_type_code': {
        'type': 'string',
        'required': True,
        'allowed': ['INT', 'USA', 'CAN'],
    },
    'post_code': {
        'type': 'string',
        'required': True,
    },
}

address_na_schema = {
    'sub_division_code': {
        'type': 'string',
        'required': True,
    },
}

address_int_schema = {
    'sub_division_code': {
        'type': 'string',
        'nullable': True,
    },
}

secondary_address_schema = {
                    'address_line_1': {
                    'type': 'string',
                    'nullable': True,
                    },
                    'address_type_code': {
                        'type': 'string',
                        'nullable': True,
                        'allowed': ['INT', 'USA', 'CAN'],
                    },
                    'city': {
                        'type': 'string',
                        'nullable': True,
                    },
                    'post_code': {
                        'type': 'string',
                        'nullable': True,
                    },
                    'sub_division_code': {
                        'type': 'string',
                        'nullable': True,
                    },
                    'address_line_2': {
                        'type': 'string',
                        'nullable': True,
                    },
                    'suite_no': {
                        'type': 'string',
                        'nullable': True,
                    },
        }

# Party Schemas
mine_party_appointment_schema = {
    'mine_party_appt_guid': {
        'nullable': True,
        'type': 'string',
    },
    'party_guid': {
        'nullable': True,
        'type': 'string',
    },
    'mine_guid': {
        'nullable': True,
        'type': 'string',
    },
    'related_guid': {
        'nullable': True,
        'type': 'string',
    },
    'permit_no': {
        'nullable': True,
        'type': 'string',
    },
    'mine_party_appt_type_code': {
        'nullable': True,
        'type': 'string',
        'allowed': ['EOR', 'TQP', 'MMG'],
    },
    'start_date': {
        'nullable': True,
        'type': 'string',
    },
    'end_date': {
        'nullable': True,
        'type': 'string',
    },
    'documents': {
        'type': 'dict',
        'schema': {
            'document_manager_guid': {
                'nullable': True,
                'type': 'string',
            },
            'document_name': {
                'nullable': True,
                'type': 'string',
            },
            'mine_document_guid': {
                'nullable': True,
                'type': 'string',
            },
            'mine_guid': {
                'nullable': True,
                'type': 'string',
            },
            'upload_date': {
                'nullable': True,
                'type': 'string',
            },
        },
    },
    'union_rep_company': {
        'nullable': True,
        'type': 'string',
    },
    'status': {
        'nullable': True,
        'type': 'string',
    },
    'mine_party_acknowledgement_status': {
        'nullable': True,
        'type': 'string',
    },
    'party': {
        'nullable': True,
        'type': 'dict',
    }
}

party_orgbook_entity_schema = {
    'party_orgbook_entity_id': {
        'nullable': True,
        'type': 'number',
    },
    'party_guid': {
        'nullable': True,
        'type': 'string',  
    },
    'regisdtration_id': {
        'nullable': True,
        'type': 'string',
    },
    'registration_status': {
        'nullable': True,
        'type': 'boolean',
    },
    'registration_date': {
        'nullable': True,
        'type': 'string',
    },
    'name_text': {
        'nullable': True,
        'type': 'string',
    },
    'name_id': {
        'nullable': True,
        'type': 'number',
    },
    'credential_id': {
        'nullable': True,
        'type': 'number',
    },
    'company_alias': {
        'nullable': True,
        'type': 'string',
    },
}

party_base_schema = {
    'party_guid': {
        'nullable': True,
        'type': 'string',
    },
    'party_type_code': {
        'nullable': True,
        'type': 'string',
    },
    'phone_ext': {
        'nullable': True,
        'type': 'string',
    },
    'phone_no_sec': {
        'nullable': True,
        'type': 'string',
    },
    'phone_no_ter': {
        'nullable': True,
        'type': 'string',
    },
    'phone_sec_ext': {
        'nullable': True,
        'type': 'string',
    },
    'phone_ter_ext': {
        'nullable': True,
        'type': 'string',
    },
    'email_sec': {
        'nullable': True,
        'type': 'string',
    },
    'name': {
        'nullable': True,
        'type': 'string',
    },
    'middle_name': {
        'nullable': True,
        'type': 'string',
    },
    'party_name': {
        'required': True,
        'anyof': [
            {
                'type': 'string'
            },
            {
                'type': 'dict',
                'schema': {
                    'key': {
                        'type': 'string',
                    },
                    'label': {
                        'type': 'string',
                    },
                    'value': {
                        'type': 'string',
                    },
                }
            },
        ],
    },
    'mine_party_appt': {
        'nullable': True,
        'anyof': [
            {
                'type': 'list',
                'schema': {
                    'type': 'dict',
                    'schema': mine_party_appointment_schema,
                },
            },
            {
                'type': 'dict',
                'schema': mine_party_appointment_schema,
            },
        ],
    },
    'job_title': {
        'nullable': True,
        'type': 'string',
    },
    'job_title_code': {
        'nullable': True,
        'type': 'string',
    },
    'postnominal_letters': {
        'nullable': True,
        'type': 'string',
    },
    'idir_username': {
        'nullable': True,
        'type': 'string',
    },
    'business_role_appts': {
        'nullable': True,
        'type': 'list',
        'schema': {'type': 'string'},
    },
    'signature': {
        'nullable': True,
        'type': 'string',
    },
    'now_party_appt': {
        'nullable': True,
        'anyof': [
            {
                'type': 'list',
                'schema': {
                    'type': 'dict',
                    'schema': now_party_appt_schema,
                },
            },
            {
                'type': 'dict',
                'schema': now_party_appt_schema,
            },
        ],
    },
    'organization_guid': {
        'nullable': True,
        'type': 'string',
    },
    'organization': {
        'nullable': True,
        'type': 'dict',
    },
    'digital_wallet_connection_status': {
        'nullable': True,
        'type': 'string',
    },
    'party_orgbook_entity': {
        'nullable': True,
        'type': 'dict',
        'schema': party_orgbook_entity_schema,
    },
}