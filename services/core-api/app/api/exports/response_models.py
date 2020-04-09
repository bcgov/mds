from app.extensions import api
from flask_restplus import fields

from app.api.mines.response_models import MINE_TENURE_TYPE_CODE_MODEL, MINE_COMMODITY_CODE_MODEL, MINE_DISTURBANCE_CODE_MODEL, MINE_STATUS_CODE_MODEL, MINE_REGION_OPTION, MINE_REPORT_DEFINITION_CATEGORIES, MINE_REPORT_DEFINITION_MODEL, MINE_REPORT_SUBMISSION_STATUS, EXEMPTION_FEE_STATUS_CODE_MODEL
from app.api.mines.response_models import PERMIT_STATUS_CODE_MODEL
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.incidents.response_models import MINE_INCIDENT_CATEGORY_MODEL, MINE_INCIDENT_DETERMINATION_TYPE_MODEL, MINE_INCIDENT_STATUS_CODE_MODEL, MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL, MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL
from app.api.parties.response_models import MINE_PARTY_APPT_TYPE_MODEL, SUB_DIVISION_CODE_MODEL
from app.api.variances.response_models import VARIANCE_APPLICATION_STATUS_CODE, VARIANCE_DOCUMENT_CATEGORY_CODE
from app.api.now_applications.response_models import NOW_APPLICATION_DOCUMENT_TYPE_MODEL, NOW_APPLICATION_REVIEW_TYPES, NOW_APPLICATION_TYPES, UNIT_TYPES, NOW_ACTIVITY_TYPES, NOW_APPLICATION_STATUS_CODES, UNDERGROUND_EXPLORATION_TYPES, NOW_APPLICATION_PERMIT_TYPES, NOW_APPLICATION_REVIEW_TYPES, APPLICATION_PROGRESS_STATUS_CODES
from app.api.securities.response_models import BOND_STATUS, BOND_TYPE, BOND_DOCUMENT_TYPE

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
    })
