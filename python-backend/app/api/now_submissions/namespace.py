from flask_restplus import Namespace

from .resources.application_resource import ApplicationResource
from .resources.application_document_resource import ApplicationDocumentResource, ApplicationDocumentTokenResource
from .resources.application_list_resource import ApplicationListResource

api = Namespace('now-submissions', description='Notice of Work operations')

api.add_resource(ApplicationListResource, '/applications')
api.add_resource(ApplicationResource, '/applications/<string:application_guid>')
api.add_resource(ApplicationDocumentResource,
                 '/applications/<string:application_guid>/document/<int:id>')
api.add_resource(ApplicationDocumentTokenResource,
                 '/applications/<string:application_guid>/document/<int:id>/token')
