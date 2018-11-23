from flask_restplus import Namespace

from ..expected.resources.mine_documents import ExpectedMineDocumentResource
from ..expected.resources.documents import ExpectedDocumentResource
from ..required.resources.required_documents import RequiredDocumentResource

api = Namespace('documents', description='MDS records of documents, expected documents, and required documents')

api.add_resource(ExpectedMineDocumentResource, '/expected/mines', '/expected/mines/<string:mine_guid>')
api.add_resource(ExpectedDocumentResource, '/expected', '/expected/<string:exp_doc_guid>')
api.add_resource(RequiredDocumentResource, '/required', '/required/<string:req_doc_guid>')