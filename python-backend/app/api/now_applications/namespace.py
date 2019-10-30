from flask_restplus import Namespace

from app.api.now_applications.resources.now_application_import_resource import NOWApplicationImportResource

api = Namespace('now-applications', description='Party related operations')

api.add_resource(NOWApplicationImportResource, '/<string:application_guid>/import')