from flask_restplus import Resource
from ..models.status import MineStatus
from app.extensions import jwt, api
from ...utils.resources_mixins import UserMixin, ErrorMixin
from ...constants import MINE_STATUS_OPTIONS


class MineStatusResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_status_guid': 'Mine status guid.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_status_guid=None):
        if mine_status_guid:
            mine_status = MineStatus.find_by_mine_status_guid(mine_status_guid)
            return mine_status.json() if mine_status else self.create_error_payload(404, 'Mine Status not found'), 404
        else:
            return {'options': MINE_STATUS_OPTIONS}
