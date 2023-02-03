import uuid
from datetime import datetime, timedelta, timezone
from random import randrange
import factory
import factory.fuzzy

from app.api.dams import Dam
from app.api.dams.models.dam import DamType, OperatingStatus, ConsequenceClassification
from app.extensions import db
from tests.status_code_gen import *
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.incidents.models.mine_incident import MineIncident
from app.api.incidents.models.mine_incident_note import MineIncidentNote
from app.api.mines.incidents.models.mine_incident_document_xref import MineIncidentDocumentXref
from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.subscription.models.subscription import Subscription
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility, StorageLocation, FacilityType, \
    TailingsStorageFacilityType
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.party_orgbook_entity import PartyOrgBookEntity
from app.api.parties.party.models.address import Address
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions
from app.api.mines.permits.permit_conditions.models.standard_permit_conditions import StandardPermitConditions
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.notice_of_departure.models.notice_of_departure import NoticeOfDeparture, NodType, NodStatus
from app.api.securities.models.bond import Bond
from app.api.securities.models.reclamation_invoice import ReclamationInvoice
from app.api.users.core.models.core_user import CoreUser, IdirUserDetail
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.variances.models.variance import Variance
from app.api.variances.models.variance_document_xref import VarianceDocumentXref
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_comment import MineReportComment
from app.api.mines.comments.models.mine_comment import MineComment
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit, ExplosivesPermitMagazine
from app.api.projects.project.models.project import Project
from app.api.projects.project_contact.models.project_contact import ProjectContact
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.projects.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization
from app.api.projects.project_summary.models.project_summary_document_xref import ProjectSummaryDocumentXref
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.EMLI_contacts.models.EMLI_contact_type import EMLIContactType
from app.api.EMLI_contacts.models.EMLI_contact import EMLIContact
from app.api.activity.models.activity_notification import ActivityNotification
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage
from app.api.mines.alerts.models.mine_alert import MineAlert

GUID = factory.LazyFunction(uuid.uuid4)
TODAY = factory.LazyFunction(datetime.utcnow)

FACTORY_LIST = []


def create_mine_and_permit(mine_kwargs={},
                           permit_kwargs={},
                           num_permits=1,
                           num_permit_amendments=1):
    mine = MineFactory(mine_permit_amendments=0, **mine_kwargs)
    for x in range(num_permits):
        permit = PermitFactory(_context_mine=mine, **permit_kwargs)
        permit._all_mines.append(mine)  # create mine_permit_xref
        PermitAmendmentFactory.create_batch(size=num_permit_amendments, mine=mine, permit=permit)
        permit._context_mine = mine              # possibly redundant
    return mine, permit


def create_mine_and_tailing_storage_facility(mine_kwargs={}, tsf_kwargs={}, num_tsf=1):
    mine = MineFactory(**mine_kwargs)
    for x in range(num_tsf):
        tsf = MineTailingsStorageFacilityFactory(**tsf_kwargs)

    return mine, tsf


class FactoryRegistry:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        FACTORY_LIST.append(cls)


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory, FactoryRegistry):
    class Meta:
        abstract = True
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'flush'

from tests.now_submission_factories import *
from tests.now_application_factories import *

class MineDocumentFactory(BaseFactory):
    class Meta:
        model = MineDocument

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_document_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    document_manager_guid = GUID
    document_name = factory.Faker('file_name')


class MineStatusFactory(BaseFactory):
    class Meta:
        model = MineStatus

    class Params:
        operating = factory.Trait(
            mine_status_xref=factory.LazyFunction(RandomOperatingMineStatusXref))

    mine_status_guid = GUID
    effective_date = TODAY
    mine_status_xref = factory.LazyFunction(RandomMineStatusXref)


class MineTypeDetailFactory(BaseFactory):
    class Meta:
        model = MineTypeDetail

    class Params:
        tenure = 'MIN'
        commodity = factory.Trait(
            mine_commodity_code=factory.LazyAttribute(
                lambda o: SampleMineCommodityCodes(o.tenure, 1)[0]))
        disturbance = factory.Trait(
            mine_disturbance_code=factory.LazyAttribute(
                lambda o: SampleMineDisturbanceCodes(o.tenure, 1)[0]))

    mine_type_detail_xref_guid = GUID
    mine_commodity_code = None
    mine_disturbance_code = None


class MineTypeFactory(BaseFactory):
    class Meta:
        model = MineType

    mine_type_guid = GUID
    mine_tenure_type_code = factory.LazyFunction(RandomTenureTypeCode)
    mine_type_detail = []
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    @factory.post_generation
    def mine_type_detail(obj, create, extracted, **kwargs):
        if not create:
            return

        if extracted is None:
            extracted = {}
        commodities = extracted.get('commodities', 1)
        commodities = SampleMineCommodityCodes(obj.mine_tenure_type, commodities)
        disturbances = extracted.get('disturbances', 1)
        disturbances = SampleMineDisturbanceCodes(obj.mine_tenure_type, disturbances)

        for commodity in commodities:
            MineTypeDetailFactory(
                mine_type_guid=obj.mine_type_guid,
                tenure=obj.mine_tenure_type_code,
                mine_commodity_code=commodity,
                **kwargs)

        for disturbance in disturbances:
            MineTypeDetailFactory(
                mine_type_guid=obj.mine_type_guid,
                tenure=obj.mine_tenure_type_code,
                mine_disturbance_code=disturbance,
                **kwargs)


class MineTailingsStorageFacilityFactory(BaseFactory):
    class Meta:
        model = MineTailingsStorageFacility

    mine_tailings_storage_facility_guid = GUID
    mine_tailings_storage_facility_name = factory.Faker('last_name')
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')
    consequence_classification_status_code = 'LOW'
    tsf_operating_status_code = 'OPT'
    itrb_exemption_status_code = 'YES'
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
    storage_location = StorageLocation['above_ground']
    facility_type = FacilityType['tailings_storage_facility']
    tailings_storage_facility_type = TailingsStorageFacilityType['pit']
    mines_act_permit_no = '123456'


class DamFactory(BaseFactory):
    class Meta:
        model = Dam

    class Params:
        tsf = factory.SubFactory('tests.factories.MineTailingsStorageFacilityFactory')

    dam_guid = GUID
    mine_tailings_storage_facility_guid = factory.SelfAttribute('tsf.mine_tailings_storage_facility_guid')
    dam_type = DamType['dam']
    dam_name = 'Dam Name'
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')
    operating_status = OperatingStatus['operation']
    consequence_classification = ConsequenceClassification['LOW']
    permitted_dam_crest_elevation = 100.11
    current_dam_height = 100.11
    current_elevation = 100.11
    max_pond_elevation = 100.11
    min_freeboard_required = 100.11


class MineCommentFactory(BaseFactory):
    class Meta:
        model = MineComment

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory')

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    mine_comment = factory.Faker('paragraph')


class MineAlertFactory(BaseFactory):
    class Meta:
        model = MineAlert

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory')
        set_end_date = factory.Trait(end_date=(datetime.now(tz=timezone.utc) + timedelta(days=10)))
        set_inactive = factory.Trait(is_active=False)

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    start_date = TODAY
    contact_name = factory.Faker('name')
    contact_phone = factory.Faker('numerify', text='###-###-####')
    message = factory.Faker('paragraph')
    is_active = True

    end_date = None


class VarianceFactory(BaseFactory):
    class Meta:
        model = Variance

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        inspector = factory.SubFactory('tests.factories.PartyBusinessRoleFactory', inspector=True)
        approved = factory.Trait(
            variance_application_status_code='APP',
            issue_date=TODAY,
            expiry_date=TODAY,
            inspector_party_guid=factory.SelfAttribute('inspector.party_guid'))
        denied = factory.Trait(
            variance_application_status_code='DEN',
            inspector_party_guid=factory.SelfAttribute('inspector.party_guid'))
        not_applicable = factory.Trait(variance_application_status_code='NAP')

    variance_guid = GUID
    compliance_article_id = factory.LazyFunction(RandomComplianceArticleId)
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    parties_notified_ind = factory.Faker('boolean', chance_of_getting_true=50)
    received_date = TODAY
    documents = []
    deleted_ind = False

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        VarianceDocumentFactory.create_batch(
            size=extracted, variance=obj, mine_document__mine=None, **kwargs)


class VarianceDocumentFactory(BaseFactory):
    class Meta:
        model = VarianceDocumentXref

    class Params:
        mine_document = factory.SubFactory(
            'tests.factories.MineDocumentFactory',
            mine_guid=factory.SelfAttribute('..variance.mine_guid'))
        variance = factory.SubFactory('tests.factories.VarianceFactory')

    variance_document_xref_guid = GUID
    mine_document_guid = factory.SelfAttribute('mine_document.mine_document_guid')
    variance_id = factory.SelfAttribute('variance.variance_id')
    variance_document_category_code = factory.LazyFunction(RandomVarianceDocumentCategoryCode)


class ProjectSummaryDocumentFactory(BaseFactory):
    class Meta:
        model = ProjectSummaryDocumentXref

    class Params:
        mine_document = factory.SubFactory(
            'tests.factories.MineDocumentFactory',
            mine_guid=factory.SelfAttribute('..project_summary.mine_guid'))
        project_summary = factory.SubFactory('tests.factories.ProjectSummaryFactory')

    project_summary_document_xref_guid = GUID
    mine_document_guid = factory.SelfAttribute('mine_document.mine_document_guid')
    project_summary_id = factory.SelfAttribute('project_summary.project_summary_id')
    project_summary_document_type_code = factory.LazyFunction(RandomProjectSummaryDocumentTypeCode)


def RandomPermitNumber():
    return random.choice(['C-', 'CX-', 'M-', 'M-', 'P-', 'PX-', 'G-', 'Q-']) + str(
        random.randint(1, 9999999))


def ExemptionFeeStatus(permit_no, status, tenure):
    permit_prefix = permit_no[0]
    if status == 'C':
        return "Y"
    elif status != 'C':
        if permit_prefix == "P" and tenure == 'PLR':
            return "Y"
        elif (permit_prefix == "M" or permit_prefix == "C") and (tenure == "MIN"
                                                                 or tenure == "COL"):
            return "MIM"
        elif (permit_prefix == "Q" or permit_prefix == "G") and (tenure == "BCL" or tenure == "MIN"
                                                                 or tenure == "PRL"):
            return "MIP"


def RandomTenureTypeCode(permit_no):
    permit_prefix = permit_no[0]
    tenure = ""
    if permit_prefix == "P":
        tenure = "PLR"
    elif permit_prefix == "C":
        tenure = "COL"
    elif permit_prefix == "M":
        tenure = "MIN"
    elif permit_prefix == "G" or permit_prefix == "Q":
        tenure = "BCL"

    obj = {'mine_tenure_type_code': tenure}
    return obj


class MineVerifiedStatusFactory(BaseFactory):
    class Meta:
        model = MineVerifiedStatus

    healthy_ind = factory.Faker('boolean', chance_of_getting_true=50)
    verifying_user = factory.Faker('name')
    verifying_timestamp = TODAY
    update_user = factory.Faker('name')
    update_timestamp = TODAY


