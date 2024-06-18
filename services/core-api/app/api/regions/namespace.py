from flask_restx import Namespace

from app.api.regions.resources.region_list_resource import RegionListResource

api = Namespace('regions', description='Region options')

api.add_resource(RegionListResource, '')
