from app.extensions import api
from flask_restplus import fields

MINE_DOCUMENT = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.DateTime,
    })

MINE_PARTY_APPT_TYPE_MODEL = api.model(
    'MinePartyApptType', {
        'mine_party_appt_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'person': fields.Boolean,
        'organization': fields.Boolean,
        'grouping_level': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_PARTY_APPT = api.model(
    'MinePartyAppointment', {
        'mine_party_appt_guid': fields.String,
        'mine_guid': fields.String,
        'party_guid': fields.String,
        'mine_party_appt_type_code': fields.String,
        'start_date': fields.Date,
        'end_date': fields.Date,
        'documents': fields.Nested(MINE_DOCUMENT)
    })

ADDRESS = api.model(
    'Address', {
        'suite_no': fields.String,
        'address_line_1': fields.String,
        'address_line_2': fields.String,
        'city': fields.String,
        'sub_division_code': fields.String,
        'post_code': fields.String,
        'address_type_code': fields.String,
    })

PARTY = api.model(
    'Party', {
        'party_guid': fields.String,
        'party_type_code': fields.String,
        'phone_no': fields.String,
        'phone_ext': fields.String,
        'email': fields.String,
        'effective_date': fields.Date,
        'expiry_date': fields.Date,
        'party_name': fields.String,
        'name': fields.String,
        'first_name': fields.String,
        'address': fields.List(fields.Nested(ADDRESS)),
        'mine_party_appt': fields.Nested(MINE_PARTY_APPT),
        'job_title': fields.String,
        'postnominal_letters': fields.String,
        'idir_username': fields.String,
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_PARTY_LIST = api.inherit('PartyList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(PARTY)),
})
