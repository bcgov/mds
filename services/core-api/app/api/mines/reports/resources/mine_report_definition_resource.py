from flask_restx import Resource, reqparse
from flask import request
from werkzeug.exceptions import BadRequest

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE

from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.response_models import PAGINATED_MINE_REPORT_DEFINITION_MODEL, MINE_REPORT_DEFINITION_MODEL


class MineReportDefinitionListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'page', type=int, help='page for pagination', location='args', store_missing=False
    )
    parser.add_argument(
        'per_page', type=int, help='records per page to retrieve all records', location='args', store_missing=False
    )
    parser.add_argument(
        'sort_field', type=str, help='field to sort by', location='args', store_missing=False
    )
    parser.add_argument(
        'sort_dir', type=str, help='direction to sort by: asc or desc', location='args', store_missing=False
    )
    parser.add_argument(
        'regulatory_authority', type=list, help='CIM, CPO, Both, NONE', location='args', store_missing=False
    )
    parser.add_argument(
        'is_prr_only', type=list, help='[true] for only prr, [false] to exclude, [true, false] for both', location='args', store_missing=False
    )
    parser.add_argument(
        'active_ind', type=list, help='[true] for only active (default), [false] for only inactive, [true, false] for both', location='args', store_missing=False
    )
    parser.add_argument(
        'section', type=str, help='article # of compliance report', location='args', store_missing=False
    )
    @api.doc(
        params={
            'page': 'The page number of paginated records to return',
            'per_page': 'The number of records to return per page. None for all records',
            'sort_field': 'field to sort by',
            'sort_dir': 'direction to sort by: asc or desc',
            'regulatory_authority': 'CIM, CPO, Both, NONE',
            'is_prr_only': '[true] for only prr, [false] to exclude, [true, false] for both',
            'active_ind': '[true] for only active (default), [false] for only inactive, [true, false] for both',
            'section': 'article # of compliance report'
        },
        description='returns the report definitions for possible reports.')
    @api.marshal_with(PAGINATED_MINE_REPORT_DEFINITION_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        page = request.args.get('page', None, type=int)
        per_page = request.args.get('per_page', 0, type=int)
        sort_field = request.args.get('sort_field', None, type=str)
        sort_dir = request.args.get('sort_dir', None, type=str)
        regulatory_authority = request.args.getlist('regulatory_authority', type=str)
        is_prr_only = request.args.getlist('is_prr_only', type=str)
        active_ind = request.args.getlist('active_ind', type=str)
        section = request.args.get('section', None, type=str)

        if (page and page < 1) or per_page and per_page < 0:
            raise BadRequest(f'Invalid pagination values: page {page}, per_page {per_page}')

        valid_sort_fields = ['report_name', 'section', 'regulatory_authority', ]
        if sort_field and sort_field not in valid_sort_fields:
            raise BadRequest(f'Invalid sort_field. Valid options: {valid_sort_fields}')

        base_query = MineReportDefinition.query
        return MineReportDefinition.apply_filters_and_pagination(
            base_query,
            page,
            per_page,
            sort_field,
            sort_dir,
            regulatory_authority,
            is_prr_only,
            active_ind,
            section
        )


    @api.doc(description='Creates a new mine report definition.')
    @api.marshal_with(MINE_REPORT_DEFINITION_MODEL, code=201)
    @requires_any_of([EDIT_CODE])
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('report_name',
                            type=str,
                            location='json',
                            required=True,
                            help='Report name')
        parser.add_argument('description',
                            type=str,
                            location='json',
                            required=True,
                            help='Report description')
        parser.add_argument('mine_report_due_date_type_code',
                            type=str,
                            location='json',
                            required=True,
                            help='Due date type')
        parser.add_argument('mine_report_due_date_period_months',
                            type=int,
                            location='json',
                            required=False,
                            help='Due date period months')
        parser.add_argument('report_type',
                            type=str,
                            location='json',
                            required=True,
                            help='Compliance Article ID')
        parser.add_argument('is_common',
                            type=bool,
                            location='json',
                            required=True,
                            help='Is Common')
        data = parser.parse_args()

        mine_report_definition = MineReportDefinition.create(data.get('report_name'),
                                                             data.get('description'),
                                                             data.get('mine_report_due_date_type_code'),
                                                             data.get('mine_report_due_date_period_months'),
                                                             data.get('report_type'),
                                                             data.get('is_common'))
        return mine_report_definition, 201


