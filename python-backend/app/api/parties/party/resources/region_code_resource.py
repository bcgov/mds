from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.region_code import RegionCode

class RegionCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={})
    @requires_role_mine_view
    def get(self):
        return { 'options': RegionCode.all_options() }
