import uuid
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy
from app.extensions import db
from tests.factories import *

from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models

SEQUENCE = factory.Sequence(lambda n: n)


class BlastingOperationFactory(BaseFactory):
    class Meta:
        model = app_models.BlastingOperation

    class Params:
        now_application = factory.SubFactory(
            'tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute(
        'now_application.now_application_id')
    has_storage_explosive_on_site = factory.Faker('boolean',
                                                  chance_of_getting_true=50)
    explosive_permit_issued = factory.Faker('boolean',
                                            chance_of_getting_true=50)
    explosive_permit_number = factory.Sequence(lambda n: n)
    explosive_permit_expiry_date = factory.Faker('future_datetime',
                                                 end_date='+30d')


class StateOfLandFactory(BaseFactory):
    class Meta:
        model = app_models.StateOfLand

    class Params:
        now_application = factory.SubFactory(
            'tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute(
        'now_application.now_application_id')
    has_community_water_shed = factory.Faker('boolean',
                                             chance_of_getting_true=50)
    has_archaeology_sites_affected = factory.Faker('boolean',
                                                   chance_of_getting_true=50)


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
        now_application = factory.SubFactory(
            'tests.factories.NOWApplicationFactory')

    now_application_id = factory.SelfAttribute(
        'now_application.now_application_id')
    #activity_summary_id = SEQUENCE

    reclamation_description = factory.Faker('sentence',
                                            nb_words=40,
                                            variable_nb_words=True)
    reclamation_cost = factory.Faker('pydecimal',
                                     right_digits=2,
                                     positive=True,
                                     max_value=500000)
    total_disturbed_area = factory.Faker('pydecimal',
                                         right_digits=2,
                                         positive=True,
                                         max_value=500000)
    total_disturbed_area_unit_type_code = factory.LazyFunction(
        RandomUnitTypeCode)


class ActivityDetailBaseFactory(BaseFactory):
    class Meta:
        model = app_models.ActivityDetailBase

    activity_type_description = factory.Faker('sentence',
                                              nb_words=40,
                                              variable_nb_words=True)
    disturbed_area = factory.Faker('pydecimal',
                                   right_digits=2,
                                   positive=True,
                                   max_value=500000)
    timber_volume = factory.Faker('pydecimal',
                                  right_digits=2,
                                  positive=True,
                                  max_value=500000)
    number_of_sites = factory.Faker('pyint', min_value=1, max_value=50)
    width = factory.Faker('pyint', min_value=1, max_value=5000)
    length = factory.Faker('pyint', min_value=1, max_value=5000)
    depth = factory.Faker('pyint', min_value=1, max_value=5000)
    height = factory.Faker('pyint', min_value=1, max_value=5000)
    quantity = factory.Faker('pyint', min_value=1, max_value=50)
    incline = factory.Faker('pydecimal',
                            right_digits=2,
                            positive=True,
                            max_value=500000)
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

    camp_name = factory.Faker('sentence', nb_words=6, variable_nb_words=True)
    camp_number_people = factory.Faker('pyint', min_value=1, max_value=500)
    camp_number_structures = factory.Faker('pyint', min_value=1, max_value=50)
    has_fuel_stored = factory.Faker('boolean', chance_of_getting_true=50)
    has_fuel_stored_in_bulk = factory.Faker('boolean',
                                            chance_of_getting_true=50)
    has_fuel_stored_in_barrels = factory.Faker('boolean',
                                               chance_of_getting_true=50)
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

        CutLinesPolarizationSurveyDetailFactory.create_batch(size=extracted,
                                                             **kwargs)


class ExplorationSurfaceDrillingFactory(ActivitySummaryBaseFactory):
    class Meta:
        model = app_models.ExplorationSurfaceDrilling

    reclamation_core_storage = factory.Faker('boolean',
                                             chance_of_getting_true=50)

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        ExplorationSurfaceDrillingDetailFactory.create_batch(size=extracted,
                                                             **kwargs)


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
    reclamation_area = factory.Faker('pydecimal',
                                     right_digits=2,
                                     positive=True,
                                     max_value=500000)
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


class SandAndGravelFactory(ActivitySummaryBaseFactory):
    class Meta:
        model = app_models.SandGravelQuarryOperation

    @factory.post_generation
    def details(obj, create, extracted, **kwargs):
        if not create:
            return

        if not isinstance(extracted, int):
            extracted = 1

        SandAndGravelDetailFactory.create_batch(size=extracted, **kwargs)


class SandAndGravelDetailFactory(ActivityDetailBaseFactory):
    class Meta:
        model = app_models.SandGravelQuarryOperationDetail


