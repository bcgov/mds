import random

from app.extensions import db
from app.api.applications.models.application_status_code import ApplicationStatusCode
from app.api.constants import COMMODITY_CODES_CONFIG, DISTURBANCE_CODES_CONFIG
from app.api.documents.expected.models.document_status import ExpectedDocumentStatus
from app.api.documents.required.models.required_documents import RequiredDocument
from app.api.mines.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType
from app.api.mines.region.models.region import MineRegionCode
from app.api.permits.permit.models.permit_status_code import PermitStatusCode
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode
from app.api.mines.mine.models.mine_disturbance_code import MineDisturbanceCode
from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.api.mines.compliance.models.compliance_article import ComplianceArticle
from app.api.parties.party.models.sub_division_code import SubDivisionCode
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType


def RandomApplicationStatusCode():
    return random.choice([
        x.application_status_code
        for x in ApplicationStatusCode.find_all_active_application_status_code()
    ])


def RandomExpectedDocumentStatusCode():
    return random.choice(
        [x.exp_document_status_code for x in ExpectedDocumentStatus.find_all_document_status()])


def RandomRequiredDocument():
    return random.choice(db.session.query(RequiredDocument).all())


def RandomMineRegionCode():
    return random.choice([x.mine_region_code for x in db.session.query(MineRegionCode).all()])


def RandomPermitStatusCode():
    return random.choice([x.permit_status_code for x in db.session.query(PermitStatusCode).all()])


def RandomTenureTypeCode():
    return random.choice(
        [x.mine_tenure_type_code for x in db.session.query(MineTenureTypeCode).all()])


def SampleMineCommodityCodes(mine_tenure_type, num):
    return random.sample([
        key for key, val in COMMODITY_CODES_CONFIG.items()
        if mine_tenure_type in val['mine_tenure_type_codes']
    ], num)


def SampleMineDisturbanceCodes(mine_tenure_type, num):
    return random.sample([
        key for key, val in DISTURBANCE_CODES_CONFIG.items()
        if mine_tenure_type in val['mine_tenure_type_codes']
    ], num)


def RandomMineStatusXref():
    return random.choice(db.session.query(MineStatusXref).all())


def RandomSubDivisionCode():
    return random.choice([x.sub_division_code for x in db.session.query(SubDivisionCode).all()])


def RandomMinePartyAppointmentTypeCode():
    return random.choice(
        [x.mine_party_appt_type_code for x in db.session.query(MinePartyAppointmentType).all()])


def RandomComplianceArticleId():
    return random.choice(
        [x.compliance_article_id for x in db.session.query(ComplianceArticle).all()])


def RandomIncidentDeterminationTypeCode():
    return random.choice([
        x.mine_incident_determination_type_code for x in MineIncidentDeterminationType.get_active()
    ])


def SampleDangerousOccurrenceSubparagraphs(num):
    return random.sample(
        db.session.query(ComplianceArticle).filter(
            ComplianceArticle.section == '1', ComplianceArticle.sub_section == '7',
            ComplianceArticle.paragraph == '3', ComplianceArticle.sub_paragraph != None).all(), num)
