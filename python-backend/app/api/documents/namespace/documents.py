from flask_restplus import Namespace

from ..expected.resources.mine_documents import ExpectedMineDocumentResource
from ..expected.resources.documents import ExpectedDocumentResource
from ..required.resources.required_documents import RequiredDocumentResource
from ..expected.resources.document_status import ExpectedDocumentStatusResource
from ..expected.resources.expected_document_uploads import ExpectedDocumentUploadResource
from ..mines.resources.mine_document_resource import MineDocumentResource

api = Namespace(
    'documents', description='MDS records of documents, expected documents, and required documents')

api.add_resource(ExpectedMineDocumentResource, '/expected/mines',
                 '/expected/mines/<string:mine_guid>')
api.add_resource(ExpectedDocumentResource, '/expected', '/expected/<string:exp_doc_guid>')
api.add_resource(RequiredDocumentResource, '/required', '/required/<string:req_doc_guid>')

api.add_resource(ExpectedDocumentStatusResource, '/expected/status', '/expected/status')

api.add_resource(ExpectedDocumentUploadResource,
                 '/expected/upload',#/<string:expected_document_guid>',
                 '/expected/<string:expected_document_guid>/document/<string:mine_document_guid>')

api.add_resource(MineDocumentResource, '/mines/<string:mine_guid>')
