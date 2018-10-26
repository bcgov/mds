from flask_restplus import Namespace

from ..mine.resources.mine import MineResource, MineListByName
from ..location.resources.location import MineLocationResource
from ..status.resources.status import MineStatusResource

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '', '/<string:mine_no_or_guid>')
api.add_resource(MineListByName, '/names')
api.add_resource(MineLocationResource, '/location', '/location/<string:mine_location_guid>')
api.add_resource(MineStatusResource, '/status', '/status/<string:mine_status_guid>')
