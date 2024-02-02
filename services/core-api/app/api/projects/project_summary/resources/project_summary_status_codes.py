from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.projects.response_models import PROJECT_SUMMARY_STATUS_CODE_MODEL
from app.api.projects.project_summary.models.project_summary_status_code import ProjectSummaryStatusCode


class ProjectSummaryStatusCodeResource(Resource):
    @api.marshal_with(PROJECT_SUMMARY_STATUS_CODE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible project description status codes')
    @requires_role_view_all
    def get(self):
        return ProjectSummaryStatusCode.get_all()
