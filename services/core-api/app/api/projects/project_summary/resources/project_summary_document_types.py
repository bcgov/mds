from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.projects.response_models import PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL
from app.api.projects.project_summary.models.project_summary_document_type import ProjectSummaryDocumentType


class ProjectSummaryDocumentTypeResource(Resource):
    @api.marshal_with(
        PROJECT_SUMMARY_DOCUMENT_TYPE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible project description document types')
    @requires_role_view_all
    def get(self):
        return ProjectSummaryDocumentType.get_all()
