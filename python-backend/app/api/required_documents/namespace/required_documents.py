from flask_restplus import Namespace

from ..resources.required_documents import RequiredDocumentResource, RequiredDocumentListResource

api = Namespace('required-documents', description='MDS record of required documents')

api.add_resource(RequiredDocumentListResource, '')
api.add_resource(RequiredDocumentResource, '/<string:req_doc_guid>')