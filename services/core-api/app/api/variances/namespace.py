from flask_restx import Namespace

from app.api.variances.resources.variance_resource import VarianceResource
from app.api.variances.resources.variance_application_status_code import VarianceApplicationStatusCodeResource
from app.api.variances.resources.variance_document_category_code import VarianceDocumentCategoryCodeResource

api = Namespace('variances', description='Variances actions/options')

api.add_resource(VarianceResource, '')
api.add_resource(VarianceApplicationStatusCodeResource, '/status-codes')
api.add_resource(VarianceDocumentCategoryCodeResource, '/document-categories')
