from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.activity_detail.underground_exploration_type import UndergroundExplorationType
from app.api.now_applications.response_models import UNDERGROUND_EXPLORATION_TYPES


class UndergroundExplorationTypeResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of all Notice of Work activity types for underground exploration',
        params={})
    @requires_role_view_all
    @api.marshal_with(UNDERGROUND_EXPLORATION_TYPES, code=200, envelope='records')
    
    def get(self):
        return UndergroundExplorationType.get_all()