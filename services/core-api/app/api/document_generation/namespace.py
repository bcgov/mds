from flask_restplus import Namespace
from app.api.document_generation.resources.now_document import NoticeOfWorkDocumentResource, NoticeOfWorkDocumentTokenResource, NoticeOfWorkDocumentGenerationResource

api = Namespace('now-document-types', description='Generate Notice of Work documents')

api.add_resource(NoticeOfWorkDocumentResource, '/<string:document_type_code>')
api.add_resource(NoticeOfWorkDocumentGenerationResource, '/<string:document_type_code>/generate')
api.add_resource(NoticeOfWorkDocumentTokenResource, '/<string:document_type_code>/token')
