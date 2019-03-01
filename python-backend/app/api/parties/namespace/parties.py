from flask_restplus import Namespace

from ..party.resources.party_resource import PartyResource
from ..party.resources.sub_division_code_resource import SubDivisionCodeResource
from ..party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from ..party_appt.resources.mine_party_appt_admin_resource import MinePartyApptAdminResource
from ..party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource
from ..party.resources.party_advance_search import PartyAdvancedSearch

api = Namespace('parties', description='Party related operations')

api.add_resource(PartyResource, '', '/<string:party_guid>')

api.add_resource(SubDivisionCodeResource, '/sub-division-codes')

api.add_resource(MinePartyApptResource, '/mines',
                 '/mines/<string:mine_party_appt_guid>')
api.add_resource(
    MinePartyApptTypeResource, '/mines/relationship-types',
    '/mines/relationship-types/<string:mine_party_appt_type_code>')

api.add_resource(
        MinePartyApptAdminResource, '/mines/manager-history/csv')

api.add_resource(PartyAdvancedSearch, '/party/search/<string:contact_search_term>')
