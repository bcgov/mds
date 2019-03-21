import uuid, json
from datetime import datetime
from werkzeug.exceptions import *
from flask_restplus import Resource, reqparse
from app.extensions import api

from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus


class MineVerifiedStatusResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_guid', type=str, required=True, help='Unique identifier for the mine.')

    @requires_role_mine_view
    def get(self):
        user_id = request.args.get('user_id')
        if user_id:
            statuses = MineVerifiedStatus.find_by_user_id(user_id)
        else:
            statuses = MineVerifiedStatus.query.all()

        return {
            'healthy': [x.json() for x in statuses if x.healthy_ind],
            'unhealthy': [x.json() for x in statuses if not x.healthy_ind]
        }

    @api.expect(parser)
    @requires_role_mine_create
    def put(self, mine_guid=None):
        mine_guid = self.parser.parse_args()['mine_guid']
        if not mine_guid:
            raise BadRequest('Mine_guid not provided')

        mine_verified_status = MineVerifiedStatus(
            mine_guid=mine_guid,
            verifying_user=User().get_user_username,
            verifying_timestamp=datetime.now)
        mine_verified_status.save()
        return mine_verified_status.json()

    @api.expect(parser)
    @requires_role_mine_admin
    def delete(self, mine_guid=None):
        mine_guid = self.parser.parse_args()['mine_guid']
        if not mine_guid:
            raise BadRequest('Mine_guid not provided')

        mine_verified_status = MineVerifiedStatus.find_by_mine_guid(mine_guid)
        if not mine_verified_status:
            raise BadRequest('Cannot find a verified status for the given mine')

        mine_verified_status.healthy = False
        mine_verified_status.save()
        return ('', 204)
