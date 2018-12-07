import uuid

from flask_restplus import Resource, reqparse
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type import MineType

class MineTypeResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument('mine_guid', type=str, help='Unique identifier for the mine with which to associate this mine type.')
    parser.add_argument('mine_tenure_type_code', type=str, help='Mine tenure type identifier.')

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-view"])
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
            self.raise_error(400, 'Error: Invalid Mine Tenure Type code.')

        return mine_type.json()
