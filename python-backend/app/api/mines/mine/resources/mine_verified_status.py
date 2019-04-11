import uuid, json
from datetime import datetime
from werkzeug.exceptions import *
from flask_restplus import Resource, reqparse, inputs
from app.extensions import api
from flask import request
from app.api.utils.include.user_info import User

from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.mine.models.mine_verified_status import MineVerifiedStatus
from app.api.mines.mine_api_models import MINE_VERIFIED_MODEL


class MineVerifiedStatusResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('healthy', type=inputs.boolean)

    @requires_role_mine_view
    @api.marshal_with(MINE_VERIFIED_MODEL, code=200)
    @api.doc(
        params={'user_id': 'A user_id to search'},
        description=
        'Returns all verified statuses for mines or for a specific user if a user_id was provided.')
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
        if not mine_guid:
            raise BadRequest('Mine_guid not provided')

        data = self.parser.parse_args()

        healthy = data.get('healthy')
        if healthy is None:
            raise BadRequest('"healthy" parameter not provided')

        mine_verified_status = MineVerifiedStatus.find_by_mine_guid(mine_guid)
        if not mine_verified_status:
            mine_verified_status = MineVerifiedStatus(
                mine_guid=mine_guid,
                verifying_user=User().get_user_username(),
                verifying_timestamp=datetime.now())

        if healthy:
            mine_verified_status.verifying_user = User().get_user_username()
            mine_verified_status.verifying_timestamp = datetime.now()

        mine_verified_status.healthy_ind = healthy
        mine_verified_status.save()
        return mine_verified_status.json()

    @requires_role_mine_admin
    def delete(self, mine_guid=None):
        #TODO: Actually delete
        return ('', 501)
