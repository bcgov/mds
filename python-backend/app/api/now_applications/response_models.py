import uuid
import simplejson
import sqlalchemy as sa
from decimal import Decimal
from app.extensions import api, db               #
                                                 #from flask_restplus import fields
from marshmallow_sqlalchemy import ModelSchema, ModelConverter
from marshmallow import fields
from geoalchemy2 import Geometry
                                                 #from flask_restplus import fields

from .models import *


class CoreConverter(ModelConverter):
    SQLA_TYPE_MAPPING = ModelConverter.SQLA_TYPE_MAPPING.copy()
    SQLA_TYPE_MAPPING.update({Geometry: fields.String, sa.Numeric: fields.Number})


class BaseMeta:
    ordered = True
    sqla_session = db.session
    model_converter = CoreConverter
    exclude = ('create_user', 'create_timestamp', 'update_user', 'update_timestamp')


class NOWApplicationSurfaceDrillingDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrillingDetail

    activity_type_code = fields.String(dump_only=True)


class NOWExplorationSurfaceDrillingSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrilling

    details = fields.Nested(NOWApplicationSurfaceDrillingDetailSchema, many=True)


class NOWApplicationSchema(ModelSchema):
    class Meta(BaseMeta):
        model = NOWApplication

    exploration_surface_drilling = fields.Nested(NOWExplorationSurfaceDrillingSchema)


# class DateTime(fields.DateTime):
#     def format(self, value):
#         return value.strftime("%Y-%m-%d %H:%M") if value else None

#     __schema_example__ = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

# class Date(fields.DateTime):
#     def format(self, value):
#         return value.strftime("%Y-%m-%d") if value else None

#     __schema_example__ = datetime.datetime.now().strftime("%Y-%m-%d")

# class NullableString(fields.String):
#     __schema_type__ = ['string', 'null']
#     __schema_example__ = 'nullable string'

# class UnitTypeCodeString(fields.String):
#     __schema_example__ = ['MTN', 'MEC', 'HA', 'DEG', 'PER', 'MTR']

# NOW_APPLICATION_ACTIVITY_DETAIL_BASE = api.model('NOWApplicationActivityDetailBase',
#     {
#         'activity_type_description': fields.String,
#         'disturbed_area': fields.Fixed,
#         'timber_volume': fields.Fixed,
#         'number_of_sites': fields.Integer,
#         'width': fields.Integer,
#         'length'  : fields.Integer,
#         'depth': fields.Integer,
#         'height': fields.Integer,
#         'quantity': fields.Integer,
#         'incline': fields.Fixed,
#         'incline_unit_type_code': UnitTypeCodeString,
#         'cut_line_length' : fields.Integer,
#         'water_quantity' : fields.Integer,
#         'water_quantity_unit_type_code': UnitTypeCodeString,
#     }
# )

# NOW_APPLICATION_ACTIVITY_SUMMARY_BASE = api.model(
#     'NOWApplicationActivitySummaryBase', {
#         'reclamation_description': fields.String,
#         'reclamation_cost': fields.Fixed(example='20000.00'),
#         'total_disturbed_area': fields.Fixed,
#         'total_disturbed_area_unit_type_code': UnitTypeCodeString,
#     })

# NOW_APPLICATION_CAMP = api.inherit(
#     'NOWApplicationCamp', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
#         'camp_name': fields.String,
#         'camp_number_people': fields.Fixed,
#         'camp_number_structures': fields.Fixed,
#         'has_fuel_stored': fields.Boolean,
#         'has_fuel_stored_in_bulk': fields.Boolean,
#         'has_fuel_stored_in_barrels': fields.Boolean,
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

#     })

# NOW_APPLICATION_CUT_LINES = api.inherit(
#     'NOWApplicationCutLines',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
#     })

# NOW_APPLICATION_EXP_ACCESS = api.inherit(
#     'NOWApplicationExplorationAccess',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
#     })

# NOW_APPLICATION_EXP_SURFACE_DRILL = api.inherit('NOWApplicationExpSurfaceDrill',
#                                                 NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#                                                 {'reclamation_core_storage': fields.String})

# NOW_APPLICATION_MECH_TRENCHING = api.inherit(
#     'NOWApplicationMechTrenching',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
#     })

# NOW_APPLICATION_PLACER_OPS = api.inherit(
#     'NOWApplicationPlacerOperations', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
#         'is_underground': fields.Boolean,
#         'is_hand_operation': fields.Boolean,
#         'reclamation_area': fields.Fixed,
#         'reclamation_unit_type_code': fields.String,
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

#     })

# NOW_APPLICATION_SAND_AND_GRAVEL = api.inherit(
#     'NOWApplicationSandAndGravel',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'average_overburden_depth': fields.Fixed,
#         'average_top_soil_depth': fields.Fixed,
#         'stability_measures_description': fields.String,
#         'is_agricultural_land_reserve': fields.String,
#         'agri_lnd_rsrv_permit_application_number': fields.String,
#         'has_local_soil_removal_bylaw': fields.Boolean,
#         'community_plan': fields.String,
#         'land_use_zoning': fields.String,
#         'proposed_land_use': fields.String,
#         'total_mineable_reserves': fields.Integer,
#         'total_mineable_reserves_unit_type_code': fields.String,
#         'total_annual_extraction': fields.Integer,
#         'total_annual_extraction_unit_type_code': fields.String,
#         'average_groundwater_depth': fields.Fixed,
#         'has_groundwater_from_existing_area': fields.Boolean,
#         'has_groundwater_from_test_pits': fields.Boolean,
#         'has_groundwater_from_test_wells': fields.Boolean,
#         'groundwater_from_other_description': fields.String,
#         'groundwater_protection_plan': fields.String,
#         'nearest_residence_distance': fields.Integer,
#         'nearest_residence_distance_unit_type_code': fields.String,
#         'nearest_water_source_distance': fields.Integer,
#         'nearest_water_source_distance_unit_type_code': fields.String,
#         'noise_impact_plan': fields.String,
#         'secure_access_plan': fields.String,
#         'dust_impact_plan': fields.String,
#         'visual_impact_plan': fields.String,
#         'reclamation_backfill_detail': fields.String,
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

