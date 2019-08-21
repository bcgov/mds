import uuid
from flask_restplus import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from sqlalchemy.exc import DBAPIError

from app.extensions import api, db
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_report, requires_role_mine_admin

from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_comment import MineReportComment

from app.api.mines.mine_api_models import MINE_REPORT_COMMENT_MODEL


class MineReportCommentListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('report_comment', type=str, location='json')
    parser.add_argument('comment_visibility_ind', type=inputs.boolean, location='json')

    @api.doc(description='retrive a list of comments for all report submissions')
    @api.marshal_with(MINE_REPORT_COMMENT_MODEL, envelope='records', code=200)
    @requires_role_view_all
    def get(self, mine_guid, mine_report_guid):

        mine_report = MineReport.find_by_mine_report_guid(
            mine_report_guid)

        if not mine_report:
            raise NotFound('Mine report not found')

        mine_report_submissions = mine_report.mine_report_submissions

        if not mine_report_submissions:
            raise NotFound('No mine report submissions for this report')

        current_app.logger.info(f'Retrieving comments for {mine_report}')

        comments = [comment.__dict__ for submission in mine_report_submissions[:-1] for comment in submission.comments]
        for comment in comments:
            comment['from_latest_submission'] = False
        latest_comments = [comment.__dict__ for submission in mine_report_submissions[-1:] for comment in submission.comments]
        for comment in latest_comments:
            comment['from_latest_submission'] = True

        return comments + latest_comments, 200

    @api.expect(MINE_REPORT_COMMENT_MODEL)
    @api.doc(description='creates a new comment for the report submission')
    @api.marshal_with(MINE_REPORT_COMMENT_MODEL, code=201)
    @requires_role_edit_report
    def post(self, mine_guid, mine_report_guid):

        mine_report_submission = MineReportSubmission.find_latest_by_mine_report_guid(
            mine_report_guid)

        if not mine_report_submission:
            raise NotFound('Mine report submission not found')
            # TODO: Do we want to create a submission if it doesn't exist?

        data = self.parser.parse_args()

        if not data['report_comment']:
            raise BadRequest('Empty comment')

        mine_report_comment_guid = uuid.uuid4()

        mine_report_comment = MineReportComment.create(
            mine_report_submission,
            mine_report_comment_guid=mine_report_comment_guid,
            report_comment=data['report_comment'],
            comment_visibility_ind=data['comment_visibility_ind'],
        )

        current_app.logger.info(f'Creating comment {mine_report_comment}')

        mine_report_comment.save()

        return mine_report_comment, 201


class MineReportCommentResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('report_comment', type=str, location='json')
    parser.add_argument('comment_visibility_ind', type=inputs.boolean, location='json')

    @api.expect(MINE_REPORT_COMMENT_MODEL)
    @api.doc(description='update a comment')
    @api.marshal_with(MINE_REPORT_COMMENT_MODEL, code=201)
    @requires_role_edit_report
    def put(self, mine_guid, mine_report_guid, mine_report_comment_guid=None):

        data = self.parser.parse_args()
        comment = MineReportComment.find_by_guid(mine_report_comment_guid)
        if not comment:
            raise NotFound('Mine report comment with guid "{mine_report_comment_guid}" not found.')

        current_app.logger.info(f'Updating {comment} with {data}')
        for key, value in data.items():
            setattr(comment, key, value)

        comment.save()

        return comment, 201

    @api.doc(
        description='Delete a mine report comment by guid', params={'mine_report_comment_guid': 'guid of the comment to delete.'})
    @requires_role_mine_admin
    def delete(self, mine_guid, mine_report_guid, mine_report_comment_guid):
        if mine_report_comment_guid is None:
            return self.create_error_payload(404, 'Must provide a mine report comment guid.'), 404

        comment = MineReportComment.find_by_guid(mine_report_comment_guid)
        if not comment:
            raise NotFound('Mine report comment with guid "{mine_report_comment_guid}" not found.')

        comment.deleted_ind = True
        current_app.logger.info(f'Deleting {comment}')

        comment.save()

        return ('', 204)
