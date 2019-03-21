import uuid
from werkzeug.exceptions import *
from flask_restplus import Resource, reqparse
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create, requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type import MineType


class MineVerifiedStatus(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_guid', type=str, required=True, help='Unique identifier for the mine.')

    @api.expect(parser)
    @requires_role_mine_create
    def put(self, mine_guid):
        mine_guid = self.parser.parse_args()['mine_guid']
        if not mine_guid:
            self.raise_error(400, 'Error: Missing mine_guid.')

        try:
            mine_verified_status = MineVerifiedStatus()
            mine_type.save()
        except exc.IntegrityError as e:
            self.raise_error(400, 'Error: Unable to create mine_type.')

        return mine_type.json()

    @api.expect(parser)
    @requires_role_mine_admin
    def delete(self, mine_guid):
        mine_guid = self.parser.parse_args()['mine_guid']
        if not mine_guid:
            raise BadRequest('Mine_guid not provided')

        mine_verified_status = MineVerifiedStatus.find_by_mine_guid(mine_guid)
        if mine_verified_status is not None:
            mine_verified_status.healthy = False
            mine_verified_status.save()

        return ('', 204)
