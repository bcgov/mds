import uuid
import sqlalchemy as sa
from sqlalchemy.inspection import inspect
from decimal import Decimal
from app.extensions import api, db               #

#from flask_restplus import fields
from marshmallow_sqlalchemy import ModelSchema, ModelConverter, field_for
from marshmallow import fields, pre_load, post_dump
from geoalchemy2 import Geometry
#from flask_restplus import fields
#from sqlalchemy_utils import
from .models import *


class CoreConverter(ModelConverter):
    SQLA_TYPE_MAPPING = ModelConverter.SQLA_TYPE_MAPPING.copy()
    SQLA_TYPE_MAPPING.update({Geometry: fields.String, sa.Numeric: fields.Number})


class BaseMeta:
    ordered = True
    sqla_session = db.session
    model_converter = CoreConverter
    exclude = ('create_user', 'create_timestamp', 'update_user', 'update_timestamp')


class BaseModelSchema(ModelSchema):
    pass
    # @post_dump
    # def strip_primary_keys(self, data, **kwargs):
    #     for pk in inspect(self.Meta.model).primary_key:
    #         del data[pk.name]
    #         print('removing pk ' + pk.name, flush=True)
    #     #for fk in inspect(self.Meta.model).foreign_keys:
    #     #del data[fk.name]
    #     #   print('removing fk ' + fk.name, flush=True)

    #     return data


class NOWApplicationCampDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = CampDetail

    def __init__():
        exclude.append('now_application_id', 'now_application')

    activity_type_code = fields.String(required=False)


class NOWApplicationCampSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = Camp

    details = fields.Nested(NOWApplicationCampDetailSchema, many=True)


class NOWApplicationCutLinesPolarizationSurveyDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = CutLinesPolarizationSurveyDetail

    activity_type_code = fields.String(required=False)


class NOWExplorationCutLinesPolarizationSurveySchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = CutLinesPolarizationSurvey

    details = fields.Nested(NOWApplicationCutLinesPolarizationSurveyDetailSchema, many=True)


class NOWApplicationExplorationSurfaceDrillingDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrillingDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationExplorationSurfaceDrillingSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrilling

    details = fields.Nested(NOWApplicationExplorationSurfaceDrillingDetailSchema, many=True)


class NOWApplicationExplorationAccessDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = ExplorationSurfaceDrillingDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationExplorationAccessSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = ExplorationAccess

    details = fields.Nested(NOWApplicationExplorationAccessDetailSchema, many=True)


class NOWApplicatioMechanicalTrenchingDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = MechanicalTrenchingDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationMechanicalTrenchingSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = MechanicalTrenching

    details = fields.Nested(NOWApplicatioMechanicalTrenchingDetailSchema, many=True)


class NOWApplicationPlacerOperationDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = PlacerOperationDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationPlacerOperationSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = PlacerOperation

    details = fields.Nested(NOWApplicationPlacerOperationDetailSchema, many=True)


class NOWApplicationSandGravelQuarryOperationDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SandGravelQuarryOperationDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationSandGravelQuarryOperationSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SandGravelQuarryOperation

    details = fields.Nested(NOWApplicationSandGravelQuarryOperationDetailSchema, many=True)


class NOWApplicationSurfaceBulkSampleDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SurfaceBulkSampleDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationSurfaceBulkSampleSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SurfaceBulkSample

    details = fields.Nested(NOWApplicationSurfaceBulkSampleDetailSchema, many=True)


class NOWApplicationWaterSupplyDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = WaterSupplyDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationWaterSupplySchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = WaterSupply

    details = fields.Nested(NOWApplicationWaterSupplyDetailSchema, many=True)


class NOWApplicationSettlingPondDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SettlingPondDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationSettlingPondSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = SettlingPond

    details = fields.Nested(NOWApplicationSettlingPondDetailSchema, many=True)


class NOWApplicationUndergroundExplorationDetailSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = UndergroundExplorationDetail

    activity_type_code = fields.String(required=False)


class NOWApplicationUndergroundExplorationSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = UndergroundExploration

    details = fields.Nested(NOWApplicationUndergroundExplorationDetailSchema, many=True)


class NOWApplicationSchema(BaseModelSchema):
    class Meta(BaseMeta):
        model = NOWApplication

    @pre_load
    def remove_empty_related_models(self, data, **kwargs):
        for key in ('camps', 'cut_lines_polarization_survey', 'exploration_surface_drilling',
                    'exploration_access', 'mechanical_trenching', 'placer_operation',
                    'sand_and_gravel', 'settling_pond', 'surface_bulk_sample',
                    'underground_exploration', 'water_supply'):
            if data[key] is None:
                print('deleting falsy key ' + key, flush=True)
                del data[key]
        return data

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
