import uuid
from flask_restplus import Resource, fields

from app.extensions import api, cache, notifications
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES

NOTIFICATION_MODEL = api.model('Notification', {'message': fields.String})


class NotificationsResource(Resource):
    @api.doc(description='Get your notification feed')
    @api.marshal_with(NOTIFICATION_MODEL, code=200)
    def get(self):
        feed = notifications.get_feeds()['normal']
        activities = list(feed[:25])
        return activities