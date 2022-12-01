from flask import request
from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime, timezone

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from werkzeug.exceptions import InternalServerError
from app.api.activity.utils import trigger_notifcation
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_EDIT, is_minespace_user
from app.api.mines.mine.models.mine import Mine
from app.api.projects.response_models import PROJECT_SUMMARY_MODEL
from app.api.projects.project.models.project import Project
from app.api.projects.project_summary.models.project_summary import ProjectSummary


class ProjectSummaryListGetResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of all Project Descriptions for a given project.',
        params={'project_guid': 'The GUID of the project to get Project Descriptions for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200, envelope='records')
    def get(self, project_guid):
        # Until the Minespace UI is updated to support projects, we need to retrieve all projects by mine.
        # After retrieving all projects we can retrieve all project descriptions and show the entirety.
        # TODO: LONG TERM FLOW - COMPLETE THIS WHEN MINESPACE IS UPDATED...

        # TODO: TEMPORARY FLOW - WILL BE REMOVED
        mine_guid = request.args.get('mine_guid', type=str)
        if mine_guid is None:
            raise BadRequest('Cannot retrieve Project Descriptions because no mine was provided.')
        projects = Project.find_by_mine_guid(mine_guid)
        project_summaries = []
        for project in projects:
            project_project_summaries = ProjectSummary.find_by_project_guid(
                project.project_guid, is_minespace_user())
            project_summaries = [*project_summaries, *project_project_summaries]

        return project_summaries


class ProjectSummaryListPostResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'mine_guid',
        type=str,
        store_missing=False,
        required=True,
    )
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
        'mrc_review_required',
        type=bool,
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
        'project_lead_party_guid',
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

    @api.doc(description='Create a new Project Description.')
    @api.expect(parser)
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self):
        data = self.parser.parse_args()

        mine_guid = data.get('mine_guid')
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        new_project = Project.create(mine, data.get('project_summary_title'),
                                     data.get('proponent_project_id'),
                                     data.get('mrc_review_required', False),
                                     data.get('contacts', []),
                                     data.get('project_lead_party_guid', None))

        submission_date = datetime.now(
            tz=timezone.utc) if data.get('status_code') == 'SUB' else None
        project_summary = ProjectSummary.create(new_project, mine,
                                                data.get('project_summary_description'),
                                                data.get('expected_draft_irt_submission_date'),
                                                data.get('expected_permit_application_date'),
                                                data.get('expected_permit_receipt_date'),
                                                data.get('expected_project_start_date'),
                                                data.get('status_code'), data.get('documents', []),
                                                data.get('authorizations', []), submission_date)

        try:
            project_summary.save()
            if project_summary.status_code == 'SUB':
                if is_minespace_user():
                    project_summary.send_project_summary_email(mine)
                # Trigger notification for newly submitted Project Summary
                message = f'A Major Mine Description called ({new_project.project_title}) has been submitted for ({new_project.mine_name})'
                extra_data = {'project': {'project_guid': str(new_project.project_guid)}}
                trigger_notifcation(message, new_project.mine, 'ProjectSummary', project_summary.project_summary_guid, extra_data)
        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return project_summary, 201
