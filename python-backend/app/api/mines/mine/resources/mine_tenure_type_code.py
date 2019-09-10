from flask_restplus import Resource
from app.extensions import api
from app.api.mines.mine_api_models import MINE_TENURE_TYPE_CODE_MODEL
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin
from ..models.mine_tenure_type_code import MineTenureTypeCode


class MineTenureTypeCodeResource(Resource, UserMixin):
    @api.doc(description='Returns all the mineral tenure type codes.')
    @requires_role_view_all
    @api.marshal_with(MINE_TENURE_TYPE_CODE_MODEL, code=200, envelope='records')
    def get(self):
        mineral_tenure_type_codes = MineTenureTypeCode.find_all_active()

        return mineral_tenure_type_codes
