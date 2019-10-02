from flask_restplus import Namespace

from .resources.compliance_article import ComplianceArticleResource

api = Namespace('compliance', description='Mine related operations')

api.add_resource(ComplianceArticleResource, '/codes')