from flask_restplus import Namespace

from ..party.resources.party import PartyResource, ManagerResource

api = Namespace('parties', description='Party related operations')

api.add_resource(PartyResource, '', '/<string:party_guid>')
api.add_resource(ManagerResource, '/managers', '/managers/<string:mgr_appointment_guid>')
