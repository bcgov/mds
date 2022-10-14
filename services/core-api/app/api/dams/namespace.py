from flask_restplus import Namespace
from app.api.dams.resources.dam import DamResource
from app.api.dams.resources.dam_list import DamListResource

api = Namespace('dams', description='Dam related operations')

api.add_resource(DamListResource, '')
api.add_resource(DamResource, '/<string:dam_guid>')
