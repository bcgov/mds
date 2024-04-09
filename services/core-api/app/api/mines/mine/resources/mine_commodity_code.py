from flask_restx import Resource
from app.extensions import api

from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine_commodity_code import MineCommodityCode
from app.api.mines.response_models import MINE_COMMODITY_CODE_MODEL


class MineCommodityCodeResource(Resource, UserMixin):
    @api.doc(params={})
    @api.marshal_with(MINE_COMMODITY_CODE_MODEL, code=200, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineCommodityCode.get_all()
