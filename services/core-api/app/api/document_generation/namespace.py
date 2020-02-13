from flask_restplus import Namespace

from app.api.document_generation.resources.now import NoticeOfWorkDocGen

api = Namespace('now-document-types', description='Generate Notice of Work documents')

api.add_resource(NoticeOfWorkDocGen, '/<string:document_type_code>/generate')
