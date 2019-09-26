from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin
from ..models.mine_commodity_code import MineCommodityCode

from app.api.mines.mine_api_models import MINE_COMMODITY_CODE_MODEL


class MineCommodityCodeResource(Resource, UserMixin):
    @api.doc(params={})
    @api.marshal_with(MINE_COMMODITY_CODE_MODEL, code=200, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineCommodityCode.get_active()
