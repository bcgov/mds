from app.extensions import api
from flask_restplus import fields

from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


BASIC_MINE_LOCATION_MODEL = api.model(
    'BasicMineLocation', {
        'latitude': fields.String,
        'longitude': fields.String,
        'utm_easting': fields.String,
        'utm_northing': fields.String,
        'utm_zone_number': fields.String,
        'utm_zone_letter': fields.String,
        'mine_location_description': fields.String,
    })

BASIC_MINE_LIST = api.model(
    'BasicMineList', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_location': fields.Nested(BASIC_MINE_LOCATION_MODEL),
    })

EXEMPTION_FEE_STATUS_CODE_MODEL = api.model('ExemptionFeeStatusCode', {
    'exemption_fee_status_code': fields.String,
    'description': fields.String,
    'display_order': fields.Integer
})

MINE_TENURE_TYPE_CODE_MODEL = api.model('MineTenureTypeCode', {
    'mine_tenure_type_code': fields.String,
    'description': fields.String,
})

MINE_COMMODITY_CODE_MODEL = api.model(
    'MineCommodityCodeModel', {
        'mine_commodity_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'mine_tenure_type_codes': fields.List(fields.String)
    })

MINE_DISTURBANCE_CODE_MODEL = api.model(
    'MineDisturbanceCodeModel', {
        'mine_disturbance_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'mine_tenure_type_codes': fields.List(fields.String)
    })

MINE_LOCATION_MODEL = api.model(
    'MineLocation', {
        'latitude': fields.Fixed(description='fixed precision decimal.', decimals=7),
        'longitude': fields.Fixed(description='fixed precision decimal.', decimals=7),
        'utm_easting': fields.String,
        'utm_northing': fields.String,
        'utm_zone_number': fields.String,
        'utm_zone_letter': fields.String,
        'mine_location_description': fields.String,
    })

MINE_DOCUMENT_MODEL = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.DateTime,
    })

PERMIT_AMENDMENT_DOCUMENT_MODEL = api.model(
    'PermitAmendmentDocument', {
        'permit_id': fields.Integer,
        'permit_amendment_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'active_ind': fields.Boolean
    })

PERMIT_AMENDMENT_MODEL = api.model(
    'PermitAmendment',
    {
                                                                                         #'permit_guid':fields.String,
        'permit_amendment_id': fields.Integer,
        'permit_amendment_guid': fields.String,
        'permit_amendment_status_code': fields.String,
        'permit_amendment_type_code': fields.String,
        'received_date': fields.DateTime(dt_format='iso8601'),
        'issue_date': fields.DateTime(dt_format='iso8601'),
        'authorization_end_date': fields.DateTime(dt_format='iso8601'),
        'security_total': fields.Fixed(description='Currency', decimals=2),
                                                                                         #'permit_amendment_status_description': fields.String,                                                                            #'permit_amendment_type_description': fields.String,
        'description': fields.String,
        'related_documents': fields.List(fields.Nested(PERMIT_AMENDMENT_DOCUMENT_MODEL))
    })

PERMIT_MODEL = api.model(
    'Permit',
    {
        'permit_id': fields.Integer,
        'permit_guid': fields.String,
        'mine_guid': fields.String,
        'permit_no': fields.String,
        'permit_status_code': fields.String,
                                                                                 # 'permit_status_code_description': fields.String,
        'permit_amendments': fields.List(fields.Nested(PERMIT_AMENDMENT_MODEL)),
    })

PERMIT_STATUS_CODE_MODEL = api.model('PermitStatusCode', {
    'permit_status_code': fields.String,
    'description': fields.String,
    'display_order': fields.Integer
})

PERMIT_AMENDEMENT_STATUS_CODE_MODEL = api.model(
    'PermitAmendmentStatusCode', {
        'permit_amendment_status_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer
    })

STATUS_MODEL = api.model(
    'MineStatus', {
        'mine_status_guid': fields.String,
        'mine_guid': fields.String,
        'mine_status_xref_guid': fields.String,
        'status_values': fields.List(fields.String),
        'status_labels': fields.List(fields.String),
        'effective_date': fields.DateTime,
        'expiry_date': fields.DateTime,
        'status_date': fields.DateTime,
        'status_description': fields.String,
    })

