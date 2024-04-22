from flask_restx import Namespace
from app.api.compliance.resources.compliance_article import ComplianceArticleResource
from app.api.compliance.resources.compliance_article_create_resource import ComplianceArticleCreateResource
from app.api.compliance.resources.compliance_article_update_resource import ComplianceArticleUpdateResource
from app.api.compliance.resources.compliance_document_resource import ComplianceDocumentResource, ComplianceDocumentTokenResource

api = Namespace('compliance', description='Mine related operations')

api.add_resource(ComplianceArticleResource, '/codes')
api.add_resource(ComplianceArticleCreateResource, '/codes/create')
api.add_resource(ComplianceArticleUpdateResource, '/codes/update')

api.add_resource(ComplianceDocumentResource, '/inspection/<int:inspection_id>/document/<int:attachment_id>')
api.add_resource(ComplianceDocumentTokenResource, '/inspection/<int:inspection_id>/document/<int:attachment_id>/token')