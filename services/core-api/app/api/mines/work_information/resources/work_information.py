from werkzeug.exceptions import NotFound
from flask_restx import Resource, inputs

from app.extensions import api, jwt
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINE_EDIT, MINESPACE_PROPONENT, is_minespace_user
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_WORK_INFORMATION_MODEL
from app.api.mines.work_information.models.mine_work_information import MineWorkInformation
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import requires_role_mine_admin


class MineWorkInformationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'work_start_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
        help='The work start date.')
    parser.add_argument(
        'work_stop_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
        help='The work stop date.')
    parser.add_argument(
        'work_comments', type=str, store_missing=False, required=False, help='The work comments.')

    @api.doc(
        description='Get a mine work information.',
        params={
            'mine_guid': 'The GUID of the mine the work information belongs to.',
            'mine_work_information_guid': 'The GUID of the work information to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_WORK_INFORMATION_MODEL, code=200)
    def get(self, mine_guid, mine_work_information_guid):
        mine_work_information = MineWorkInformation.find_by_mine_work_information_guid(
            mine_work_information_guid)

        if mine_work_information is None:
            raise NotFound('Work information not found')

        return mine_work_information

    @api.doc(
        description='Update a mine work information.',
        params={
            'mine_guid': 'The GUID of the mine the work information belongs to.',
            'mine_work_information_guid': 'The GUID of the work information to update.'
        })
    @requires_any_of([MINE_EDIT, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_WORK_INFORMATION_MODEL, code=200)
    def put(self, mine_guid, mine_work_information_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        mine_work_information = MineWorkInformation.find_by_mine_work_information_guid(
            mine_work_information_guid)
        if mine_work_information is None:
            raise NotFound('Work information not found')

        data = self.parser.parse_args()
        for key, value in data.items():
            setattr(mine_work_information, key, value)

        mine_work_information.save()

        # NOTE: Currently, it is implemented so that users in MineSpace can only modify the most recent work information record (or create one if one doesn't exist). They cannot modify "historical" records like users can in Core.
        # Only send a "status update" email if this is a modifiation of the most recent work information record and the request is from a MineSpace user.
        is_current_record = mine_work_information == mine.mine_work_information
        if is_current_record and is_minespace_user():
            mine_work_information.send_work_status_update_email()

        return mine_work_information

    @api.doc(
        description='Delete a mine work information.',
        params={
            'mine_guid': 'The GUID of the mine the work information belongs to.',
            'mine_work_information_guid': 'The GUID of the work information to delete.'
        })
    @requires_any_of([MINE_EDIT])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, mine_work_information_guid):
        mine_work_information = MineWorkInformation.find_by_mine_work_information_guid(
            mine_work_information_guid)
        if mine_work_information is None:
            raise NotFound('Work information not found')
        mine_work_information.delete()
        return None, 204
