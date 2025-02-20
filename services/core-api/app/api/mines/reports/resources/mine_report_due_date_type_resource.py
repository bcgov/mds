from flask_restx import Resource

from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.mines.response_models import MINE_REPORT_DUE_DATE_TYPE_MODEL
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class MineReportDueDateTypeResource(Resource, UserMixin):

    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_REPORT_DUE_DATE_TYPE_MODEL, as_list=True, code=200)
    def get(self):
        return MineReportDueDateType.query.all()
