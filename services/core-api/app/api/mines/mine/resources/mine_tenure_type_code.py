from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.response_models import MINE_TENURE_TYPE_CODE_MODEL
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode


class MineTenureTypeCodeResource(Resource, UserMixin):
    @api.doc(description='Returns all the mineral tenure type codes.')
    @requires_role_view_all
    @api.marshal_with(MINE_TENURE_TYPE_CODE_MODEL, code=200, envelope='records')
    def get(self):
        mineral_tenure_type_codes = MineTenureTypeCode.get_all()

        return mineral_tenure_type_codes
