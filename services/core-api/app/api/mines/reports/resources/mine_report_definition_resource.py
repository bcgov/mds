import uuid
from flask_restx import Resource, reqparse
from flask import request
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.response_models import PAGINATED_MINE_REPORT_DEFINITION_MODEL

class MineReportDefinitionListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()   
    parser.add_argument(
        'page', type=int, help='page for pagination', location='args', store_missing=False
    )
    parser.add_argument(
        'per_page', type=int, help='records per page- 0 to retrieve all records', location='args', store_missing=False
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
        'is_prr_only', type=bool, help='True for only PRR, False for only CRR', location='args', store_missing=False
    )
    parser.add_argument(
        'section', type=str, help='article # of compliance report', location='args', store_missing=False
    )
    @api.doc(
        params={
            'page': 'The page number of paginated records to return. Default',
            'per_page': 'The number of records to return per page',
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
        is_prr_only = request.args.get('is_prr_only', type=bool)
        section = request.args.get('section', None, type=str)

        base_query = MineReportDefinition.query.filter_by(active_ind=True)
        return MineReportDefinition.apply_filters_and_pagination(
            base_query,
            page,
            per_page,
            sort_field,
            sort_dir,
            regulatory_authority,
            is_prr_only,
            section
        )
