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


class NOWApplicationCampDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = CampDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationCampSchema(ModelSchema):
    class Meta(BaseMeta):
        model = Camp

    details = fields.Nested(NOWApplicationCampDetailSchema, many=True)


class NOWApplicationCutLinesPolarizationSurveyDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = CutLinesPolarizationSurveyDetail

    activity_type_code = fields.String(dump_only=True)


class NOWExplorationCutLinesPolarizationSurveySchema(ModelSchema):
    class Meta(BaseMeta):
        model = CutLinesPolarizationSurvey

    details = fields.Nested(NOWApplicationCutLinesPolarizationSurveyDetailSchema, many=True)


class NOWApplicationExplorationSurfaceDrillingDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrillingDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationExplorationSurfaceDrillingSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrilling

    details = fields.Nested(NOWApplicationExplorationSurfaceDrillingDetailSchema, many=True)


class NOWApplicationExplorationAccessDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrillingDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationExplorationAccessSchema(ModelSchema):
    class Meta(BaseMeta):
        model = ExplorationAccess

    details = fields.Nested(NOWApplicationExplorationAccessDetailSchema, many=True)


class NOWApplicatioMechanicalTrenchingDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = MechanicalTrenchingDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationMechanicalTrenchingSchema(ModelSchema):
    class Meta(BaseMeta):
        model = MechanicalTrenching

    details = fields.Nested(NOWApplicatioMechanicalTrenchingDetailSchema, many=True)


class NOWApplicationPlacerOperationDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = PlacerOperationDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationPlacerOperationSchema(ModelSchema):
    class Meta(BaseMeta):
        model = PlacerOperation

    details = fields.Nested(NOWApplicationPlacerOperationDetailSchema, many=True)


class NOWApplicationSandGravelQuarryOperationDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SandGravelQuarryOperationDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationSandGravelQuarryOperationSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SandGravelQuarryOperation

    details = fields.Nested(NOWApplicationSandGravelQuarryOperationDetailSchema, many=True)


class NOWApplicationSurfaceBulkSampleDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SurfaceBulkSampleDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationSurfaceBulkSampleSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SurfaceBulkSample

    details = fields.Nested(NOWApplicationSurfaceBulkSampleDetailSchema, many=True)


class NOWApplicationWaterSupplyDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = WaterSupplyDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationWaterSupplySchema(ModelSchema):
    class Meta(BaseMeta):
        model = WaterSupply

    details = fields.Nested(NOWApplicationWaterSupplyDetailSchema, many=True)


class NOWApplicationSettlingPondDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SettlingPondDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationSettlingPondSchema(ModelSchema):
    class Meta(BaseMeta):
        model = SettlingPond

    details = fields.Nested(NOWApplicationSettlingPondDetailSchema, many=True)


class NOWApplicationUndergroundExplorationDetailSchema(ModelSchema):
    class Meta(BaseMeta):
        model = UndergroundExplorationDetail

    activity_type_code = fields.String(dump_only=True)


class NOWApplicationUndergroundExplorationSchema(ModelSchema):
    class Meta(BaseMeta):
        model = UndergroundExploration

    details = fields.Nested(NOWApplicationUndergroundExplorationDetailSchema, many=True)


class NOWApplicationSchema(ModelSchema):
    class Meta(BaseMeta):
        model = NOWApplication

    camps = fields.Nested(NOWApplicationCampSchema)
    cut_lines_polarization_survey = fields.Nested(NOWExplorationCutLinesPolarizationSurveySchema)
    exploration_surface_drilling = fields.Nested(NOWApplicationExplorationSurfaceDrillingSchema)
    exploration_access = fields.Nested(NOWApplicationExplorationAccessSchema)
    mechanical_trenching = fields.Nested(NOWApplicationMechanicalTrenchingSchema)
    placer_operation = fields.Nested(NOWApplicationPlacerOperationSchema)
    sand_and_gravel = fields.Nested(NOWApplicationSandGravelQuarryOperationSchema)
    settling_pond = fields.Nested(NOWApplicationSettlingPondSchema)
    surface_bulk_sample = fields.Nested(NOWApplicationSurfaceBulkSampleSchema)
    underground_exploration = fields.Nested(NOWApplicationUndergroundExplorationSchema)
    water_supply = fields.Nested(NOWApplicationWaterSupplySchema)
