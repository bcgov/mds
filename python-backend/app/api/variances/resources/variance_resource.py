from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_filters

from app.extensions import api

from ..models.variance import Variance
from ..models.variance_application_status_code import VarianceApplicationStatusCode
from ..response_models import PAGINATED_VARIANCE_LIST
from ...utils.access_decorators import requires_any_of, MINE_VIEW
from ...utils.resources_mixins import UserMixin, ErrorMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class VarianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of variances.',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'variance_application_status_code':
            'Comma-separated list of code statuses to include in results. Default: All status codes.',
        })
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(PAGINATED_VARIANCE_LIST, code=200)
    def get(self):
        status_filter_values = list(map(
            lambda x: x.variance_application_status_code,
            VarianceApplicationStatusCode.active()))

        status_param = request.args.get('variance_application_status_code')
        if status_param is not None:
            status_filter_values = status_param.split(',')

        filtered_query = apply_filters(
            Variance.query,
            [{
                'field': 'variance_application_status_code',
                'op': 'in',
                'value': status_filter_values
            }])

        paginated_variances, pagination_details = apply_pagination(
            filtered_query, request.args.get('page', PAGE_DEFAULT, type=int),
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
