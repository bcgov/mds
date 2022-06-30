from cerberus import Validator
import json


def contact_validator(values):
    if values == None:
        return values
    CONTACT_SCHEMA = {
        'nod_contact_guid': {
            'required': False,
            'type': 'string'
        },
        'first_name': {
            'required': True,
            'type': 'string',
            'maxlength': 200
        },
        'last_name': {
            'required': True,
            'type': 'string',
            'maxlength': 100
        },
        'email': {
            'required': True,
            'type': 'string',
            'regex': '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        },
        'phone_number': {
            'required': False,
            'type': 'string',
            'regex': '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$'
        },
        'is_primary': {
            'required': True,
            'type': 'boolean',
            'default': False
        },
    }
    result = []
    has_a_primary = False
    v = Validator()
    for value in values:
        if v.validate(value, CONTACT_SCHEMA):
            result.append(value)
            if value['is_primary'] == True:
                has_a_primary = True
        else:
            raise ValueError(json.dumps(v.errors))
    if (len(values) > 0 and has_a_primary == False):
        raise ValueError('has to be a primary contact')
    return result