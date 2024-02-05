from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.activity_summary.activity_type import ActivityType
from app.api.now_applications.response_models import NOW_ACTIVITY_TYPES


class NOWActivityTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work activity status codes.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_ACTIVITY_TYPES, code=200, envelope='records')
    def get(self):
        return ActivityType.get_all()