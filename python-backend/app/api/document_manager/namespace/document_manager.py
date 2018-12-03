from flask_restplus import Namespace

from ..resources.document_manager import DocumentManagerResource

api = Namespace('document-manager', description='Document Manager for uploading and keeping track of files and then serving them to users.')

api.add_resource(DocumentManagerResource, '', '/<string:document_guid>')