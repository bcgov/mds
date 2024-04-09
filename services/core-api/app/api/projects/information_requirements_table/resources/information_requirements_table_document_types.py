from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.projects.response_models import IRT_DOCUMENT_TYPE_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table_document_type import InformationRequirementsTableDocumentType


class InformationRequirementsTableDocumentTypeResource(Resource):
    @api.marshal_with(
        IRT_DOCUMENT_TYPE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible information requirements table (IRT) document types')
    @requires_role_view_all
    def get(self):
        return InformationRequirementsTableDocumentType.get_all()
