from app.extensions import api
from flask_restx import fields

CREATE_ACTIVITY_MODEL = api.model(
    'Activity', {
        'recipient': fields.String,
        'mine_guid': fields.String,
        'entity_guid': fields.String,
        'entity': fields.String,
        'message': fields.String
    })


ACTIVITY_NOTIFICATION_MODEL = api.model(
    'NoticeOfDeparture', {
        'notification_guid':
        fields.String,
        'notification_recipient':
        fields.String,
        'notification_read':
        fields.Boolean,
        'notification_document':
        fields.Raw,
        'create_timestamp':
        fields.DateTime,
        'update_timestamp':
        fields.DateTime,

    })

ACTIVITY_NOTIFICATION_MODEL_LIST = api.model('NoticeOfDepartureList', {
    'records': fields.List(fields.Nested(ACTIVITY_NOTIFICATION_MODEL)),
    'total': fields.Integer
})
