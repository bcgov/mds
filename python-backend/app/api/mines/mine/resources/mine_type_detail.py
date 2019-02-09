import uuid

from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_type_detail import MineTypeDetail
from ..models.mine_type import MineType
from app.api.constants import DISTURBANCE_CODES_CONFIG, COMMODITY_CODES_CONFIG

class MineTypeDetailResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_type_guid',
        type=str,
        help='Unique identifier for the mine type with which to associate this details record.'
    )
    parser.add_argument('mine_disturbance_code', type=str, help='Mine disturbance type identifier.')
    parser.add_argument('mine_commodity_code', type=str, help='Mine commodity type identifier.')

    @api.expect(parser)
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        mine_type_guid = data.get('mine_type_guid')
        mine_disturbance_code = data.get('mine_disturbance_code')
        mine_commodity_code = data.get('mine_commodity_code')

        if not mine_type_guid:
            self.raise_error(400, 'Error: Missing mine_type_guid.')

        if not mine_disturbance_code and not mine_commodity_code:
            self.raise_error(400, 'Error: Missing mine_disturbance_code or mine_commodity_code.')

        if mine_disturbance_code and mine_commodity_code:
            self.raise_error(400, 'Error: Unable to create mine_type_detail with disturbance and commodity.')

        try:
            mine_type_detail = MineTypeDetail.create_mine_type_detail(
                mine_type_guid,
                mine_disturbance_code,
                mine_commodity_code,
                self.get_create_update_dict(),
                save=False
            )

            if mine_disturbance_code:
                (code, name, config) = (mine_disturbance_code, 'mine_disturbance_code', DISTURBANCE_CODES_CONFIG)
            if mine_commodity_code:
                (code, name, config) = (mine_commodity_code, 'mine_commodity_code', COMMODITY_CODES_CONFIG)

            try:
                mine_type = MineType.find_by_guid(mine_type_guid)
                assert mine_type.mine_tenure_type_code in config[code]['mine_tenure_type_codes']
            except (AssertionError, KeyError) as e:
                self.raise_error(
                    400,
                    'Error: Invalid '+name+'.'
                )

            mine_type_detail.save()
        except exc.IntegrityError as e:
            self.raise_error(
                400,
                'Error: Unable to create mine_type_detail.'
            )

        return mine_type_detail.json()


    @api.expect(parser)
    @requires_role_mine_create
    def delete(self, mine_type_detail_xref_guid=None):
        data = self.parser.parse_args()

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
