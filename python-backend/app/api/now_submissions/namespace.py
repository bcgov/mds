from flask_restplus import Namespace

from app.api.now_submissions.resources.application_resource import ApplicationResource
from app.api.now_submissions.resources.application_document_resource import ApplicationDocumentResource, ApplicationDocumentTokenResource


api = Namespace('now-submissions', description='Notice of Work operations')

api.add_resource(ApplicationResource, '/applications/<string:application_guid>')
api.add_resource(ApplicationDocumentResource,
                 '/applications/<string:application_guid>/document/<int:id>')
api.add_resource(ApplicationDocumentTokenResource,
                 '/applications/<string:application_guid>/document/<int:id>/token')
