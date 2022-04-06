import uuid
from flask_restplus import Resource
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT)
from app.api.mines.permits.notice_of_departure.models.notice_of_departure import NoticeOfDeparture
from app.api.mines.response_models import MINE_NOD_MODEL


class MineNoticeOfDepartureListResource(Resource, UserMixin):

    @api.doc(params={'mine_guid': 'Mine guid.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_NOD_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        nods = NoticeOfDeparture.find_all_by_mine_guid(mine_guid)
        return nods
