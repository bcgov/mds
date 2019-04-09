from flask_restplus import Namespace
from app.api.applications.resources.application import ApplicationResource, ApplicationListResource
from app.api.applications.resources.application_status_code import ApplicationStatusCodeResource

api = Namespace('applications', description='Application related operations')

api.add_resource(ApplicationListResource, '')
api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(ApplicationStatusCodeResource, '/status-codes')
