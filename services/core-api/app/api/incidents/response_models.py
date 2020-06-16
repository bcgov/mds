from app.extensions import api
from flask_restplus import fields

MINE_INCIDENT_CATEGORY_MODEL = api.model(
    'Mine Incident Category', {
        'mine_incident_category_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_INCIDENT_DETERMINATION_TYPE_MODEL = api.model('Mine Incident Determination Type', {
    'mine_incident_determination_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL = api.model(
    'Mine Incident Followup Investigation Type', {
        'mine_incident_followup_investigation_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

MINE_INCIDENT_STATUS_CODE_MODEL = api.model('Mine Incident Status Codes', {
    'mine_incident_status_code': fields.String,
    'description': fields.String,
    'active_ind' : fields.Boolean
})

MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL = api.model('Mine Incident Document Type Codes', {
    'mine_incident_document_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

MINE_INCIDENT_DOCUMENT_MODEL = api.model(
    'Mine Incident Document', {
        'mine_document_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'mine_incident_document_type_code': fields.String,
        'upload_date': fields.DateTime,
    })

MINE_INCIDENT_RECOMMENDATION_MODEL = api.model('Mine Incident Recommendation', {
    'recommendation': fields.String,
    'mine_incident_recommendation_guid': fields.String
})

MINE_INCIDENT_MODEL = api.model(
    'Mine Incident', {
        'mine_incident_id': fields.Integer,
        'mine_incident_id_year': fields.Integer,
        'mine_incident_guid': fields.String,
        'mine_incident_report_no': fields.String,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_region': fields.String,
        'major_mine_ind': fields.Boolean,
        'incident_timestamp': fields.DateTime,
        'incident_description': fields.String,
        'reported_timestamp': fields.DateTime,
        'reported_by_name': fields.String,
        'reported_by_email': fields.String,
        'reported_by_phone_no': fields.String,
        'reported_by_phone_ext': fields.String,
        'emergency_services_called': fields.Boolean,
        'number_of_injuries': fields.Integer,
        'number_of_fatalities': fields.Integer,
        'reported_to_inspector_party_guid': fields.String,
        'responsible_inspector_party_guid': fields.String,
        'determination_type_code': fields.String,
        'status_code': fields.String,
        'followup_investigation_type_code': fields.String,
        'followup_inspection': fields.Boolean,
        'followup_inspection_date': fields.Date,
        'determination_inspector_party_guid': fields.String,
        'mms_inspector_initials': fields.String(attribute='mms_insp_cd'),
        'dangerous_occurrence_subparagraph_ids': fields.List(fields.Integer),
        'proponent_incident_no': fields.String,
        'mine_incident_no': fields.String,
        'documents': fields.List(fields.Nested(MINE_INCIDENT_DOCUMENT_MODEL)),
        'recommendations': fields.List(fields.Nested(MINE_INCIDENT_RECOMMENDATION_MODEL)),
        'categories': fields.List(fields.Nested(MINE_INCIDENT_CATEGORY_MODEL))
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_INCIDENT_LIST = api.inherit('IncidentList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(MINE_INCIDENT_MODEL)),
})