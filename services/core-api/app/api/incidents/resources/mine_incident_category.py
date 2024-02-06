from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.incidents.response_models import MINE_INCIDENT_CATEGORY_MODEL
from app.api.incidents.models.mine_incident_category import MineIncidentCategory


class MineIncidentCategoryResource(Resource):
    @api.marshal_with(MINE_INCIDENT_CATEGORY_MODEL, envelope='records', code=200, as_list=True)
    @api.doc(description='Returns the possible categories for dangerous occurrences')
    @requires_role_view_all
    def get(self):
        return MineIncidentCategory.get_all()
