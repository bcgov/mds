import decimal, uuid

from flask import request
from flask_restplus import Resource, reqparse, inputs
from sqlalchemy_filters import apply_sort, apply_pagination

from app.extensions import jwt, api
from app.api.mines.response_models import MINES_MODEL
from app.api.mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin


class MineBasicInfoResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guids',
                        type=list,
                        location="json",
                        help='List of guids for mines to get basic info for.')

    @api.expect(parser)
    @api.marshal_with(MINES_MODEL, code=200)
    @api.doc(description='Returns a list of basic mine info.')
    @jwt.requires_roles(["core_view_all"])
    def post(self):

        data = self.parser.parse_args()
        mines = data.get('mine_guids', [])

        mine_list = Mine.query.filter(Mine.mine_guid.in_((mines))).all()
        return mine_list
