from flask.globals import current_app

from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, requires_role_edit_explosives_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.services.epic_eoa_service import EPICEAOService
from app.api.mines.external_authorizations.response_models import EPIC_MINE_INFO




class EPICResource(Resource, UserMixin):
    @api.doc(
        description='',
        params={'mine_guid': 'The GUID of the mine the belongs to.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(EPIC_MINE_INFO, code=200, envelope='records', as_list=True)
    def get(self, mine_guid):
        return EPICEAOService.get_for_mine(mine_guid) 