import uuid

from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type import MineType
from app.api.mines.mine_api_models import MINE_TYPE


class MineTypeListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_guid',
        type=str,
        help='Unique identifier for the mine with which to associate this mine type.',
        location='json',
        required=True)
    parser.add_argument(
        'mine_tenure_type_code',
        type=str,
        help='Mine tenure type identifier.',
        location='json',
        required=True)

    @api.expect(parser)
    @api.marshal_with(MINE_TYPE, code=200)
    @api.doc(
        description=
        'This endpoint takes in a mine tenure type code and a mine guid and associated them together.'
    )
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        mine_guid = data.get('mine_guid')
        mine_tenure_type_code = data.get('mine_tenure_type_code')

        mine_type = MineType.create_mine_type(mine_guid, mine_tenure_type_code, save=False)
        mine_type.save()

        return mine_type


class MineTypeResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_guid',
        type=str,
        help='Unique identifier for the mine with which to associate this mine type.')
    parser.add_argument('mine_tenure_type_code', type=str, help='Mine tenure type identifier.')

    @api.expect(parser)
    @requires_role_mine_create
    def delete(self, mine_type_guid):
        data = self.parser.parse_args()

        mine_type = MineType.find_by_guid(mine_type_guid)
        if not mine_type:
            self.raise_error(400, 'Error: Invalid mine_type_guid.')

        try:
            MineType.expire_record(mine_type)
        except exc.IntegrityError as e:
            self.raise_error(400, 'Error: Unable to update mine_type.')

        return mine_type.json()
