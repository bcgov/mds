from flask_restx import Resource

from app.api.projects.information_requirements_table.models.information_requirements_table_status_code import InformationRequirementsTableStatusCode
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.projects.response_models import IRT_STATUS_CODE_MODEL


class InformationRequirementsTableStatusCodeResource(Resource):
    @requires_role_view_all
    @api.marshal_with(IRT_STATUS_CODE_MODEL, envelope='records', code=200)
    @api.doc(description='Returns the possible Information Requirements Table (IRT) status codes')
    def get(self):
        return InformationRequirementsTableStatusCode.get_all()