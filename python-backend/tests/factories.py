import uuid
from datetime import datetime
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy

from app.extensions import db
from tests.status_code_gen import *
from app.api.document_manager.models.document_manager import DocumentManager
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
from app.api.documents.mines.models.mine_document import MineDocument
from app.api.mines.location.models.mine_location import MineLocation
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.parties.party.models.party import Party
from app.api.permits.permit.models.permit import Permit
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

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


class DocumentManagerFactory(BaseFactory):
    class Meta:
        model = DocumentManager

    document_manager_id = factory.Sequence(lambda n: n)
    document_guid = GUID
    full_storage_path = factory.LazyAttribute(lambda o: f'mine_no/category/{o.file_display_name}')
    upload_started_date = TODAY
    upload_completed_date = TODAY
    file_display_name = factory.Faker('file_name')
    path_display_name = factory.LazyAttribute(lambda o: f'mine_name/category/{o.file_display_name}')


class MineDocumentFactory(BaseFactory):
    class Meta:
        model = MineDocument

    class Params:
        document_manager_obj = factory.SubFactory(
            DocumentManagerFactory, file_display_name=factory.SelfAttribute('..document_name'))
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)

    mine_document_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    document_manager_guid = factory.SelfAttribute('document_manager_obj.document_guid')
    document_name = factory.Faker('file_name')
    mine_expected_document = []


class MineExpectedDocumentFactory(BaseFactory):
    class Meta:
        model = MineExpectedDocument

    exp_document_guid = GUID
    required_document = factory.LazyFunction(RandomRequiredDocument)
    exp_document_status_code = factory.LazyFunction(RandomExpectedDocumentStatusCode)
    exp_document_name = factory.LazyAttribute(lambda o: o.required_document.req_document_name)
    exp_document_description = factory.LazyAttribute(lambda o: o.required_document.description)
    due_date = TODAY
    received_date = TODAY
    hsrc_code = factory.LazyAttribute(lambda o: o.required_document.hsrc_code)
    mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
    mine_documents = []

    @factory.post_generation
    def mine_documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineDocumentFactory.create_batch(
            size=extracted, mine_expected_document=[obj], mine=obj.mine, **kwargs)


class MineLocationFactory(BaseFactory):
    class Meta:
        model = MineLocation

    mine_location_guid = GUID
    latitude = factory.Faker('latitude')  # or factory.fuzzy.FuzzyFloat(49, 60) for ~ inside BC
    longitude = factory.Faker('longitude')  # or factory.fuzzy.FuzzyFloat(-132, -114.7) for ~ BC
    geom = factory.LazyAttribute(lambda o: 'SRID=3005;POINT(%f %f)' % (o.longitude, o.latitude))
    effective_date = TODAY
    expiry_date = TODAY


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
        commodity = factory.Trait(
            mine_commodity_code=factory.LazyAttribute(lambda o: SampleMineCommodityCodes(
                o.tenure, 1)[0]))
        disturbance = factory.Trait(
            mine_disturbance_code=factory.LazyAttribute(lambda o: SampleMineDisturbanceCodes(
                o.tenure, 1)[0]))

    mine_type_detail_xref_guid = GUID
    mine_commodity_code = None
    mine_disturbance_code = None


class MineTypeFactory(BaseFactory):
    class Meta:
        model = MineType

    mine_type_guid = GUID
    mine_tenure_type_code = factory.LazyFunction(RandomTenureTypeCode)
    mine_type_detail = []

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


class PermitFactory(BaseFactory):
    class Meta:
        model = Permit

    permit_id = factory.Sequence(lambda n: n)
    permit_guid = GUID
    permit_no = factory.Sequence(lambda n: f'QQ{n}')
    permit_status_code = factory.LazyFunction(RandomPermitStatusCode)
    permit_amendments = []

    @factory.post_generation
    def permit_amendments(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        for n in range(extracted):
            PermitAmendmentFactory(permit_id=obj.permit_id, initial_permit=(n == 0), **kwargs)


class PermitAmendmentFactory(BaseFactory):
    class Meta:
        model = PermitAmendment

    class Params:
        initial_permit = factory.Trait(
            description='Initial permit issued.',
            permit_amendment_type_code='OGP',
        )

    permit_amendment_id = factory.Sequence(lambda n: n)
    permit_amendment_guid = GUID
    received_date = TODAY
    issue_date = TODAY
    authorization_end_date = factory.Faker('future_datetime', end_date='+30d')
    permit_amendment_status_code = 'ACT'
    permit_amendment_type_code = 'AMD'
    description = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    documents = []


class MineVerifiedStatusFactory(BaseFactory):
    class Meta:
        model = MineVerifiedStatus

    mine_verified_status_id = factory.Sequence(lambda n: n)
    healthy_ind = factory.Faker('boolean', chance_of_getting_true=50)
    verifying_user = factory.Faker('name')
    verifying_timestamp = TODAY
    update_user = factory.Faker('name')
    update_timestamp = TODAY


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
    expiry_date = datetime.strptime('9999-12-31', '%Y-%m-%d')  # holdover till datetime refactor
    party_type_code = None
    address_line_1 = factory.Faker('street_address')
    suite_no = factory.Iterator([None, None, '123', '123'])
    address_line_2 = factory.Iterator([None, 'Apt. 123', None, 'Apt. 123'])
    city = factory.Faker('city')
    sub_division_code = factory.LazyFunction(RandomSubDivisionCode)
    post_code = factory.Faker('bothify', text='?#?#?#', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ')

    mine_party_appt = []


class MineFactory(BaseFactory):
    class Meta:
        model = Mine

    class Params:
        minimal = factory.Trait(
            mine_no=None,
            mine_note=None,
            mine_region='NE',
            mine_location=None,
            mine_type=None,
            verified_status=None,
            mine_status=None,
            mine_tailings_storage_facilities=0,
            mine_permit=0,
            mine_expected_documents=0,
        )

    mine_guid = GUID
    mine_no = factory.Sequence(lambda n: f'MINENO{n}')
    mine_name = factory.Sequence(lambda n: f'mine name {n}')
    mine_note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    major_mine_ind = factory.Faker('boolean', chance_of_getting_true=50)
    mine_region = factory.LazyFunction(RandomMineRegionCode)
    mine_location = factory.RelatedFactory(MineLocationFactory, 'mine')
    mine_type = factory.RelatedFactory(MineTypeFactory, 'mine')
    verified_status = factory.RelatedFactory(MineVerifiedStatusFactory, 'mine')
    mine_status = factory.RelatedFactory(MineStatusFactory, 'mine')
    mine_tailings_storage_facilities = []
    mine_permit = []
    mine_expected_documents = []

    @factory.post_generation
    def mine_tailings_storage_facilities(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineTailingsStorageFacilityFactory.create_batch(
            size=extracted, mine_guid=obj.mine_guid, **kwargs)

    @factory.post_generation
    def mine_permit(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        PermitFactory.create_batch(size=extracted, mine_guid=obj.mine_guid, **kwargs)

    @factory.post_generation
    def mine_expected_documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MineExpectedDocumentFactory.create_batch(size=extracted, mine=obj, **kwargs)
