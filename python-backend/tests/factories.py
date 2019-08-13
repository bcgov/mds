import uuid
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy

from app.extensions import db
from tests.status_code_gen import *
from app.api.applications.models.application import Application
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.documents.variances.models.variance import VarianceDocumentXref
from app.api.documents.incidents.models.mine_incident import MineIncidentDocumentXref
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.incidents.models.mine_incident import MineIncident
from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.subscription.models.subscription import Subscription
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.users.core.models.core_user import CoreUser, IdirUserDetail
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.variances.models.variance import Variance
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from app.api.mines.reports.models.mine_report import MineReport
from app.api.now_submissions.models.application import Application as NOWApplication
from app.api.now_submissions.models.client import Client as NOWClient
from app.api.now_submissions.models.contact import Contact as NOWContact
from app.api.now_submissions.models.placer_activity import PlacerActivity as NOWPlacerActivity
from app.api.now_submissions.models.settling_pond import SettlingPond as NOWSettlingPond
from app.api.now_submissions.models.document import Document as NOWDocument
from app.api.now_submissions.models.sand_grv_qry_activity import SandGrvQryActivity as NOWSandGrvQryActivity
from app.api.now_submissions.models.under_exp_new_activity import UnderExpNewActivity as NOWUnderExpNewActivity
from app.api.now_submissions.models.under_exp_rehab_activity import UnderExpRehabActivity as NOWUnderExpRehabActivity
from app.api.now_submissions.models.surface_bulk_sample_activity import SurfaceBulkSampleActivity as NOWSurfaceBulkSampleActivity
from app.api.now_submissions.models.existing_placer_activity_xref import ExistingPlacerActivityXref as NOWExistingPlacerActivityXref
from app.api.now_submissions.models.proposed_placer_activity_xref import ProposedPlacerActivityXref as NOWProposedPlacerActivityXref
from app.api.now_submissions.models.existing_settling_pond_xref import ExistingSettlingPondXref as NOWExistingSettlingPondXref
from app.api.now_submissions.models.proposed_settling_pond_xref import ProposedSettlingPondXref as NOWProposedSettlingPondXref

GUID = factory.LazyFunction(uuid.uuid4)
TODAY = factory.LazyFunction(datetime.now)

FACTORY_LIST = []


class FactoryRegistry:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        FACTORY_LIST.append(cls)


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory, FactoryRegistry):
    class Meta:
        abstract = True
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'flush'


class ApplicationFactory(BaseFactory):
    class Meta:
        model = Application

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    application_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    application_no = factory.Sequence(lambda n: f'TX-{n}-TEST')
    application_status_code = factory.LazyFunction(RandomApplicationStatusCode)
    description = factory.Faker('sentence', nb_words=8, variable_nb_words=True)
    received_date = TODAY


class MineDocumentFactory(BaseFactory):
    class Meta:
        model = MineDocument

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_document_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    document_manager_guid = GUID
    document_name = factory.Faker('file_name')
    mine_expected_document = []


class MineExpectedDocumentFactory(BaseFactory):
    class Meta:
        model = MineExpectedDocument

    exp_document_guid = GUID
    required_document = factory.LazyFunction(RandomRequiredDocument)
    exp_document_status_code = factory.LazyFunction(RandomExpectedDocumentStatusCode)
    exp_document_name = factory.SelfAttribute('required_document.req_document_name')
    exp_document_description = factory.SelfAttribute('required_document.description')
    due_date = TODAY
    received_date = TODAY
    hsrc_code = factory.SelfAttribute('required_document.hsrc_code')
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
    related_documents = []

    @factory.post_generation
    def related_documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineDocumentFactory.create_batch(size=extracted,
                                         mine_expected_document=[obj],
                                         mine=obj.mine,
                                         **kwargs)


class MineStatusFactory(BaseFactory):
    class Meta:
        model = MineStatus

    mine_status_guid = GUID
    effective_date = TODAY
    mine_status_xref = factory.LazyFunction(RandomMineStatusXref)


class MineTypeDetailFactory(BaseFactory):
    class Meta:
        model = MineTypeDetail

    class Params:
        tenure = 'MIN'
        commodity = factory.Trait(mine_commodity_code=factory.LazyAttribute(
            lambda o: SampleMineCommodityCodes(o.tenure, 1)[0]))
        disturbance = factory.Trait(mine_disturbance_code=factory.LazyAttribute(
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
        commodities = SampleMineCommodityCodes(obj.mine_tenure_type_code, commodities)
        disturbances = extracted.get('disturbances', 1)
        disturbances = SampleMineDisturbanceCodes(obj.mine_tenure_type_code, disturbances)

        for commodity in commodities:
            MineTypeDetailFactory(mine_type_guid=obj.mine_type_guid,
                                  tenure=obj.mine_tenure_type_code,
                                  mine_commodity_code=commodity,
                                  **kwargs)

        for disturbance in disturbances:
            MineTypeDetailFactory(mine_type_guid=obj.mine_type_guid,
                                  tenure=obj.mine_tenure_type_code,
                                  mine_disturbance_code=disturbance,
                                  **kwargs)


class MineTailingsStorageFacilityFactory(BaseFactory):
    class Meta:
        model = MineTailingsStorageFacility

    mine_tailings_storage_facility_guid = GUID
    mine_tailings_storage_facility_name = factory.Faker('last_name')
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)


class VarianceFactory(BaseFactory):
    class Meta:
        model = Variance

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        inspector = factory.SubFactory('tests.factories.PartyBusinessRoleFactory')
        approved = factory.Trait(variance_application_status_code='APP',
                                 issue_date=TODAY,
                                 expiry_date=TODAY,
                                 inspector_party_guid=factory.SelfAttribute('inspector.party_guid'))
        denied = factory.Trait(variance_application_status_code='DEN',
                               inspector_party_guid=factory.SelfAttribute('inspector.party_guid'))
        not_applicable = factory.Trait(variance_application_status_code='NAP')

    variance_guid = GUID
    compliance_article_id = factory.LazyFunction(RandomComplianceArticleId)
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    parties_notified_ind = factory.Faker('boolean', chance_of_getting_true=50)
    received_date = TODAY
    documents = []

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        VarianceDocumentFactory.create_batch(size=extracted,
                                             variance=obj,
                                             mine_document__mine=None,
                                             **kwargs)


class VarianceDocumentFactory(BaseFactory):
    class Meta:
        model = VarianceDocumentXref

    class Params:
        mine_document = factory.SubFactory('tests.factories.MineDocumentFactory',
                                           mine_guid=factory.SelfAttribute('..variance.mine_guid'))
        variance = factory.SubFactory('tests.factories.VarianceFactory')

    variance_document_xref_guid = GUID
    mine_document_guid = factory.SelfAttribute('mine_document.mine_document_guid')
    variance_id = factory.SelfAttribute('variance.variance_id')
    variance_document_category_code = factory.LazyFunction(RandomVarianceDocumentCategoryCode)


def RandomPermitNumber():
    return random.choice(['C-', 'CX-', 'M-', 'M-', 'P-', 'PX-', 'G-', 'Q-']) + str(
        random.randint(1, 9999999))


class PermitFactory(BaseFactory):
    class Meta:
        model = Permit

    permit_guid = GUID
    permit_no = factory.LazyFunction(RandomPermitNumber)
    permit_status_code = factory.LazyFunction(RandomPermitStatusCode)
    permit_amendments = []
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    @factory.post_generation
    def permit_amendments(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        for n in range(extracted):
            PermitAmendmentFactory(permit=obj, initial_permit=(n == 0), **kwargs)


class PermitAmendmentFactory(BaseFactory):
    class Meta:
        model = PermitAmendment

    class Params:
        initial_permit = factory.Trait(
            description='Initial permit issued.',
            permit_amendment_type_code='OGP',
        )
        permit = factory.SubFactory(PermitFactory, permit_amendments=0)

    permit_amendment_guid = GUID
    permit_id = factory.SelfAttribute('permit.permit_id')
    received_date = TODAY
    issue_date = TODAY
    authorization_end_date = factory.Faker('future_datetime', end_date='+30d')
    permit_amendment_status_code = 'ACT'
    permit_amendment_type_code = 'AMD'
    description = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    related_documents = []


class PermitAmendmentDocumentFactory(BaseFactory):
    class Meta:
        model = PermitAmendmentDocument

    permit_amendment_document_guid = GUID
    permit_amendment_id = factory.SelfAttribute('permit_amendment.permit_amendment_id')
    document_name = factory.Faker('file_name')
    mine_guid = factory.SelfAttribute('permit_amendment.permit.mine.mine_guid')
    document_manager_guid = GUID
    permit_amendment = factory.SubFactory(PermitAmendmentFactory)


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
    determination_type_code = factory.LazyFunction(RandomIncidentDeterminationTypeCode)
    status_code = factory.LazyFunction(RandomIncidentStatusCode)
    followup_investigation_type_code = 'NO'
    dangerous_occurrence_subparagraphs = factory.LazyAttribute(
        lambda o: SampleDangerousOccurrenceSubparagraphs(o.do_subparagraph_count)
        if o.determination_type_code == 'DO' else [])
    documents = []

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineIncidentDocumentFactory.create_batch(size=extracted,
                                             incident=obj,
                                             mine_document__mine=None,
                                             **kwargs)


class MineIncidentDocumentFactory(BaseFactory):
    class Meta:
        model = MineIncidentDocumentXref

    class Params:
        mine_document = factory.SubFactory('tests.factories.MineDocumentFactory',
                                           mine_guid=factory.SelfAttribute('..incident.mine_guid'))
        incident = factory.SubFactory('tests.factories.MineIncidentFactory')

    mine_incident_document_xref_guid = GUID
    mine_document_guid = factory.SelfAttribute('mine_document.mine_document_guid')
    mine_incident_id = factory.SelfAttribute('incident.mine_incident_id')
    mine_incident_document_type_code = factory.LazyFunction(RandomIncidentDocumentType)


class MineReportFactory(BaseFactory):
    class Meta:
        model = MineReport

    mine_report_guid = GUID
    mine_report_definition_id = factory.LazyFunction(RandomMineReportDefinition)
    due_date = factory.Faker('future_datetime', end_date='+30d')
    submission_year = factory.fuzzy.FuzzyInteger(2020, 3000)


class AddressFactory(BaseFactory):
    class Meta:
        model = Address

    address_line_1 = factory.Faker('street_address')
    suite_no = factory.Iterator([None, None, '123', '123'])
    address_line_2 = factory.Iterator([None, 'Apt. 123', None, 'Apt. 123'])
    city = factory.Faker('city')
    sub_division_code = factory.LazyFunction(RandomSubDivisionCode)
    post_code = factory.Faker('bothify', text='?#?#?#', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ')


class PartyFactory(BaseFactory):
    class Meta:
        model = Party

    class Params:
        person = factory.Trait(
            first_name=factory.Faker('first_name'),
            party_name=factory.Faker('last_name'),
            email=factory.LazyAttribute(lambda o: f'{o.first_name}.{o.party_name}@example.com'),
            party_type_code='PER',
        )

        company = factory.Trait(
            party_name=factory.Faker('company'),
            email=factory.Faker('company_email'),
            party_type_code='ORG',
        )

    party_guid = factory.LazyFunction(uuid.uuid4)
    first_name = None
    party_name = None
    phone_no = factory.Faker('numerify', text='###-###-####')
    phone_ext = factory.Iterator([None, '123'])
    email = None
    effective_date = TODAY
    expiry_date = None
    party_type_code = None

    mine_party_appt = []
    address = factory.List([factory.SubFactory(AddressFactory) for _ in range(1)])


class PartyBusinessRoleFactory(BaseFactory):
    class Meta:
        model = PartyBusinessRoleAppointment

    party_business_role_code = factory.LazyFunction(RandomPartyBusinessRoleCode)
    party = factory.SubFactory(PartyFactory, person=True)
    start_date = TODAY
    end_date = None


class MinePartyAppointmentFactory(BaseFactory):
    class Meta:
        model = MinePartyAppointment

    mine_party_appt_guid = GUID
    mine = factory.SubFactory('tests.factories.MineFactory')
    party = factory.SubFactory(PartyFactory, person=True)
    mine_party_appt_type_code = factory.LazyFunction(RandomMinePartyAppointmentTypeCode)
    start_date = TODAY
    end_date = None
    processed_by = factory.Faker('first_name')
    processed_on = TODAY

    mine_tailings_storage_facility_guid = factory.LazyAttribute(
        lambda o: o.mine.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid
        if o.mine_party_appt_type_code == 'EOR' else None)
    permit_guid = factory.LazyAttribute(lambda o: o.mine.mine_permit[0].permit_guid
                                        if o.mine_party_appt_type_code == 'PMT' else None)


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
    email = factory.Faker('email')


class SubscriptionFactory(BaseFactory):
    class Meta:
        model = Subscription

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    user_name = factory.Faker('last_name')


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
            mine_permit=0,
            mine_expected_documents=0,
            mine_incidents=0,
            mine_variance=0,
        )

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
    latitude = factory.Faker('latitude')  # or factory.fuzzy.FuzzyFloat(49, 60) for ~ inside BC
    longitude = factory.Faker('longitude')  # or factory.fuzzy.FuzzyFloat(-132, -114.7) for ~ BC
    geom = factory.LazyAttribute(lambda o: 'SRID=3005;POINT(%f %f)' % (o.longitude, o.latitude))
    mine_location_description = factory.Faker('sentence', nb_words=8, variable_nb_words=True)
    mine_status = factory.RelatedFactory(MineStatusFactory, 'mine')
    mine_tailings_storage_facilities = []
    mine_permit = []
    mine_expected_documents = []
    mine_incidents = []
    mine_variance = []

    @factory.post_generation
    def mine_tailings_storage_facilities(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineTailingsStorageFacilityFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def mine_permit(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        PermitFactory.create_batch(size=extracted, mine=obj, **kwargs)

    @factory.post_generation
    def mine_expected_documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineExpectedDocumentFactory.create_batch(size=extracted, mine=obj, **kwargs)

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

        MineReportFactory.create_batch(size=extracted, mine_guid=obj.mine_guid, **kwargs)


class NOWApplicationFactory(BaseFactory):
    class Meta:
        model = NOWApplication

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        applicant = factory.SubFactory('tests.factories.NOWClientFactory')
        submitter = factory.SubFactory('tests.factories.NOWClientFactory')

    application_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    messageid = factory.fuzzy.FuzzyInteger(1, 100)
    applicantclientid = factory.SelfAttribute('applicant.clientid')
    submitterclientid = factory.SelfAttribute('submitter.clientid')

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWDocumentFactory.create_batch(size=extracted,
                                        application=obj,
                                        **kwargs)

    @factory.post_generation
    def contacts(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWContactFactory.create_batch(size=extracted,
                                       application=obj,
                                       **kwargs)

    @factory.post_generation
    def sand_grv_qry_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWSandGrvQryActivityFactory.create_batch(size=extracted,
                                                  application=obj,
                                                  **kwargs)

    @factory.post_generation
    def under_exp_new_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWUnderExpNewActivityFactory.create_batch(size=extracted,
                                                   application=obj,
                                                   **kwargs)

    @factory.post_generation
    def under_exp_rehab_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWUnderExpRehabActivityFactory.create_batch(size=extracted,
                                                     application=obj,
                                                     **kwargs)

    @factory.post_generation
    def existing_placer_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWExistingPlacerActivityXrefFactory.create_batch(size=extracted,
                                                          application=obj,
                                                          **kwargs)

    @factory.post_generation
    def proposed_placer_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWProposedPlacerActivityXrefFactory.create_batch(size=extracted,
                                                          application=obj,
                                                          **kwargs)

    @factory.post_generation
    def surface_bulk_sample_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWSurfaceBulkSampleActivityFactory.create_batch(size=extracted,
                                                        application=obj,
                                                        **kwargs)

    @factory.post_generation
    def existing_settling_pond(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWExistingSettlingPondXrefFactory.create_batch(size=extracted,
                                                        application=obj,
                                                        **kwargs)

    @factory.post_generation
    def proposed_settling_pond(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWProposedSettlingPondXrefFactory.create_batch(size=extracted,
                                                        application=obj,
                                                        **kwargs)


class NOWClientFactory(BaseFactory):
    class Meta:
        model = NOWClient

    clientid = factory.fuzzy.FuzzyInteger(1, 100)
    type = factory.Faker('sentence', nb_words=1)


class NOWDocumentFactory(BaseFactory):
    class Meta:
        model = NOWDocument

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    filename = factory.Faker('file_name')


class NOWContactFactory(BaseFactory):
    class Meta:
        model = NOWContact

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWSandGrvQryActivityFactory(BaseFactory):
    class Meta:
        model = NOWSandGrvQryActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpNewActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpNewActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpRehabActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpRehabActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWSurfaceBulkSampleActivityFactory(BaseFactory):
    class Meta:
        model = NOWSurfaceBulkSampleActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    id = factory.fuzzy.FuzzyInteger(1, 100)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWExistingPlacerActivityXrefFactory(BaseFactory):
    class Meta:
        model = NOWExistingPlacerActivityXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')
        placer_activity = factory.SubFactory('tests.factories.NOWPlacerActivityFactory')

    messageid = factory.SelfAttribute('application.messageid')
    placeractivityid = factory.SelfAttribute('placer_activity.placeractivityid')


class NOWPlacerActivityFactory(BaseFactory):
    class Meta:
        model = NOWPlacerActivity

    placeractivityid = factory.fuzzy.FuzzyInteger(1, 100)
    type = factory.Faker('sentence', nb_words=1)


class NOWProposedPlacerActivityXrefFactory(BaseFactory):
    class Meta:
        model = NOWProposedPlacerActivityXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')
        placer_activity = factory.SubFactory('tests.factories.NOWPlacerActivityFactory')

    messageid = factory.SelfAttribute('application.messageid')
    placeractivityid = factory.SelfAttribute('placer_activity.placeractivityid')


class NOWSettlingPondFactory(BaseFactory):
    class Meta:
        model = NOWSettlingPond

    settlingpondid = factory.fuzzy.FuzzyInteger(1, 100)
    pondid = factory.Faker('sentence', nb_words=1)


class NOWExistingSettlingPondXrefFactory(BaseFactory):
    class Meta:
        model = NOWExistingSettlingPondXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')
        settling_pond = factory.SubFactory('tests.factories.NOWSettlingPondFactory')

    messageid = factory.SelfAttribute('application.messageid')
    settlingpondid = factory.SelfAttribute('settling_pond.settlingpondid')


class NOWProposedSettlingPondXrefFactory(BaseFactory):
    class Meta:
        model = NOWProposedSettlingPondXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWApplicationFactory')
        settling_pond = factory.SubFactory('tests.factories.NOWSettlingPondFactory')

    messageid = factory.SelfAttribute('application.messageid')
    settlingpondid = factory.SelfAttribute('settling_pond.settlingpondid')
