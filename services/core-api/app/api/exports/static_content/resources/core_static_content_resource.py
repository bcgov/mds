import json

from flask import Response, current_app, make_response
from flask_restplus import Resource, marshal
from sqlalchemy.inspection import inspect

from app.extensions import api, cache

from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import TIMEOUT_60_MINUTES, STATIC_CONTENT_KEY

from ...response_models import STATIC_CONTENT_MODEL

from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode
from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode
from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.api.mines.region.models.region import MineRegionCode
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from app.api.mines.mine.models.excemption_fee_status import ExemptionFeeStatus
from app.api.mines.permits.permit.models.permit_status_code import PermitStatusCode
from app.api.incidents.models.mine_incident_document_type_code import MineIncidentDocumentTypeCode
from app.api.incidents.models.mine_incident_followup_investigation_type import MineIncidentFollowupInvestigationType
from app.api.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType
from app.api.incidents.models.mine_incident_status_code import MineIncidentStatusCode
from app.api.incidents.models.mine_incident_category import MineIncidentCategory
from app.api.parties.party.models.sub_division_code import SubDivisionCode
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.variances.models.variance_application_status_code import VarianceApplicationStatusCode
from app.api.variances.models.variance_document_category_code import VarianceDocumentCategoryCode
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.now_applications.models.activity_summary.activity_type import ActivityType
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.now_application_type import NOWApplicationType
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.models.now_application_document_type import NOWApplicationDocumentType
from app.api.now_applications.models.activity_detail.underground_exploration_type import UndergroundExplorationType
from app.api.now_applications.models.now_application_progress_status import NOWApplicationProgressStatus
from app.api.now_applications.models.now_application_permit_type import NOWApplicationPermitType
from app.api.now_applications.models.now_application_review_type import NOWApplicationReviewType
from app.api.securities.models.bond_status import BondStatus
from app.api.securities.models.bond_type import BondType
from app.api.securities.models.bond_document_type import BondDocumentType
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.mines.permits.permit_conditions.models.permit_condition_type import PermitConditionType
from app.api.parties.party_appt.models.party_business_role_code import PartyBusinessRoleCode
from app.api.now_applications.models.now_application_delay_type import NOWApplicationDelayType
from app.api.mines.permits.permit_amendment.models.permit_amendment_type_code import PermitAmendmentTypeCode
from app.api.now_applications.models.administrative_amendments.application_reason_code import ApplicationReasonCode
from app.api.now_applications.models.administrative_amendments.application_source_type_code import ApplicationSourceTypeCode
from app.api.now_applications.models.application_type_code import ApplicationTypeCode
from app.api.mines.government_agencies.models.government_agency_type import GovernmentAgencyType
from app.api.mines.tailings.models.tsf_operating_status_code import TSFOperatingStatusCode
from app.api.mines.tailings.models.consequence_classification_status_code import ConsequenceClassificationStatusCode
from app.api.mines.tailings.models.itrb_exemption_status_code import ITRBExemptionStatusCode
from app.api.mines.explosives_permit.models.explosives_permit_status import ExplosivesPermitStatus
from app.api.mines.explosives_permit.models.explosives_permit_magazine_type import ExplosivesPermitMagazineType
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.projects.project_summary.models.project_summary_status_code import ProjectSummaryStatusCode
from app.api.projects.project_summary.models.project_summary_document_type import ProjectSummaryDocumentType
from app.api.EMLI_contacts.models.EMLI_contact_type import EMLIContactType
from app.api.projects.project_summary.models.project_summary_authorization_type import ProjectSummaryAuthorizationType
from app.api.projects.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType
from app.api.projects.information_requirements_table.models.information_requirements_table_status_code import InformationRequirementsTableStatusCode
from app.api.projects.information_requirements_table.models.information_requirements_table_document_type import InformationRequirementsTableDocumentType
from app.api.projects.major_mine_application.models.major_mine_application_status_code import MajorMineApplicationStatusCode
from app.api.projects.major_mine_application.models.major_mine_application_document_type import MajorMineApplicationDocumentType
from app.api.projects.project_decision_package.models.project_decision_package_status_code import ProjectDecisionPackageStatusCode
from app.api.projects.project_decision_package.models.project_decision_package_document_type import ProjectDecisionPackageDocumentType


MODELS_GET_ACTIVE = [
    MineDisturbanceCode, MineCommodityCode, MineStatusXref, MineRegionCode, MineTenureTypeCode,
    PermitStatusCode, MineIncidentDocumentTypeCode, MineIncidentFollowupInvestigationType,
    MineIncidentDeterminationType, MineIncidentStatusCode, MineIncidentCategory, SubDivisionCode,
    ComplianceArticle, VarianceApplicationStatusCode, VarianceDocumentCategoryCode,
    MineReportDefinition, MineReportCategory, MineReportSubmissionStatusCode, ActivityType,
    UnitType, NOWApplicationType, NOWApplicationStatus, NOWApplicationDocumentType,
    UndergroundExplorationType, NOWApplicationProgressStatus, NOWApplicationPermitType,
    MinePartyAppointmentType, NOWApplicationReviewType, BondType, BondStatus, BondDocumentType,
    ExemptionFeeStatus, PermitConditionType, PermitConditionCategory, PartyBusinessRoleCode,
    NOWApplicationDelayType, PermitAmendmentTypeCode, ApplicationReasonCode,
    ApplicationSourceTypeCode, ApplicationTypeCode, GovernmentAgencyType, TSFOperatingStatusCode,
    ConsequenceClassificationStatusCode, ITRBExemptionStatusCode, ExplosivesPermitStatus,
    ExplosivesPermitMagazineType, ExplosivesPermitDocumentType, ProjectSummaryDocumentType,
    ProjectSummaryStatusCode, EMLIContactType, ProjectSummaryAuthorizationType,
    ProjectSummaryPermitType, InformationRequirementsTableStatusCode, InformationRequirementsTableDocumentType,
    MajorMineApplicationStatusCode, MajorMineApplicationDocumentType, ProjectDecisionPackageStatusCode, ProjectDecisionPackageDocumentType
]


def generate_static_content_dict():
    static_content = {}
    for model in MODELS_GET_ACTIVE:
        static_content[model.__name__] = model.get_all()

    return static_content


class StaticContentResource(Resource):
    @api.doc(
        description='Returns static content in bulk instead of calling endpoints individually, keys are custom for current store in CORE/Minespace'
    )
    @requires_role_view_all
    def get(self):
        content_json = cache.get(STATIC_CONTENT_KEY)
        if not content_json:
            current_app.logger.debug('CACHE MISS - core-static-content')
            content = generate_static_content_dict()
            assert content
            content_dict = marshal(content, STATIC_CONTENT_MODEL)
            content_json = json.dumps(content_dict, separators=(',', ':'))
            cache.set(STATIC_CONTENT_KEY, content_json, TIMEOUT_60_MINUTES)

        response = make_response(content_json)
        response.headers['content-type'] = 'application/json'

        return response
