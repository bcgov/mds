from flask_restplus import Resource, reqparse

from app.api.activity.models.activity_notification import ActivityNotification
from app.api.utils.access_decorators import VIEW_ALL, requires_any_of, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin


class ActivityMarkAsReadResource(Resource, UserMixin):
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def patch(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'activity_guids',
            type=list,
            location='json',
            required=True,
            help='List of activity guids to mark as read')
        args = parser.parse_args()
        activity_guids = args.get('activity_guids')
        ActivityNotification.mark_as_read_many(activity_guids)