MINE_REPORT_SUBMISSION_STATUS = api.model('MineReportSubmissionStatus', {
    'mine_report_submission_status_code': fields.String,
    'description': fields.String,
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
        'verifying_timestamp': fields.DateTime,
    })

MINE_REGION_OPTION = api.model('MineRegion', {
    'mine_region_code': fields.String,
    'description': fields.String
})


MINES_MODEL = api.model(
    'Mines', {
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'mine_note': fields.String,
        'legacy_mms_mine_status': fields.String,
        'major_mine_ind': fields.Boolean,
        'mine_region': fields.String,
        'ohsc_ind': fields.Boolean,
        'union_ind': fields.Boolean,
        'mine_status': fields.List(fields.Nested(STATUS_MODEL)),
        'mine_permit_numbers': fields.List(fields.String),
        'mine_tailings_storage_facilities': fields.List(fields.Nested(MINE_TSF_MODEL)),
        'mine_type': fields.List(fields.Nested(MINE_TYPE_MODEL)),
        'verified_status': fields.Nested(MINE_VERIFIED_MODEL),
        'has_minespace_users': fields.Boolean,
    })

MINE_MODEL = api.inherit('Mine', MINES_MODEL, {
    'mine_location': fields.Nested(MINE_LOCATION_MODEL),
    'exemption_fee_status_code': fields.String,
    'exemption_fee_status_note': fields.String,
})

