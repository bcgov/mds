import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ..models.mine_identity import MineIdentity
from ..models.mine_detail import MineDetail
from ....permits.permit.models.permit import Permit
from ...location.models.mine_location import MineLocation
from ....utils.random import generate_mine_no
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MineBasicInfoResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_guids',
        type=list,
        location="json",
        help='List of guids for mines to get basic info for.')

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-view"])
    def post(self, mine_no_or_guid=None):
        data = self.parser.parse_args()
        result = []
        #return data.get('mine_guids')
        for mine_guid in data.get('mine_guids', []):
            mine = MineIdentity.find_by_mine_guid(mine_guid)
            result.append(mine.json_for_list())
        return result