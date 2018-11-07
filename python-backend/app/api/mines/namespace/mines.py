from flask_restplus import Namespace

from ..mine.resources.mine import MineResource, MineListByName
from ..location.resources.location import MineLocationResource
from ..status.resources.status import MineStatusResource
<<<<<<< HEAD
from ..region.resources.region import MineRegionResource
=======
>>>>>>> 259eca472cd767968d5f5f8705f1e508f8a97d86

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '', '/<string:mine_no_or_guid>')
api.add_resource(MineListByName, '/names')
api.add_resource(MineLocationResource, '/location', '/location/<string:mine_location_guid>')
api.add_resource(MineStatusResource, '/status', '/status/<string:mine_status_guid>')
<<<<<<< HEAD
api.add_resource(MineRegionResource,'/region','/region/<string:mine_region_guid>')
=======
>>>>>>> 259eca472cd767968d5f5f8705f1e508f8a97d86
