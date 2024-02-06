from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.incidents.response_models import MINE_INCIDENT_DETERMINATION_TYPE_MODEL
from app.api.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType


class MineIncidentDeterminationTypeResource(Resource):
    @api.marshal_with(
        MINE_INCIDENT_DETERMINATION_TYPE_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(
        description='Returns the possible inspector determination types for dangerous occurrences')
    @requires_role_view_all
    def get(self):
        return MineIncidentDeterminationType.get_all()
