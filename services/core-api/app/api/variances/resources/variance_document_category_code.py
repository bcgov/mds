from flask_restx import Resource
from app.extensions import api

from app.api.variances.models.variance_document_category_code import VarianceDocumentCategoryCode
from app.api.variances.response_models import VARIANCE_DOCUMENT_CATEGORY_CODE
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin


class VarianceDocumentCategoryCodeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all variance document category codes.', params={})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(VARIANCE_DOCUMENT_CATEGORY_CODE, code=200, envelope='records')
    def get(self):
        return VarianceDocumentCategoryCode.get_all()
