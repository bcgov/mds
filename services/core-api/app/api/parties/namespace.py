from flask_restx import Namespace

from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.merge_resource import MergeResource
from app.api.parties.party.resources.sub_division_code_resource import SubDivisionCodeResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.parties.party.resources.party_orgbook_entity_list_resource import PartyOrgBookEntityListResource
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource

api = Namespace('parties', description='Party related operations')

api.add_resource(PartyListResource, '')
api.add_resource(PartyResource, '/<string:party_guid>')

api.add_resource(MergeResource, '/merge')

api.add_resource(SubDivisionCodeResource, '/sub-division-codes')

api.add_resource(MinePartyApptResource, '/mines', '/mines/<string:mine_party_appt_guid>')
api.add_resource(MinePartyApptTypeResource, '/mines/relationship-types',
                 '/mines/relationship-types/<string:mine_party_appt_type_code>')

api.add_resource(PartyOrgBookEntityListResource, '/<string:party_guid>/orgbook-entity')
