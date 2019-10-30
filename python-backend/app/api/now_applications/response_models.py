from app.extensions import api
from flask_restplus import fields


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


NOW_APPLICATION_MODEL = api.model(
    'NOWApplication',
    {
        'now_application_guid': fields.String,
        'mine_guid': fields.String,
        'now_message_id': fields.String,
        'notice_of_work_type_code': fields.String,                        ## code
        'now_application_status_code': fields.String,                     ##code
        'submitted_date': Date,
        'received_date': Date,
        'now_application_guid': fields.String,
        'latitude': fields.Fixed,
        'longitude': fields.Fixed,
        'property_name': fields.String,
        'tenure_number': fields.String,
        'latitude': fields.String,
        'description_of_land': fields.String,
        'proposed_start_date': Date,
        'proposed_end_date': Date,
    })