MINE_LIST_MODEL = api.model(
    'MineList', {
        'mines': fields.List(fields.Nested(MINES_MODEL)),
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
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

MINE_INCIDENT_CATEGORY_MODEL = api.model(
    'Mine Incident Category', {
        'mine_incident_category_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_INCIDENT_MODEL = api.model(
    'Mine Incident', {
        'mine_incident_id': fields.Integer,
        'mine_incident_id_year': fields.Integer,
        'mine_incident_guid': fields.String,
        'mine_incident_report_no': fields.String,
        'mine_guid': fields.String,
        'incident_timestamp': DateTime,
        'incident_description': fields.String,
        'reported_timestamp': DateTime,
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
        'mine_determination_type_code': fields.String,
        'mine_determination_representative': fields.String,
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

VARIANCE_DOCUMENT_MODEL = api.inherit('VarianceDocumentModel', MINE_DOCUMENT_MODEL, {
    'created_at': fields.Date,
    'variance_document_category_code': fields.String
})

VARIANCE_MODEL = api.model(
    'Variance', {
        'variance_guid': fields.String,
        'variance_no': fields.Integer,
        'mine_guid': fields.String,
        'compliance_article_id': fields.Integer,
        'variance_application_status_code': fields.String,
        'applicant_guid': fields.String,
        'inspector_party_guid': fields.String,
        'note': fields.String,
        'parties_notified_ind': fields.Boolean,
        'issue_date': fields.Date,
        'received_date': fields.Date,
        'expiry_date': fields.Date,
        'documents': fields.Nested(VARIANCE_DOCUMENT_MODEL)
    })

MINE_OPERATION_STATUS_CODE_MODEL = api.model('MineOperationStatusCode', {
    'mine_operation_status_code': fields.String,
    'description': fields.String
})

MINE_OPERATION_STATUS_REASON_CODE_MODEL = api.model('MineOperationStatusReasonCode', {
    'mine_operation_status_reason_code': fields.String,
    'description': fields.String
})

MINE_OPERATION_STATUS_SUB_REASON_CODE_MODEL = api.model(
    'MineOperationStatusSubReasonCode', {
        'mine_operation_status_sub_reason_code': fields.String,
        'description': fields.String
    })

MINE_STATUS_CODE_MODEL = api.model(
    'MineStatusCode', {
        'mine_status_xref_guid': fields.String,
        'mine_operation_status': fields.Nested(MINE_OPERATION_STATUS_CODE_MODEL),
        'mine_operation_status_reason': fields.Nested(MINE_OPERATION_STATUS_REASON_CODE_MODEL),
        'mine_operation_status_sub_reason':
        fields.Nested(MINE_OPERATION_STATUS_SUB_REASON_CODE_MODEL),
        'description': fields.String,
    })

MINE_COMMENT_MODEL = api.model(
    'MineCommentModel', {
        'mine_comment_guid': fields.String,
        'mine_comment': fields.String,
        'comment_user': fields.String,
        'comment_datetime': fields.DateTime,
    })

MINE_REPORT_COMMENT_MODEL = api.model(
    'MineReportCommentModel', {
        'mine_report_comment_guid': fields.String,
        'report_comment': fields.String,
        'comment_visibility_ind': fields.Boolean,
        'comment_user': fields.String,
        'comment_datetime': fields.DateTime,
        'from_latest_submission': fields.Boolean
    })

MINE_REPORT_SUBMISSION_MODEL = api.model(
    'MineReportSubmission', {
        'mine_report_submission_guid': fields.String,
        'submission_date': fields.Date,
        'mine_report_submission_status_code': fields.String,
        'documents': fields.List(fields.Nested(MINE_DOCUMENT_MODEL)),
        'comments': fields.List(fields.Nested(MINE_REPORT_COMMENT_MODEL))
    })

MINE_REPORT_MODEL = api.model(
    'MineReportModel', {
        'mine_report_id':
        fields.Integer,
        'mine_report_guid':
        fields.String,
        'mine_report_definition_guid':
        fields.String,
        'mine_report_category':
        fields.List(
            fields.String(attribute='mine_report_category'),
            attribute='mine_report_definition.categories'),
        'report_name':
        fields.String,
        'due_date':
        fields.Date,
        'received_date':
        fields.Date,
        'submission_year':
        fields.Integer,
        'created_by_idir':
        fields.String,
        'permit_guid':
        fields.String,
        'mine_report_submissions':
        fields.List(fields.Nested(MINE_REPORT_SUBMISSION_MODEL)),
        'mine_guid':
        fields.String,
        'mine_name':
        fields.String,
    })

MINE_REPORT_DEFINITION_CATEGORIES = api.model('MineReportDefinitionCategoriesModel', {
    'mine_report_category': fields.String,
    'description': fields.String
})

MINE_REPORT_DEFINITION_MODEL = api.model(
    'MineReportDefinition', {
        'mine_report_definition_guid': fields.String,
        'report_name': fields.String,
        'description': fields.String,
        'due_date_period_months': fields.Integer,
        'mine_report_due_date_type': fields.String,
        'default_due_date': fields.Date,
        'categories': fields.List(fields.Nested(MINE_REPORT_DEFINITION_CATEGORIES)),
        'compliance_articles': fields.List(fields.Nested(COMPLIANCE_ARTICLE_MODEL)),
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_REPORT_LIST = api.inherit('ReportList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(MINE_REPORT_MODEL)),
})

ORDER_DOCUMENT_MODEL = api.model(
    'MineComplianceOrderDocument', {
        "external_id": fields.String,
        "document_date": fields.DateTime,
        "document_type": fields.String,
        "file_name": fields.String,
        "comment": fields.String
    })

ORDER_MODEL = api.model(
    'MineComplianceOrder', {
        "order_no": fields.String,
        "violation": fields.String,
        "report_no": fields.Integer,
        "inspector": fields.String,
        "inspection_type": fields.String,
        "due_date": fields.Date,
        "order_status": fields.String,
        "overdue": fields.Boolean,
        "documents": fields.List(fields.Nested(ORDER_DOCUMENT_MODEL))
    })

COMPLAINCE_AGGREGATION_MODEL = api.model(
    'MineComplianceStats', {
        'num_inspections': fields.Integer,
        'num_advisories': fields.Integer,
        'num_warnings': fields.Integer,
        'num_requests': fields.Integer,
    })

MINE_COMPLIANCE_RESPONSE_MODEL = api.model(
    'MineComplianceData', {
        'last_inspection': fields.DateTime,
        'last_inspector': fields.String,
        'num_open_orders': fields.Integer,
        'num_overdue_orders': fields.Integer,
        'all_time': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'last_12_months': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'current_fiscal': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'year_to_date': fields.Nested(
            api.model('NUM_INSPECTIONS', {'num_inspections': fields.Integer})),
        'orders': fields.List(fields.Nested(ORDER_MODEL)),
    })
