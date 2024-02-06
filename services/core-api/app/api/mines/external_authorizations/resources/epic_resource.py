from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, requires_role_edit_explosives_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.services.epic_service import EPICService
from app.api.mines.external_authorizations.response_models import EPIC_MINE_INFO




class EPICResource(Resource, UserMixin):
    @api.doc(
        description='Returns the information for a mine from EPIC if that mine is listed there.',
        params={'mine_guid': 'The GUID of the mine the belongs to.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EPIC_MINE_INFO, code=200, envelope='records', as_list=True)
    def get(self, mine_guid):
        return EPICService.get_for_mine(mine_guid) 