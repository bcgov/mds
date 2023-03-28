import uuid
from datetime import datetime, timedelta
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy
from app.extensions import db
from tests.factories import *

from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models
from tests.now_submission_factories import NOWSubmissionFactory


class BlastingOperationFactory(BaseFactory):

    class Meta:
        model = app_models.BlastingOperation

    class Params:
        now_application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute('now_application.now_application_id')
    has_storage_explosive_on_site = factory.Faker('boolean', chance_of_getting_true=50)
    explosive_permit_issued = factory.Faker('boolean', chance_of_getting_true=50)
    explosive_permit_number = factory.Sequence(lambda n: n)
    explosive_permit_expiry_date = factory.Faker('future_datetime', end_date='+30d')


class StateOfLandFactory(BaseFactory):

    class Meta:
        model = app_models.StateOfLand

    class Params:
        now_application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute('now_application.now_application_id')
    has_community_water_shed = factory.Faker('boolean', chance_of_getting_true=50)
    has_archaeology_sites_affected = factory.Faker('boolean', chance_of_getting_true=50)
    authorization_details = factory.Faker('sentence', nb_words=100)
    has_licence_of_occupation = factory.Faker('boolean', chance_of_getting_true=50)
    licence_of_occupation = factory.Faker('sentence', nb_words=100)
    applied_for_licence_of_occupation = factory.Faker('boolean', chance_of_getting_true=50)
    notice_served_to_private = factory.Faker('boolean', chance_of_getting_true=50)


class EquipmentFactory(BaseFactory):

    class Meta:
        model = app_models.Equipment

    description = factory.Faker('sentence', nb_words=100)
    quantity = factory.Faker('pyint', min_value=1, max_value=50)
    capacity = factory.Faker('sentence', nb_words=6)


class ActivitySummaryBaseFactory(BaseFactory):

    class Meta:
        model = app_models.ActivitySummaryBase

    class Params:
        now_application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute('now_application.now_application_id')

    reclamation_description = factory.Faker('sentence', nb_words=40, variable_nb_words=True)
    reclamation_cost = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=500000)
    total_disturbed_area = factory.Faker('pydecimal', positive=True, max_value=500000)
    total_disturbed_area_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)


class ActivityDetailBaseFactory(BaseFactory):

    class Meta:
        model = app_models.ActivityDetailBase

    activity_type_description = factory.Faker('sentence', nb_words=40, variable_nb_words=True)
    disturbed_area = factory.Faker('pydecimal', positive=True, max_value=500000)
    timber_volume = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=500000)
    number_of_sites = factory.Faker('pyint', min_value=1, max_value=50)
    width = factory.Faker('pyint', min_value=1, max_value=5000)
    length = factory.Faker('pyint', min_value=1, max_value=5000)
    depth = factory.Faker('pyint', min_value=1, max_value=5000)
    height = factory.Faker('pyint', min_value=1, max_value=5000)
    quantity = factory.Faker('pyint', min_value=1, max_value=50)
    incline = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=500000)
    incline_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)
    cut_line_length = factory.Faker('pyint', min_value=1, max_value=5000)
    water_quantity = factory.Faker('pyint', min_value=1, max_value=5000)
    water_quantity_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)

    @factory.post_generation
    def equipment(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        EquipmentFactory.create_batch(size=extracted, **kwargs)


class CampDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.CampDetail


class CampFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.Camp

    health_authority_notified = factory.Faker('boolean', chance_of_getting_true=50)
    health_authority_consent = factory.Faker('boolean', chance_of_getting_true=50)
    has_fuel_stored = factory.Faker('boolean', chance_of_getting_true=50)
    has_fuel_stored_in_bulk = factory.Faker('boolean', chance_of_getting_true=50)
    has_fuel_stored_in_barrels = factory.Faker('boolean', chance_of_getting_true=50)
    volume_fuel_stored = factory.Faker('pyint', min_value=1, max_value=9999)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        CampDetailFactory.create_batch(size=extracted, **kwargs)


class CutLinesPolarizationSurveyDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.CutLinesPolarizationSurveyDetail


class CutLinesPolarizationSurveyFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.CutLinesPolarizationSurvey

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        CutLinesPolarizationSurveyDetailFactory.create_batch(size=extracted, **kwargs)


class ExplorationSurfaceDrillingFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.ExplorationSurfaceDrilling

    reclamation_core_storage = factory.Faker('sentence', nb_words=6, variable_nb_words=True)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ExplorationSurfaceDrillingDetailFactory.create_batch(size=extracted, **kwargs)


class ExplorationSurfaceDrillingDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.ExplorationSurfaceDrillingDetail


class MechanicalTrenchingFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.MechanicalTrenching

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        MechanicalTrenchingDetailFactory.create_batch(size=extracted, **kwargs)


class MechanicalTrenchingDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.MechanicalTrenchingDetail


class PlacerOperationFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.PlacerOperation

    is_underground = factory.Faker('boolean', chance_of_getting_true=50)
    is_hand_operation = factory.Faker('boolean', chance_of_getting_true=50)
    has_stream_diversion = factory.Faker('boolean', chance_of_getting_true=50)
    reclamation_area = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=500000)
    reclamation_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        PlacerOperationDetailFactory.create_batch(size=extracted, **kwargs)


class PlacerOperationDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.PlacerOperationDetail


class SandGravelQuarryOperationFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.SandGravelQuarryOperation

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        SandGravelQuarryOperationDetailFactory.create_batch(size=extracted, **kwargs)


class SandGravelQuarryOperationDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.SandGravelQuarryOperationDetail


class SurfaceBulkFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.SurfaceBulkSample

    processing_method_description = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    handling_instructions = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    drainage_mitigation_description = factory.Faker('sentence', nb_words=50, variable_nb_words=True)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        SurfaceBulkDetailFactory.create_batch(size=extracted, **kwargs)


class SurfaceBulkDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.SurfaceBulkSampleDetail


class WaterSupplyFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.WaterSupply

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        WaterSupplyDetailFactory.create_batch(size=extracted, **kwargs)


class WaterSupplyDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.WaterSupplyDetail

    supply_source_description = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    supply_source_type = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    water_use_description = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    estimate_rate = factory.Faker('pydecimal', right_digits=7, positive=True, max_value=500000)
    pump_size = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=500000)
    intake_location = factory.Faker('sentence', nb_words=50, variable_nb_words=True)


class ExplorationAccessFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.ExplorationAccess

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ExplorationAccessDetailFactory.create_batch(size=extracted, **kwargs)


class ExplorationAccessDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.ExplorationAccessDetail


class SettlingPondFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.SettlingPond

    proponent_pond_name = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    is_ponds_exfiltrated = factory.Faker('boolean', chance_of_getting_true=50)
    is_ponds_recycled = factory.Faker('boolean', chance_of_getting_true=50)
    is_ponds_discharged = factory.Faker('boolean', chance_of_getting_true=50)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        SettlingPondDetailFactory.create_batch(size=extracted, **kwargs)


class SettlingPondDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.SettlingPondDetail

    water_source_description = factory.Faker('sentence', nb_words=50, variable_nb_words=True)
    construction_plan = factory.Faker('sentence', nb_words=50, variable_nb_words=True)


class UndergroundExplorationFactory(ActivitySummaryBaseFactory):

    class Meta:
        model = app_models.UndergroundExploration

    total_ore_amount = factory.Faker('pyint', min_value=1, max_value=9999)
    total_ore_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)
    total_waste_amount = factory.Faker('pyint', min_value=1, max_value=9999)
    total_waste_unit_type_code = factory.LazyFunction(RandomUnitTypeCode)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        UndergroundExplorationDetailFactory.create_batch(size=extracted, **kwargs)


class UndergroundExplorationDetailFactory(ActivityDetailBaseFactory):

    class Meta:
        model = app_models.UndergroundExplorationDetail

    underground_exploration_type_code = factory.LazyFunction(RandomUndergroundExplorationTypeCode)


