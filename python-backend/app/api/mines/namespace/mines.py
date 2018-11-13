from flask_restplus import Namespace

from ..mine.resources.mine import MineResource, MineListByName
from ..location.resources.location import MineLocationResource
from ..status.resources.status import MineStatusResource
from ..region.resources.region import MineRegionResource

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '', '/<string:mine_no_or_guid>')
api.add_resource(MineListByName, '/names')
api.add_resource(MineLocationResource, '/location', '/location/<string:mine_location_guid>')
api.add_resource(MineStatusResource, '/status', '/status/<string:mine_status_guid>')
api.add_resource(MineRegionResource,'/region','/region/<string:mine_region_guid>')
