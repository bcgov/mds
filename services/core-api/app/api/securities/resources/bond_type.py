from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.utils.resources_mixins import UserMixin
from app.api.securities.models.bond_type import BondType
from app.api.securities.response_models import BOND_TYPE


class BondTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all active bond type codes.')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(BOND_TYPE, code=200, envelope='records')
    def get(self):
        return BondType.get_all()
