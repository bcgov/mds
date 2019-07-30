from flask_restplus import Namespace

from ..expected.resources.mine_documents import ExpectedMineDocumentResource
from ..expected.resources.documents import ExpectedDocumentResource
from ..expected.resources.document_status import ExpectedDocumentStatusResource
from ..expected.resources.expected_document_uploads import ExpectedDocumentUploadResource
from ..mines.resources.mine_document_resource import MineDocumentResource

api = Namespace('mines/<string:mine_guid>/documents',
                description='MDS records of documents, expected documents, and required documents')

api.add_resource(MineDocumentResource, '/')

api.add_resource(ExpectedMineDocumentResource, '/expected')

api.add_resource(ExpectedDocumentStatusResource, '/expected/status', '/expected/status')

api.add_resource(ExpectedDocumentUploadResource,
                 '/expected/<string:expected_document_guid>/document',
                 '/expected/<string:expected_document_guid>/document/<string:mine_document_guid>')