#     })
# NOW_APPLICATION_SETTLING_POND_DETAIL = api.inherit(
#     'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
#         'water_source_description': fields.String,
#         'construction_plan': fields.String
#     }
# )

# NOW_APPLICATION_SETTLING_POND = api.inherit(
#     'NOWApplicationSettlingPond',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'proponent_pond_name': fields.String,
#         'is_ponds_exfiltrated': fields.Boolean,
#         'is_ponds_recycled': fields.Boolean,
#         'is_ponds_discharged': fields.Boolean,
#         'details': fields.List(fields.Nested(NOW_APPLICATION_SETTLING_POND_DETAIL,skip_none=True))
#     })

# NOW_APPLICATION_SURFACE_BULK = api.inherit(
#     'NOWApplicationSurfaceBulkSample',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'processing_method_description': fields.String,
#         'handling_instructions': fields.String,
#         'drainage_mitigation_description': fields.String,
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))

#     })

# NOW_APPLICATION_UNDERGROUND_EXPLORATION_DETAIL = api.inherit(
#     'NOWApplicationCampDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
#         'underground_exploration_type_code': fields.String,
#     }
# )

# NOW_APPLICATION_UNDERGROUND_EXPLORATION = api.inherit(
#     'NOWApplicationUndergroundExploration',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'details': fields.List(fields.Nested(NOW_APPLICATION_ACTIVITY_DETAIL_BASE,skip_none=True))
#     })

# NOW_APPLICATION_WATER_SUPPLY_DETAIL = api.inherit(
#     'NOWApplicationWaterSupplyDetail', NOW_APPLICATION_ACTIVITY_DETAIL_BASE,{
#         'supply_source_description': fields.String,
#         'supply_source_type': fields.String,
#         'water_use_description': fields.String,
#         'estimate_rate': fields.Fixed,
#         'pump_size': fields.Fixed,
#         'intake_location': fields.String
#     }
# )

# NOW_APPLICATION_WATER_SUPPLY = api.inherit(
#     'NOWApplicationWaterSupply',
#     NOW_APPLICATION_ACTIVITY_SUMMARY_BASE,
#     {
#         'details': fields.List(fields.Nested(NOW_APPLICATION_WATER_SUPPLY_DETAIL,skip_none=True))
#     })

# NOW_APPLICATION_MODEL = api.model(
#     'NOWApplication',
#     {
#         'now_application_guid': fields.String(required=True, example=str(uuid.uuid4())),
#         'mine_guid': fields.String(required=True, example=str(uuid.uuid4())),
#         'imported_to_core': fields.Boolean(readonly=True),                           #Just-in-time attribute
#         'now_message_id': fields.Integer(required=True),
#         'notice_of_work_type_code':
#         fields.String(example=['QCA', 'COL', 'PLA', 'MIN', 'SAG', 'QIM'], required=True),
#         'now_application_status_code': fields.String(example=['ACC', 'WDN', 'UNR']),
#         'submitted_date': Date(required=True),
#         'received_date': Date(required=True),
#         'latitude': fields.Float(min=-180, max=180),
#         'longitude': fields.Float(min=-180, max=180),
#         'property_name': fields.String,
#         'tenure_number': fields.String,
#         'description_of_land': NullableString,
#         'proposed_start_date': Date(min=datetime.datetime.now()),
#         'proposed_end_date': Date,
#         'camps': fields.Nested(NOW_APPLICATION_CAMP, skip_none=True),
#         'cut_lines_polarization_survey': fields.Nested(NOW_APPLICATION_CUT_LINES, skip_none=True),
#         'exploration_access': fields.Nested(NOW_APPLICATION_EXP_ACCESS, skip_none=True),
#         'exploration_surface_drilling': fields.Nested(NOW_APPLICATION_EXP_SURFACE_DRILL, skip_none=True),
#         'mechanical_trenching': fields.Nested(NOW_APPLICATION_MECH_TRENCHING, skip_none=True),
#         'placer_operation': fields.Nested(NOW_APPLICATION_PLACER_OPS, skip_none=True),
#         'sand_and_gravel': fields.Nested(NOW_APPLICATION_SAND_AND_GRAVEL, skip_none=True),
#         'settling_pond': fields.Nested(NOW_APPLICATION_SETTLING_POND, skip_none=True),
#         'surface_bulk_sample': fields.Nested(NOW_APPLICATION_SURFACE_BULK, skip_none=True),
#         'underground_exploration': fields.Nested(NOW_APPLICATION_UNDERGROUND_EXPLORATION, skip_none=True),
#         'water_supply': fields.Nested(NOW_APPLICATION_WATER_SUPPLY, skip_none=True)
#     })
