from flask_restplus import Namespace

from app.api.incidents.resources.mine_incident_status_codes import MineIncidentStatusCodeResource
from app.api.incidents.resources.mine_incident_followup_types import MineIncidentFollowupTypeResource
from app.api.incidents.resources.mine_incident_determination_types import MineIncidentDeterminationTypeResource

api = Namespace('incidents', description='Incidents actions/options')

api.add_resource(MineIncidentFollowupTypeResource, '/followup-types')
api.add_resource(MineIncidentDeterminationTypeResource, '/determination-types')
api.add_resource(MineIncidentStatusCodeResource, '/status-codes')
