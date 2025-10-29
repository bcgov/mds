from datetime import date, timedelta

from app.api.constants import MINE_REPORT_TYPE
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.report_helpers import ReportFilterHelper
from app.api.mines.response_models import PAGINATED_REPORT_LIST
from app.api.utils.access_decorators import MINESPACE_PROPONENT, VIEW_ALL, requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import request
from flask_restx import Resource
from sqlalchemy import or_

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 10


class MineUpcomingReportListResource(Resource, UserMixin):
    """Returns a paginated list of upcoming (future-dated) reports for a given mine.

    This mirrors MineReportListResource but enforces a due_date filter of strictly after today
    to ensure only upcoming/pending reports are returned. It supports the same sorting/pagination
    parameters and report-type filtering.
    """

    @api.marshal_with(PAGINATED_REPORT_LIST, code=200)
    @api.doc(
        description="returns upcoming (future-dated) reports for a given mine.",
        params={
            'page': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'sort_field': 'The field the returned results will be ordered by',
            'sort_dir': 'The direction by which the sort field is ordered',
            'mine_reports_type': 'Report type filter(s). Can repeat to include multiple.',
            'time_range': "Upcoming window from today: one of '90d', '6m', '1y'. Default: '90d'",
        },
    )
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid):
        # Always enforce due_date strictly in the future (upcoming)
        today_iso = date.today().isoformat()

        # Optional upcoming window: default 1 year; allowed: '90d', '6m', '1y'
        time_range = request.args.get('time_range', '1y', type=str)
        if time_range not in {'90d', '6m', '1y'}:
            time_range = '90d'

        if time_range == '90d':
            end_date = date.today() + timedelta(days=90)
        elif time_range == '6m':
            # Approximate 6 months as 182 days
            end_date = date.today() + timedelta(days=182)
        else:
            # 1 year
            end_date = date.today() + timedelta(days=365)

        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            'sort_field': request.args.get('sort_field', type=str),
            'sort_dir': request.args.get('sort_dir', type=str),
            'search_terms': None,
            'report_type': None,  # we derive below
            'report_name': None,
            'due_date_after': today_iso,
            'due_date_before': end_date.isoformat(),
            'received_date_after': None,
            'received_date_before': None,
            'received_only': False,
            'compliance_year': None,
            'requested_by': None,
            'status': [],
            'major': None,
            'region': [],
        }

        # Support multiple report types via repeated mine_reports_type query params; if none supplied,
        # default to both Code Required and Permit Required reports.
        requested_types = set(request.args.getlist('mine_reports_type', type=str) or [
            MINE_REPORT_TYPE['CODE REQUIRED REPORTS'],
            MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS'],
        ])

        # Base query; ordering is applied via ReportFilterHelper
        query = MineReport.query.filter_by(mine_guid=mine_guid, deleted_ind=False)

        if requested_types:
            conditions = []

            # PRR: No definition id
            if MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS'] in requested_types:
                conditions.append(MineReport.mine_report_definition_id.is_(None))

            # CRR: Has definition id
            if MINE_REPORT_TYPE['CODE REQUIRED REPORTS'] in requested_types:
                conditions.append(MineReport.mine_report_definition_id.isnot(None))

            # TAR: TSF category on definition
            if MINE_REPORT_TYPE['TAILINGS REPORTS'] in requested_types:
                tar_cond = MineReport.mine_report_definition.has(
                    MineReportDefinition.categories.any(
                        MineReportCategory.mine_report_category == 'TSF'
                    )
                )
                conditions.append(tar_cond)

            if conditions:
                query = query.filter(or_(*conditions))

        # Apply filtering and pagination via helper (will apply due_date_after)
        records, pagination_details = ReportFilterHelper.apply_filters_and_pagination(query, args, mine_guid)

        return {
            'records': records.all(),
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }
