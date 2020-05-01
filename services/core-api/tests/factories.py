import uuid
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy

from app.extensions import db
from tests.status_code_gen import *
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.incidents.models.mine_incident import MineIncident
from app.api.mines.incidents.models.mine_incident_document_xref import MineIncidentDocumentXref
from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.subscription.models.subscription import Subscription
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.securities.models.bond import Bond
from app.api.securities.models.bond_permit_xref import BondPermitXref
from app.api.securities.models.reclamation_invoice import ReclamationInvoice
from app.api.users.core.models.core_user import CoreUser, IdirUserDetail
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.variances.models.variance import Variance
from app.api.variances.models.variance_document_xref import VarianceDocumentXref
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_comment import MineReportComment
from app.api.mines.comments.models.mine_comment import MineComment

GUID = factory.LazyFunction(uuid.uuid4)
TODAY = factory.LazyFunction(datetime.utcnow)

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
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)


class MineCommentFactory(BaseFactory):
    class Meta:
        model = MineComment

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory')

    mine_guid = factory.SelfAttribute('mine.mine_guid')
    mine_comment = factory.Faker('paragraph')


class VarianceFactory(BaseFactory):
    class Meta:
        model = Variance

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        inspector = factory.SubFactory('tests.factories.PartyBusinessRoleFactory')
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


def RandomPermitNumber():
    return random.choice(['C-', 'CX-', 'M-', 'M-', 'P-', 'PX-', 'G-', 'Q-']) + str(
        random.randint(1, 9999999))


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

        MineIncidentDocumentFactory.create_batch(
            size=extracted, incident=obj, mine_document__mine=None, **kwargs)


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
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_report_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    mine_report_definition_id = factory.LazyFunction(RandomMineReportDefinition)
    received_date = factory.Faker('date_between', start_date='-15d', end_date='+15d')
    due_date = factory.Faker('future_datetime', end_date='+30d')
    submission_year = factory.fuzzy.FuzzyInteger(datetime.utcnow().year - 2,
                                                 datetime.utcnow().year + 11)
    mine_report_submissions = []

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

    first_name = None
    party_name = None
    phone_no = factory.Faker('numerify', text='###-###-####')
    phone_ext = factory.Iterator([None, '123'])
    email = None
    effective_date = TODAY
    expiry_date = None
    party_type_code = None

    mine_party_appt = []
    address = []

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

    party_business_role_code = factory.LazyFunction(RandomPartyBusinessRole)
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
    start_date = factory.LazyFunction(datetime.utcnow().date)
    end_date = None
    processed_by = factory.Faker('first_name')
    processed_on = TODAY
    permit_guid = factory.LazyAttribute(lambda o: o.mine.mine_permit[
        0].permit_guid if o.mine.mine_permit and o.mine_party_appt_type_code == 'PMT' else None)
    mine_tailings_storage_facility_guid = factory.LazyAttribute(
        lambda o: o.mine.mine_tailings_storage_facilities[0].mine_tailings_storage_facility_guid
        if o.mine_party_appt_type_code == 'EOR' else None)

    permit_guid = factory.LazyAttribute(lambda o: o.mine.mine_permit[
        0].permit_guid if o.mine.mine_permit and o.mine_party_appt_type_code == 'PMT' else None)


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
            mine_incidents=0,
            mine_variance=0,
            mine_reports=0)
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
    mine_permit = []
    mine_incidents = []
    mine_variance = []
    mine_reports = []

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
    authorization_end_date = factory.Faker('date_between', start_date='+31d', end_date='+90d')
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
    project_id = factory.Faker('numerify', text='#######')
    amount = factory.Faker(
        'pydecimal', right_digits=2, positive=True, min_value=50, max_value=500000)
    vendor = factory.Faker('company')
