from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL

from app.api.utils.resources_mixins import UserMixin 
from app.api.now_applications.models..activity_summary.activity_type import ActivityType
from app.api.now_applications.response_models import NOW_ACTIVITY_TYPE_CODE


class NOWActivityTypeCodeResource(Resource, UserMixin ):
    @api.doc(description='Get a list of all Notice of Work activity status codes.', params={})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(NOW_ACTIVITY_TYPE_CODE, code=200, envelope='records')
    def get(self):
        return ActivityType.active()