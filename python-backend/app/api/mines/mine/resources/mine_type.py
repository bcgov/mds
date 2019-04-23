import uuid
from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin
from ..models.mine_type import MineType
from app.api.mines.mine_api_models import MINE_TYPE_MODEL


class MineTypeListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
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
    @api.marshal_with(MINE_TYPE_MODEL, code=201)
    @api.doc(description='Creates a mine type and associates it with a Mine.')
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        mine_guid = data['mine_guid']
        mine_tenure_type_code = data['mine_tenure_type_code']

        mine_type = MineType.create_mine_type(
            mine_guid, mine_tenure_type_code, add_to_session=False)
        mine_type.save()

        return mine_type


class MineTypeResource(Resource, UserMixin):
    @api.doc(description='Deletes the mine type provided.')
    @requires_role_mine_create
    def delete(self, mine_type_guid):

        mine_type = MineType.find_by_guid(mine_type_guid)
        if not mine_type:
            raise NotFound('Error: Invalid mine_type_guid.')

        try:
            MineType.expire_record(mine_type)
        except exc.IntegrityError:
            raise BadRequest('Error: Unable to update mine_type.')

        return None, 204