class MineIncidentFactory(BaseFactory):
    class Meta:
        model = MineIncident

    class Params:

        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        do_subparagraph_count = 2

    mine_incident_id_year = 2019
    mine_incident_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    incident_timestamp = factory.Faker('past_datetime')
    incident_description = factory.Faker('sentence', nb_words=20, variable_nb_words=True)
    reported_timestamp = factory.Faker('past_datetime')
    reported_by_name = factory.Faker('name')
    reported_by_phone_no = factory.Faker('numerify', text='###-###-####')
    reported_by_email = factory.Faker('email')
    determination_type_code = factory.LazyFunction(RandomIncidentDeterminationTypeCode)
    status_code = factory.LazyFunction(RandomIncidentStatusCode)
    followup_investigation_type_code = 'NO'
    dangerous_occurrence_subparagraphs = factory.LazyAttribute(
        lambda o: SampleDangerousOccurrenceSubparagraphs(o.do_subparagraph_count)
        if o.determination_type_code == 'DO' else [])
    immediate_measures_taken = None
    injuries_description = None
    johsc_worker_rep_name = None
    johsc_worker_rep_contacted = None
    johsc_management_rep_name = None
    johsc_management_rep_contacted = None
    documents = []
    mine_incident_notes = []
    deleted_ind = False

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineIncidentDocumentFactory.create_batch(
            size=extracted, incident=obj, mine_document__mine=None, **kwargs)

    @factory.post_generation
    def mine_incident_notes(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineIncidentNoteFactory.create_batch(size=extracted + 1, mine_incident=obj, **kwargs)


class MineIncidentNoteFactory(BaseFactory):
    class Meta:
        model = MineIncidentNote

    class Params:
        mine_incident = factory.SubFactory('tests.factories.MineIncidentFactory')

    mine_incident_note_guid = GUID
    mine_incident_guid = factory.SelfAttribute('mine_incident.mine_incident_guid')
    content = factory.Faker('sentence')
    create_user = factory.Faker('name')
    update_user = factory.Faker('name')
    create_timestamp = TODAY
    update_timestamp = TODAY
    deleted_ind = False


class MineIncidentDocumentFactory(BaseFactory):
    class Meta:
        model = MineIncidentDocumentXref

    class Params:
        mine_document = factory.SubFactory(
            'tests.factories.MineDocumentFactory',
            mine_guid=factory.SelfAttribute('..incident.mine_guid'))
        incident = factory.SubFactory('tests.factories.MineIncidentFactory')

    mine_incident_document_xref_guid = GUID
    mine_document_guid = factory.SelfAttribute('mine_document.mine_document_guid')
    mine_incident_id = factory.SelfAttribute('incident.mine_incident_id')
    mine_incident_document_type_code = factory.LazyFunction(RandomIncidentDocumentType)


class MineReportFactory(BaseFactory):
    class Meta:
        model = MineReport

    class Params:
        permit_required_reports = factory.Trait(
            mine_report_definition_id=None,
            permit_condition_category_code=factory.LazyFunction(RandomConditionCategoryCode))

        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_report_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    mine_report_definition_id = factory.LazyFunction(
        RandomMineReportDefinition
    )  # None if not factory.SelfAttribute('set_permit_condition_category_code') else factory.LazyFunction(RandomMineReportDefinition)
    received_date = factory.Faker('date_between', start_date='-15d', end_date='+15d')
    due_date = factory.Faker('future_datetime', end_date='+30d')
    submission_year = factory.fuzzy.FuzzyInteger(datetime.utcnow().year - 2,
                                                 datetime.utcnow().year + 11)
    mine_report_submissions = []
    permit_condition_category_code = None

    @factory.post_generation
    def mine_report_submissions(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineReportSubmissionFactory.create_batch(size=extracted, report=obj, **kwargs)


class MineReportCommentFactory(BaseFactory):
    class Meta:
        model = MineReportComment

    class Params:
        submission = factory.SubFactory('tests.factories.MineReportSubmissionFactory')

    mine_report_submission_id = factory.SelfAttribute('submission.mine_report_submission_id')
    mine_report_comment_guid = GUID
    report_comment = factory.Faker('paragraph')
    comment_visibility_ind = factory.Faker('boolean', chance_of_getting_true=50)


class MineReportSubmissionFactory(BaseFactory):
    class Meta:
        model = MineReportSubmission

    class Params:
        report = factory.SubFactory('tests.factories.MineReportFactory')

    mine_report_id = factory.SelfAttribute('report.mine_report_id')
    mine_report_submission_guid = GUID
    mine_report_submission_status_code = factory.LazyFunction(RandomMineReportSubmissionStatusCode)
    submission_date = factory.Faker('future_datetime', end_date='+30d')
    comments = []

    @factory.post_generation
    def comments(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineReportCommentFactory.create_batch(size=extracted, submission=obj, **kwargs)


class AddressFactory(BaseFactory):
    class Meta:
        model = Address

    class Params:
        party = factory.SubFactory('tests.factories.PartyFactory', person=True)

    party_guid = factory.SelfAttribute('party.party_guid')
    address_line_1 = factory.Faker('street_address')
    suite_no = factory.Iterator([None, None, '123', '123'])
    address_line_2 = factory.Iterator([None, 'Apt. 123', None, 'Apt. 123'])
    city = factory.Faker('city')
    sub_division_code = factory.LazyFunction(RandomSubDivisionCode)
    post_code = factory.Faker('bothify', text='?#?#?#', letters='ABCEGHJKLMNPRSTVXY')


class PartyFactory(BaseFactory):
    class Meta:
        model = Party

    class Params:
        person = factory.Trait(
            first_name=factory.Faker('first_name'),
            party_name=factory.Faker('last_name'),
            email=factory.LazyAttribute(lambda o: f'{o.first_name}.{o.party_name}@example.com'),
            party_type_code='PER',
            create_user='test-proponent'
        )

        company = factory.Trait(
            party_name=factory.Faker('company'),
            email=factory.Faker('company_email'),
            party_type_code='ORG',

        )

    first_name = None
    party_name = None
    phone_no = factory.Faker('numerify', text='###-###-####')
    phone_ext = factory.Iterator([None, '123'])
    phone_no_sec = factory.Faker('numerify', text='###-###-####')
    phone_sec_ext = factory.Iterator([None, '123'])
    phone_no_ter = factory.Faker('numerify', text='###-###-####')
    phone_ter_ext = factory.Iterator([None, '123'])
    email = None
    email_sec = None
    party_type_code = None
    organization_guid = None
    job_title_code = None

    @factory.post_generation
    def address(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        AddressFactory.create_batch(size=extracted, party=obj, **kwargs)


class PartyBusinessRoleFactory(BaseFactory):
    class Meta:
        model = PartyBusinessRoleAppointment

    class Params:
        inspector = factory.Trait(party_business_role_code='INS')

    party_business_role_code = factory.LazyFunction(RandomPartyBusinessRole)
    party = factory.SubFactory(PartyFactory, person=True)
    start_date = datetime.utcnow().date()
    end_date = None


class MinePartyAppointmentFactory(BaseFactory):
    class Meta:
        model = MinePartyAppointment

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory')
        permittee = factory.Trait(mine_guid=None, mine_party_appt_type_code='PMT')
        eor = factory.Trait(mine_party_appt_type_code='EOR')

    mine_party_appt_guid = GUID
    mine_party_appt_type_code = factory.LazyFunction(RandomMinePartyAppointmentTypeCode)

    mine_guid = factory.LazyAttribute(lambda o: o.mine.mine_guid if o.mine_party_appt_type_code
                                      not in PERMIT_LINKED_CONTACT_TYPES else None)

    party = factory.SubFactory(PartyFactory, person=True, address=1)
    start_date = factory.LazyFunction(datetime.utcnow().date)
    end_date = None
    status = None
    processed_by = factory.Faker('first_name')
    processed_on = TODAY
    permit_id = factory.LazyAttribute(lambda o: o.mine.mine_permit[0].permit_id
                                      if o.mine.mine_permit and o.mine_party_appt_type_code in
                                      PERMIT_LINKED_CONTACT_TYPES else None)
    mine_tailings_storage_facility_guid = factory.LazyAttribute(
        lambda o: o.mine.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid
        if o.mine_party_appt_type_code == 'EOR' else None)


class PartyOrgBookEntityFactory(BaseFactory):
    class Meta:
        model = PartyOrgBookEntity

    party = factory.SubFactory(PartyFactory, company=True)
    registration_id = factory.Faker('pyint')
    registration_status = factory.Faker('boolean', chance_of_getting_true=50)
    registration_date = factory.Faker('date_between', start_date='-100d', end_date='-25d')
    name_id = factory.Faker('pyint')
    name_text = factory.Faker('company')
    credential_id = factory.Faker('pyint')
    association_user = factory.Faker('first_name')
    association_timestamp = datetime.utcnow().date()


class CoreUserFactory(BaseFactory):
    class Meta:
        model = CoreUser

    core_user_guid = GUID
    email = factory.Faker('email')
    phone_no = factory.Faker('numerify', text='###-###-####')
    last_logon = TODAY
    idir_user_detail = factory.RelatedFactory('tests.factories.IdirUserDetailFactory', 'core_user')


class IdirUserDetailFactory(BaseFactory):
    class Meta:
        model = IdirUserDetail

    class Params:
        core_user = factory.SubFactory(CoreUserFactory)

    core_user_id = factory.SelfAttribute('core_user.core_user_id')
    bcgov_guid = GUID
    username = factory.Faker('first_name')


class MinespaceUserFactory(BaseFactory):
    class Meta:
        model = MinespaceUser

    keycloak_guid = GUID
    email_or_username = factory.Faker('email')

# Core subscriptions
class SubscriptionFactory(BaseFactory):
    class Meta:
        model = Subscription

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    user_name = factory.Faker('last_name')

# Minespace subscriptions/access
class MinespaceSubscriptionFactory(BaseFactory):
    class Meta:
        model = MinespaceUserMine

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        minespace_user = factory.SubFactory(MinespaceUserFactory)

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    user_id = factory.SelfAttribute('minespace_user.user_id')

class MineFactory(BaseFactory):
    class Meta:
        model = Mine

    class Params:
        minimal = factory.Trait(
            mine_no=None,
            mine_note=None,
            mine_region='NE',
            latitude=None,
            longitude=None,
            geom=None,
            mine_location_description=None,
            mine_type=None,
            verified_status=None,
            mine_status=None,
            mine_tailings_storage_facilities=0,
            mine_permit_amendments=0,
            mine_incidents=0,
            mine_variance=0,
            mine_reports=0,
            comments=0,
            alerts=0)
        operating = factory.Trait(
            mine_status=factory.RelatedFactory(MineStatusFactory, 'mine', operating=True))

    mine_guid = GUID
    mine_no = factory.Faker('ean', length=8)
    mine_name = factory.Faker('company')
    mine_note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    major_mine_ind = factory.Faker('boolean', chance_of_getting_true=50)
    mine_region = factory.LazyFunction(RandomMineRegionCode)
    ohsc_ind = factory.Faker('boolean', chance_of_getting_true=50)
    union_ind = factory.Faker('boolean', chance_of_getting_true=50)
    mine_type = factory.RelatedFactory(MineTypeFactory, 'mine')
    verified_status = factory.RelatedFactory(MineVerifiedStatusFactory, 'mine')
    latitude = factory.Faker('latitude')         # or factory.fuzzy.FuzzyFloat(49, 60) for ~ inside BC
    longitude = factory.Faker('longitude')       # or factory.fuzzy.FuzzyFloat(-132, -114.7) for ~ BC
    geom = factory.LazyAttribute(lambda o: 'SRID=3005;POINT(%f %f)' % (o.longitude, o.latitude))
    mine_location_description = factory.Faker('sentence', nb_words=8, variable_nb_words=True)
    mine_status = factory.RelatedFactory(MineStatusFactory, 'mine')
    exemption_fee_status_code = factory.LazyFunction(RandomExemptionFeeStatusCode)
    exemption_fee_status_note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    mine_tailings_storage_facilities = []
    mine_permit_amendments = []
    mine_incidents = []
    mine_variance = []
    mine_reports = []
    comments = []
    alerts = []

    @factory.post_generation
    def mine_tailings_storage_facilities(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineTailingsStorageFacilityFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def mine_permit_amendments(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        permit = PermitFactory()
        permit._all_mines.append(obj)
        PermitAmendmentFactory.create_batch(size=extracted, mine=obj, permit=permit, **kwargs)

    @factory.post_generation
    def mine_incidents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineIncidentFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def mine_variance(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        VarianceFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def mine_reports(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineReportFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def comments(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineCommentFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def project(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        if obj.major_mine_ind:
            ProjectFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def alerts(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineAlertFactory.create_batch(size=extracted, mine=obj, **kwargs)


class PermitFactory(BaseFactory):
    class Meta:
        model = Permit

    permit_guid = GUID
    permit_no = factory.LazyFunction(RandomPermitNumber)
    permit_status_code = factory.LazyFunction(RandomPermitStatusCode)

    @factory.post_generation
    def permit_prefix(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = {}
        obj.permit_no[0]

    @factory.post_generation
    def site_properties(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = {}
        RandomTenureTypeCode(obj.permit_no)

    @factory.post_generation
    def exemption_fee_status_code(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = {}

        ExemptionFeeStatus(obj.permit_no, obj.permit_status_code,
                           RandomTenureTypeCode(obj.permit_no))

    @factory.post_generation
    def bonds(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = random.randint(1, 3)

        for n in range(extracted):
            BondFactory(permit=obj, **kwargs)

    @factory.post_generation
    def reclamation_invoices(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = random.randint(1, 3)

        for n in range(extracted):
            ReclamationInvoiceFactory(permit=obj, **kwargs)


class MinePermitXrefFactory(BaseFactory):
    class Meta:
        model = MinePermitXref

    class Params:
        permit = factory.SubFactory(PermitFactory)
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    permit_id = factory.SelfAttribute('permit.permit_id')
    mine_guid = factory.SelfAttribute('mine.mine_guid')


class PermitAmendmentFactory(BaseFactory):
    class Meta:
        model = PermitAmendment

    class Params:
        initial_permit = factory.Trait(
            description='Initial permit issued.',
            permit_amendment_type_code='OGP',
        )
        permit = factory.SubFactory(PermitFactory, permit_amendments=0)
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    permit_amendment_guid = GUID
    permit_id = factory.SelfAttribute('permit.permit_id')
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    received_date = TODAY
    issue_date = TODAY
    authorization_end_date = factory.Faker('date_between', start_date='+31d', end_date='+89d')
    permit_amendment_status_code = 'ACT'
    permit_amendment_type_code = 'AMD'
    description = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    related_documents = []
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
    deleted_ind = False
    is_generated_in_core = False

    @factory.post_generation
    def conditions(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 5

        PermitConditionsFactory.create_batch(size=extracted, permit_amendment=obj, **kwargs)
        PermitConditionsFactory.reset_sequence()


class PermitAmendmentDocumentFactory(BaseFactory):
    class Meta:
        model = PermitAmendmentDocument

    permit_amendment_document_guid = GUID
    permit_amendment_id = factory.SelfAttribute('permit_amendment.permit_amendment_id')
    document_name = factory.Faker('file_name')
    mine_guid = factory.SelfAttribute('permit_amendment.mine_guid')
    document_manager_guid = GUID
    permit_amendment = factory.SubFactory(PermitAmendmentFactory)


class PermitConditionsFactory(BaseFactory):
    class Meta:
        model = PermitConditions

    class Params:
        permit_amendment = factory.SubFactory(PermitAmendmentFactory)

    permit_condition_guid = GUID
    permit_amendment_id = factory.SelfAttribute('permit_amendment.permit_amendment_id')
    condition_category_code = factory.LazyFunction(RandomConditionCategoryCode)
    condition_type_code = factory.LazyFunction(RandomConditionTypeCode)
    condition = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    display_order = factory.Sequence(lambda n: n + 1)


class StandardPermitConditionsFactory(BaseFactory):
    class Meta:
        model = StandardPermitConditions

    standard_permit_condition_guid = GUID
    notice_of_work_type = factory.LazyFunction(RandomNOWTypeCode)
    condition_category_code = factory.LazyFunction(RandomConditionCategoryCode)
    condition_type_code = factory.LazyFunction(RandomConditionTypeCode)
    condition = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    display_order = factory.Sequence(lambda n: n + 1)


class BondFactory(BaseFactory):
    class Meta:
        model = Bond

    class Params:
        payer = factory.SubFactory(PartyFactory, company=True)

    bond_guid = GUID
    amount = factory.Faker(
        'pydecimal', right_digits=2, positive=True, min_value=50, max_value=500000)
    bond_type_code = factory.LazyFunction(RandomBondTypeCode)
    bond_status_code = factory.LazyFunction(RandomBondStatusCode)
    payer_party_guid = factory.SelfAttribute('payer.party_guid')
    institution_name = factory.Faker('company')
    institution_street = factory.Faker('street_address')
    institution_city = factory.Faker('city')
    institution_province = factory.LazyFunction(RandomSubDivisionCode)
    institution_postal_code = factory.Faker(
        'bothify', text='?#?#?#', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    note = factory.Faker(
        'paragraph', nb_sentences=3, variable_nb_sentences=True, ext_word_list=None)
    issue_date = TODAY
    reference_number = factory.Faker('numerify', text='#######')


class ReclamationInvoiceFactory(BaseFactory):
    class Meta:
        model = ReclamationInvoice

    reclamation_invoice_guid = GUID
    amount = factory.Faker(
        'pydecimal', right_digits=2, positive=True, min_value=50, max_value=500000)
    vendor = factory.Faker('company')


class ExplosivesPermitFactory(BaseFactory):
    class Meta:
        model = ExplosivesPermit

    class Params:
        mine = factory.SubFactory(MineFactory, minimal=True)
        mines_act_permit = factory.SubFactory(PermitFactory)
        issuing_inspector = factory.SubFactory(PartyBusinessRoleFactory)
        mine_manager = factory.SubFactory(MinePartyAppointmentFactory)
        permittee = factory.SubFactory(MinePartyAppointmentFactory)

    explosives_permit_guid = GUID

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    permit_guid = factory.SelfAttribute('mines_act_permit.permit_guid')
    issuing_inspector_party_guid = factory.SelfAttribute('issuing_inspector.party_guid')
    mine_manager_mine_party_appt_id = factory.SelfAttribute('mine_manager.mine_party_appt_id')
    permittee_mine_party_appt_id = factory.SelfAttribute('permittee.mine_party_appt_id')

    originating_system = 'Core'
    application_number = factory.Faker('sentence', nb_words=1)
    received_timestamp = TODAY
    application_status = 'REC'
    application_date = TODAY
    description = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')

    permit_number = None
    issue_date = None
    expiry_date = None
    is_closed = False
    closed_reason = None
    closed_timestamp = None

    deleted_ind = False

    explosive_magazines = []
    detonator_magazines = []
    documents = []

    @factory.post_generation
    def explosive_magazines(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ExplosivesPermitMagazineFactory.create_batch(
            size=extracted, explosives_permit=obj, **kwargs)

    @factory.post_generation
    def detonator_magazines(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ExplosivesPermitMagazineFactory.create_batch(
            size=extracted, explosives_permit=obj, **kwargs)


class ExplosivesPermitMagazineFactory(BaseFactory):
    class Meta:
        model = ExplosivesPermitMagazine

    class Params:
        explosives_permit = factory.SubFactory('tests.factories.ExplosivesPermitFactory')

    explosives_permit_id = factory.SelfAttribute('explosives_permit.explosives_permit_id')
    explosives_permit_magazine_type_code = factory.LazyFunction(
        RandomExplosivesPermitMagazineTypeCode)
    type_no = factory.Faker('sentence', nb_words=1, variable_nb_words=True)
    tag_no = factory.Faker('sentence', nb_words=1, variable_nb_words=True)
    construction = factory.Faker('sentence', nb_words=1, variable_nb_words=True)
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')
    length = factory.Faker('pyint', min_value=1, max_value=10)
    width = factory.Faker('pyint', min_value=1, max_value=10)
    height = factory.Faker('pyint', min_value=1, max_value=10)
    quantity = factory.Faker('pyint', min_value=1, max_value=10)
    distance_road = factory.Faker('pyint', min_value=10, max_value=100)
    distance_dwelling = factory.Faker('pyint', min_value=10, max_value=100)
    detonator_type = factory.Faker('sentence', nb_words=1, variable_nb_words=True)


class ProjectFactory(BaseFactory):
    class Meta:
        model = Project

    class Params:
        mine = factory.SubFactory(MineFactory, minimal=True)

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    project_guid = GUID
    proponent_project_id = factory.Faker('sentence', nb_words=1)
    project_title = factory.Faker('text', max_nb_chars=50)
    contacts = []

    proponent_project_id = None

    @factory.post_generation
    def project_summary(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ProjectSummaryFactory.create_batch(size=extracted, project=obj, **kwargs)

    @factory.post_generation
    def project_contact(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        proj_contact = ProjectContactFactory.create_batch(size=extracted, project=obj, **kwargs)
        obj.contacts.extend(proj_contact)


class ProjectSummaryFactory(BaseFactory):
    class Meta:
        model = ProjectSummary

    class Params:
        project = factory.SubFactory(ProjectFactory)

    project_guid = factory.SelfAttribute('project.project_guid')
    project_summary_guid = GUID
    status_code = 'SUB'
    project_summary_description = factory.Faker('paragraph', nb_sentences=5, variable_nb_sentences=True, ext_word_list=None)
    documents = []
    authorizations = []
    deleted_ind = False

    expected_draft_irt_submission_date = None
    expected_permit_application_date = None
    expected_permit_receipt_date = None
    expected_project_start_date = None

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ProjectSummaryDocumentFactory.create_batch(
            size=extracted, project_summary=obj, mine_document__mine=None, **kwargs)


class ProjectSummaryContactFactory(BaseFactory):
    class Meta:
        model = ProjectSummaryContact

    class Params:
        project_summary = factory.SubFactory(ProjectSummaryFactory)

    project_summary_guid = factory.SelfAttribute('project_summary.project_summary_guid')
    email = factory.Faker('email')
    phone_number = factory.Faker('numerify', text='###-###-####')
    name = factory.Faker('name')
    is_primary = True
    deleted_ind = False

    phone_extension = None
    job_title = None
    company_name = None


class ProjectContactFactory(BaseFactory):
    class Meta:
        model = ProjectContact

    class Params:
        project = factory.SubFactory(ProjectFactory)

    project_guid = factory.SelfAttribute('project.project_guid')
    email = factory.Faker('email')
    phone_number = factory.Faker('numerify', text='###-###-####')
    name = factory.Faker('name')
    is_primary = True
    deleted_ind = False

    phone_extension = None
    job_title = None
    company_name = None


class ProjectSummaryAuthorizationFactory(BaseFactory):
    class Meta:
        model = ProjectSummaryAuthorization

    class Params:
        project_summary = factory.SubFactory(ProjectSummaryFactory)

    project_summary_guid = factory.SelfAttribute('project_summary.project_summary_guid')
    project_summary_permit_type = ['NEW']
    project_summary_authorization_type = 'MINES_ACT_PERMIT'
    existing_permits_authorizations = []
    deleted_ind = False


class EMLIContactTypeFactory(BaseFactory):
    class Meta:
        model = EMLIContactType

    emli_contact_type_code = factory.LazyFunction(RandomEMLIContactTypeCode)
    description = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    display_order = factory.Sequence(lambda n: n + 1)
    active_ind = True


class EMLIContactFactory(BaseFactory):
    class Meta:
        model = EMLIContact

    class Params:
        major_mine = factory.Trait(
            contact_guid=GUID,
            emli_contact_type_code=factory.LazyFunction(RandomEMLIContactTypeCode),
            mine_region_code=factory.LazyFunction(RandomMineRegionCode),
            first_name=factory.Faker('first_name'),
            last_name=factory.Faker('last_name'),
            email=factory.Faker('email'),
            phone_number=factory.Faker('numerify', text='###-###-####'),
            is_major_mine=True,
            is_general_contact=False,
            deleted_ind=False)

    contact_guid = GUID
    emli_contact_type_code = factory.LazyFunction(RandomEMLIContactTypeCode)
    mine_region_code = factory.LazyFunction(RandomMineRegionCode)
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    email = factory.Faker('email')
    phone_number = factory.Faker('numerify', text='###-###-####')
    is_major_mine = False
    is_general_contact = False
    deleted_ind = False


class NoticeOfDepartureFactory(BaseFactory):
    class Meta:
        model = NoticeOfDeparture

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        permit = factory.SubFactory('tests.factories.PermitFactory')

    nod_guid = GUID
    nod_no = factory.LazyAttribute(lambda a: f'NOD-X-45564456-{randrange(1,1000)}')
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    permit_guid = factory.SelfAttribute('permit.permit_guid')
    nod_title = factory.Faker('text', max_nb_chars=50)
    nod_description = factory.Faker('text', max_nb_chars=3000)
    nod_type: NodType.non_substantial
    nod_status: NodStatus.pending_review
    deleted_ind = False


class InformationRequirementsTableFactory(BaseFactory):
    class Meta:
        model = InformationRequirementsTable

    class Params:
        project = factory.SubFactory(ProjectFactory)

    project_guid = factory.SelfAttribute('project.project_guid')
    irt_guid = GUID
    status_code = 'SUB'


class MajorMineApplicationFactory(BaseFactory):
    class Meta:
        model = MajorMineApplication

    class Params:
        project = factory.SubFactory(ProjectFactory)

    project_guid = factory.SelfAttribute('project.project_guid')
    major_mine_application_guid = GUID
    major_mine_application_id = factory.Faker('pyint')
    status_code = 'SUB'
    deleted_ind = False


class ProjectDecisionPackageFactory(BaseFactory):
    class Meta:
        model = ProjectDecisionPackage

    class Params:
        project = factory.SubFactory(ProjectFactory)

    project_guid = factory.SelfAttribute('project.project_guid')
    project_decision_package_guid = GUID
    project_decision_package_id = factory.Faker('pyint')
    status_code = 'NTS'
    documents = []
    deleted_ind = False


class ActivityFactory(BaseFactory):

    class Meta:
        model = ActivityNotification

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        entity = 'mine'
        entity_guid = factory.LazyFunction(uuid.uuid4)
        user = factory.Faker('user_name')

    notification_guid = GUID
    activity_type = factory.SelfAttribute('entity')
    notification_document = factory.LazyAttribute(lambda o: {
        "message": "Mine has been upddated ",
        "metadata": {
            "mine": {
                "mine_no": o.mine.mine_no,
                "mine_guid": str(o.mine.mine_guid),
                "mine_name": o.mine.mine_name
            },
            "entity": o.entity,
            "entity_guid": str(o.entity_guid)
        }
    })
    notification_read = False
    notification_recipient = factory.SelfAttribute('user')
