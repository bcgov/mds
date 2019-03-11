from flask_restplus import Namespace
from app.api.applications.resources.apllication_resources import ApplicationResource

api = Namespace('applications', description='Application related operations')

api.add_resource(ApplicationResource, '', '/<string:mine_guid>')