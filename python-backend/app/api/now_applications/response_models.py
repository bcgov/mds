from app.extensions import api
from flask_restplus import fields


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


NOW_APPLICATION_ACTIVITY_SUMMARY_BASE = api.model(
    'NOWApplicationActivitySummaryBase', {
        'reclamation_description': fields.String,
        'reclamation_cost': fields.Fixed,
        'total_disturbed_area': fields.Fixed,
        'total_disturbed_area_unit_type_code': fields.String
    })

NOW_APPLICATION_CAMP = api.inherit(
    'NOWApplicationCamp', NOW_APPLICATION_ACTIVITY_SUMMARY_BASE, {
        'camp_name': fields.String,
        'camp_number_people': fields.Fixed,
        'camp_number_structures': fields.Fixed,
        'has_fuel_stored': fields.Boolean,
        'has_fuel_stored_in_bulk': fields.Boolean,
        'has_fuel_stored_in_barrels': fields.Boolean,
    })

NOW_APPLICATION_MODEL = api.model(
    'NOWApplication',
    {
        'now_application_guid': fields.String,
        'mine_guid': fields.String,
        'now_message_id': fields.String,
        'notice_of_work_type_code': fields.String,                   ## code
        'now_application_status_code': fields.String,                ##code
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
        'camps': fields.Nested(NOW_APPLICATION_CAMP, skip_none=True)
    })