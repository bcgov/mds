from datetime import date, datetime, timedelta

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.report_helpers import ReportFilterHelper
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.response_models import MINE_REPORT_STATS_MODEL
from app.api.utils.access_decorators import (
    MINESPACE_PROPONENT,
    VIEW_ALL,
    requires_any_of,
)
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask_restx import Resource
from pytz import timezone
from werkzeug.exceptions import NotFound


class MineReportStatsResource(Resource, UserMixin):
    @api.marshal_with(MINE_REPORT_STATS_MODEL, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, mine_guid):
        """Return stats for the given mine:
        - active_permits: count of non-draft permits associated with the mine
        - overdue_reports: due_date before today AND on/after 2025-04-01 (this is when report submissions became mandatory through Minespace) AND not yet submitted
        - due_next_90_days: due_date within [today, today+90] AND not yet submitted
        """
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        # Active permits are those surfaced by Mine.mine_permit (excludes drafts)
        active_permits = len(mine.mine_permit_numbers)

        # Compute 'today' in Pacific Time to evaluate overdue and upcoming windows
        today = datetime.now(timezone('US/Pacific')).date()
        april_1_2025 = date(2025, 4, 1)
        in_90_days = today + timedelta(days=90)

        # Overdue = due_date < today, due_date >= 2025-04-01, and status is NON (no latest submission)
        base_query = ReportFilterHelper._filter_latest_permit_amendment_prr(
            MineReport.query.filter(
                MineReport.mine_guid == mine_guid,
                MineReport.deleted_ind == False,
            )
        )

        overdue_reports = (
            base_query
            .filter(
                MineReport.due_date != None,
                MineReport.due_date >= april_1_2025,
                MineReport.due_date < today,
                MineReport.mine_report_status_code == 'NON',
            )
            .count()
        )

        # Due in next 90 days = due_date between today and +90, and not yet submitted
        due_next_90_days = (
            base_query
            .filter(
                MineReport.due_date != None,
                MineReport.due_date >= today,
                MineReport.due_date <= in_90_days,
                MineReport.mine_report_status_code == 'NON',
            )
            .count()
        )

        return {
            'active_permits': active_permits,
            'overdue_reports': overdue_reports,
            'due_next_90_days': due_next_90_days,
        }
