from flask_restplus import Namespace

from ..expected.resources.mine_documents import ExpectedMineDocumentResource
from ..expected.resources.documents import ExpectedDocumentResource
from ..required.resources.required_documents import RequiredDocumentResource
from ..expected.resources.document_status import ExpectedDocumentStatusResource
from ..expected.resources.expected_document_uploads import ExpectedDocumentUploadResource
from ..mines.resources.mine_document_resource import MineDocumentResource
from ..variances.resources.variance import VarianceDocumentListResource, VarianceDocumentResource
from ..variances.resources.variance_document_uploads import VarianceDocumentUploadResource, VarianceDocumentUploadedResource

api = Namespace(
    'documents', description='MDS records of documents, expected documents, and required documents')

api.add_resource(ExpectedMineDocumentResource, '/expected/mines',
                 '/expected/mines/<string:mine_guid>')
api.add_resource(ExpectedDocumentResource, '/expected', '/expected/<string:exp_doc_guid>')
api.add_resource(RequiredDocumentResource, '/required', '/required/<string:req_doc_guid>')

api.add_resource(ExpectedDocumentStatusResource, '/expected/status', '/expected/status')

api.add_resource(ExpectedDocumentUploadResource,
                 '/expected/<string:expected_document_guid>/document',
                 '/expected/<string:expected_document_guid>/document/<string:mine_document_guid>')

api.add_resource(MineDocumentResource, '/mines/<string:mine_guid>')

api.add_resource(VarianceDocumentListResource, '/variances/<string:variance_id>')
api.add_resource(VarianceDocumentResource, '/variances/<string:variance_id>/document/<string:mine_document_guid>')

api.add_resource(VarianceDocumentUploadResource, '/variances/<string:variance_id>')
api.add_resource(VarianceDocumentUploadedResource, '/variances/<string:variance_id>/document/<string:mine_document_guid>')
