from flask_restx import Namespace

from app.api.now_submissions.resources.application_resource import ApplicationResource
from app.api.now_submissions.resources.application_list_resource import ApplicationListResource
from app.api.now_submissions.resources.application_nda_resource import ApplicationNDAResource
from app.api.now_submissions.resources.application_nda_list_resource import ApplicationNDAListResource
from app.api.now_submissions.resources.application_document_resource import ApplicationDocumentResource, ApplicationDocumentTokenResource
from app.api.now_submissions.resources.application_status_resource import ApplicationStatusResource, ApplicationStatusListResource

from app.api.now_submissions.resources.application_start_stop_list_resource import ApplicationStartStopListResource

api = Namespace('now-submissions', description='NROS/VFCBC Notice of Work submission operations')

api.add_resource(ApplicationListResource, '/applications')
api.add_resource(ApplicationResource, '/applications/<string:application_guid>')
api.add_resource(ApplicationNDAListResource, '/applications-nda')
api.add_resource(ApplicationNDAResource, '/applications-nda/<int:application_nda_guid>')
api.add_resource(ApplicationDocumentResource,
                 '/applications/<string:application_guid>/document/<int:id>')
api.add_resource(ApplicationDocumentTokenResource,
                 '/applications/<string:application_guid>/document/<int:id>/token')
api.add_resource(ApplicationStatusResource, '/applications/<string:now_number>/status')
api.add_resource(ApplicationStatusListResource, '/applications/status')
api.add_resource(ApplicationStartStopListResource, '/applications-startstop')
