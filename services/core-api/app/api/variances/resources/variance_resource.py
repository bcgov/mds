from flask import request, current_app
from flask_restx import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from sqlalchemy import desc, cast, NUMERIC, func, or_
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin

from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.variances.models.variance import Variance
from app.api.variances.models.variance_application_status_code import VarianceApplicationStatusCode
from app.api.variances.response_models import PAGINATED_VARIANCE_LIST

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class VarianceResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of variances. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'variance_application_status_code':
            'Status Codes. Default: All status codes.',
            'compliance_codes':
            'List of compliance codes to be filtered. Default: All compliance codes',
            'major': 'boolean indicating if variance is from a major or regional mine',
            'region':
            'Regions the mines associated with the variances are located in',
            'sort_field': 'The field the returned results will be ordered by',
            'sort_dir': 'The direction by which the sort field is ordered',
            'issue_date_before': 'Latest possible issue date returned (inclusive)',
            'issue_date_after': 'Earliest possible issue date returned (inclusive)',
            'expiry_date_before': 'Latest possible expiry date returned (inclusive)',
            'expiry_date_after': 'Earliest possible expiry date returned (inclusive)'
        })
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PAGINATED_VARIANCE_LIST, code=200)
    def get(self):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            "application_status": request.args.getlist('variance_application_status_code', type=str),
            "compliance_codes": request.args.getlist('compliance_code', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.getlist('region', type=str),
            'issue_date_before': request.args.get('issue_date_before', type=str),
            'issue_date_after': request.args.get('issue_date_after', type=str),
            'expiry_date_before': request.args.get('expiry_date_before', type=str),
            'expiry_date_after': request.args.get('expiry_date_after', type=str),
            'search_terms': request.args.get('search', type=str),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
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

    @classmethod
    def _build_filter(cls, model, field, op, argfield):
        return {'model': model, 'field': field, 'op': op, 'value': argfield}

    def _apply_filters_and_pagination(self, args):
        sort_models = {
            'variance_id': 'Variance',
            'compliance_article_id': 'Variance',
            'lead_inspector': 'Variance',
            'received_date': 'Variance',
            'mine_name': 'Mine',
            'variance_application_status_code': 'Variance'
        }

        status_filter_values = list(
            map(lambda x: x.variance_application_status_code,
                VarianceApplicationStatusCode.get_all()))

        conditions = []
        if args["application_status"]:
            conditions.append(
                self._build_filter('Variance', 'variance_application_status_code', 'in',
                                   args["application_status"]))

        if args["compliance_codes"]:
            conditions.append(
                self._build_filter('Variance', 'compliance_article_id', 'in',
                                   args["compliance_codes"]))

        if args["expiry_date_before"] is not None:
            conditions.append(
                self._build_filter('Variance', 'expiry_date', '<=', args["expiry_date_before"]))

        if args["expiry_date_after"] is not None:
            conditions.append(
                self._build_filter('Variance', 'expiry_date', '>=', args["expiry_date_after"]))

        if args["issue_date_before"] is not None:
            conditions.append(
                self._build_filter('Variance', 'issue_date', '<=', args["issue_date_before"]))

        if args["issue_date_after"] is not None:
            conditions.append(
                self._build_filter('Variance', 'issue_date', '>=', args["issue_date_after"]))

        if args["major"]:
            conditions.append(self._build_filter('Mine', 'major_mine_ind', '==', args["major"]))

        if args["search_terms"] is not None:
            search_conditions = [
                self._build_filter('Mine', 'mine_name', 'ilike',
                                   '%{}%'.format(args["search_terms"])),
                self._build_filter('Mine', 'mine_no', 'ilike', '%{}%'.format(args["search_terms"]))
            ]
            conditions.append({'or': search_conditions})

        if args["region"]:
            conditions.append(self._build_filter('Mine', 'mine_region', 'in', args["region"]))

        query = Variance.query.filter_by(deleted_ind=False).join(Mine).join(ComplianceArticle)

        # Apply sorting
        if args['sort_field'] and args['sort_dir']:
            # The compliance sorting must be custom due to the code being stored in multiple columns.
            if args['sort_field'] == "compliance_article_id":
                if args['sort_dir'] == 'desc':
                    filtered_query = apply_filters(
                        query.order_by(
                            desc(cast(ComplianceArticle.section, NUMERIC)),
                            desc(cast(ComplianceArticle.sub_section, NUMERIC)),
                            desc(cast(ComplianceArticle.paragraph, NUMERIC)),
                            desc(ComplianceArticle.sub_paragraph)), conditions)
                elif args['sort_dir'] == 'asc':
                    filtered_query = apply_filters(
                        query.order_by(
                            cast(ComplianceArticle.section, NUMERIC),
                            cast(ComplianceArticle.sub_section, NUMERIC),
                            cast(ComplianceArticle.paragraph, NUMERIC),
                            ComplianceArticle.sub_paragraph), conditions)
            elif args['sort_field'] == "lead_inspector":
                query = query.outerjoin(Party, Variance.inspector_party_guid == Party.party_guid)
                filtered_query = apply_filters(query, conditions)
                sort_criteria = [{
                    'model': 'Party',
                    'field': 'party_name',
                    'direction': args['sort_dir']
                }]
                filtered_query = apply_sort(filtered_query, sort_criteria)
            else:
                filtered_query = apply_filters(query, conditions)
                sort_criteria = [{
                    'model': sort_models[args['sort_field']],
                    'field': args['sort_field'],
                    'direction': args['sort_dir']
                }]
                filtered_query = apply_sort(filtered_query, sort_criteria)
        else:
            filtered_query = apply_filters(query, conditions)

            # default sorting is by submission date descending
            sort_criteria = [{'model': 'Variance', 'field': 'received_date', 'direction': 'desc'}]
            filtered_query = apply_sort(filtered_query, sort_criteria)

        return apply_pagination(filtered_query, args["page_number"], args["page_size"])
