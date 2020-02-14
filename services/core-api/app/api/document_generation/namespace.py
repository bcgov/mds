from flask_restplus import Namespace

from app.api.document_generation.resources.now import NoticeOfWorkDocumentGeneration

api = Namespace('now-document-types', description='Generate Notice of Work documents')

api.add_resource(NoticeOfWorkDocumentGeneration, '/<string:document_type_code>/generate')
