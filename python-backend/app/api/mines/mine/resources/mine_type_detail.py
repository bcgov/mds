import uuid

from sqlalchemy import exc
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from ....utils.access_decorators import requires_role_mine_create
from ....utils.resources_mixins import UserMixin
from ..models.mine_type_detail import MineTypeDetail
from ..models.mine_type import MineType
from app.api.mines.mine_api_models import MINE_TYPE_DETAIL_MODEL
from app.api.constants import DISTURBANCE_CODES_CONFIG, COMMODITY_CODES_CONFIG


class MineTypeDetailListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_type_guid',
        type=str,
        help='Unique identifier for the mine type with which to associate this details record.',
        location='json',
        required=True)
    parser.add_argument(
        'mine_disturbance_code',
        type=str,
        help='Mine disturbance type identifier.',
        location='json')
    parser.add_argument(
        'mine_commodity_code', type=str, help='Mine commodity type identifier.', location='json')

    @api.expect(parser)
    @api.doc(description='Creates a mine type detail.')
    @api.marshal_with(MINE_TYPE_DETAIL_MODEL, code=201)
    @requires_role_mine_create
    def post(self):
        data = self.parser.parse_args()

        mine_type_guid = data['mine_type_guid']
        mine_disturbance_code = data['mine_disturbance_code']
        mine_commodity_code = data['mine_commodity_code']

        if not mine_type_guid:
            raise BadRequest('Error: Missing mine_type_guid.')

        if not mine_disturbance_code and not mine_commodity_code:
            raise BadRequest('Error: Missing mine_disturbance_code or mine_commodity_code.')

        if mine_disturbance_code and mine_commodity_code:
            raise BadRequest(
                'Error: Unable to create mine_type_detail with disturbance and commodity.')

        mine_type_detail = MineTypeDetail.create_mine_type_detail(
            mine_type_guid, mine_disturbance_code, mine_commodity_code, save=False)

        if mine_disturbance_code:
            (code, name, config) = (mine_disturbance_code, 'mine_disturbance_code',
                                    DISTURBANCE_CODES_CONFIG)
        if mine_commodity_code:
            (code, name, config) = (mine_commodity_code, 'mine_commodity_code',
                                    COMMODITY_CODES_CONFIG)

        mine_type = MineType.find_by_guid(mine_type_guid)
        assert mine_type.mine_tenure_type_code in config[code]['mine_tenure_type_codes']

        mine_type_detail.save()

        return mine_type_detail


class MineTypeDetailResource(Resource, UserMixin):
    @api.doc(description='Deletes a mine type detail.')
    @requires_role_mine_create
    def delete(self, mine_type_detail_xref_guid):

        if not mine_type_detail_xref_guid:
            raise BadRequest('Error: Missing mine_type_detail_xref_guid.')

        mine_type_detail = MineTypeDetail.find_by_guid(mine_type_detail_xref_guid)
        if not mine_type_detail:
            raise BadRequest('Error: Invalid mine_type_detail_guid.')

        MineTypeDetail.expire_record(mine_type_detail)

        return None, 204
