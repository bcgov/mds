from flask_restplus import fields

from app.api.dams.models.dam import DamType, OperatingStatus, ConsequenceClassification
from app.extensions import api

DAM_MODEL = api.model('Dam', {
    'mine_tailings_storage_facility_guid': fields.String,
    'dam_type': fields.String(enum=DamType, attribute='dam_type.name'),
    'dam_name': fields.String,
    'latitude': fields.Fixed(decimals=7),
    'longitude': fields.Fixed(decimals=7),
    'operating_status': fields.String(enum=OperatingStatus, attribute='operating_status.name'),
    'consequence_classification': fields.String(enum=ConsequenceClassification, attribute='consequence_classification.name'),
    'permitted_dam_crest_elevation': fields.Fixed(decimals=2),
    'current_dam_height': fields.Fixed(decimals=2),
    'current_elevation': fields.Fixed(decimals=2),
    'max_pond_elevation': fields.Fixed(decimals=2),
    'min_freeboard_required': fields.Fixed(decimals=2),
})

DAM_MODEL_LIST = api.model('DamList', {
    'records': fields.List(fields.Nested(DAM_MODEL)),
    'total': fields.Integer,
})

CREATE_DAM_MODEL = api.model('Dam', {
    'mine_tailings_storage_facility_guid': fields.String,
    'dam_type': fields.String,
    'dam_name': fields.String,
    'latitude': fields.String,
    'longitude': fields.String,
    'operating_status': fields.String,
    'consequence_classification': fields.String,
    'permitted_dam_crest_elevation': fields.String,
    'current_dam_height': fields.String,
    'current_elevation': fields.String,
    'max_pond_elevation': fields.String,
    'min_freeboard_required': fields.String
})
