import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from ..models.mine import Mine
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
        mines = data.get('mine_guids', [])

        mine_list = Mine.query.filter(Mine.mine_guid.in_((mines))).all()
        return [x.json_for_list() for x in mine_list]
