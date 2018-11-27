from flask_restplus import Namespace

from ..models.document_manager import DocumentManagerResource

api = Namespace('document_manager', description='MDS Document Manager for uploading files and serving them to users.')

api.add_resource(DocumentManagerResource, '/document-manager')