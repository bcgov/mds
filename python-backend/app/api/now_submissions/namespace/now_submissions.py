from flask_restplus import Namespace

from app.api.now_submissions.resources.application_resource import ApplicationResource, ApplicationListResource

api = Namespace('now-submissions', description='Notice of Work operations')

api.add_resource(ApplicationListResource, '/applications')
api.add_resource(ApplicationResource, '/applications/<string:application_guid>')
