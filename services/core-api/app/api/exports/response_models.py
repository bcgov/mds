from app.extensions import api
from flask_restx import fields

from app.api.mines.response_models import MINE_TENURE_TYPE_CODE_MODEL, MINE_COMMODITY_CODE_MODEL, MINE_DISTURBANCE_CODE_MODEL, MINE_STATUS_CODE_MODEL, MINE_REGION_OPTION, MINE_REPORT_DEFINITION_CATEGORIES, MINE_REPORT_DEFINITION_MODEL, MINE_REPORT_SUBMISSION_STATUS, EXEMPTION_FEE_STATUS_CODE_MODEL, PERMIT_STATUS_CODE_MODEL, PERMIT_CONDITION_CATEGORY_MODEL, PERMIT_CONDITION_TYPE_MODEL, PERMIT_AMENDEMENT_TYPE_CODE_MODEL, GOVERNMENT_AGENCY_TYPE_MODEL, CONSEQUENCE_CLASSIFICATION_STATUS_MODEL, ITRB_EXEMPTION_STATUS_MODEL, TSF_OPERATING_STATUS_MODEL
from app.api.mines.explosives_permit.response_models import EXPLOSIVES_PERMIT_STATUS_MODEL, EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL, EXPLOSIVES_PERMIT_MAGAZINE_TYPE_MODEL
from app.api.projects.response_models import PROJECT_SUMMARY_STATUS_CODE_MODEL, PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL, PROJECT_SUMMARY_AUTHORIZATION_TYPE_MODEL, PROJECT_SUMMARY_PERMIT_TYPE_MODEL, IRT_STATUS_CODE_MODEL, IRT_DOCUMENT_TYPE_MODEL, MAJOR_MINE_APPLICATION_STATUS_CODE_MODEL, MAJOR_MINE_APPLICATION_DOCUMENT_TYPE_MODEL, PROJECT_DECISION_PACKAGE_STATUS_CODE_MODEL, PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE_MODEL
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.incidents.response_models import MINE_INCIDENT_CATEGORY_MODEL, MINE_INCIDENT_DETERMINATION_TYPE_MODEL, MINE_INCIDENT_STATUS_CODE_MODEL, MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL, MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL
from app.api.parties.response_models import MINE_PARTY_APPT_TYPE_MODEL, SUB_DIVISION_CODE_MODEL, PARTY_BUSINESS_ROLE
from app.api.variances.response_models import VARIANCE_APPLICATION_STATUS_CODE, VARIANCE_DOCUMENT_CATEGORY_CODE
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPE_MODEL, NOW_APPLICATION_REVIEW_TYPES, NOW_APPLICATION_TYPES, UNIT_TYPES, NOW_ACTIVITY_TYPES, NOW_APPLICATION_STATUS_CODES, UNDERGROUND_EXPLORATION_TYPES, NOW_APPLICATION_PERMIT_TYPES, NOW_APPLICATION_REVIEW_TYPES, APPLICATION_PROGRESS_STATUS_CODES, NOW_APPLICATION_DELAY_TYPE, APPLICATION_REASON_CODE, APPLICATION_SOURCE_TYPE_CODE, APPLICATION_TYPE_CODE
from app.api.securities.response_models import BOND_STATUS, BOND_TYPE, BOND_DOCUMENT_TYPE
from app.api.EMLI_contacts.response_models import EMLI_CONTACT_TYPE

