from flask_restplus import Namespace

from ..resources.document_manager import DocumentManagerResource

api = Namespace('document-manager', description='MDS Document Manager for uploading files and serving them to users.')

api.add_resource(DocumentManagerResource, '', '')