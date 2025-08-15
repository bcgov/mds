from app.extensions import api
from flask_restx import fields

MINE_SWAGGER_PAYLOAD = api.model('MineSwaggerPayload', {
        'mine_name': fields.String(
            required=True,
            description='Name of the mine.'
        ),
        'mine_note': fields.String(
            description='Any additional notes to be added to the mine.'
        ),
        'longitude': fields.String(
            description='Longitude point for the mine.'
        ),
        'latitude': fields.String(
            description='Latitude point for the mine.'
        ),
        'mine_status': fields.String(
            required=True,
            description='Status of the mine, to be given as a comma separated string value. Ex: status_code, status_reason_code, status_sub_reason_code '
        ),
        'status_date': fields.String(
            description='The date when the current status took effect'
        ),
        'major_mine_ind': fields.Boolean(
            description='Indication if mine is major_mine_ind or regional. Accepts "true", "false", "1", "0".'
        ),
        'mine_region': fields.String(
            required=True,
            description='Region for the mine.'
        ),
        'ohsc_ind': fields.Boolean(
            description='Indicates if the mine has an OHSC.'
        ),
        'union_ind': fields.Boolean(
            description='Indicates if the mine has a union.'
        ),
        'government_agency_type_code': fields.String(
            description='Government agency the mine belongs to.'
        ),
        'exemption_fee_status_code': fields.String(
            description='Exemption fee status code.'
        ),
        'exemption_fee_status_note': fields.String(
            description='Exemption fee status note.'
        ),
    })

CREATE_MINE_SWAGGER_PAYLOAD= api.inherit('CreateMineSwaggerPayload', MINE_SWAGGER_PAYLOAD, {
        'work_status': fields.String(
            description='Work status for the mine.'
        )
    })

UPDATE_MINE_SWAGGER_PAYLOAD = api.inherit('UpdateMineSwaggerPayload', MINE_SWAGGER_PAYLOAD, {
        'number_of_contractors': fields.Integer(
            description='Number of contractors.'
        ),
        'number_of_mine_employees': fields.Integer(
            description='Number of mine employees.'
        )
    })