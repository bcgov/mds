from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound
from datetime import datetime, timezone
from decimal import Decimal

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from werkzeug.exceptions import InternalServerError
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_EDIT, is_minespace_user
from app.api.mines.mine.models.mine import Mine
from app.api.projects.project_summary.response_models import PROJECT_SUMMARY_MODEL
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.projects.project_summary.models.project_summary_authorization import ProjectSummaryAuthorization


class ProjectSummaryListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'status_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'project_summary_description',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'project_summary_title',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'proponent_project_id',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_draft_irt_submission_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_permit_application_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_permit_receipt_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_project_start_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument('contacts', type=list, location='json', store_missing=False, required=False)
    parser.add_argument(
        'authorizations', type=list, location='json', store_missing=False, required=False)

    @api.doc(
        description='Get a list of all Project Summaries for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get Project Summaries for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        project_summaries = ProjectSummary.find_by_mine_guid(mine_guid, is_minespace_user())
        return project_summaries

    @api.doc(
        description='Create a new Project Description.',
        params={'mine_guid': 'The GUID of the mine to create the Project Description for.'})
    @api.expect(parser)
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        submission_date = datetime.now(
            tz=timezone.utc) if data.get('status_code') == 'SUB' else None
        project_summary = ProjectSummary.create(mine, data.get('project_summary_description'),
                                                data.get('project_summary_title'),
                                                data.get('proponent_project_id'),
                                                data.get('expected_draft_irt_submission_date'),
                                                data.get('expected_permit_application_date'),
                                                data.get('expected_permit_receipt_date'),
                                                data.get('expected_project_start_date'),
                                                data.get('status_code'), data.get('documents', []),
                                                data.get('contacts', []),
                                                data.get('authorizations', []), submission_date)

        try:
            project_summary.save()
            if is_minespace_user():
                if project_summary.status_code == 'SUB':
                    project_summary.send_project_summary_email_to_ministry(mine)
                    project_summary.send_project_summary_email_to_proponent(mine)
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return project_summary, 201
