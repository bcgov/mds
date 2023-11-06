from flask_restplus import fields, marshal

from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.dams.dto import DAM_MODEL
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus, MinePartyAcknowledgedStatus
from app.api.parties.response_models import PARTY
from app.extensions import api


class DateTime(fields.Raw):

    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class PermitCondition(fields.Raw):

    def format(self, value):
        return marshal(value, PERMIT_CONDITION_MODEL)


class PermitConditionTemplate(fields.Raw):

    def format(self, value):
        return marshal(value, PERMIT_CONDITION_TEMPLATE_MODEL)


class StandardPermitCondition(fields.Raw):

    def format(self, value):
        return marshal(value, STANDARD_PERMIT_CONDITION_MODEL)


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

EXEMPTION_FEE_STATUS_CODE_MODEL = api.model(
    'ExemptionFeeStatusCode', {
        'exemption_fee_status_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })

MINE_TENURE_TYPE_CODE_MODEL = api.model('MineTenureTypeCode', {
    'mine_tenure_type_code': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
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

MINE_DOCUMENT_VERSION_MODEL = api.model(
    'MineDocumentVersion', {
        'mine_document_guid': fields.String,
        'mine_document_version_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_manager_version_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.String,
        'create_user': fields.String,
        'update_timestamp': fields.String
    })

MAJOR_MINE_APPLICATION_DOCUMENT_XREF_MODEL = api.model(
    'MajorMineApplicationDocumentXref', {
        'major_mine_application_document_type_code': fields.String
    })

PROJECT_SUMMARY_DOCUMENT_XREF_MODEL = api.model(
    'ProjectSummaryDocumentXref', {
        'project_summary_document_type_code': fields.String
    })

PROJECT_DECISION_PACKAGE_DOCUMENT_XREF_MODEL = api.model(
    'ProjectDecisionPackageDocumentXref', {
        'project_decision_package_document_type_code': fields.String
    })

INFORMATION_REQUIREMENTS_TABLE_DOCUMENT_XREF_MODEL = api.model(
    'InformationRequirementsTableDocumentXref', {
        'information_requirements_table_document_type_code': fields.String
    })

MINE_DOCUMENT_MODEL = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.String,
        'update_timestamp': fields.String,
        'create_user': fields.String,
        'is_archived': fields.Boolean,
        'archived_date': fields.String,
        'archived_by': fields.String,
        'versions': fields.List(fields.Nested(MINE_DOCUMENT_VERSION_MODEL)),
        'major_mine_application_document_xref': fields.Nested(MAJOR_MINE_APPLICATION_DOCUMENT_XREF_MODEL),
        'project_summary_document_xref': fields.Nested(PROJECT_SUMMARY_DOCUMENT_XREF_MODEL),
        'project_decision_package_document_xref': fields.Nested(PROJECT_DECISION_PACKAGE_DOCUMENT_XREF_MODEL),
        'information_requirements_table_document_xref': fields.Nested(INFORMATION_REQUIREMENTS_TABLE_DOCUMENT_XREF_MODEL),
    })

ARCHIVE_MINE_DOCUMENT = api.model('ARCHIVE_MINE_DOCUMENT', {
    'mine_document_guids': fields.List(fields.String)
})

DOCUMENT_MANAGER_ZIP = api.model('DOCUMENT_MANAGER_ZIP', {
    'document_manager_guids': fields.List(fields.String)
})

IMPORTED_NOW_SUBMISSION_DOCUMENT = api.model(
    'IMPORTED_NOW_SUBMISSION_DOCUMENT', {
        'messageid': fields.Integer,
        'documenturl': fields.String,
        'filename': fields.String,
        'documenttype': fields.String,
        'description': fields.String,
        'is_final_package': fields.Boolean,
        'final_package_order': fields.Integer,
        'mine_document': fields.Nested(MINE_DOCUMENT_MODEL),
    })

PERMIT_AMENDMENT_NOW_DOCUMENT = api.model(
    'NOW_DOCUMENT', {
        'now_application_document_xref_guid': fields.String,
        'now_application_document_type_code': fields.String,
        'now_application_document_sub_type_code': fields.String,
        'description': fields.String,
        'is_final_package': fields.Boolean,
        'final_package_order': fields.Integer,
        'mine_document': fields.Nested(MINE_DOCUMENT_MODEL),
    })

PERMIT_AMENDMENT_DOCUMENT_MODEL = api.model(
    'PermitAmendmentDocument', {
        'permit_id': fields.Integer,
        'permit_amendment_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'active_ind': fields.Boolean,
        'preamble_title': fields.String,
        'preamble_author': fields.String,
        'preamble_date': fields.DateTime,
    })

PERMIT_AMENDMENT_SHORT_MODEL = api.model(
    'PermitAmendment', {
        'permit_amendment_id': fields.Integer,
        'permit_amendment_guid': fields.String,
        'permit_amendment_status_code': fields.String,
        'permit_amendment_type_code': fields.String,
        'received_date': fields.DateTime(dt_format='iso8601'),
        'issue_date': fields.DateTime(dt_format='iso8601'),
        'authorization_end_date': fields.DateTime(dt_format='iso8601'),
        'liability_adjustment': fields.Fixed(description='Currency', decimals=2),
        'security_received_date': fields.DateTime(dt_format='iso8601'),
        'security_not_required': fields.Boolean,
        'security_not_required_reason': fields.String,
        'description': fields.String,
        'issuing_inspector_title': fields.String,
        'regional_office': fields.String,
        'now_application_guid': fields.String,
        'permit_conditions_last_updated_by': fields.String,
        'permit_conditions_last_updated_date': fields.DateTime,
        'has_permit_conditions': fields.Boolean,
        'vc_credential_exch_state': fields.String,
        'is_generated_in_core': fields.Boolean,
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
        'permit_guid': fields.String,
        'now_application_guid': fields.String,
        'mine_tenure_type_code': fields.String,
        'mine_type_detail': fields.List(fields.Nested(MINE_TYPE_DETAIL_MODEL)),
    })

PERMIT_AMENDMENT_MODEL = api.model(
    'PermitAmendment', {
        'permit_amendment_id':
            fields.Integer,
        'permit_no':
            fields.String,
        'permit_amendment_guid':
            fields.String,
        'permit_amendment_status_code':
            fields.String,
        'permit_amendment_type_code':
            fields.String,
        'received_date':
            fields.DateTime(dt_format='iso8601'),
        'issue_date':
            fields.DateTime(dt_format='iso8601'),
        'authorization_end_date':
            fields.DateTime(dt_format='iso8601'),
        'liability_adjustment':
            fields.Fixed(description='Currency', decimals=2),
        'security_received_date':
            fields.DateTime(dt_format='iso8601'),
        'security_not_required':
            fields.Boolean,
        'security_not_required_reason':
            fields.String,
        'description':
            fields.String,
        'issuing_inspector_title':
            fields.String,
        'regional_office':
            fields.String,
        'now_application_guid':
            fields.String,
        'now_application_documents':
            fields.List(fields.Nested(PERMIT_AMENDMENT_NOW_DOCUMENT)),
        'imported_now_application_documents':
            fields.List(fields.Nested(IMPORTED_NOW_SUBMISSION_DOCUMENT)),
        'related_documents':
            fields.List(fields.Nested(PERMIT_AMENDMENT_DOCUMENT_MODEL)),
        'permit_conditions_last_updated_by':
            fields.String,
        'permit_conditions_last_updated_date':
            fields.DateTime,
        'has_permit_conditions':
            fields.Boolean,
        'vc_credential_exch_state':
            fields.String,
        'conditions':
            fields.List(PermitCondition),
        'is_generated_in_core':
            fields.Boolean,
        'preamble_text':
            fields.String
    })

BOND_MODEL = api.model('Bond_guid', {'bond_guid': fields.String})

PERMIT_MODEL = api.model(
    'Permit', {
        'permit_id': fields.Integer,
        'permit_guid': fields.String,
        'permit_no': fields.String,
        'permit_status_code': fields.String,
        'current_permittee': fields.String,
        'current_permittee_guid': fields.String,
        'current_permittee_digital_wallet_connection_state': fields.String,
        'project_id': fields.String,
        'permit_amendments': fields.List(fields.Nested(PERMIT_AMENDMENT_MODEL)),
        'remaining_static_liability': fields.Float,
        'assessed_liability_total': fields.Float,
        'confiscated_bond_total': fields.Float,
        'active_bond_total': fields.Float,
        'bonds': fields.List(fields.Nested(BOND_MODEL)),
        'exemption_fee_status_code': fields.String,
        'exemption_fee_status_note': fields.String,
        'site_properties': fields.List(fields.Nested(MINE_TYPE_MODEL)),
        'permit_prefix': fields.String,
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

PERMIT_AMENDEMENT_TYPE_CODE_MODEL = api.model(
    'PermitAmendmentTypeCode', {
        'permit_amendment_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
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

MINE_REPORT_SUBMISSION_STATUS = api.model(
    'MineReportSubmissionStatus', {
        'mine_report_submission_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

MINE_PARTY_APPT_PARTY = api.model(
    'MinePartyAppointment', {
        'update_timestamp': fields.DateTime,
        'mine_party_appt_guid': fields.String,
        'mine_guid': fields.String,
        'party_guid': fields.String,
        'mine_party_appt_type_code': fields.String,
        'start_date': fields.Date,
        'end_date': fields.Date,
        'party': fields.Nested(PARTY),
        'status': fields.String(enum=MinePartyAppointmentStatus, attribute='status.name'),
        'mine_party_acknowledgement_status': fields.String(
            enum=MinePartyAcknowledgedStatus, attribute='mine_party_acknowledgement_status.name'),
    })

MINE_TSF_MODEL = api.model(
    'MineTailingsStorageFacility', {
        'mine_tailings_storage_facility_guid': fields.String,
        'mine_guid': fields.String,
        'mine_tailings_storage_facility_name': fields.String,
        'latitude': fields.Float,
        'longitude': fields.Float,
        'consequence_classification_status_code': fields.String,
        'itrb_exemption_status_code': fields.String,
        'update_timestamp': fields.DateTime,
        'tsf_operating_status_code': fields.String,
        'notes': fields.String,
        'facility_type': fields.String,
        'tailings_storage_facility_type': fields.String,
        'storage_location': fields.String,
        'mines_act_permit_no': fields.String,
        'engineer_of_record': fields.Nested(MINE_PARTY_APPT_PARTY),
        'qualified_person': fields.Nested(MINE_PARTY_APPT_PARTY),
        'dams': fields.List(fields.Nested(DAM_MODEL)),
    })

MINE_WORK_INFORMATION_MODEL = api.model(
    'MineWorkInformation', {
        'mine_work_information_id': fields.Integer,
        'mine_work_information_guid': fields.String,
        'mine_guid': fields.String,
        'work_start_date': fields.Date,
        'work_stop_date': fields.Date,
        'work_comments': fields.String,
        'work_status': fields.String,
        'created_by': fields.String,
        'created_timestamp': fields.DateTime,
        'updated_by': fields.String,
        'updated_timestamp': fields.DateTime,
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
        'verified_status': fields.Nested(MINE_VERIFIED_MODEL, skip_none=True),
        'has_minespace_users': fields.Boolean,
        'mms_alias': fields.String,
        'mine_work_information': fields.Nested(MINE_WORK_INFORMATION_MODEL, skip_none=True),
        'latest_mine_status': fields.Nested(STATUS_MODEL)
    })

MINE_MODEL = api.inherit(
    'Mine', MINES_MODEL, {
        'mine_location': fields.Nested(MINE_LOCATION_MODEL),
        'exemption_fee_status_code': fields.String,
        'exemption_fee_status_note': fields.String,
        'government_agency_type_code': fields.String,
        'number_of_contractors': fields.Integer,
        'number_of_mine_employees': fields.Integer,
    })

MINE_SEARCH_MODEL = api.model(
    'MineSearch', {
        'mine_name': fields.String,
        'mine_no': fields.String,
        'latitude': fields.String(default=''),
        'longitude': fields.String(default=''),
        'mine_guid': fields.String,
        'mine_location_description': fields.String(default=''),
        'deleted_ind': fields.Boolean,
        'major_mine_ind': fields.Boolean
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
        'upload_date': fields.String,
        'update_user': fields.String
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
        'active_ind': fields.Boolean,
        'is_historic': fields.Boolean,
        'parent_mine_incident_category_code': fields.String,
    })

MINE_INCIDENT_MODEL = api.model(
    'Mine Incident', {
        'mine_incident_id': fields.Integer,
        'mine_incident_id_year': fields.Integer,
        'mine_incident_guid': fields.String,
        'mine_incident_report_no': fields.String,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'incident_timestamp': fields.DateTime(dt_format='iso8601'),
        'incident_timezone': fields.String,
        'incident_description': fields.String,
        'incident_location': fields.String,
        'reported_timestamp': fields.DateTime(dt_format='iso8601'),
        'reported_by_name': fields.String,
        'reported_by_email': fields.String,
        'reported_by_phone_no': fields.String,
        'reported_by_phone_ext': fields.String,
        'emergency_services_called': fields.Boolean,
        'number_of_injuries': fields.Integer,
        'number_of_fatalities': fields.Integer,
        'reported_to_inspector_party_guid': fields.String,
        'reported_to_inspector_party': fields.String,
        'reported_to_inspector_contacted': fields.Boolean,
        'reported_to_inspector_contact_method': fields.String,
        'responsible_inspector_party_guid': fields.String,
        'responsible_inspector_party': fields.String,
        'determination_type_code': fields.String,
        'mine_determination_type_code': fields.String,
        'mine_determination_representative': fields.String,
        'status_code': fields.String,
        'followup_investigation_type_code': fields.String,
        'followup_inspection': fields.Boolean,
        'followup_inspection_date': fields.DateTime(dt_format='iso8601'),
        'determination_inspector_party_guid': fields.String,
        'mms_inspector_initials': fields.String(attribute='mms_insp_cd'),
        'dangerous_occurrence_subparagraph_ids': fields.List(fields.Integer),
        'proponent_incident_no': fields.String,
        'mine_incident_no': fields.String,
        'documents': fields.List(fields.Nested(MINE_INCIDENT_DOCUMENT_MODEL)),
        'recommendations': fields.List(fields.Nested(MINE_INCIDENT_RECOMMENDATION_MODEL)),
        'categories': fields.List(fields.Nested(MINE_INCIDENT_CATEGORY_MODEL)),
        'immediate_measures_taken': fields.String,
        'injuries_description': fields.String,
        'johsc_worker_rep_name': fields.String,
        'johsc_worker_rep_contacted': fields.Boolean,
        'johsc_worker_rep_contact_method': fields.String,
        'johsc_worker_rep_contact_timestamp': fields.DateTime(dt_format='iso8601'),
        'johsc_management_rep_name': fields.String,
        'johsc_management_rep_contacted': fields.Boolean,
        'johsc_management_rep_contact_method': fields.String,
        'johsc_management_rep_contact_timestamp': fields.DateTime(dt_format='iso8601'),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime(dt_format='iso8601'),
        'create_user': fields.String,
        'create_timestamp': fields.DateTime(dt_format='iso8601'),
        'verbal_notification_provided': fields.Boolean,
        'verbal_notification_timestamp': fields.DateTime(dt_format='iso8601'),
    })

MINE_ALERT_MODEL = api.model(
    'Mine Alert', {
        'mine_alert_id': fields.Integer,
        'mine_alert_guid': fields.String,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'start_date': fields.DateTime,
        'end_date': fields.DateTime,
        'contact_name': fields.String,
        'contact_phone': fields.String,
        'message': fields.String,
        'is_active': fields.Boolean,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime,
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
    }
)

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
        'created_by': fields.String,
        'created_timestamp': fields.DateTime,
        'updated_by': fields.String,
        'updated_timestamp': fields.DateTime,
        'documents': fields.Nested(VARIANCE_DOCUMENT_MODEL)
    })

MINE_OPERATION_STATUS_CODE_MODEL = api.model(
    'MineOperationStatusCode', {
        'mine_operation_status_code': fields.String,
        'active_ind': fields.Boolean,
        'description': fields.String
    })

MINE_OPERATION_STATUS_REASON_CODE_MODEL = api.model(
    'MineOperationStatusReasonCode', {
        'mine_operation_status_reason_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

MINE_OPERATION_STATUS_SUB_REASON_CODE_MODEL = api.model(
    'MineOperationStatusSubReasonCode', {
        'mine_operation_status_sub_reason_code': fields.String,
        'active_ind': fields.Boolean,
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
        'permit_number':
            fields.String,
        'mine_report_submissions':
            fields.List(fields.Nested(MINE_REPORT_SUBMISSION_MODEL)),
        'mine_guid':
            fields.String,
        'mine_name':
            fields.String,
        'permit_condition_category_code':
            fields.String
    })

MINE_REPORT_DEFINITION_CATEGORIES = api.model('MineReportDefinitionCategoriesModel', {
    'mine_report_category': fields.String,
    'description': fields.String,
    'active_ind': fields.Boolean
})

MINE_REPORT_DEFINITION_MODEL = api.model(
    'MineReportDefinition', {
        'mine_report_definition_guid': fields.String,
        'report_name': fields.String,
        'description': fields.String,
        'due_date_period_months': fields.Integer,
        'mine_report_due_date_type': fields.String,
        'default_due_date': fields.Date,
        'active_ind': fields.Boolean,
        'categories': fields.List(fields.Nested(MINE_REPORT_DEFINITION_CATEGORIES)),
        'compliance_articles': fields.List(fields.Nested(COMPLIANCE_ARTICLE_MODEL))
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

PAGINATED_GLOBAL_MINE_ALERT_LIST = api.inherit('GlobalMineAlertList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(MINE_ALERT_MODEL)),
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

PERMIT_CONDITION_MODEL = api.model(
    'PermitCondition', {
        'permit_condition_id': fields.Integer,
        'permit_amendment_id': fields.Integer,
        'permit_condition_guid': fields.String,
        'condition': fields.String,
        'condition_type_code': fields.String,
        'condition_category_code': fields.String,
        'parent_permit_condition_id': fields.Integer,
        'sub_conditions': fields.List(PermitCondition),
        'step': fields.String,
        'display_order': fields.Integer
    })

PERMIT_CONDITION_TEMPLATE_MODEL = api.model('PermitConditionTemplate', {
    'condition': fields.String,
    'sub_conditions': fields.List(PermitConditionTemplate),
})

PERMIT_CONDITION_CATEGORY_MODEL = api.model(
    'PermitConditionCategory', {
        'condition_category_code': fields.String,
        'step': fields.String,
        'description': fields.String,
        'display_order': fields.Integer
    })

PERMIT_CONDITION_TYPE_MODEL = api.model('PermitConditionType', {
    'condition_type_code': fields.String,
    'description': fields.String,
    'display_order': fields.Integer
})

STANDARD_PERMIT_CONDITION_MODEL = api.model(
    'StandardPermitCondition', {
        'standard_permit_condition_id': fields.Integer,
        'permit_condition_id': fields.Integer,
        'notice_of_work_type': fields.String,
        'standard_permit_condition_guid': fields.String,
        'condition': fields.String,
        'condition_category_code': fields.String,
        'parent_standard_permit_condition_id': fields.Integer,
        'parent_permit_condition_id': fields.Integer,
        'condition_type_code': fields.String,
        'sub_conditions': fields.List(StandardPermitCondition),
        'step': fields.String,
        'display_order': fields.Integer
    })

GOVERNMENT_AGENCY_TYPE_MODEL = api.model(
    'GovernmentAgencyType', {
        'government_agency_type_code': fields.String,
        'description': fields.String,
        'is_active': fields.Integer
    })

CONSEQUENCE_CLASSIFICATION_STATUS_MODEL = api.model(
    'ConsequenceClassificationStatusCode', {
        'consequence_classification_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

ITRB_EXEMPTION_STATUS_MODEL = api.model(
    'ITRBExemptionStatusCode', {
        'itrb_exemption_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

TSF_OPERATING_STATUS_MODEL = api.model(
    'TSFOperatingStatusCode', {
        'tsf_operating_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })
