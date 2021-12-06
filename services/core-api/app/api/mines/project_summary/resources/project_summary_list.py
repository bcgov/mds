from flask_restplus import Resource, inputs
from werkzeug.exceptions import NotFound
from decimal import Decimal

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, is_minespace_user
from app.api.mines.mine.models.mine import Mine
from app.api.mines.project_summary.response_models import PROJECT_SUMMARY_MODEL
from app.api.mines.project_summary.models.project_summary import ProjectSummary


class ProjectSummaryListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'project_summary_description',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'project_summary_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
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

    @api.doc(
        description='Get a list of all Project Summaries for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get Project Summaries for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        project_summaries = ProjectSummary.find_by_mine_guid(mine_guid)
        return project_summaries

    @api.doc(
        description='Create a new Project Summary.',
        params={'mine_guid': 'The GUID of the mine to create the Project Summary for.'})
    @api.expect(parser)
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=201)
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        data = self.parser.parse_args()
        project_summary = ProjectSummary.create(mine, data.get('project_summary_date'),
                                                data.get('project_summary_description'),
                                                data.get('documents', []))
        project_summary.save()

        if is_minespace_user():
            project_summary.send_project_summary_email_to_ministry(mine)

        return project_summary, 201
