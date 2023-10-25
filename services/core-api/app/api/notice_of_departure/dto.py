from app.extensions import api
from flask_restplus import fields
from app.api.notice_of_departure.models.notice_of_departure import NodType, NodStatus
from app.api.notice_of_departure.models.notice_of_departure_document_xref import DocumentType
from app.api.mines.response_models import MINE_DOCUMENT_MODEL

NOD_DOCUMENT_MODEL = api.inherit(
    'NoticeOfDeparureDocumentModel', MINE_DOCUMENT_MODEL, {
        'document_type': fields.String(enum=DocumentType, attribute='document_type.name'),
        'create_timestamp': fields.DateTime
    })

NOD_CONTACT_CREATE_MODEL = api.model(
    'NoticeOfDepartureCreateContact', {
        'first_name': fields.String,
        'last_name': fields.String,
        'email': fields.String,
        'phone_number': fields.String,
        'is_primary': fields.Boolean
    })

NOD_CONTACT_MODEL = api.inherit('NoticeOfDepartureContact', NOD_CONTACT_CREATE_MODEL,
                                {'nod_contact_guid': fields.String})

NOD_MODEL = api.model(
    'NoticeOfDeparture', {
        'nod_guid':
        fields.String,
        'nod_no':
        fields.String,
        'nod_title':
        fields.String,
        'nod_description':
        fields.String,
        'create_timestamp':
        fields.DateTime,
        'update_timestamp':
        fields.DateTime,
        'submission_timestamp':
        fields.DateTime,
        'mine':
        fields.Nested(
            api.model('Mine', {
                'mine_guid': fields.String,
                'mine_no': fields.String,
                'mine_name': fields.String,
            })),
        'permit':
        fields.Nested(
            api.model(
                'Permit', {
                    'permit_guid': fields.String,
                    'permit_no': fields.String,
                    'permit_status_code': fields.String,
                    'current_permittee': fields.String,
                    'current_permittee_guid': fields.String,
                    'current_permittee_digital_wallet_connection_state':fields.String
                })),
        'nod_status':
        fields.String(enum=NodStatus, attribute='nod_status.name'),
        'nod_type':
        fields.String(enum=NodType, attribute='nod_type.name'),
        'documents':
        fields.List(fields.Nested(NOD_DOCUMENT_MODEL)),
        'nod_contacts':
        fields.List(fields.Nested(NOD_CONTACT_MODEL))
    })

NOD_MODEL_LIST = api.model('NoticeOfDepartureList', {
    'records': fields.List(fields.Nested(NOD_MODEL)),
    'total': fields.Integer
})

CREATE_NOD_MODEL = api.model(
    'NoticeOfDeparture', {
        'mine_guid': fields.String,
        'permit_guid': fields.String,
        'nod_title': fields.String,
        'nod_description': fields.String,
        'nod_type': fields.String,
        'nod_status': fields.String,
        'nod_contacts': fields.List(fields.Nested(NOD_CONTACT_CREATE_MODEL)),
    })

UPDATE_NOD_MODEL = api.inherit('NoticeOfDepartureUpdate', CREATE_NOD_MODEL, {
    'nod_guid': fields.String,
    'nod_contacts': fields.List(fields.Nested(NOD_CONTACT_MODEL)),
})
