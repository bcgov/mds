from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.parties.party.models.sub_division_code import SubDivisionCode
from app.api.parties.response_models import SUB_DIVISION_CODE_MODEL


class SubDivisionCodeResource(Resource, UserMixin):
    @api.doc(params={})
    @requires_role_view_all
    @api.marshal_with(SUB_DIVISION_CODE_MODEL, envelope='records', code=200)
    def get(self):
        return SubDivisionCode.get_all()
