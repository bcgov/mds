from flask_restplus import Namespace

from app.api.now_applications.resources.test_resource import NOWApplicationResource
from app.api.now_applications.resources.now_application_import_resource import NOWApplicationImportResource

api = Namespace('now_applications', description='Party related operations')

api.add_resource(NOWApplicationResource, '/<string:application_guid>')
api.add_resource(NOWApplicationImportResource, '/<string:application_guid>/import')