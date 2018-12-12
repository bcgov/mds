import uuid

from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type_detail import MineTypeDetail
from ..models.mine_type import MineType
from app.api.constants import DISTURBANCE_CODES_CONFIG

class MineTypeDetailResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_type_guid',
        type=str,
        help='Unique identifier for the mine type with which to associate this details record.'
    )
    parser.add_argument('mine_disturbance_code', type=str, help='Mine disturbance type identifier.')

    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def post(self):
        data = self.parser.parse_args()

        mine_type_guid = data['mine_type_guid']
        mine_disturbance_code = data['mine_disturbance_code']

        if not mine_type_guid:
            self.raise_error(400, 'Error: Missing mine_type_guid.')

        if not mine_disturbance_code:
            self.raise_error(400, 'Error: Missing mine_disturbance_code.')


        try:
            mine_type_detail = MineTypeDetail.create_mine_type_detail(
                mine_type_guid,
                mine_disturbance_code,
                self.get_create_update_dict(),
                save=False
            )

            try:
                mine_type = MineType.find_by_guid(mine_type_guid)
                mine_type_detail.validate_disturbance_code_with_tenure(mine_type.mine_tenure_type_code)
            except (AssertionError, KeyError) as e:
                self.raise_error(
                    400,
                    'Error: Invalid mine_disturbance_code.'
                )

            mine_type_detail.save()
        except exc.IntegrityError as e:
            self.raise_error(
                400,
                'Error: Unable to create mine_type_detail.'
            )

        return mine_type_detail.json()


    @api.expect(parser)
    @jwt.requires_roles(["mds-mine-create"])
    def delete(self, mine_type_detail_xref_guid=None):
        data = self.parser.parse_args()

        mine_type_guid = data['mine_type_guid']
        mine_disturbance_code = data['mine_disturbance_code']

        if not mine_type_detail_xref_guid:
            self.raise_error(400, 'Error: Missing mine_type_detail_xref_guid.')

        mine_type_detail = MineTypeDetail.find_by_guid(mine_type_detail_xref_guid)
        if not mine_type_detail:
            self.raise_error(400, 'Error: Invalid mine_type_detail_guid.')

        try:
            MineTypeDetail.expire_record(mine_type_detail)
        except exc.IntegrityError as e:
            self.raise_error(
                400,
                'Error: Unable to update mine_type_detail.'
            )

        return mine_type_detail.json()
