from flask_restplus import Namespace

from ..resources.required_documents import RequiredDocumentResource

api = Namespace('/required-documents',
                description='MDS records of documents, expected documents, and required documents')

api.add_resource(RequiredDocumentResource, '/required', '/required/<string:req_doc_guid>')