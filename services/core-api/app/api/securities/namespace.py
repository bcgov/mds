from flask_restplus import Namespace

from app.api.securities.resources.bond import BondListResource, BondResource

api = Namespace('bonds', description='Core Bond Operations')

api.add_resource(BondListResource, '')
api.add_resource(BondResource, '/<bond_guid>')
