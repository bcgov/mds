from app.extensions import api
from flask_restx import fields

BOND_PARTY = api.model('Party', {
    'party_name': fields.String,
    'name': fields.String,
    'first_name': fields.String,
})

BOND_DOCUMENT_MODEL = api.model(
    'BondDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'document_date': fields.DateTime,
        'upload_date': fields.Date,
        'bond_document_type_code': fields.String
    })

RECLAMATION_INVOICE_DOCUMENT_MODEL = api.model(
    'ReclamationInvoiceDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.Date,
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
        'closed_date': fields.DateTime,
        'closed_note': fields.String,
        'payer': fields.Nested(BOND_PARTY),
        'project_id': fields.String(attribute='permit.project_id'),
        'permit_guid': fields.String(attribute='permit.permit_guid'),
        'permit_no': fields.String(attribute='permit.permit_no'),
        'documents': fields.List(fields.Nested(BOND_DOCUMENT_MODEL))
    })

BOND_MINESPACE = api.model(
    'BondMineSpace', {
        'bond_id': fields.Integer,
        'bond_guid': fields.String,
        'amount': fields.Fixed(decimals=2),
        'bond_type_code': fields.String,
        'payer_party_guid': fields.String,
        'bond_status_code': fields.String,
        'reference_number': fields.String,
        'issue_date': fields.DateTime,
        'payer': fields.Nested(BOND_PARTY),
        'project_id': fields.String,
        'permit_guid': fields.String(attribute='permit.permit_guid'),
        'permit_no': fields.String(attribute='permit.permit_no'),
    })

BOND_STATUS = api.model('BondStatus', {
    'bond_status_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

BOND_TYPE = api.model('BondType', {
    'bond_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

BOND_DOCUMENT_TYPE = api.model(
    'BondDocumentType', {
        'bond_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

RECLAMATION_INVOICE = api.model(
    'ReclamationInvoice', {
        'reclamation_invoice_id': fields.Integer,
        'reclamation_invoice_guid': fields.String,
        'project_id': fields.String,
        'amount': fields.Fixed(decimals=2),
        'vendor': fields.String,
        'paid_date': fields.Date,
        'note': fields.String,
        'project_id': fields.String(attribute='permit.project_id'),
        'permit_guid': fields.String(attribute='permit.permit_guid'),
        'documents': fields.List(fields.Nested(RECLAMATION_INVOICE_DOCUMENT_MODEL))
    })
