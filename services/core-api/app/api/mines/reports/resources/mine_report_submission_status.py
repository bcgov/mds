from flask_restx import Resource

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all

from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.mines.response_models import MINE_REPORT_SUBMISSION_STATUS


class MineReportSubmissionStatusResource(Resource, UserMixin):
    @api.doc(params={'mine_region_guid': 'Mine region guid.'})
    @api.marshal_with(MINE_REPORT_SUBMISSION_STATUS, code=201, envelope='records')
    @requires_role_view_all
    def get(self):
        return MineReportSubmissionStatusCode.get_all()