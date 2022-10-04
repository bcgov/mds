from flask_restplus import Namespace
from app.api.dams.resources.dam_list import DamListResource

api = Namespace('dams', description='Dam related operations')

api.add_resource(DamListResource, '')
