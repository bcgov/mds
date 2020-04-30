import uuid, random
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy
from app.extensions import db
from tests.factories import *

from app.api.now_submissions.models.application import Application as NOWApplication
from app.api.now_submissions.models.application_nda import ApplicationNDA as NOWApplicationNDA
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

from app.api.now_applications.models.now_application_type import NOWApplicationType
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.models.unit_type import UnitType

from app.api.now_applications.transmogrify_now import unit_type_map


def randomYesNo():
    return random.choice(['Yes', 'No'])


def randomUnitDescription():
    return random.choice(list(unit_type_map.keys()))


def randomNOWOriginatingSystem():
    return random.choice(['NROS', 'VFCBC', 'Core', 'MMS'])


class NOWSubmissionFactory(BaseFactory):
    class Meta:
        model = NOWApplication

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        applicant = factory.SubFactory('tests.factories.NOWClientFactory')
        submitter = factory.SubFactory('tests.factories.NOWClientFactory')
        #now_application_identity = factory.SubFactory('tests.factories.NOWApplicationIdentityFactory')
        all_activites = factory.Trait(
            blasting_operation=True,
            state_of_land=True,
            camps=True,
            cut_lines_polarization_survey=True,
            exploration_access=True,
            exploration_surface_drilling=True,
            mechanical_trenching=True,
            placer_operation=True,
            sand_and_gravel=True,
            surface_bulk_sample=True,
            settling_pond=True,
            underground_exploration=True)
        camps = factory.Trait(
            cbsfreclamation=factory.Faker('sentence', nb_words=3),
            cbsfreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            campbuildstgetotaldistarea=factory.fuzzy.FuzzyDecimal(100),
            fuellubstoreonsite=factory.LazyFunction(randomYesNo)
        )                                                               #details=factory.SubFactory('tests.now_submission_factories.NOWCampDetails'))

        blasting_operation = factory.Trait(
            bcexplosivespermitissued=factory.LazyFunction(randomYesNo),
            bcexplosivespermitnumber=factory.Faker(
                'bothify', text='???#####', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            bcexplosivespermitexpiry=factory.Faker('future_datetime', end_date='+30d'),
            storeexplosivesonsite=factory.LazyFunction(randomYesNo))

        state_of_land = factory.Trait(
            landcommunitywatershed=factory.LazyFunction(randomYesNo),
            archsitesaffected=factory.LazyFunction(randomYesNo))

        cut_lines_polarization_survey = factory.Trait(
            cutlinesreclamation=factory.Faker('sentence', nb_words=3),
            cutlinesreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            cutlinesexplgriddisturbedarea=factory.fuzzy.FuzzyDecimal(100))

        exploration_access = factory.Trait(
            expaccessreclamation=factory.Faker('sentence', nb_words=3),
            expaccessreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            expaccesstotaldistarea=factory.fuzzy.FuzzyDecimal(100))

        exploration_surface_drilling = factory.Trait(
            expsurfacedrillreclcorestorage=factory.Faker('sentence', nb_words=1),
            expsurfacedrillreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            expsurfacedrilltotaldistarea=factory.fuzzy.FuzzyDecimal(100))

        mechanical_trenching = factory.Trait(
            mechtrenchingreclamation=factory.Faker('sentence', nb_words=3),
            mechtrenchingreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            mechtrenchingtotaldistarea=factory.fuzzy.FuzzyDecimal(100))

        placer_operation = factory.Trait(
            placerundergroundoperations=factory.LazyFunction(randomYesNo),
            placerhandoperations=factory.LazyFunction(randomYesNo),
            placerreclamationarea=factory.fuzzy.FuzzyDecimal(1000),
            placerreclamation=factory.Faker('sentence', nb_words=2),
            placerreclamationcost=factory.fuzzy.FuzzyDecimal(1000))

        sand_and_gravel = factory.Trait(
            sandgrvqrydepthoverburden=factory.fuzzy.FuzzyDecimal(1000),
            sandgrvqrydepthtopsoil=factory.fuzzy.FuzzyDecimal(1000),
            sandgrvqrystabilizemeasures=factory.Faker('sentence', nb_words=2),
            sandgrvqrywithinaglandres=factory.LazyFunction(randomYesNo),
            sandgrvqryalrpermitnumber=factory.Faker('sentence', nb_words=2),
            sandgrvqrylocalgovsoilrembylaw=factory.LazyFunction(randomYesNo),
            sandgrvqryofficialcommplan=factory.Faker('sentence', nb_words=2),
            sandgrvqrylandusezoning=factory.Faker('sentence', nb_words=2),
            sandgrvqryendlanduse=factory.Faker('sentence', nb_words=2),
            sandgrvqrytotalmineres=factory.fuzzy.FuzzyInteger(1, 100),
            sandgrvqrytotalmineresunits=factory.LazyFunction(randomUnitDescription),
            sandgrvqryannualextrest=factory.fuzzy.FuzzyInteger(1, 100),
            sandgrvqryannualextrestunits=factory.LazyFunction(randomUnitDescription),
            sandgrvqryreclamation=factory.Faker('sentence', nb_words=2),
            sandgrvqryreclamationbackfill=factory.Faker('sentence', nb_words=2),
            sandgrvqryreclamationcost=factory.fuzzy.FuzzyDecimal(1000),
            sandgrvqrygrdwtravgdepth=factory.fuzzy.FuzzyDecimal(100),
            sandgrvqrygrdwtrexistingareas=factory.LazyFunction(randomYesNo),
            sandgrvqrygrdwtrtestpits=factory.LazyFunction(randomYesNo),
            sandgrvqrygrdwtrtestwells=factory.LazyFunction(randomYesNo),
            sandgrvqrygrdwtrother=factory.Faker('sentence', nb_words=2),
            sandgrvqrygrdwtrmeasprotect=factory.Faker('sentence', nb_words=2),
            sandgrvqryimpactdistres=factory.fuzzy.FuzzyInteger(1, 100),
            sandgrvqryimpactdistwater=factory.fuzzy.FuzzyInteger(1, 100),
            sandgrvqryimpactnoise=factory.Faker('sentence', nb_words=3),
            sandgrvqryimpactprvtaccess=factory.Faker('sentence', nb_words=3),
            sandgrvqryimpactprevtdust=factory.Faker('sentence', nb_words=3),
            sandgrvqryimpactminvisual=factory.Faker('sentence', nb_words=3))

        surface_bulk_sample = factory.Trait(
            surfacebulksampleprocmethods=factory.Faker('sentence', nb_words=3),
            surfacebulksamplereclsephandl=factory.Faker('sentence', nb_words=3),
            surfacebulksamplereclamation=factory.Faker('sentence', nb_words=3),
            surfacebulksamplerecldrainmiti=factory.Faker('sentence', nb_words=3),
            surfacebulksamplereclcost=factory.fuzzy.FuzzyDecimal(100),
            surfacebulksampletotaldistarea=factory.fuzzy.FuzzyDecimal(100))

        settling_pond = factory.Trait(
            pondsreclamation=factory.Faker('sentence', nb_words=3),
            pondsreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            pondstotaldistarea=factory.fuzzy.FuzzyDecimal(100),
            pondsexfiltratedtoground=factory.LazyFunction(randomYesNo),
            pondsrecycled=factory.LazyFunction(randomYesNo),
            pondsdischargedtoenv=factory.LazyFunction(randomYesNo))

        underground_exploration = factory.Trait(
            underexptotalore=factory.fuzzy.FuzzyInteger(1, 100),
            underexptotaloreunits=factory.LazyFunction(randomUnitDescription),
            underexpreclamation=factory.Faker('sentence', nb_words=3),
            underexpreclamationcost=factory.fuzzy.FuzzyDecimal(100),
            underexptotalwaste=factory.fuzzy.FuzzyInteger(1, 100),
            underexptotalwasteunits=factory.LazyFunction(randomUnitDescription),
            underexptotaldistarea=factory.fuzzy.FuzzyDecimal(100))

    all_activites = True

    application_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    messageid = factory.Sequence(lambda n: n)
    applicantclientid = factory.SelfAttribute('applicant.clientid')
    submitterclientid = factory.SelfAttribute('submitter.clientid')
    noticeofworktype = factory.LazyFunction(
        lambda: random.choice([x.description for x in NOWApplicationType.query.all()]))
    trackingnumber = factory.fuzzy.FuzzyInteger(1, 100)
    status = factory.LazyFunction(lambda: random.choice(['Accepted', 'Withdrawn', 'Under Review']))
    submitteddate = factory.Faker('past_datetime')
    receiveddate = factory.Faker('past_datetime')
    minenumber = factory.Faker('word')
    originating_system = factory.LazyFunction(randomNOWOriginatingSystem)

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


class NOWApplicationNDAFactory(BaseFactory):
    class Meta:
        model = NOWApplicationNDA

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        applicant = factory.SubFactory('tests.factories.NOWClientFactory')
        submitter = factory.SubFactory('tests.factories.NOWClientFactory')
        #now_application_identity = factory.SubFactory('tests.factories.NOWApplicationIdentityFactory')

    application_nda_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    messageid = factory.Sequence(lambda n: n)
    applicantclientid = factory.SelfAttribute('applicant.clientid')
    submitterclientid = factory.SelfAttribute('submitter.clientid')
    status = factory.LazyFunction(
        lambda: random.choice([x.description for x in NOWApplicationStatus.get_active()]))
    submitteddate = factory.Faker('past_datetime')
    receiveddate = factory.Faker('past_datetime')
    minenumber = factory.SelfAttribute('mine.mine_no')
    originating_system = random.choice(['NROS', 'VFCBC'])

    @factory.post_generation
    def documents(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWDocumentFactory.create_batch(size=extracted, application=obj, **kwargs)


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

    messageid = factory.SelfAttribute('application.messageid')
    filename = factory.Faker('file_name')


class NOWContactFactory(BaseFactory):
    class Meta:
        model = NOWContact

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)
    org_legalname = factory.Faker('name')
    org_doingbusinessas = factory.Faker('company')
    ind_firstname = factory.Faker('first_name')
    ind_lastname = factory.Faker('first_name')
    ind_phonenumber = factory.Faker('numerify', text='##########')
    dayphonenumber = factory.Faker('numerify', text='##########')
    dayphonenumberext = factory.Faker('numerify', text='###')
    faxnumber = factory.Faker('numerify', text='##########')
    email = factory.Faker('company_email')
    contacttype = "Permitee"
    mailingaddressline2 = factory.Faker('street_address')
    mailingaddresscity = factory.Faker('city')
    mailingaddressprovstate = factory.LazyFunction(RandomSubDivisionCode)
    mailingaddresspostalzip = factory.Faker(
        'bothify', text='?#?#?#', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ')


class NOWSandGrvQryActivityFactory(BaseFactory):
    class Meta:
        model = NOWSandGrvQryActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWUnderExpNewActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpNewActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)
    incline = factory.fuzzy.FuzzyDecimal(100, precision=1)
    inclineunits = factory.LazyFunction(randomUnitDescription)
    quantity = factory.fuzzy.FuzzyInteger(100)
    length = factory.fuzzy.FuzzyDecimal(100, precision=1)
    width = factory.fuzzy.FuzzyDecimal(100, precision=1)
    height = factory.fuzzy.FuzzyDecimal(100, precision=1)


class NOWUnderExpRehabActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpRehabActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)
    incline = factory.fuzzy.FuzzyDecimal(100, precision=1)
    inclineunits = factory.LazyFunction(randomUnitDescription)
    quantity = factory.fuzzy.FuzzyInteger(100)
    length = factory.fuzzy.FuzzyDecimal(100, precision=1)
    width = factory.fuzzy.FuzzyDecimal(100, precision=1)
    height = factory.fuzzy.FuzzyDecimal(100, precision=1)


class NOWUnderExpSurfaceActivityFactory(BaseFactory):
    class Meta:
        model = NOWUnderExpSurfaceActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)
    disturbedarea = factory.fuzzy.FuzzyDecimal(100)
    timbervolume = factory.fuzzy.FuzzyDecimal(100)


class NOWWaterSourceActivityFactory(BaseFactory):
    class Meta:
        model = NOWWaterSourceActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)


class NOWSurfaceBulkSampleActivityFactory(BaseFactory):
    class Meta:
        model = NOWSurfaceBulkSampleActivity

    class Params:
        application = factory.SubFactory('tests.factories.NOWSubmissionFactory')

    messageid = factory.SelfAttribute('application.messageid')
    type = factory.Faker('sentence', nb_words=1)
    disturbedarea = factory.fuzzy.FuzzyDecimal(100)
    timbervolume = factory.fuzzy.FuzzyDecimal(100)


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
