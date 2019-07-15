from flask_restplus import Resource, fields

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from ..models.mine_incident_status_code import MineIncidentStatusCode
from ...mine_api_models import MINE_INCIDENT_STATUS_CDOE_MODEL


class MineIncidentStatusCodeResource(Resource):
    @api.marshal_with(MINE_INCIDENT_STATUS_CDOE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description=
             'Returns the possible EMPR inspector determination types for dangerous occurrences')
    @requires_role_view_all
    def get(self):
        return MineIncidentStatusCode.get_active()
