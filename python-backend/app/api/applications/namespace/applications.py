from flask_restplus import Namespace
from app.api.applications.resources.apllication import ApplicationResource

api = Namespace('applications', description='Application related operations')

api.add_resource(ApplicationResource, '', '/<string:application_guid>')