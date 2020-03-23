from app.extensions import api
from flask_restplus import fields

BOND_PARTY = api.model('Party', {
    'party_name': fields.String,
    'name': fields.String,
    'first_name': fields.String,
})

BOND = api.model(
    'Bond', {
        'bond_id': fields.Integer,
        'bond_guid': fields.String,
        'amount': fields.Fixed(decimals=2),
        'bond_type_code': fields.String,
        'payer_party_guid': fields.String,
        'bond_status_code': fields.String,
        'reference_number': fields.String,
        'issue_date': fields.DateTime,
        'institution_name': fields.String,
        'institution_street': fields.String,
        'institution_city': fields.String,
        'institution_province': fields.String,
        'institution_postal_code': fields.String,
        'note': fields.String,
        'payer': fields.Nested(BOND_PARTY),
        'permit_guid': fields.String(attribute='permits.permit_guid')
    })

BOND_STATUS = api.model('BondStatus', {
    'bond_status_code': fields.String,
    'description': fields.String
})

BOND_TYPE = api.model('BondType', {'bond_type_code': fields.String, 'description': fields.String})
