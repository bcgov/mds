from flask_restplus import Namespace
from ..layer.resources.mine_region import MineRegionResource
from ..layer.resources.mine_region_query import MineRegionQueryResource

api = Namespace('map', description='User related operations')

api.add_resource(MineRegionResource, '/layer/mine_region')
api.add_resource(MineRegionQueryResource, '/layer/mine_region/query')