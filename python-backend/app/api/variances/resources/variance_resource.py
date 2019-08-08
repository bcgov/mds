from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_filters
from sqlalchemy import desc

from app.extensions import api

from ..models.variance import Variance
from ..models.variance_application_status_code import VarianceApplicationStatusCode
from ..response_models import PAGINATED_VARIANCE_LIST
from ...utils.access_decorators import requires_any_of, VIEW_ALL
from ...utils.resources_mixins import UserMixin, ErrorMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class VarianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of variances. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'variance_application_status_code':
            'Comma-separated list of code statuses to include in results. Default: All status codes.',
            'compliance_code':'Comma-separated list of compliance codes to be filtered. Default: All compliance codes',
            'major': 'boolean indicating if variance is from a major or regional mine',
            'region': 'Comma-separated list of regions the mines associated with the variances are located in',
            'issue_date_before': 'Latest possible issue date returned',
            'issue_date_after': 'Earliest possible issue date returned',
            'expiry_date_before': 'Latest possible expiry date returned',
            'expiry_date_after': 'Earliest possible expiry date returned'})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PAGINATED_VARIANCE_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            application_status=request.args.get('variance_application_status_code', type=str))

        if not records:
            raise BadRequest('Unable to fetch variances.')

        return {
            'records': records.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    def _apply_filters_and_pagination(self,
                                      page_number=PAGE_DEFAULT,
                                      page_size=PER_PAGE_DEFAULT,
                                      application_status=None):
        status_filter_values = list(map(
            lambda x: x.variance_application_status_code,
            VarianceApplicationStatusCode.active()))

        if application_status is not None:
            status_filter_values = application_status.split(',')

        filtered_query = apply_filters(
            Variance.query.order_by(desc(Variance.received_date)),
            [{
                'field': 'variance_application_status_code',
                'op': 'in',
                'value': status_filter_values
            }])

        return apply_pagination(filtered_query, page_number, page_size)
