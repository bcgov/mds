from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_filters
from sqlalchemy import desc
from app.extensions import api
from ...mines.mine.models.mine import Mine
from ..models.variance import Variance
from ..models.variance_application_status_code import VarianceApplicationStatusCode
from ..response_models import PAGINATED_VARIANCE_LIST
from ...utils.access_decorators import requires_any_of, VIEW_ALL
from ...utils.resources_mixins import UserMixin, ErrorMixin
import logging
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
            'compliance_codes':'Comma-separated list of compliance codes to be filtered. Default: All compliance codes',
            'major': 'boolean indicating if variance is from a major or regional mine',
            'region': 'Comma-separated list of regions the mines associated with the variances are located in',
            'issue_date_before': 'Latest possible issue date returned',
            'issue_date_after': 'Earliest possible issue date returned',
            'expiry_date_before': 'Latest possible expiry date returned',
            'expiry_date_after': 'Earliest possible expiry date returned'})
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PAGINATED_VARIANCE_LIST, code=200)
    def get(self):
        args={
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size":request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            "application_status": request.args.get('variance_application_status_code', type=str),
            "compliance_codes": request.args.get('compliance_code', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.get('region', type=str),
            'issue_date_before': request.args.get('issue_date_before', type=str),
            'issue_date_after': request.args.get('issue_date_after', type=str),
            'expiry_date_before': request.args.get('expiry_date_before', type=str),
            'expiry_date_after': request.args.get('expiry_date_after', type=str),
            'search_terms': request.args.get('search', type=str),
        }


        records, pagination_details = self._apply_filters_and_pagination(args)

        if not records:
            raise BadRequest('Unable to fetch variances.')

        return {
            'records': records.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    def _apply_filters_and_pagination(self, args):

        # TODO figure out why status filter is not used
        status_filter_values = list(map(
            lambda x: x.variance_application_status_code,
            VarianceApplicationStatusCode.active()))

        if args["page_number"] is None:
            args["page_number"]=PAGE_DEFAULT
        if args["page_size"] is None:
            args["page_size"] = PER_PAGE_DEFAULT

        conditions = []
        if args["application_status"] is not None:
            status_filter_values = args["application_status"].split(',')
            conditions.append({
                'model': 'Variance',
                'field': 'variance_application_status_code',
                'op': 'in',
                'value': status_filter_values
            })
        if args["compliance_codes"] is not None:
            compliance_codes_values = args["compliance_codes"].split(',')
            conditions.append({
                'model': 'Variance',
                'field': 'compliance_article_id',
                'op': 'in',
                'value': compliance_codes_values
             })

        if args["expiry_date_before"] is not None:
            conditions.append({
              'model': 'Variance',
              'field':  'expiry_date',
              'op': '<=',
              'value': args["expiry_date_before"]
            })
        if args["expiry_date_after"] is not None:
            conditions.append({
              'model': 'Variance',
              'field': 'expiry_date',
              'op': '>=',
              'value': args["expiry_date_after"]
            })
        if args["issue_date_before"] is not None:
            conditions.append({
              'model': 'Variance',
              'field': 'issue_date',
              'op': '<=',
              'value': args["issue_date_before"]
            })
        if args["issue_date_after"] is not None:
            conditions.append({
              'model': 'Variance',
              'field': 'issue_date',
              'op': '>=',
              'value': args["issue_date_after"]
            })

        if args["major"] is not None:
            conditions.append({
                'model': 'Mine',
                'field': 'major_mine_ind',
                'op': '==',
                'value': args["major"]
            })
        if args["search_terms"] is not None:
            search_term_list = args["search_terms"].split(' ')
            search_conditions = []
            for search_term in search_term_list:
                search_conditions.append(
                    {
                        'model': 'Mine',
                        'field': 'mine_name',
                        'op': 'ilike',
                        'value': '%{}%'.format(search_term)
                    })
                search_conditions.append(
                    {
                        'model': 'Mine',
                        'field': 'mine_no',
                        'op': 'ilike',
                        'value': '%{}%'.format(search_term)
                    },
                )
            conditions.append(
                {
                    'or': search_conditions
                })

        if args["region"] is not None:
            region_list = args["region"].split(',')
            conditions.append({
                'model': 'Mine',
                'field': 'mine_region',
                'op': 'in',
                'value': region_list
            })

        query = Variance.query.join(Mine)

        filtered_query = apply_filters(
            query.order_by(desc(Variance.received_date)), conditions)

        return apply_pagination(filtered_query, args["page_number"], args["page_size"])
