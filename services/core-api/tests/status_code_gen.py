import random

from app.extensions import db
from app.api.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType
from app.api.incidents.models.mine_incident_status_code import MineIncidentStatusCode
from app.api.incidents.models.mine_incident_document_type_code import MineIncidentDocumentTypeCode
from app.api.mines.region.models.region import MineRegionCode
from app.api.EMLI_contacts.models.EMLI_contact_type import EMLIContactType
from app.api.mines.permits.permit.models.permit_status_code import PermitStatusCode
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.mines.permits.permit_conditions.models.permit_condition_type import PermitConditionType
from app.api.mines.mine.models.excemption_fee_status import ExemptionFeeStatus
from app.api.securities.models.bond_status import BondStatus
from app.api.securities.models.bond_type import BondType
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode
from app.api.mines.explosives_permit.models.explosives_permit_document_type import ExplosivesPermitDocumentType
from app.api.mines.explosives_permit.models.explosives_permit_magazine_type import ExplosivesPermitMagazineType
from app.api.projects.project_summary.models.project_summary_document_type import ProjectSummaryDocumentType
from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode
from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.parties.party.models.sub_division_code import SubDivisionCode
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.parties.party_appt.models.party_business_role import PartyBusinessRole
from app.api.variances.models.variance_document_category_code import VarianceDocumentCategoryCode
from app.api.variances.models.variance_application_status_code import VarianceApplicationStatusCode
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.now_applications.models.now_application_type import NOWApplicationType
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.underground_exploration_type import UndergroundExplorationType
from app.api.now_applications.models.now_application_progress_status import NOWApplicationProgressStatus
from app.api.now_applications.models.now_application_review_type import NOWApplicationReviewType
from app.api.now_applications.models.application_type_code import ApplicationTypeCode


def RandomMineRegionCode():
    return random.choice([x.mine_region_code for x in db.session.query(MineRegionCode).all()])


def RandomEMLIContactTypeCode():
    return random.choice([
        x.emli_contact_type_code
        for x in db.session.query(EMLIContactType).filter(EMLIContactType.active_ind == True).all()
    ])


def RandomPermitStatusCode():
    return random.choice([
        x.permit_status_code for x in db.session.query(PermitStatusCode).filter(
            PermitStatusCode.permit_status_code != 'D').all()
    ])


def RandomExemptionFeeStatusCode():
    return random.choice([x.exemption_fee_status_code for x in ExemptionFeeStatus.get_all()])


def RandomBondStatusCode():
    return random.choice([x.bond_status_code for x in BondStatus.get_all()])


def RandomBondTypeCode():
    return random.choice([x.bond_type_code for x in BondType.get_all()])


def RandomConditionCategoryCode():
    return random.choice([x.condition_category_code for x in PermitConditionCategory.get_all()])


def RandomConditionTypeCode():
    return random.choice([x.condition_type_code for x in PermitConditionType.get_all()])


def RandomTenureTypeCode():
    return random.choice(
        [x.mine_tenure_type_code for x in db.session.query(MineTenureTypeCode).all()])


def SampleMineCommodityCodes(mine_tenure_type, num):
    return [
        x.mine_commodity_code for x in random.sample(mine_tenure_type.mine_commodity_codes, num)
    ]


def SampleMineDisturbanceCodes(mine_tenure_type, num):
    return [
        x.mine_disturbance_code for x in random.sample(mine_tenure_type.mine_disturbance_codes, num)
    ]


def RandomOperatingMineStatusXref():
    return random.choice(
        db.session.query(MineStatusXref).filter(
            MineStatusXref.mine_operation_status_code == 'OP').all())


def RandomMineStatusXref():
    return random.choice(db.session.query(MineStatusXref).all())


def RandomSubDivisionCode():
    return random.choice([x.sub_division_code for x in db.session.query(SubDivisionCode).all()])


def RandomMinePartyAppointmentTypeCode():
    return random.choice([
        x.mine_party_appt_type_code for x in db.session.query(MinePartyAppointmentType).filter(
            MinePartyAppointmentType.mine_party_appt_type_code.notin_(['PMT', 'EOR', 'URP'])).all()
    ])


def RandomPartyBusinessRole():
    return random.choice([x.party_business_role_code for x in db.session.query(PartyBusinessRole)])


def RandomComplianceArticleId():
    return random.choice(
        [x.compliance_article_id for x in db.session.query(ComplianceArticle).all()])


def RandomIncidentDeterminationTypeCode():
    return random.choice(
        [x.mine_incident_determination_type_code for x in MineIncidentDeterminationType.get_all()])


def RandomIncidentStatusCode():
    return random.choice([x.mine_incident_status_code for x in MineIncidentStatusCode.get_all() if x.mine_incident_status_code != 'DFT'])


def RandomIncidentDocumentType():
    return random.choice(
        [x.mine_incident_document_type_code for x in MineIncidentDocumentTypeCode.get_all()])


def RandomMineReportDefinition():
    return random.choice([x.mine_report_definition_id for x in MineReportDefinition.get_all()])


def RandomMineReportDefinitionWithDueDate():
    return random.choice([
        x.mine_report_definition_id for x in MineReportDefinition.get_all()
        if x.due_date_period_months and x.due_date_period_months > 0
    ])


def RandomMineReportSubmissionStatusCode():
    return random.choice(
        [x.mine_report_submission_status_code for x in MineReportSubmissionStatusCode.get_all()])


def RandomVarianceDocumentCategoryCode():
    return random.choice(
        [x.variance_document_category_code for x in VarianceDocumentCategoryCode.get_all()])


def RandomExplosivesPermitMagazineTypeCode():
    return random.choice(
        [x.explosives_permit_magazine_type_code for x in ExplosivesPermitMagazineType.get_all()])


def RandomProjectSummaryDocumentTypeCode():
    return random.choice(
        [x.project_summary_document_type_code for x in ProjectSummaryDocumentType.get_all()])


def SampleDangerousOccurrenceSubparagraphs(num):
    return random.sample(
        db.session.query(ComplianceArticle).filter(ComplianceArticle.article_act_code == 'HSRCM',
                                                   ComplianceArticle.section == '1',
                                                   ComplianceArticle.sub_section == '7',
                                                   ComplianceArticle.paragraph == '3',
                                                   ComplianceArticle.sub_paragraph != None).all(),
        num)


def RandomVarianceApplicationStatusCode():
    return random.choice([
        x.variance_application_status_code
        for x in filter(lambda x: x.variance_application_status_code not in ['APP', 'DEN'],
                        VarianceApplicationStatusCode.get_all())
    ])


def RandomNOWTypeCode():
    return random.choice(
        [x.notice_of_work_type_code for x in db.session.query(NOWApplicationType).all()])


def RandomNOWStatusCode():
    return random.choice([x.now_application_status_code for x in NOWApplicationStatus.get_active()])


def RandomNOWReviewCode():
    return random.choice([
        x.now_application_review_type_code
        for x in db.session.query(NOWApplicationReviewType).all()
    ])


def RandomUnitTypeCode():
    return random.choice([x.unit_type_code for x in db.session.query(UnitType).all()])


def RandomUndergroundExplorationTypeCode():
    return random.choice([
        x.underground_exploration_type_code
        for x in db.session.query(UndergroundExplorationType).all()
    ])


def RandomNOWProgressStatusCode():
    return random.choice([
        x.application_progress_status_code
        for x in db.session.query(NOWApplicationProgressStatus).all()
    ])


def RandomApplicationType():
    return random.choice(['New Permit', 'Amendment'])


def RandomApplicationTypeCode():
    return random.choice(
        [x.application_type_code for x in db.session.query(ApplicationTypeCode).all()])
