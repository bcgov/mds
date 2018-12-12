from flask_restplus import Namespace

from ..party.resources.party_resource import PartyResource
from ..party.resources.manager_resource import ManagerResource
from ..party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from ..party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource

api = Namespace('parties', description='Party related operations')

api.add_resource(PartyResource, '', '/<string:party_guid>')
api.add_resource(ManagerResource, '/managers',
                 '/managers/<string:mgr_appointment_guid>')
api.add_resource(MinePartyApptResource, '/mines',
                 '/mines/<string:mine_party_appt_guid>')
api.add_resource(
    MinePartyApptTypeResource, '/mines/relationship-types',
    '/mines/relationship-types/<string:mine_party_appt_type_code>')
