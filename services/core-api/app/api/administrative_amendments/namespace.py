from flask_restplus import Namespace

from app.api.administrative_amendments.resources.administrative_amendment_list_resource import AdministrativeAmendmentListResource

api = Namespace('applications', description='Core Notice of Work operations')

api.add_resource(AdministrativeAmendmentListResource, '/administrative-amendments')

# static content