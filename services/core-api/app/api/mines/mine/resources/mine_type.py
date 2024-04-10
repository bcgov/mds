from sqlalchemy import exc
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy import exc
from flask.globals import current_app

from app.extensions import api
from app.api.utils.access_decorators import requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine_tenure_type_code import MineTenureTypeCode
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.response_models import MINE_TYPE_MODEL


class MineTypeListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'mine_tenure_type_code',
        type=str,
        help='Mine tenure type identifier.',
        location='json',
        required=True)
    parser.add_argument(
        'mine_disturbance_code',
        location='json',
        type=list,
        help='Mine disturbance type identifier.')
    parser.add_argument(
        'mine_commodity_code', location='json', type=list, help='Mine commodity type identifier.')
    parser.add_argument(
        'permit_guid', location='json', type=str, help='Guid of the associated permit.')

    @api.expect(parser)
    @api.marshal_with(MINE_TYPE_MODEL, code=201)
    @api.doc(description='Creates a mine type and associates it with a Mine.')
    @requires_role_mine_edit
    def post(self, mine_guid):

        try:
            data = self.parser.parse_args()
            mine_tenure_type_code = data.get('mine_tenure_type_code')
            mine_disturbance_code = data.get('mine_disturbance_code') or []
            mine_commodity_code = data.get('mine_commodity_code') or []
            permit_guid = data.get('permit_guid')

            mine_type = MineType.create(mine_guid, mine_tenure_type_code, permit_guid=permit_guid)

            for d_code in mine_disturbance_code:
                MineTypeDetail.create(mine_type, mine_disturbance_code=d_code)

            for c_code in mine_commodity_code:
                MineTypeDetail.create(mine_type, mine_commodity_code=c_code)

            mine_type.save()
            return mine_type
        except exc.IntegrityError as e:
            current_app.logger.error(e)
            raise MineException("Unable to process the request due to a data integrity violation.", status_code=400)


class MineTypeResource(Resource, UserMixin):
    @api.doc(description='Deletes the mine type provided.')
    @api.response(204, 'Successfully deleted.')
    @requires_role_mine_edit
    def delete(self, mine_guid, mine_type_guid):

        mine_type = MineType.find_by_guid(mine_type_guid)
        if not mine_type:
            raise NotFound('Error: Invalid mine_type_guid.')

        try:
            mine_type.expire_record()
        except exc.IntegrityError:
            raise BadRequest('Error: Unable to update mine_type.')

        return None, 204
