from flask_restplus import Namespace
from app.api.document_generation.resources.now_document import NoticeOfWorkDocumentResource, NoticeOfWorkDocumentGenerationResource

api = Namespace('document-generation', description='Generate documents for business objects.')

api.add_resource(NoticeOfWorkDocumentResource, '/now')
api.add_resource(NoticeOfWorkDocumentGenerationResource, '/now/<string:document_type_code>')
