from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_PERMIT

from app.api.utils.resources_mixins import UserMixin
from app.api.securities.models.bond_status import BondStatus
from app.api.securities.response_models import BOND_STATUS


class BondStatusResource(Resource, UserMixin):
    @api.doc(description='Get a list of all active bond status codes.', params={})
    @requires_any_of([VIEW_ALL, EDIT_PERMIT])
    @api.marshal_with(BOND_STATUS, code=200, envelope='records')
    def get(self):
        return BondStatus.get_active()