class NOWApplicationProgressFactory(BaseFactory):

    class Meta:
        model = app_models.NOWApplicationProgress

    class Params:
        now_application = factory.SubFactory('tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute('now_application.now_application_id')
    application_progress_status_code = 'REV'
    start_date = factory.Faker('past_datetime')
    created_by = factory.Faker('company')
    active_ind = True


class NOWApplicationDelayFactory(BaseFactory):

    class Meta:
        model = app_models.NOWApplicationDelay

    class Params:
        now_application = factory.SubFactory('tests.factories.NOWApplicationIdentityFactory')

    now_application_guid = factory.SelfAttribute('now_application.now_application_guid')
    delay_type_code = 'OAB'
    start_date = factory.Faker('past_datetime')
    start_comment = factory.Faker('name')
    end_comment = factory.Faker('name')


class NOWApplicationReviewFactory(BaseFactory):

    class Meta:
        model = app_models.NOWApplicationReview

    now_application_id = factory.SelfAttribute('now_application.now_application_id')
    now_application_review_type_code = factory.LazyFunction(RandomNOWReviewCode)
    response_date = factory.Faker('past_datetime')
    referee_name = factory.Faker('name')


class NOWApplicationFactory(BaseFactory):

    class Meta:
        model = app_models.NOWApplication

    class Params:
        lead_inspector = factory.SubFactory('tests.factories.PartyBusinessRoleFactory')
        issuing_inspector = factory.SubFactory('tests.factories.PartyBusinessRoleFactory')

    application_progress = factory.RelatedFactory(NOWApplicationProgressFactory, 'now_application')
    lead_inspector_party_guid = factory.SelfAttribute('lead_inspector.party.party_guid')
    issuing_inspector_party_guid = factory.SelfAttribute('issuing_inspector.party.party_guid')
    now_tracking_number = factory.fuzzy.FuzzyInteger(1, 100)
    proponent_submitted_permit_number = factory.Sequence(lambda n: str(n))
    ats_authorization_number = factory.fuzzy.FuzzyInteger(1, 10000)
    unreclaimed_disturbance_previous_year = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=10000)
    disturbance_planned_reclamation = factory.Faker('pydecimal', right_digits=2, positive=True, max_value=10000)
    ats_project_number = factory.fuzzy.FuzzyInteger(1, 10000)
    other_information = factory.Faker('sentence', nb_words=250, variable_nb_words=True)
    original_start_date = factory.Faker('past_datetime')
    type_of_application = factory.LazyFunction(RandomApplicationType)
    notice_of_work_type_code = factory.LazyFunction(RandomNOWTypeCode)
    now_application_status_code = "REC"
    previous_application_status_code = "PEV"
    submitted_date = factory.Faker('past_datetime')
    received_date = factory.Faker('past_datetime')
    # or factory.fuzzy.FuzzyFloat(49, 60) for ~ inside BC
    latitude = factory.Faker('latitude')
    # or factory.fuzzy.FuzzyFloat(-132, -114.7) for ~ BC
    longitude = factory.Faker('longitude')
    property_name = factory.Faker('company')
    tenure_number = factory.Sequence(lambda n: str(n))
    description_of_land = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    proposed_start_date = factory.Faker('past_datetime')
    last_updated_date = datetime.utcnow()
    proposed_end_date = factory.Faker('past_datetime')
    directions_to_site = factory.Faker('sentence', nb_words=5, variable_nb_words=True)
    security_not_required_reason = factory.Faker('sentence', nb_words=5, variable_nb_words=True)
    security_not_required = True
    imported_by = factory.Faker('sentence', nb_words=5, variable_nb_words=True)
    imported_date = factory.Faker('past_datetime')
    annual_summary_submitted = False
    is_first_year_of_multi = False
    verified_by_user_date = factory.Faker('past_datetime')
    req_access_authorization_numbers = factory.Faker('sentence', nb_words=5, variable_nb_words=True)
    relationship_to_applicant = factory.Faker('sentence', nb_words=5, variable_nb_words=True)
    liability_adjustment = factory.fuzzy.FuzzyInteger(1, 10000)
    crown_grant_or_district_lot_numbers = factory.Faker(
        'sentence', nb_words=5, variable_nb_words=True)
    adjusted_annual_maximum_tonnage = factory.fuzzy.FuzzyInteger(1, 10000)

    blasting_operation = factory.RelatedFactory(BlastingOperationFactory, 'now_application')
    state_of_land = factory.RelatedFactory(StateOfLandFactory, 'now_application')
    camp = factory.RelatedFactory(CampFactory, 'now_application')
    cut_lines_polarization_survey = factory.RelatedFactory(CutLinesPolarizationSurveyFactory,
                                                           'now_application')
    exploration_surface_drilling = factory.RelatedFactory(ExplorationSurfaceDrillingFactory,
                                                          'now_application')
    mechanical_trenching = factory.RelatedFactory(MechanicalTrenchingFactory, 'now_application')
    placer_operation = factory.RelatedFactory(PlacerOperationFactory, 'now_application')
    sand_gravel_quarry_operation = factory.RelatedFactory(SandGravelQuarryOperationFactory,
                                                          'now_application')
    surface_bulk_sample = factory.RelatedFactory(SurfaceBulkFactory, 'now_application')
    water_supply = factory.RelatedFactory(WaterSupplyFactory, 'now_application')
    exploration_access = factory.RelatedFactory(ExplorationAccessFactory, 'now_application')
    settling_pond = factory.RelatedFactory(SettlingPondFactory, 'now_application')
    underground_exploration = factory.RelatedFactory(UndergroundExplorationFactory,
                                                     'now_application')

    @factory.post_generation
    def reviews(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        NOWApplicationReviewFactory.create_batch(size=extracted, now_application=obj, **kwargs)


class NOWApplicationIdentityFactory(BaseFactory):

    class Meta:
        model = app_models.NOWApplicationIdentity

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory')
        submission_only = factory.Trait(
            now_application=None,
            now_application_id=None,
            mms_cid=None,
            application_type_code="NOW")

    now_application_guid = GUID
    application_type_code = None
    now_application_id = factory.SelfAttribute('now_application.now_application_id')
    messageid = factory.SelfAttribute('now_submission.messageid')
    mms_cid = factory.Sequence(lambda n: n)
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    # TODO: Create a value that adheres to the actual structure of a NoW number
    now_number = factory.Sequence(lambda n: n)

    now_application = factory.SubFactory('tests.now_application_factories.NOWApplicationFactory')

    now_submission = factory.SubFactory(NOWSubmissionFactory, mine=factory.SelfAttribute('..mine'))

    # TODO check if we have anything dependent on it and if we need this
    # @factory.post_generation
    # def application_delays(obj, create, extracted, **kwargs):
    #     if not create:
    #         return

    #     if not isinstance(extracted, int):
    #         extracted = 1

    #     NOWApplicationDelayFactory.create_batch(size=extracted, now_application=obj, **kwargs)