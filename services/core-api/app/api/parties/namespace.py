from flask_restplus import Namespace

from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.sub_division_code_resource import SubDivisionCodeResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.parties.party.resources.orgbook_resources import SearchAutocompleteList, CredentialRetrieveFormatted
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource

api = Namespace('parties', description='Party related operations')

api.add_resource(PartyListResource, '')
api.add_resource(PartyResource, '/<string:party_guid>')

api.add_resource(SubDivisionCodeResource, '/sub-division-codes')

api.add_resource(MinePartyApptResource, '/mines', '/mines/<string:mine_party_appt_guid>')
api.add_resource(MinePartyApptTypeResource, '/mines/relationship-types',
                 '/mines/relationship-types/<string:mine_party_appt_type_code>')

api.add_resource(SearchAutocompleteList, '/orgbook/search')
api.add_resource(CredentialRetrieveFormatted, '/orgbook/credential/<int:credential_id>')
