import uuid
from flask_restx import Resource, reqparse, fields, inputs
from flask import request, current_app
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import MineReportDefinitionComplianceArticleXref
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import PAGINATED_MINE_REPORT_DEFINITION_MODEL

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 50

class MineReportDefinitionListResource(Resource, UserMixin):
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
        description='returns the report definitions for possible reports.')
    @api.marshal_with(PAGINATED_MINE_REPORT_DEFINITION_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        page = request.args.get('page', PAGE_DEFAULT, type=int)
        per_page = request.args.get('per_page', PER_PAGE_DEFAULT, type=int)
        return MineReportDefinition.get_paginated(page, per_page)
