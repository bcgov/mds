from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, NotFound
from ..models.mine_status import MineStatus
from app.api.mines.status.models.mine_status_xref import MineStatusXref
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.mines.mine_api_models import MINE_STATUS_CODE_MODEL
from ....constants import MINE_STATUS_OPTIONS


class MineStatusListResource(Resource, UserMixin):
    @api.marshal_with(MINE_STATUS_CODE_MODEL, envelope='records')
    @requires_role_mine_view
    def get(self):
        return MineStatusXref.active_status_codes()


class MineStatusResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_status_guid': 'Mine status guid.'})
    @requires_role_mine_view
    def get(self, mine_status_guid):
        if not mine_status_guid:
            raise BadRequest('A mine guid must be provided.')
        mine_status = MineStatus.find_by_mine_status_guid(mine_status_guid)
        if not mine_status:
            raise NotFound('Mine Status not found')

        return mine_status.json()
