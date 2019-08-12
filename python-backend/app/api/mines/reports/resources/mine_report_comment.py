import uuid
from flask_restplus import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from sqlalchemy.exc import DBAPIError

from app.extensions import api, db
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_edit_report, requires_role_mine_admin

from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_comment import MineReportComment

from app.api.mines.mine_api_models import MINE_REPORT_COMMENT_MODEL


class MineReportCommentListResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('report_comment', type=str, location='json')
    parser.add_argument('comment_visibility_ind', type=inputs.boolean, location='json')

    @api.expect(MINE_REPORT_COMMENT_MODEL)
    @api.doc(description='creates a new comment for the report submission')
    @api.marshal_with(MINE_REPORT_COMMENT_MODEL, code=201)
    @requires_role_edit_report
    def post(self, mine_guid, mine_report_guid, mine_report_submission_guid, mine_report_comment_guid=None):

        if mine_report_comment_guid:
            raise BadRequest('Unexpected mine_report_comment_guid.')

        mine_report_submission = MineReportSubmission.find_by_guid(
            mine_report_submission_guid)

        if not mine_report_submission:
            raise NotFound('Mine report submission not found')

        data = self.parser.parse_args()

        mine_report_comment_guid = uuid.uuid4()

        mine_report_comment = MineReportComment.create(
            mine_report_submission,
            mine_report_comment_guid=mine_report_comment_guid,
            report_comment=data['report_comment'],
            comment_visibility_ind=data['comment_visibility_ind'],
        )

        try:
            mine_report_comment.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return mine_report_comment, 201


class MineReportCommentResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('report_comment', type=str, location='json')
    parser.add_argument('comment_visibility_ind', type=inputs.boolean, location='json')

    @api.expect(MINE_REPORT_COMMENT_MODEL)
    @api.doc(description='update a comment')
    @api.marshal_with(MINE_REPORT_COMMENT_MODEL, code=201)
    @requires_role_edit_report
    def put(self, mine_guid, mine_report_guid, mine_report_submission_guid, mine_report_comment_guid=None):

        if mine_report_comment_guid:
            raise BadRequest('Unexpected mine_report_comment_guid.')

        mine_report_submission = MineReportSubmission.find_by_guid(
            mine_report_submission_guid)

        if not mine_report_submission:
            raise NotFound('Mine report submission not found')

        data = self.parser.parse_args()

        mine_report_comment_guid = uuid.uuid4()

        mine_report_comment = MineReportComment.create(
            mine_report_submission,
            mine_report_comment_guid=mine_report_comment_guid,
            report_comment=data['report_comment'],
            comment_visibility_ind=data['comment_visibility_ind'],
        )

        try:
            mine_report_comment.save()
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return mine_report_comment, 201

    @api.doc(
        description='Delete a mine report comment by guid', params={'mine_report_comment_guid': 'guid of the comment to delete.'})
    @requires_role_mine_admin
    def delete(self, mine_guid, mine_report_guid, mine_report_submission_guid, mine_report_comment_guid):
        if mine_report_comment_guid is None:
            return self.create_error_payload(404, 'Must provide a mine report comment guid.'), 404
        try:
            comment = MineReportComment.find_by_guid(mine_report_comment_guid)
        except DBAPIError:
            return self.create_error_payload(422, 'Invalid Mine Report Comment guid'), 422
        if comment is None:
            return self.create_error_payload(404, 'Mine report comment guid with "{mine_report_comment_guid}" not found.'), 404

        comment.deleted_ind = True
        comment.save()

        return ('', 204)
