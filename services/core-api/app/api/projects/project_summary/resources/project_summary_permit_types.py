from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.projects.response_models import PROJECT_SUMMARY_PERMIT_TYPE_MODEL
from app.api.projects.project_summary.models.project_summary_permit_type import ProjectSummaryPermitType


class ProjectSummaryPermitTypeResource(Resource):
    @api.marshal_with(PROJECT_SUMMARY_PERMIT_TYPE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible project description permit types')
    @requires_role_view_all
    def get(self):
        return ProjectSummaryPermitType.get_all()
