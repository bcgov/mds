from flask_restplus import Namespace

from app.api.securities.resources.bond import BondListResource, BondResource
from app.api.securities.resources.bond_status import BondStatusResource
from app.api.securities.resources.bond_type import BondTypeResource
from app.api.securities.resources.bond_document import BondDocumentListResource

api = Namespace('bonds', description='Core Bond Operations')

api.add_resource(BondListResource, '')
api.add_resource(BondResource, '/<bond_guid>')
api.add_resource(BondStatusResource, '/status-codes')
api.add_resource(BondTypeResource, '/type-codes')
api.add_resource(
    BondDocumentListResource,
    '/<string:mine_guid>/bonds/documents',
)