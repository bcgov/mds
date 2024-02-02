from flask_restx import Namespace

from app.api.incidents.resources.mine_incident_category import MineIncidentCategoryResource
from app.api.incidents.resources.mine_incident_status_codes import MineIncidentStatusCodeResource
from app.api.incidents.resources.mine_incident_followup_types import MineIncidentFollowupTypeResource
from app.api.incidents.resources.mine_incident_determination_types import MineIncidentDeterminationTypeResource
from app.api.incidents.resources.mine_incident_document_type_codes import MineIncidentDocumentTypeCodeResource
from app.api.incidents.resources.incidents_resource import IncidentsResource
from app.api.incidents.resources.mine_incident_notes import MineIncidentNoteResource, MineIncidentNoteListResource

api = Namespace('incidents', description='Incidents actions/options')

api.add_resource(IncidentsResource, '')
api.add_resource(MineIncidentNoteListResource, '/<string:mine_incident_guid>/notes')
api.add_resource(MineIncidentNoteResource,
                 '/<string:mine_incident_guid>/notes/<string:mine_incident_note_guid>')
api.add_resource(MineIncidentFollowupTypeResource, '/followup-types')
api.add_resource(MineIncidentDeterminationTypeResource, '/determination-types')
api.add_resource(MineIncidentStatusCodeResource, '/status-codes')
api.add_resource(MineIncidentDocumentTypeCodeResource, '/document-types')
api.add_resource(MineIncidentCategoryResource, '/category-codes')