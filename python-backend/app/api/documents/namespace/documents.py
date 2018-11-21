from flask_restplus import Namespace

from ..mines.resources.expected_documents import MineExpectedDocumentResource
from ..required.resources.required_documents import RequiredDocumentResource

api = Namespace('documents', description='MDS records of documents, expected documents, and required documents')

api.add_resource(MineExpectedDocumentResource, '/mines/expected', '/mines/expected/<string:mine_guid>')
api.add_resource(RequiredDocumentResource, '/required', '/required/<string:req_doc_guid>')