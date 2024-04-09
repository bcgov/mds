from flask_restx import Resource, fields

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.incidents.response_models import MINE_INCIDENT_STATUS_CODE_MODEL
from app.api.incidents.models.mine_incident_status_code import MineIncidentStatusCode


class MineIncidentStatusCodeResource(Resource):
    @api.marshal_with(MINE_INCIDENT_STATUS_CODE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible incident status codes')
    @requires_role_view_all
    def get(self):
        return MineIncidentStatusCode.get_all()
