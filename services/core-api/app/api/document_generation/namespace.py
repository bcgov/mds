from flask_restplus import Namespace
from app.api.document_generation.resources.now_document import NoticeOfWorkDocumentResource

api = Namespace('documents', description='Generate documents for business objects.')

api.add_resource(NoticeOfWorkDocumentResource, '')
