from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from ..models.mine_incident_determination_type import MineIncidentDeterminationType
from ...mine_api_models import MINE_INCIDENT_DETERMINATION_TYPE_MODEL


class MineIncidentDeterminationTypeResource(Resource):
    @api.marshal_with(MINE_INCIDENT_DETERMINATION_TYPE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible EMPR inspector determination types for dangerous occurrences')
    @requires_role_view_all
    def get(self):
        return MineIncidentDeterminationType.get_active()
