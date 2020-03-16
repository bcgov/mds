from app.extensions import api
from flask_restplus import fields

BOND = api.model(
    'Bond', {
        'bond_id': fields.Integer,
        'bond_guid': fields.String,
        'amount': fields.Fixed(decimals=2),
        'bond_type_code': fields.String,
        'payer_party_guid': fields.String,
        'institution_party_guid': fields.String,
        'bond_status_code': fields.String,
        'reference_number': fields.String,
        'permit_guid': fields.String(attribute='permits.permit_guid')
    })
