from flask_restplus import Resource
from flask import request
from datetime import datetime
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from sqlalchemy import desc, cast, NUMERIC, extract
from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from ..models.mine_incident import MineIncident
from app.api.incidents.models.mine_incident_do_subparagraph import MineIncidentDoSubparagraph
from ..response_models import PAGINATED_INCIDENT_LIST
from ...utils.access_decorators import requires_any_of, VIEW_ALL
from ...utils.resources_mixins import UserMixin, ErrorMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class IncidentsResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of incidents. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'search': 'A string to be search in the incident number, mine name, or mine number',
            'status': 'Comma-separated list of the incident status codes',
            'determination':  'Comma-separated list of the inspectors determination, a three character code',
            'codes': 'Comma-separated list of code sub_paragraphs to include in results. Default: All status codes.',
            'incident_year': 'Return only incidents for this year',
            'major': 'boolean indicating if incident is from a major or regional mine',
            'region': 'Comma-separated list of regions the mines associated with the incident are located in',
            'sort_field': 'The field the returned results will be ordered by',
            'sort_dir': 'The direction by which the sort field is ordered',
        })

    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PAGINATED_INCIDENT_LIST, code=200)
    def get(self):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size":request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            "status": request.args.get('status', type=str),
            "determination": request.args.get('determination', type=str),
            "codes": request.args.get('codes', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.get('region', type=str),
            'year': request.args.get('incident_year', type=str),
            'search_terms': request.args.get('search', type=str),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
        }

        records, pagination_details = self._apply_filters_and_pagination(args)
        if not records:
            raise BadRequest('Unable to fetch incidents.')
        return {
            'records': records.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @classmethod
    def _build_filter(cls, model, field, op, argfield):
        return {
            'model': model,
            'field': field,
            'op': op,
            'value': argfield
        }

    def _apply_filters_and_pagination(self, args):
        sort_models = {
            "date": 'MineIncident',
            # TODO: Mine incident_no is not currently implemented
            # "incident_no": 'MineIncident',
            "determination": 'MineIncident',
            "status": 'MineIncident',
            "mine_name": 'Mine',
        }

        sort_field = {
            "date": 'incident_timestamp',
            # TODO: Mine incident_no is not currently implemented
            # "incident_no": 'mine_incident_no',
            "determination": 'determination_type_code',
            "status": 'status_code',
            "mine_name": 'mine_name',
        }

        query = MineIncident.query.join(Mine)
        conditions = []
        if args["status"] is not None:
            status_values = args["status"].split(',')
            conditions.append(self._build_filter('MineIncident', 'status_code', 'in',  status_values))
        if args["determination"] is not None:
            determination_values = args["determination"].split(',')
            conditions.append(
                self._build_filter('MineIncident', 'determination_type_code', 'in', determination_values))
        if args["codes"] is not None:
            query = MineIncident.query.join(Mine).outerjoin(MineIncidentDoSubparagraph)
            code_values = args["codes"].split(',')
            conditions.append(
                self._build_filter('MineIncidentDoSubparagraph', 'compliance_article_id', 'in', code_values))
        if args["year"] is not None:
            min_datetime = datetime(int(args["year"]), 1, 1)
            max_datetime = datetime(int(args["year"])+1, 1, 1)
            conditions.append(
                self._build_filter('MineIncident', 'incident_timestamp', '>=', min_datetime))
            conditions.append(
                self._build_filter('MineIncident', 'incident_timestamp', '<', max_datetime))
        if args["major"] is not None:
            conditions.append(
                self._build_filter('Mine', 'major_mine_ind', '==', args["major"]))
        if args["search_terms"] is not None:
            search_conditions = [
                self._build_filter('Mine', 'mine_name', 'ilike', '%{}%'.format(args["search_terms"])),
                self._build_filter('Mine', 'mine_no', 'ilike', '%{}%'.format(args["search_terms"])),
                # TODO: Mine incident_no is not currently implemented
                # self._build_filter('MineIncident', 'mine_incident_no ', 'ilike','%{}%'.format(args["search_terms"]))
            ]
            conditions.append({'or': search_conditions})
        if args["region"] is not None:
            region_list = args["region"].split(',')
            conditions.append(self._build_filter('Mine', 'mine_region', 'in', region_list))

        filtered_query = apply_filters(query, conditions)

        # Apply sorting
        if args['sort_field'] and args['sort_dir']:
            # sorting by code section is not applicable since a single incident may have many sections associated.
            sort_criteria = [{'model': sort_models[args['sort_field']],
                              'field': sort_field[args['sort_field']],
                              'direction': args['sort_dir']}]
            # filtered_query = apply_sort(filtered_query, sort_criteria)
        else:
            # default sorting is by descending date.
            sort_criteria = [
                {'model': 'MineIncident', 'field': 'incident_timestamp', 'direction': 'desc'}]
        filtered_query = apply_sort(filtered_query, sort_criteria)

        return apply_pagination(filtered_query, args["page_number"], args["page_size"])
