from flask_restx import Namespace
from app.api.compliance.resources.compliance_article import ComplianceArticleResource
from app.api.compliance.resources.compliance_article_create import ComplianceArticleCreateResource
from app.api.compliance.resources.compliance_article_update import ComplianceArticleUpdateResource
from app.api.compliance.resources.compliance_document_resource import ComplianceDocumentResource, ComplianceDocumentTokenResource

api = Namespace('compliance', description='Mine related operations')

api.add_resource(ComplianceArticleResource, '/codes')
api.add_resource(ComplianceArticleCreateResource, '')
api.add_resource(ComplianceArticleUpdateResource, '/<int:compliance_article_id>')

api.add_resource(ComplianceDocumentResource, '/inspection/<int:inspection_id>/document/<int:attachment_id>')
api.add_resource(ComplianceDocumentTokenResource, '/inspection/<int:inspection_id>/document/<int:attachment_id>/token')