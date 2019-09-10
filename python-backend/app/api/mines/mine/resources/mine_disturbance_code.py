from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin
from ..models.mine_disturbance_code import MineDisturbanceCode

class MineDisturbanceCodeResource(Resource, UserMixin):
    @api.doc(params={})
    @requires_role_view_all
    def get(self):
        return { 'records': MineDisturbanceCode.all_options() }
