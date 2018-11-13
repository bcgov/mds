from flask_restplus import Namespace

from ..mine_documents.resources.expected_documents import MineExpectedDocumentResource

api = Namespace('documents', description='MDS records of documents, to be held by a document manager microservice in the future')

api.add_resource(MineExpectedDocumentResource, '/expected', '/expected/<string:mine_guid>')