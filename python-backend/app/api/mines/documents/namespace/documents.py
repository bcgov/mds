from flask_restplus import Namespace

from ..expected.resources.mine_documents import ExpectedMineDocumentResource
from ..expected.resources.expected_documents import ExpectedDocumentResource, ExpectedDocumentListResource
from ..expected.resources.document_status import ExpectedDocumentStatusResource
from ..expected.resources.expected_document_uploads import ExpectedDocumentUploadResource

#this will be replaced by code required reports
api = Namespace('documents/expected',
                description='MDS records of documents, expected documents, and required documents')

api.add_resource(ExpectedMineDocumentResource, '/mines/<string:mine_guid>')
api.add_resource(ExpectedDocumentListResource, '/')
api.add_resource(ExpectedDocumentResource, '/<string:exp_doc_guid>')

api.add_resource(ExpectedDocumentStatusResource, '/status')

api.add_resource(ExpectedDocumentUploadResource, '/<string:expected_document_guid>/document',
                 '/<string:expected_document_guid>/document/<string:mine_document_guid>')
