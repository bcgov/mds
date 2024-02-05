from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.response_models import UNIT_TYPES


class UnitTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of units and their codes. (ie degrees, meters etc)', params={})
    @requires_role_view_all
    @api.marshal_with(UNIT_TYPES, code=200, envelope='records')
    def get(self):
        return UnitType.get_all()