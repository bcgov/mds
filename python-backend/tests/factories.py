import uuid
from datetime import datetime

import factory
import factory.fuzzy

from app.extensions import db
from .constants import *
from app.api.document_manager.models.document_manager import DocumentManager
# from app.api.documents.expected.models.document_status import ExpectedDocumentStatus
# from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
# from app.api.documents.mines.models.mine_document import MineDocument
# from app.api.documents.required.models.required_document_categories import RequiredDocumentCategory
# from app.api.documents.required.models.required_document_due_date_type import RequiredDocumentDueDateType
# from app.api.documents.required.models.required_document_sub_categories import RequiredDocumentSubCategory
# from app.api.documents.required.models.required_documents import RequiredDocument
from app.api.mines.location.models.mine_location import MineLocation
from app.api.mines.mine.models.mine import Mine

# from app.api.mines.mine.models.mine_type import MineType
# from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
# from app.api.mines.mine.models.mineral_tenure_xref import MineralTenureXref
# from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility

# from app.api.parties.party.models.party import Party
# from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
# from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
# from app.api.permits.permit.models.permit import Permit
# from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment


class DocumentManagerFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = DocumentManager
        sqlalchemy_session = db.session

    document_manager_id = factory.Sequence(lambda n: n)
    document_guid = factory.LazyFunction(uuid.uuid4)
    full_storage_path = factory.LazyAttribute(lambda o: f'mine_no/category/{o.file_display_name}')
    upload_started_date = factory.LazyFunction(datetime.now)
    upload_completed_date = factory.LazyFunction(datetime.now)
    file_display_name = factory.Faker('file_name')
    path_display_name = factory.LazyAttribute(lambda o: f'mine_name/category/{o.file_display_name}')


class MineLocationFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = MineLocation
        sqlalchemy_session = db.session

    mine_location_guid = factory.LazyFunction(uuid.uuid4)
    mine_guid = None
    latitude = factory.Faker('latitude')  # or factory.fuzzy.FuzzyFloat(49, 60)
    longitude = factory.Faker('longitude')  # or factory.fuzzy.FuzzyFloat(-132, -114.7)
    geom = factory.LazyAttribute(lambda o: 'SRID=3005;POINT(%f %f)' % (o.longitude, o.latitude))
    effective_date = factory.LazyFunction(datetime.now)
    expiry_date = factory.LazyFunction(datetime.now)


class MineTailingsStorageFacilityFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = MineTailingsStorageFacility
        sqlalchemy_session = db.session

    mine_tailings_storage_facility_guid = factory.LazyFunction(uuid.uuid4)
    mine_guid = None
    mine_tailings_storage_facility_name = factory.Faker('last_name')


class MineFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Mine
        sqlalchemy_session = db.session

    mine_guid = uuid.uuid4()
    mine_no = factory.Sequence(lambda n: f'MINENO{n}')
    mine_name = factory.Sequence(lambda n: f'mine name {n}')
    mine_note = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    major_mine_ind = factory.Faker('boolean', chance_of_getting_true=50)
    mine_region = factory.fuzzy.FuzzyChoice(TEST_REGION_CODES)
    mine_location = factory.SubFactory(MineLocationFactory, mine_guid=mine_guid)
    mine_tailings_storage_facilities = factory.List(
        [factory.SubFactory(MineTailingsStorageFacilityFactory, mine_guid=mine_guid)])

    # mine_permit =
    # mine_type =
    # mineral_tenure_xref =
    # mine_expected_documents =
    # mine_party_appt =

    # mine_status = factory.SubFactory(MineLocationFactory   ???