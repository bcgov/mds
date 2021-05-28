from flask_restplus import Resource,
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_MINE, MINESPACE_PROPONENT
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import MINE_WORK_INFORMATION_MODEL
from app.api.mines.models.mine_work_information import MineWorkInformation


class MineWorkInformationListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('work_start_date', store_missing=False, help='The work start date.')
    parser.add_argument('work_stop_date', store_missing=False, help='The work stop date.')
    parser.add_argument('work_comments', type=str, store_missing=False, help='The work comments.')

    @api.doc(
        description='Get a list of all work information for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get work information for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_WORK_INFORMATION_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        mine_work_informations = MineWorkInformation.find_by_mine_guid(mine_guid)
        return mine_work_informations

    @api.doc(
        description='Create a new mine work information.',
        params={'mine_guid': 'The GUID of the mine to create the work information for.'})
    @api.expect(parser)
    @requires_any_of([EDIT_MINE])
    @api.marshal_with(MINE_WORK_INFORMATION_MODEL, code=200)
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        work_start_date = data.get('work_start_date')
        work_stop_date = data.get('work_stop_date')
        work_comments = data.get('work_comments')

        mine_work_information = MineWorkInformation(
            work_start_date=work_start_date,
            work_stop_date=work_stop_date,
            work_comments=work_comments)
        mine_work_information.save()

        return mine_work_information
