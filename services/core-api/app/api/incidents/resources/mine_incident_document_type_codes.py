from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.incidents.response_models import MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL
from app.api.incidents.models.mine_incident_document_type_code import MineIncidentDocumentTypeCode


class MineIncidentDocumentTypeCodeResource(Resource):
    @api.marshal_with(
        MINE_INCIDENT_DOCUMENT_TYPE_CODE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible incident document types')
    @requires_role_view_all
    def get(self):
        return MineIncidentDocumentTypeCode.get_all()
