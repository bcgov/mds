from app.extensions import api
from flask_restplus import fields, marshal

from app.api.mines.response_models import MINE_DOCUMENT_MODEL, MINES_MODEL


class Requirement(fields.Raw):
    def format(self, value):
        return marshal(value, REQUIREMENTS_MODEL)


PROJECT_SUMMARY_DOCUMENT_MODEL = api.inherit('ProjectSummaryDocument', MINE_DOCUMENT_MODEL, {
    'project_summary_id': fields.Integer,
    'project_summary_document_type_code': fields.String
})

PROJECT_SUMMARY_STATUS_CODE_MODEL = api.model(
    'ProjectSummaryStatusCode', {
        'project_summary_status_code': fields.String,
        'description': fields.String,
        'alias_description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL = api.model(
    'ProjectSummaryDocumentType', {
        'project_summary_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

PROJECT_SUMMARY_PERMIT_TYPE_MODEL = api.model('ProjectSummaryPermitType', {
    'project_summary_permit_type': fields.String,
    'description': fields.String
})

PROJECT_SUMMARY_AUTHORIZATION_TYPE_MODEL = api.model(
    'ProjectSummaryAuthorizationType', {
        'project_summary_authorization_type': fields.String,
        'description': fields.String,
        'project_summary_authorization_type_group_id': fields.String
    })

PROJECT_SUMMARY_CONTACT_MODEL = api.model(
    'ProjectSummaryContact', {
        'project_summary_contact_guid': fields.String,
        'project_summary_guid': fields.String,
        'name': fields.String,
        'job_title': fields.String,
        'company_name': fields.String,
        'email': fields.String,
        'phone_number': fields.String,
        'phone_extension': fields.String,
        'is_primary': fields.Boolean
    })

PROJECT_SUMMARY_AUTHORIZATION_MODEL = api.model(
    'ProjectSummaryAuthorization', {
        'project_summary_authorization_guid': fields.String,
        'project_summary_guid': fields.String,
        'project_summary_permit_type': fields.List(fields.String),
        'project_summary_authorization_type': fields.String,
        'existing_permits_authorizations': fields.List(fields.String)
    })

PROJECT_SUMMARY_MODEL = api.model(
    'ProjectSummary', {
        'project_guid': fields.String,
        'project_summary_id': fields.Integer,
        'project_summary_guid': fields.String,
        'project_summary_title': fields.String,
        'project_summary_description': fields.String,
        'mine_guid': fields.String,
        'mine_name': fields.String,
        'status_code': fields.String,
        'proponent_project_id': fields.String,
        'expected_draft_irt_submission_date': fields.DateTime,
        'submission_date': fields.DateTime,
        'expected_permit_application_date': fields.DateTime,
        'expected_permit_receipt_date': fields.DateTime,
        'expected_project_start_date': fields.DateTime,
        'documents': fields.List(fields.Nested(PROJECT_SUMMARY_DOCUMENT_MODEL), attribute='mine_documents'),
        'contacts': fields.List(fields.Nested(PROJECT_SUMMARY_CONTACT_MODEL)),
        'authorizations': fields.List(fields.Nested(PROJECT_SUMMARY_AUTHORIZATION_MODEL)),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })

PROJECT_CONTACT_MODEL = api.model(
    'ProjectContact', {
        'project_contact_guid': fields.String,
        'project_guid': fields.String,
        'name': fields.String,
        'job_title': fields.String,
        'company_name': fields.String,
        'email': fields.String,
        'phone_number': fields.String,
        'phone_extension': fields.String,
        'is_primary': fields.Boolean
    })

REQUIREMENTS_MODEL = api.model(
    'Requirements', {
        'requirement_guid': fields.String,
        'requirement_id': fields.Integer,
        'parent_requirement_id': fields.Integer,
        'description': fields.String,
        'display_order': fields.Integer,
        'deleted_ind': fields.Boolean,
        'sub_requirements': fields.List(Requirement),
        'step': fields.String
    })

IRT_DOCUMENT_MODEL = api.inherit('InformationRequirementsTableDocument', MINE_DOCUMENT_MODEL, {
    'irt_id': fields.Integer,
    'information_requirements_table_document_type_code': fields.String
})

IRT_STATUS_CODE_MODEL = api.model(
    'InformationRequirementsTableStatusCode', {
        'information_requirements_table_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

IRT_DOCUMENT_TYPE_MODEL = api.model(
    'InformationRequirementsTableDocumentType', {
        'information_requirements_table_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

IRT_REQUIREMENTS_MODEL = api.model(
    'IRTRequirementsXref', {
        'irt_requirements_xref_guid': fields.String,
        'requirement_guid': fields.String,
        'deleted_ind': fields.Boolean,
        'required': fields.Boolean,
        'methods': fields.Boolean,
        'comment': fields.String
    })

IRT_MODEL = api.model(
    'InformationRequirementsTable', {
        'irt_id': fields.Integer,
        'irt_guid': fields.String,
        'project_guid': fields.String,
        'status_code': fields.String,
        'requirements': fields.List(fields.Nested(IRT_REQUIREMENTS_MODEL)),
        'documents': fields.List(fields.Nested(IRT_DOCUMENT_MODEL)),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })

MAJOR_MINE_APPLICATION_DOCUMENT_MODEL = api.inherit(
    'MajorMineApplicationDocument', MINE_DOCUMENT_MODEL, {
        'major_mine_application_id': fields.Integer,
        'major_mine_application_document_type_code': fields.String
    })

MAJOR_MINE_APPLICATION_STATUS_CODE_MODEL = api.model(
    'MajorMineApplicationStatusCode', {
        'major_mine_application_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

MAJOR_MINE_APPLICATION_DOCUMENT_TYPE_MODEL = api.model(
    'MajorMineApplicationDocumentType', {
        'major_mine_application_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

MAJOR_MINE_APPLICATION_MODEL = api.model(
    'MajorMineApplication', {
        'major_mine_application_id': fields.Integer,
        'major_mine_application_guid': fields.String,
        'project_guid': fields.String,
        'status_code': fields.String,
        'documents': fields.List(fields.Nested(MAJOR_MINE_APPLICATION_DOCUMENT_MODEL)),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })

PROJECT_DECISION_PACKAGE_DOCUMENT_MODEL = api.inherit(
    'ProjectDecisionPackageDocument', MINE_DOCUMENT_MODEL, {
        'project_decision_package_id': fields.Integer,
        'project_decision_package_document_type_code': fields.String
    })

PROJECT_DECISION_PACKAGE_STATUS_CODE_MODEL = api.model(
    'ProjectDecisionPackageStatusCode', {
        'project_decision_package_status_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
    })

PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE_MODEL = api.model(
    'ProjectDecisionPackageDocumentType', {
        'project_decision_package_document_type_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean,
        'display_order': fields.Integer
    })

PROJECT_DECISION_PACKAGE_MODEL = api.model(
    'ProjectDecisionPackage', {
        'project_decision_package_id': fields.Integer,
        'project_decision_package_guid': fields.String,
        'project_guid': fields.String,
        'status_code': fields.String,
        'documents': fields.List(fields.Nested(PROJECT_DECISION_PACKAGE_DOCUMENT_MODEL)),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })

PROJECT_MODEL = api.model(
    'Project', {
        'project_guid': fields.String,
        'project_id': fields.Integer,
        'project_title': fields.String,
        'mine_name': fields.String,
        'mine_guid': fields.String,
        'project_lead_name': fields.String,
        'project_lead_party_guid': fields.String,
        'proponent_project_id': fields.String,
        'mrc_review_required': fields.Boolean,
        'contacts': fields.List(fields.Nested(PROJECT_CONTACT_MODEL)),
        'project_summary': fields.Nested(PROJECT_SUMMARY_MODEL),
        'information_requirements_table': fields.Nested(IRT_MODEL),
        'major_mine_application': fields.Nested(MAJOR_MINE_APPLICATION_MODEL),
        'project_decision_package': fields.Nested(PROJECT_DECISION_PACKAGE_MODEL),
        'update_user': fields.String,
        'update_timestamp': fields.DateTime,
        'create_user': fields.String,
        'create_timestamp': fields.DateTime
    })

PROJECT_MINE_LIST_MODEL = api.model(
    'ProjectMineList',{
        'stage': fields.String,
        'id': fields.Integer,
        'guid': fields.String,
        'project_title': fields.String,
        'project_id': fields.String,
        'project_guid': fields.String,
        'mrc_review_required': fields.Boolean,
        'status_code': fields.String,
        'contacts': fields.List(fields.Nested(PROJECT_CONTACT_MODEL)),
        'project_lead_party_name': fields.String,
        'project_lead_name': fields.String,
        'update_timestamp': fields.DateTime,
        'mine': fields.Nested(MINES_MODEL),
    })


PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    }
)

PAGINATED_PROJECT_LIST = api.inherit('ProjectList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(PROJECT_MINE_LIST_MODEL))
})
