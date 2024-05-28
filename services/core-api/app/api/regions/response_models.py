from flask_restx import fields

from app.extensions import api

REGION = api.model(
    'Region', {
        'name': fields.String,
        'regional_district_id': fields.Integer,
    })
