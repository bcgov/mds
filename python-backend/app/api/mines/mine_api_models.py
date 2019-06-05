from app.extensions import api
from flask_restplus import fields


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


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

MINE_TENURE_TYPE_CODE_MODEL = api.model('MineTenureTypeCode', {
    'mine_tenure_type_code': fields.String,
    'description': fields.String,
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
    })

PERMIT_MODEL = api.model('MinePermit', {
    'permit_guid': fields.String,
    'permit_no': fields.String,
    'permit_status_code': fields.String,
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
        'effective_date': Date,
        'expiry_date': Date,
        'status_date': Date,
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
        'verifying_timestamp': Date,
    })

MINE_EXPECTED_DOCUMENT_MODEL = api.model(
    'MineExpectedDocument', {
        'exp_document_guid': fields.String,
        'req_document_guid': fields.String,
        'mine_guid': fields.String,
        'exp_document_name': fields.String,
        'exp_document_description': fields.String,
        'due_date': Date,
        'received_date': Date,
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
        'ohsc_ind': fields.Boolean,
        'union_ind': fields.Boolean,
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

MINE_INCIDENT_MODEL = api.model(
    'Mine Incident', {
        'mine_incident_guid': fields.String,
        'mine_incident_report_no': fields.String,
        'mine_incident_id_year': fields.Integer,
        'mine_guid': fields.String,
        'incident_timestamp': DateTime,
        'incident_description': fields.String,
        'reported_timestamp': DateTime,
        'reported_by': fields.String,
        'reported_by_role': fields.String,
        'determination_type_code': fields.String,
        'followup_type_code': fields.String,
        'dangerous_occurrence_subparagraph_ids': fields.List(fields.Integer)
    })

MINE_INCIDENT_FOLLOWUP_TYPE_MODEL = api.model(
    'Mine Incident Followup Type', {
        'mine_incident_followup_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_INCIDENT_DETERMINATION_TYPE_MODEL = api.model(
    'Mine Incident Determination Type', {
        'mine_incident_determination_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

VARIANCE_DOCUMENT_MODEL = api.inherit(
    'VarianceDocumentModel', MINE_DOCUMENT_MODEL, {
        'created_at': fields.Date
    })

VARIANCE_MODEL = api.model(
    'Variance', {
        'variance_guid': fields.String,
        'compliance_article_id': fields.Integer,
        'variance_application_status_code': fields.String,
        'applicant_guid': fields.String,
        'inspector_guid': fields.String,
        'note': fields.String,
        'issue_date': fields.Date,
        'received_date': fields.Date,
        'expiry_date': fields.Date,
        'documents': fields.Nested(VARIANCE_DOCUMENT_MODEL)
    })

VARIANCE_APPLICATION_STATUS_CODE_MODEL = api.model(
    'VarianceApplicationStatusCode', {
        'variance_application_status_code': fields.String,
        'description': fields.String
    })

MINE_OPERATION_STATUS_CODE_MODEL = api.model(
    'MineOperationStatusCode', {
        'mine_operation_status_code': fields.String(),
        'description': fields.String()
    })

MINE_OPERATION_STATUS_REASON_CODE_MODEL = api.model(
    'MineOperationStatusReasonCode', {
        'mine_operation_status_reason_code': fields.String(),
        'description': fields.String()
    })

MINE_OPERATION_STATUS_SUB_REASON_CODE_MODEL = api.model(
    'MineOperationStatusSubReasonCode', {
        'mine_operation_status_sub_reason_code': fields.String(),
        'description': fields.String()
    })

MINE_STATUS_CODE_MODEL = api.model(
        'MineStatusCode', {
            'mine_status_xref_guid':fields.String(),
            'mine_operation_status':fields.Nested(MINE_OPERATION_STATUS_CODE_MODEL),
            'mine_operation_status_reason':fields.Nested(MINE_OPERATION_STATUS_REASON_CODE_MODEL),
            'mine_operation_status_sub_reason':fields.Nested(MINE_OPERATION_STATUS_SUB_REASON_CODE_MODEL),
            'description': fields.String(),
    })
