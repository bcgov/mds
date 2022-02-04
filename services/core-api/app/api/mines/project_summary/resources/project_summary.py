from flask_restplus import Resource, inputs
from flask import request
from datetime import datetime
from sqlalchemy import desc, cast, NUMERIC, extract, asc
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest, NotFound
from decimal import Decimal

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, MINE_ADMIN, is_minespace_user, EDIT_PROJECT_SUMMARIES
from app.api.mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.project_summary.response_models import PROJECT_SUMMARY_MODEL
from app.api.mines.project_summary.models.project_summary import ProjectSummary

from app.api.incidents.response_models import PAGINATED_INCIDENT_LIST

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ProjectSummaryResource(Resource, UserMixin):

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
        'project_summary_lead_party_guid',
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
        description='Get a Project Description.',
        params={
            'mine_guid': 'The GUID of the mine the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200)
    def get(self, mine_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        if project_summary is None:
            raise NotFound('Project Description not found')

        return project_summary

    @api.doc(
        description='Update a Project Description.',
        params={
            'mine_guid': 'The GUID of the mine the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to update.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200)
    def put(self, mine_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        if project_summary is None:
            raise NotFound('Project Description not found')

        data = self.parser.parse_args()
        project_summary.update(
            data.get('project_summary_description'), data.get('project_summary_title'),
            data.get('proponent_project_id'), data.get('expected_draft_irt_submission_date'),
            data.get('expected_permit_application_date'), data.get('expected_permit_receipt_date'),
            data.get('expected_project_start_date'), data.get('status_code'),
            data.get('project_summary_lead_party_guid'), data.get('documents', []),
            data.get('contacts', []), data.get('authorizations', []))

        project_summary.save()
        return project_summary

    @api.doc(
        description='Delete a Project Description.',
        params={
            'mine_guid': 'The GUID of the mine the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to delete.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        if project_summary is None:
            raise NotFound('Project Description not found')

        if project_summary.status_code == 'DFT':
            project_summary.delete()
            return None, 204

        raise BadRequest(
            'Project description must have status code of "DRAFT" to be eligible for deletion.')