class SurfaceBulkFactory(ActivitySummaryBaseFactory):
    class Meta:
        model = app_models.SurfaceBulkSample

    processing_method_description = factory.Faker('sentence',
                                                  nb_words=50,
                                                  variable_nb_words=True)
    handling_instructions = factory.Faker('sentence',
                                          nb_words=50,
                                          variable_nb_words=True)
    drainage_mitigation_description = factory.Faker('sentence',
                                                    nb_words=50,
                                                    variable_nb_words=True)

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

    supply_source_description = factory.Faker('sentence',
                                              nb_words=50,
                                              variable_nb_words=True)
    supply_source_type = factory.Faker('sentence',
                                       nb_words=50,
                                       variable_nb_words=True)
    water_use_description = factory.Faker('sentence',
                                          nb_words=50,
                                          variable_nb_words=True)
    estimate_rate = factory.Faker('pydecimal',
                                  right_digits=2,
                                  positive=True,
                                  max_value=500000)
    pump_size = factory.Faker('pydecimal',
                              right_digits=2,
                              positive=True,
                              max_value=500000)
    intake_location = factory.Faker('sentence',
                                    nb_words=50,
                                    variable_nb_words=True)


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

    proponent_pond_name = factory.Faker('sentence',
                                        nb_words=6,
                                        variable_nb_words=True)
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

    water_source_description = factory.Faker('sentence',
                                             nb_words=50,
                                             variable_nb_words=True)
    construction_plan = factory.Faker('sentence',
                                      nb_words=50,
                                      variable_nb_words=True)


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

        UndergroundExplorationDetailFactory.create_batch(size=extracted,
                                                         **kwargs)


class UndergroundExplorationDetailFactory(ActivityDetailBaseFactory):
    class Meta:
        model = app_models.UndergroundExplorationDetail

    underground_exploration_type_code = factory.LazyFunction(
        RandomUndergroundExplorationTypeCode)


class NOWApplicationFactory(BaseFactory):
    class Meta:
        model = app_models.NOWApplication\


#    now_application_id = factory.Sequence(lambda n: n)

    now_tracking_number = factory.fuzzy.FuzzyInteger(1, 100)
    notice_of_work_type_code = factory.LazyFunction(RandomNOWTypeCode)
    now_application_status_code = factory.LazyFunction(RandomNOWStatusCode)
    submitted_date = factory.Faker('past_datetime')
    received_date = factory.Faker('past_datetime')
    latitude = factory.Faker(
        'latitude')  # or factory.fuzzy.FuzzyFloat(49, 60) for ~ inside BC
    longitude = factory.Faker(
        'longitude')  # or factory.fuzzy.FuzzyFloat(-132, -114.7) for ~ BC
    property_name = factory.Faker('company')
    tenure_number = str(factory.Sequence(lambda n: n))
    description_of_land = factory.Faker('sentence',
                                        nb_words=6,
                                        variable_nb_words=True)
    proposed_start_date = factory.Faker('past_datetime')
    proposed_end_date = factory.Faker('past_datetime')

    blasting = factory.RelatedFactory(BlastingOperationFactory,
                                      'now_application')
    state_of_land = factory.RelatedFactory(StateOfLandFactory,
                                           'now_application')

    # Activities
    camps = factory.RelatedFactory(CampFactory, 'now_application')
    cut_lines_polarization_survey = factory.RelatedFactory(
        CutLinesPolarizationSurveyFactory, 'now_application')
    exploration_surface_drilling = factory.RelatedFactory(
        ExplorationSurfaceDrillingFactory, 'now_application')
    mechanical_trenching = factory.RelatedFactory(MechanicalTrenchingFactory,
                                                  'now_application')
    placer_operation = factory.RelatedFactory(PlacerOperationFactory,
                                              'now_application')
    sand_and_gravel = factory.RelatedFactory(SandAndGravelFactory,
                                             'now_application')
    surface_bulk_sample = factory.RelatedFactory(SurfaceBulkFactory,
                                                 'now_application')
    water_supply = factory.RelatedFactory(WaterSupplyFactory,
                                          'now_application')
    exploration_access = factory.RelatedFactory(ExplorationAccessFactory,
                                                'now_application')
    settling_pond = factory.RelatedFactory(SettlingPondFactory,
                                           'now_application')
    underground_exploration = factory.RelatedFactory(
        UndergroundExplorationFactory, 'now_application')


class NOWApplicationIdentityFactory(BaseFactory):
    class Meta:
        model = app_models.NOWApplicationIdentity

    class Params:
        mine = factory.SubFactory('tests.factories.MineFactory', minimal=True)
        now_application = factory.SubFactory(
            'tests.now_application_factories.NOWApplicationFactory')
        now_submission = factory.SubFactory(
            'tests.now_submission_factories.NOWSubmissionFactory')

    now_application_guid = GUID
    mine_guid = factory.SelfAttribute('mine.mine_guid')
    now_application_id = factory.SelfAttribute(
        'now_application.now_application_id')
    messageid = factory.SelfAttribute('now_submission.messageid')
    mms_cid = factory.Sequence(lambda n: n)