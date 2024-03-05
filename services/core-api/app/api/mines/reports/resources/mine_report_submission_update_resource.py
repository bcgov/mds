from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.response_models import MINE_REPORT_SUBMISSION_MODEL
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, EDIT_REPORT, MINE_ADMIN


class ReportSubmissionUpdateResource(Resource, UserMixin):
    parser = CustomReqparser()

    parser.add_argument(
        'description_comment',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'mine_report_submission_status_code',
        type=str,
        store_missing=False,
        required=True,
    )

    @api.doc(
        description='Update a Mine Report Submission.',
        params={
            'mine_report_submission_guid': 'The GUID of the Mine Report Submission to update.'
        })
    @api.marshal_with(MINE_REPORT_SUBMISSION_MODEL, code=201)
    @requires_any_of([EDIT_REPORT, MINE_ADMIN])
    def patch(self, mine_report_submission_guid):

        mine_report_submission = MineReportSubmission.find_by_mine_report_submission_guid(mine_report_submission_guid)
        print(mine_report_submission)
        data = self.parser.parse_args()

        if mine_report_submission is None:
            raise NotFound('Mine Report Submission not found')

        mine_report_submission.patch(data.get('mine_report_submission_status_code'),
                                     data.get('description_comment'))

        mine_report_submission.save()

        return mine_report_submission


