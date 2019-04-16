from app.extensions import api
from flask_restplus import fields

BASIC_MINE_LOCATION_MODEL = api.model('BasicMineLocation', {
    'latitude': fields.String,
    'longitude': fields.String,
})

BASIC_MINE_LIST = api.model(
    'BasicMineList', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_location': fields.Nested(BASIC_MINE_LOCATION_MODEL)
    })

MINE_LOCATION_MODEL = api.model(
    'MineLocation', {
        'mine_location_guid': fields.String,
        'mine_guid': fields.String,
        'latitude': fields.Fixed(description='fixed precision decimal.', decimals=7),
        'longitude': fields.Fixed(description='fixed precision decimal.', decimals=7),
    })

MINE_DOCUMENT_MODEL = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'active_ind': fields.Boolean,
    })

PERMIT_MODEL = api.model('MinePermit', {
    'permit_guid': fields.String,
    'permit_no': fields.String,
})

EXPECTED_DOCUMENT_STATUS_MODEL = api.model('ExpectedDocumentStatus', {
    'exp_document_status_code': fields.String,
    'description': fields.String,
})

STATUS_MODEL = api.model(
    'MineStatus', {
        'mine_status_guid': fields.String,
        'mine_guid': fields.String,
        'mine_status_xref_guid': fields.String,
        'status_values': fields.List(fields.String()),
        'status_labels': fields.List(fields.String),
        'effective_date': fields.Date,
        'expiry_date': fields.Date,
    })

MINE_TSF_MODEL = api.model(
    'MineTailingsStorageFacility', {
        'mine_tailings_storage_facility_guid': fields.String,
        'mine_guid': fields.String,
        'mine_tailings_storage_facility_name': fields.String,
    })

MINE_TYPE_DETAIL_MODEL = api.model(
    'MineTypeDetail', {
        'mine_type_detail_xref_guid': fields.String,
        'mine_type_guid': fields.String,
        'mine_disturbance_code': fields.String,
        'mine_commodity_code': fields.String,
    })

MINE_TYPE_MODEL = api.model(
    'MineType', {
        'mine_type_guid': fields.String,
        'mine_guid': fields.String,
        'mine_tenure_type_code': fields.String,
        'mine_type_detail': fields.List(fields.Nested(MINE_TYPE_DETAIL_MODEL)),
    })

MINE_VERIFIED_MODEL = api.model(
    'MineVerifiedStatus', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'healthy_ind': fields.Boolean,
        'verifying_user': fields.String,
        'verifying_timestamp': fields.Date,
    })

MINE_EXPECTED_DOCUMENT_MODEL = api.model(
    'MineExpectedDocument', {
        'exp_document_guid': fields.String,
        'req_document_guid': fields.String,
        'mine_guid': fields.String,
        'exp_document_name': fields.String,
        'exp_document_description': fields.String,
        'due_date': fields.Date,
        'received_date': fields.Date,
        'exp_document_status_code': fields.String,
        'expected_document_status': fields.Nested(EXPECTED_DOCUMENT_STATUS_MODEL),
        'hsrc_code': fields.String,
        'related_documents': fields.List(fields.Nested(MINE_DOCUMENT_MODEL)),
    })

MINES_MODEL = api.model(
    'Mines', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_note': fields.String,
        'major_mine_ind': fields.Boolean,
        'mine_region': fields.String,
        'mine_permit': fields.List(fields.Nested(PERMIT_MODEL)),
        'mine_status': fields.List(fields.Nested(STATUS_MODEL)),
        'mine_tailings_storage_facilities': fields.List(fields.Nested(MINE_TSF_MODEL)),
        'mine_type': fields.List(fields.Nested(MINE_TYPE_MODEL)),
        'verified_status': fields.Nested(MINE_VERIFIED_MODEL)
    })

MINE_MODEL = api.inherit(
    'Mine', MINES_MODEL, {
        'mine_location': fields.Nested(MINE_LOCATION_MODEL),
        'mine_expected_documents': fields.List(fields.Nested(MINE_EXPECTED_DOCUMENT_MODEL)),
    })

MINE_LIST_MODEL = api.model(
    'MineList', {
        'mines': fields.List(fields.Nested(MINES_MODEL)),
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })