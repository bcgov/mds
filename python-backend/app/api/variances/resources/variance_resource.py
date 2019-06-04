from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination

from app.extensions import api

from ..models.variance import Variance
from ..response_models import PAGINATED_VARIANCE_LIST
from ...utils.access_decorators import requires_any_of, MINE_VIEW
from ...utils.resources_mixins import UserMixin, ErrorMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25

class VarianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of variances.',
        params={})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(PAGINATED_VARIANCE_LIST, code=200)
    def get(self):
        paginated_variances, pagination_details = apply_pagination(
            Variance.query,
            request.args.get('page', PAGE_DEFAULT, type=int),
            request.args.get('per_page', PER_PAGE_DEFAULT, type=int))

        if not paginated_variances:
            raise BadRequest('Unable to fetch variances.')

        return {
            'records': paginated_variances.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }
