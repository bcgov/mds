import json

from flask import request
from flask_restplus import Resource, marshal, reqparse
from ..models.mine_summary_view import MineSummaryView

from app.api.exports.response_models import MINE_SUMMARY_MODEL_LIST
from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import MINE_DETAILS_JSON, TIMEOUT_60_MINUTES


PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 100

class MineSummaryResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'page', type=int, help='page for pagination', location='args', store_missing=False
    )
    parser.add_argument(
        'per_page', type=int, help='records per page', location='args', store_missing=False
    )
    @api.doc(
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
        },
        description='Returns a paginated summary of mine data.')
    @api.marshal_with(MINE_SUMMARY_MODEL_LIST, envelope='data', code=200)
    @requires_role_view_all
    def get(self):
        page = request.args.get('page', PAGE_DEFAULT, type=int)
        per_page = request.args.get('per_page', PER_PAGE_DEFAULT, type=int)

        data = MineSummaryView.get_paginated_data(page, per_page)

        return data
