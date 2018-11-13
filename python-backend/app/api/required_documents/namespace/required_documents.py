from flask_restplus import Namespace

from ..required_document.resources.required_document import RequiredDocumentResource

api = Namespace('required_documents', description='Repository of Required Documents for MDS Objects (TSF, Mines, Permit Applications, etc)')

api.add_resource(RequiredDocumentResource, '', '/<string:req_doc_guid>')