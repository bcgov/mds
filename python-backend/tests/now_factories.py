import uuid
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy
from app.extensions import db
from tests.factories import *

from app.api.now_submissions.models.application import Application as NOWApplication
from app.api.now_submissions.models.client import Client as NOWClient
from app.api.now_submissions.models.contact import Contact as NOWContact
from app.api.now_submissions.models.placer_activity import PlacerActivity as NOWPlacerActivity
from app.api.now_submissions.models.settling_pond import SettlingPondSubmission as NOWSettlingPond
from app.api.now_submissions.models.document import Document as NOWDocument
from app.api.now_submissions.models.sand_grv_qry_activity import SandGrvQryActivity as NOWSandGrvQryActivity
from app.api.now_submissions.models.under_exp_new_activity import UnderExpNewActivity as NOWUnderExpNewActivity
from app.api.now_submissions.models.under_exp_rehab_activity import UnderExpRehabActivity as NOWUnderExpRehabActivity
from app.api.now_submissions.models.under_exp_surface_activity import UnderExpSurfaceActivity as NOWUnderExpSurfaceActivity
from app.api.now_submissions.models.water_source_activity import WaterSourceActivity as NOWWaterSourceActivity
from app.api.now_submissions.models.surface_bulk_sample_activity import SurfaceBulkSampleActivity as NOWSurfaceBulkSampleActivity
from app.api.now_submissions.models.existing_placer_activity_xref import ExistingPlacerActivityXref as NOWExistingPlacerActivityXref
from app.api.now_submissions.models.proposed_placer_activity_xref import ProposedPlacerActivityXref as NOWProposedPlacerActivityXref
from app.api.now_submissions.models.existing_settling_pond_xref import ExistingSettlingPondXref as NOWExistingSettlingPondXref
from app.api.now_submissions.models.proposed_settling_pond_xref import ProposedSettlingPondXref as NOWProposedSettlingPondXref


class NOWSubmissionFactory(BaseFactory):
    class Meta:
        model = NOWApplication

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        applicant = factory.SubFactory('tests.factories.NOWClientFactory')
        submitter = factory.SubFactory('tests.factories.NOWClientFactory')

    application_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    messageid = factory.Sequence(lambda n: n)
    applicantclientid = factory.SelfAttribute('applicant.clientid')
    submitterclientid = factory.SelfAttribute('submitter.clientid')
    noticeofworktype = factory.Faker('word')
    trackingnumber = factory.fuzzy.FuzzyInteger(1, 100)
    status = random.choice(['Approved', 'Rejected', 'Received', 'Client Delayed'])
    receiveddate = factory.Faker('past_datetime')
    minenumber = factory.Faker('word')
    originating_system = random.choice(['NROS', 'VFCBC'])

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWDocumentFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def contacts(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWContactFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def sand_grv_qry_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWSandGrvQryActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def under_exp_new_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWUnderExpNewActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def under_exp_rehab_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWUnderExpRehabActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def under_exp_surface_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWUnderExpSurfaceActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def water_source_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWWaterSourceActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def existing_placer_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWExistingPlacerActivityXrefFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def proposed_placer_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWProposedPlacerActivityXrefFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def surface_bulk_sample_activity(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWSurfaceBulkSampleActivityFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def existing_settling_pond(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWExistingSettlingPondXrefFactory.create_batch(size=extracted, application=obj, **kwargs)

    @factory.post_generation
    def proposed_settling_pond(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWProposedSettlingPondXrefFactory.create_batch(size=extracted, application=obj, **kwargs)


class NOWClientFactory(BaseFactory):
    class Meta:
        model = NOWClient

    clientid = factory.Sequence(lambda n: n)
    type = factory.Faker('sentence', nb_words=1)


class NOWDocumentFactory(BaseFactory):
    class Meta:
        model = NOWDocument

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    filename = factory.Faker('file_name')


class NOWContactFactory(BaseFactory):
    class Meta:
        model = NOWContact

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWSandGrvQryActivityFactory(BaseFactory):
    class Meta:
        model = NOWSandGrvQryActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpNewActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpNewActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpRehabActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpRehabActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpSurfaceActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpSurfaceActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWWaterSourceActivityFactory(BaseFactory):
    class Meta:
        model = NOWWaterSourceActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWSurfaceBulkSampleActivityFactory(BaseFactory):
    class Meta:
        model = NOWSurfaceBulkSampleActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    id = factory.Sequence(lambda n: n)
    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWExistingPlacerActivityXrefFactory(BaseFactory):
    class Meta:
        model = NOWExistingPlacerActivityXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')
        placer_activity = factory.SubFactory('tests.factories.NOWPlacerActivityFactory')

    messageid = factory.SelfAttribute('application.messageid')
    placeractivityid = factory.SelfAttribute('placer_activity.placeractivityid')


class NOWPlacerActivityFactory(BaseFactory):
    class Meta:
        model = NOWPlacerActivity

    placeractivityid = factory.Sequence(lambda n: n)
    type = factory.Faker('sentence', nb_words=1)


class NOWProposedPlacerActivityXrefFactory(BaseFactory):
    class Meta:
        model = NOWProposedPlacerActivityXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')
        placer_activity = factory.SubFactory('tests.factories.NOWPlacerActivityFactory')

    messageid = factory.SelfAttribute('application.messageid')
    placeractivityid = factory.SelfAttribute('placer_activity.placeractivityid')


class NOWSettlingPondFactory(BaseFactory):
    class Meta:
        model = NOWSettlingPond

    settlingpondid = factory.Sequence(lambda n: n)
    pondid = factory.Faker('sentence', nb_words=1)


class NOWExistingSettlingPondXrefFactory(BaseFactory):
    class Meta:
        model = NOWExistingSettlingPondXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')
        settling_pond = factory.SubFactory('tests.factories.NOWSettlingPondFactory')

    messageid = factory.SelfAttribute('application.messageid')
    settlingpondid = factory.SelfAttribute('settling_pond.settlingpondid')


class NOWProposedSettlingPondXrefFactory(BaseFactory):
    class Meta:
        model = NOWProposedSettlingPondXref

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')
        settling_pond = factory.SubFactory('tests.factories.NOWSettlingPondFactory')

    messageid = factory.SelfAttribute('application.messageid')
    settlingpondid = factory.SelfAttribute('settling_pond.settlingpondid')
