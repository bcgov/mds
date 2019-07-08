from flask_restplus import Resource
from app.extensions import api

from ..models.variance_document_category_code import VarianceDocumentCategoryCode
from ..response_models import VARIANCE_DOCUMENT_CATEGORY_CODE
from ...utils.access_decorators import requires_any_of, VIEW_ALL
from ...utils.resources_mixins import UserMixin, ErrorMixin


class VarianceDocumentCategoryCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of all variance document category codes.',
        params={})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(VARIANCE_DOCUMENT_CATEGORY_CODE, code=200, envelope='records')
    def get(self):
        return VarianceDocumentCategoryCode.active()
