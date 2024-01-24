from flask_restx import Resource
from flask import request
from datetime import datetime
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import BadRequest
from sqlalchemy import asc, desc, func, or_
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.mines.response_models import PAGINATED_REPORT_LIST

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ReportsResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of reports. Order: received_date DESC',
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'sort_field': 'The field the returned results will be ordered by',
            'sort_dir': 'The direction by which the sort field is ordered',
            'search': 'A substring to match in a mine name, mine number, or permit number',
            'report_type': 'The report categories',
            'report_name': 'The descriptive names of the report',
            'due_date_after': 'Reports with a due date only after this date',
            'due_date_before': 'Reports with a due date only before this date',
            'received_date_after': 'Reports with a received date only after this date',
            'received_date_before': 'Reports with a received date only before this date',
            'received_only': 'Whether or not to only show reports that have a set received date',
            'compliance_year': 'The compliance year/period of the report',
            'requested_by': 'A substring to match in the name of the user who requested the report',
            'major': 'Whether or not the report is for a major or regional mine',
            'region': 'Regions the mines associated with the report are located in',
        })
    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PAGINATED_REPORT_LIST, code=200)
    def get(self):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
            'search_terms': request.args.get('search', type=str),
            'report_type': request.args.getlist('report_type', type=str),
            'report_name': request.args.getlist('report_name', type=str),
            'due_date_after': request.args.get('due_date_after', type=str),
            'due_date_before': request.args.get('due_date_before', type=str),
            'received_date_after': request.args.get('received_date_after', type=str),
            'received_date_before': request.args.get('received_date_before', type=str),
            'received_only': request.args.get('received_only', type=str) == "true",
            'compliance_year': request.args.get('compliance_year', type=str),
            'requested_by': request.args.get('requested_by', type=str),
            'status': request.args.getlist('status', type=str),
            'major': request.args.get('major', type=str),
            'region': request.args.getlist('region', type=str),
        }

        records, pagination_details = self._apply_filters_and_pagination(args)
        if not records:
            raise BadRequest('Unable to fetch reports.')
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
            "mine_report_id": 'MineReport',
            "mine_report_category": 'MineReportCategoryXref',
            "report_name": 'MineReportDefinition',
            "due_date": 'MineReport',
            "received_date": 'MineReport',
            "submission_year": 'MineReport',
            "mine_report_status_code": 'MineReportSubmissionStatusCode',
            "created_by_idir": 'MineReport',
            "mine_name": 'Mine',
        }

        sort_field = {
            "mine_report_id": 'mine_report_id',
            "mine_report_category": 'mine_report_category',
            "report_name": 'report_name',
            "due_date": 'due_date',
            "received_date": 'received_date',
            "submission_year": 'submission_year',
            "mine_report_status_code": 'mine_report_status_description',
            "created_by_idir": 'created_by_idir',
            "mine_name": 'mine_name',
        }

        query = MineReport.query.filter_by(deleted_ind=False)
        conditions = []

        if args["search_terms"] or args["major"] or args["region"] or (
                args["sort_field"] and sort_models[args['sort_field']] == 'Mine'):
            query = query.join(Mine)

        if args["report_type"] or args["report_name"] or (args['sort_field'] and sort_models[
                args['sort_field']] in ['MineReportCategoryXref', 'MineReportDefinition']):
            query = query.join(
                MineReportDefinition, MineReport.mine_report_definition_id ==
                MineReportDefinition.mine_report_definition_id)
            query = query.join(
                MineReportCategoryXref, MineReportDefinition.mine_report_definition_id ==
                MineReportCategoryXref.mine_report_definition_id)
            query = query.join(
                MineReportCategory, MineReportCategoryXref.mine_report_category ==
                MineReportCategory.mine_report_category)

        if args["major"]:
            conditions.append(self._build_filter('Mine', 'major_mine_ind', '==', args["major"]))

        if args["region"]:
            conditions.append(self._build_filter('Mine', 'mine_region', 'in', args["region"]))

        if args["report_type"]:
            conditions.append(
                self._build_filter('MineReportCategoryXref', 'mine_report_category', 'in',
                                   args["report_type"]))

        if args["report_name"]:
            conditions.append(
                self._build_filter('MineReportDefinition', 'mine_report_definition_guid', 'in',
                                   args["report_name"]))

        if args["status"]:
            query = query.filter(MineReport.mine_report_status_code.in_(args["status"]))

        if args["compliance_year"]:
            conditions.append(
                self._build_filter('MineReport', 'submission_year', '==', args["compliance_year"]))

        if args["due_date_before"]:
            conditions.append(
                self._build_filter('MineReport', 'due_date', '<=', args["due_date_before"]))

        if args["due_date_after"]:
            conditions.append(
                self._build_filter('MineReport', 'due_date', '>=', args["due_date_after"]))

        if args["received_date_before"]:
            conditions.append(
                self._build_filter('MineReport', 'received_date', '<=',
                                   args["received_date_before"]))

        if args["received_date_after"]:
            conditions.append(
                self._build_filter('MineReport', 'received_date', '>=',
                                   args["received_date_after"]))

        if args["received_only"]:
            query = query.filter(MineReport.received_date.isnot(None))

        if args["requested_by"]:
            conditions.append(
                self._build_filter('MineReport', 'created_by_idir', 'ilike',
                                   '%{}%'.format(args["requested_by"])))

        if args["search_terms"]:
            search_conditions = [
                self._build_filter('Mine', 'mine_name', 'ilike',
                                   '%{}%'.format(args["search_terms"])),
                self._build_filter('Mine', 'mine_no', 'ilike', '%{}%'.format(args["search_terms"])),
            ]
            conditions.append({'or': search_conditions})

        filtered_query = apply_filters(query, conditions)

        if args['sort_field'] == 'mine_report_status_code':
            if args['sort_dir'] == 'asc':
                filtered_query = filtered_query.order_by(
                    asc(MineReport.mine_report_status_description))
            else:
                filtered_query = filtered_query.order_by(
                    desc(MineReport.mine_report_status_description))

        else:
            if args['sort_field'] and args['sort_dir']:
                sort_criteria = [{
                    'model': sort_models[args['sort_field']],
                    'field': sort_field[args['sort_field']],
                    'direction': args['sort_dir']
                }]
            else:
                sort_criteria = [{
                    'model': 'MineReport',
                    'field': 'received_date',
                    'direction': 'desc'
                }]

            filtered_query = apply_sort(filtered_query, sort_criteria)

        return apply_pagination(filtered_query, args["page_number"], args["page_size"])