MINE_SUMMARY_MODEL = api.model(
    'MineSummaryModel', {
        'mine_guid': fields.String,
        'permit_guid': fields.String,
        'permit_id': fields.Integer,
        'mine_name': fields.String,
        'mine_number': fields.String,
        'mine_region': fields.String,
        'major_mine_ind': fields.String,
        'major_mine_d': fields.String,
        'mine_latitude': fields.String,
        'mine_longitude': fields.String,
        'bcmi_url': fields.String,
        'government_agency_type_code': fields.String,
        'government_agency_type_d': fields.String,
        'operation_status_code': fields.String,
        'operation_status': fields.String,
        'mine_operation_status_code': fields.String,
        'mine_operation_status_d': fields.String,
        'mine_operation_status_reason_code': fields.String,
        'mine_operation_status_reason_d': fields.String,
        'mine_operation_status_sub_reason_code': fields.String,
        'mine_operation_status_sub_reason_d': fields.String,
        'status_date': fields.String,
        'mine_date': fields.String,
        'mine_exemption_fee_status_note': fields.String,
        'mine_exemption_fee_status_code': fields.String,
        'mine_exemption_fee_status_d': fields.String,
        'mine_tenure_type_code': fields.String,
        'mine_tenure': fields.String,
        'mine_commodity_type_code': fields.String,
        'mine_commodity': fields.String,
        'mine_disturbance_type_code': fields.String,
        'mine_disturbance': fields.String,
        'permit_tenure_type_code': fields.String,
        'permit_tenure': fields.String,
        'permit_commodity_type_code': fields.String,
        'permit_commodity': fields.String,
        'permit_disturbance_type_code': fields.String,
        'permit_disturbance': fields.String,
        'permit_no': fields.String,
        'permit_status_code': fields.String,
        'permit_status_changed_timestamp': fields.DateTime,
        'issue_date': fields.DateTime,
        'permittee_name': fields.String,
        'permittee_first_name': fields.String,
        'permittee_party_guid': fields.String,
        'permit_exemption_fee_status_note': fields.String,
        'permit_exemption_fee_status_code': fields.String,
        'permit_exemption_fee_status_d': fields.String,
        'permittee_address_suite': fields.String,
        'permittee_address_line_1': fields.String,
        'permittee_address_line_2': fields.String,
        'permittee_address_city': fields.String,
        'permittee_address_post_code': fields.String,
        'permittee_address_prov': fields.String
    })

MINE_SUMMARY_MODEL_LIST = api.model('MineSummaryList', {
    'mines': fields.List(fields.Nested(MINE_SUMMARY_MODEL)),
    'total': fields.Integer,
    'current_page': fields.Integer,
    'per_page': fields.Integer
})

MUNICIPALITY_MODEL = api.model('Municipality', {
    'municipality_name': fields.String,
    'municipality_guid': fields.String
})

STATIC_CONTENT_MODEL = api.model(
    'StaticContentModel', {
        'mineDisturbanceOptions':
        fields.List(fields.Nested(MINE_DISTURBANCE_CODE_MODEL), attribute='MineDisturbanceCode'),
        'mineCommodityOptions':
        fields.List(fields.Nested(MINE_COMMODITY_CODE_MODEL), attribute='MineCommodityCode'),
        'mineStatusOptions':
        fields.List(fields.Nested(MINE_STATUS_CODE_MODEL), attribute='MineStatusXref'),
        'mineRegionOptions':
        fields.List(fields.Nested(MINE_REGION_OPTION), attribute='MineRegionCode'),
        'mineTenureTypes':
        fields.List(fields.Nested(MINE_TENURE_TYPE_CODE_MODEL), attribute='MineTenureTypeCode'),
        'permitStatusCodes':
        fields.List(fields.Nested(PERMIT_STATUS_CODE_MODEL), attribute='PermitStatusCode'),
        'incidentDocumentTypeOptions':
        fields.List(
            fields.Nested(MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL),
            attribute='MineIncidentDocumentTypeCode'),
        'incidentFollowupActionOptions':
        fields.List(
            fields.Nested(MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL),
            attribute='MineIncidentFollowupInvestigationType'),
        'incidentDeterminationOptions':
        fields.List(
            fields.Nested(MINE_INCIDENT_DETERMINATION_TYPE_MODEL),
            attribute='MineIncidentDeterminationType'),
        'incidentStatusCodeOptions':
        fields.List(
            fields.Nested(MINE_INCIDENT_STATUS_CODE_MODEL), attribute='MineIncidentStatusCode'),
        'incidentCategoryCodeOptions':
        fields.List(fields.Nested(MINE_INCIDENT_CATEGORY_MODEL), attribute='MineIncidentCategory'),
        'provinceOptions':
        fields.List(fields.Nested(SUB_DIVISION_CODE_MODEL), attribute='SubDivisionCode'),
        'complianceCodes':
        fields.List(fields.Nested(COMPLIANCE_ARTICLE_MODEL), attribute='ComplianceArticle'),
        'varianceStatusOptions':
        fields.List(
            fields.Nested(VARIANCE_APPLICATION_STATUS_CODE),
            attribute='VarianceApplicationStatusCode'),
        'varianceDocumentCategoryOptions':
        fields.List(
            fields.Nested(VARIANCE_DOCUMENT_CATEGORY_CODE),
            attribute='VarianceDocumentCategoryCode'),
        'mineReportDefinitionOptions':
        fields.List(fields.Nested(MINE_REPORT_DEFINITION_MODEL), attribute='MineReportDefinition'),
        'mineReportStatusOptions':
        fields.List(
            fields.Nested(MINE_REPORT_SUBMISSION_STATUS),
            attribute='MineReportSubmissionStatusCode'),
        'mineReportCategoryOptions':
        fields.List(
            fields.Nested(MINE_REPORT_DEFINITION_CATEGORIES), attribute='MineReportCategory'),
        'noticeOfWorkActivityTypeOptions':
        fields.List(fields.Nested(NOW_ACTIVITY_TYPES), attribute='ActivityType'),
        'noticeOfWorkUnitTypeOptions':
        fields.List(fields.Nested(UNIT_TYPES), attribute='UnitType'),
        'noticeOfWorkApplicationTypeOptions':
        fields.List(fields.Nested(NOW_APPLICATION_TYPES), attribute='NOWApplicationType'),
        'noticeOfWorkApplicationStatusOptions':
        fields.List(fields.Nested(NOW_APPLICATION_STATUS_CODES), attribute='NOWApplicationStatus'),
        'noticeOfWorkApplicationDocumentTypeOptions':
        fields.List(
            fields.Nested(NOW_APPLICATION_DOCUMENT_TYPE_MODEL),
            attribute='NOWApplicationDocumentType'),
        'noticeOfWorkUndergroundExplorationTypeOptions':
        fields.List(
            fields.Nested(UNDERGROUND_EXPLORATION_TYPES), attribute='UndergroundExplorationType'),
        'noticeOfWorkApplicationProgressStatusCodeOptions':
        fields.List(
            fields.Nested(APPLICATION_PROGRESS_STATUS_CODES),
            attribute='NOWApplicationProgressStatus'),
        'noticeOfWorkApplicationPermitTypeOptions':
        fields.List(
            fields.Nested(NOW_APPLICATION_PERMIT_TYPES), attribute='NOWApplicationPermitType'),
        'noticeOfWorkApplicationReviewOptions':
        fields.List(
            fields.Nested(NOW_APPLICATION_REVIEW_TYPES), attribute='NOWApplicationReviewType'),
        'partyRelationshipTypes':
        fields.List(
            fields.Nested(MINE_PARTY_APPT_TYPE_MODEL), attribute='MinePartyAppointmentType'),
        'bondStatusOptions':
        fields.List(fields.Nested(BOND_STATUS), attribute='BondStatus'),
        'bondTypeOptions':
        fields.List(fields.Nested(BOND_TYPE), attribute='BondType'),
        'bondDocumentTypeOptions':
        fields.List(fields.Nested(BOND_DOCUMENT_TYPE), attribute='BondDocumentType'),
        'exemptionFeeStatusOptions':
        fields.List(fields.Nested(EXEMPTION_FEE_STATUS_CODE_MODEL), attribute='ExemptionFeeStatus'),
        'permitConditionTypeOptions':
        fields.List(fields.Nested(PERMIT_CONDITION_TYPE_MODEL), attribute='PermitConditionType'),
        'permitConditionCategoryOptions':
        fields.List(
            fields.Nested(PERMIT_CONDITION_CATEGORY_MODEL), attribute='PermitConditionCategory'),
        'partyBusinessRoleOptions':
        fields.List(fields.Nested(PARTY_BUSINESS_ROLE), attribute='PartyBusinessRoleCode'),
        'noticeOfWorkApplicationDelayOptions':
        fields.List(fields.Nested(NOW_APPLICATION_DELAY_TYPE), attribute='NOWApplicationDelayType'),
        'permitAmendmentTypeCodeOptions':
        fields.List(
            fields.Nested(PERMIT_AMENDEMENT_TYPE_CODE_MODEL), attribute='PermitAmendmentTypeCode'),
        'applicationReasonCodeOptions':
        fields.List(fields.Nested(APPLICATION_REASON_CODE), attribute='ApplicationReasonCode'),
        'applicationSourceTypeCodeOptions':
        fields.List(
            fields.Nested(APPLICATION_SOURCE_TYPE_CODE), attribute='ApplicationSourceTypeCode'),
        'applicationTypeCodeOptions':
        fields.List(fields.Nested(APPLICATION_TYPE_CODE), attribute='ApplicationTypeCode'),
        'governmentAgencyTypeOptions':
        fields.List(fields.Nested(GOVERNMENT_AGENCY_TYPE_MODEL), attribute='GovernmentAgencyType'),
        'consequenceClassificationStatusCodeOptions':
        fields.List(
            fields.Nested(CONSEQUENCE_CLASSIFICATION_STATUS_MODEL),
            attribute='ConsequenceClassificationStatusCode'),
        'itrbExemptionStatusCodeOptions':
        fields.List(
            fields.Nested(ITRB_EXEMPTION_STATUS_MODEL), attribute='ITRBExemptionStatusCode'),
        'TSFOperatingStatusCodeOptions':
        fields.List(fields.Nested(TSF_OPERATING_STATUS_MODEL), attribute='TSFOperatingStatusCode'),
        'explosivesPermitStatus':
        fields.List(
            fields.Nested(EXPLOSIVES_PERMIT_STATUS_MODEL), attribute='ExplosivesPermitStatus'),
        'explosivesPermitDocumentType':
        fields.List(
            fields.Nested(EXPLOSIVES_PERMIT_DOCUMENT_TYPE_MODEL),
            attribute='ExplosivesPermitDocumentType'),
        'explosivesPermitMagazineType':
        fields.List(
            fields.Nested(EXPLOSIVES_PERMIT_MAGAZINE_TYPE_MODEL),
            attribute='ExplosivesPermitMagazineType'),
        'projectSummaryStatusCodes':
        fields.List(
            fields.Nested(PROJECT_SUMMARY_STATUS_CODE_MODEL), attribute='ProjectSummaryStatusCode'),
        'projectSummaryDocumentTypes':
        fields.List(
            fields.Nested(PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL),
            attribute='ProjectSummaryDocumentType'),
        'projectSummaryAuthorizationTypes':
        fields.List(
            fields.Nested(PROJECT_SUMMARY_AUTHORIZATION_TYPE_MODEL),
            attribute='ProjectSummaryAuthorizationType'),
        'projectSummaryPermitTypes':
        fields.List(
            fields.Nested(PROJECT_SUMMARY_PERMIT_TYPE_MODEL),
            attribute='ProjectSummaryPermitType'),
        'informationRequirementsTableStatusCodes':
        fields.List(
            fields.Nested(IRT_STATUS_CODE_MODEL),
            attribute='InformationRequirementsTableStatusCode'),
        'informationRequirementsTableDocumentTypes':
        fields.List(
            fields.Nested(IRT_DOCUMENT_TYPE_MODEL),
            attribute='InformationRequirementsTableDocumentType'),
        'majorMineApplicationStatusCodes':
        fields.List(
            fields.Nested(MAJOR_MINE_APPLICATION_STATUS_CODE_MODEL),
            attribute='MajorMineApplicationStatusCode'),
        'majorMineApplicationDocumentTypes':
        fields.List(
            fields.Nested(MAJOR_MINE_APPLICATION_DOCUMENT_TYPE_MODEL),
            attribute='MajorMineApplicationDocumentType'),
        'projectDecisionPackageStatusCodes':
        fields.List(
            fields.Nested(PROJECT_DECISION_PACKAGE_STATUS_CODE_MODEL),
            attribute='ProjectDecisionPackageStatusCode'),
        'projectDecisionPackageDocumentTypes':
        fields.List(
            fields.Nested(PROJECT_DECISION_PACKAGE_DOCUMENT_TYPE_MODEL),
            attribute='ProjectDecisionPackageDocumentType'),
        'EMLIContactTypes':
        fields.List(
            fields.Nested(EMLI_CONTACT_TYPE),
            attribute='EMLIContactType'),
        'municipalityOptions':
        fields.List(fields.Nested(MUNICIPALITY_MODEL), attribute='Municipality')
    })
