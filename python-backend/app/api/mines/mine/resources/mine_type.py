import uuid

from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type import MineType

class MineTypeResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, help='Unique identifier for the mine with which to associate this mine type.')
    parser.add_argument('mine_tenure_type_code', type=str, help='Mine tenure type identifier.')


    @api.expect(parser)
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        mine_guid = data['mine_guid']
        mine_tenure_type_code = data['mine_tenure_type_code']

        if not mine_guid:
            self.raise_error(400, 'Error: Missing mine_guid.')

        if not mine_tenure_type_code:
            self.raise_error(400, 'Error: Missing mine_tenure_type_code.')

        try:
            mine_type = MineType.create_mine_type(
                mine_guid,
                mine_tenure_type_code,
                self.get_create_update_dict(),
                save=False
            )
            mine_type.save()
        except exc.IntegrityError as e:
            self.raise_error(400, 'Error: Unable to create mine_type.')

        return mine_type.json()

    @api.expect(parser)
    @requires_role_mine_create
    def delete(self, mine_type_guid=None):
        data = self.parser.parse_args()

        if not mine_type_guid:
            self.raise_error(400, 'Error: Missing mine_type_guid.')

        mine_type = MineType.find_by_guid(mine_type_guid)
        if not mine_type:
            self.raise_error(400, 'Error: Invalid mine_type_guid.')

        try:
            MineType.expire_record(mine_type)
        except exc.IntegrityError as e:
            self.raise_error(
                400,
                'Error: Unable to update mine_type.'
            )

        return mine_type.json()
