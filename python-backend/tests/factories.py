import uuid
from datetime import datetime

import factory
import factory.fuzzy

from app.extensions import db
from tests.status_code_gen import *
from app.api.document_manager.models.document_manager import DocumentManager
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
from app.api.mines.location.models.mine_location import MineLocation
from app.api.mines.mine.models.mine import Mine
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.mines.status.models.mine_status import MineStatus
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
# from app.api.parties.party.models.party import Party
# from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
# from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.permits.permit.models.permit import Permit
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument

GUID = factory.LazyFunction(uuid.uuid4)
TODAY = factory.LazyFunction(datetime.now)


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session = db.session


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


class MineLocationFactory(BaseFactory):
    class Meta:
        model = MineLocation

    mine_location_guid = GUID
    latitude = factory.Faker('latitude')  # or factory.fuzzy.FuzzyFloat(49, 60) for inside BC
    longitude = factory.Faker(
        'longitude')  # or factory.fuzzy.FuzzyFloat(-132, -114.7) for inside BC
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
        commodity = True

    mine_type_detail_xref_guid = factory.LazyFunction(uuid.uuid4)
    mine_commodity_code = factory.LazyAttribute(lambda o: SampleMineCommodityCodes(o.tenure, 1)[0]
                                                if o.commodity else None)
    mine_disturbance_code = factory.LazyAttribute(lambda o: SampleMineDisturbanceCodes(o.tenure, 1)[
        0] if not o.commodity else None)


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
                commodity=False,
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
            if n == 0:
                PermitAmendmentFactory(permit_id=obj.permit_id, initial_permit=True, **kwargs)
            else:
                PermitAmendmentFactory(permit_id=obj.permit_id, **kwargs)


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
    authorization_end_date = TODAY
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


class MineFactory(BaseFactory):
    class Meta:
        model = Mine

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
    # mine_party_appt =
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

        MineExpectedDocumentFactory.create_batch(size=extracted, mine_guid=obj.mine_guid, **kwargs)
