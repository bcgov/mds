from flask_restx import Resource

from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project_summary.models.project_summary_ministry_comment import ProjectSummaryMinistryComment
from app.api.projects.response_models import PROJECT_SUMMARY_MINISTRY_COMMENT
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class ProjectSummaryMinistryCommentResource(Resource, UserMixin):
    @requires_role_view_all
    @api.marshal_with(PROJECT_SUMMARY_MINISTRY_COMMENT, code=200, envelope='records')
    def get(self, project_summary_guid):
        return ProjectSummaryMinistryComment.get_by_project_summary_guid(project_summary_guid)

    parser = CustomReqparser()
    parser.add_argument(
        'content',
        type=str,
        required=True,
        store_missing=False,
    )

    @api.expect(parser)
    @api.marshal_with(PROJECT_SUMMARY_MINISTRY_COMMENT, code=201)
    def post(self, project_summary_guid):
        data = self.parser.parse_args()
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid)

        if not project_summary:
            return {'message': f'No project summary found with project summary id {project_summary_guid}'}, 404

        content = data.get('content')

        return ProjectSummaryMinistryComment.create(project_summary, content)
