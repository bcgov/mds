"""Database and report-stats checks around the BC permanent UTC-7 change (2026-11-01)."""
import json
from datetime import date

import pytest
from freezegun import freeze_time
from sqlalchemy import text
from tests.factories import MineFactory, MineReportFactory
from tests.timezone.helpers import BC_TIME_MATRIX, assert_rows


class TestDatabaseTimezone:
    """Postgres timezone"""

    def test_session_timezone_is_utc(self, db_session):
        """Backend stores and compares in UTC"""
        actual = db_session.execute(text("SHOW timezone")).scalar()
        assert_rows([("Database session timezone", "n/a", "UTC", "UTC" if actual in ("UTC", "Etc/UTC") else actual)])

    def test_vancouver_rules(self, db_session):
        """Postgres tz rules for America/Vancouver"""
        rows = []
        for scenario, instant, _, local_text, _ in BC_TIME_MATRIX:
            actual = db_session.execute(
                text("SELECT to_char(CAST(:ts AS timestamptz) AT TIME ZONE 'America/Vancouver', "
                     "'Mon DD YYYY, HH24:MI')"),
                {"ts": instant}).scalar()
            rows.append((scenario, instant, local_text, actual))
        assert_rows(rows)


@pytest.fixture(scope="module", autouse=True)
def initialize_app_fixtures_before_database_tests(app, test_client, auth_headers):
    pass


class TestReportStatsToday:
    """Report stats 'today' in BC time"""

    @staticmethod
    def _overdue(test_client, auth_headers, frozen_utc, due):
        with freeze_time(frozen_utc):
            mine = MineFactory(mine_reports=0, mine_permit_amendments=0)
            MineReportFactory(mine=mine, mine_report_submissions=0, due_date=due, received_date=None)
            resp = test_client.get(
                f"/mines/{mine.mine_guid}/reports/stats", headers=auth_headers['full_auth_header'])
        assert resp.status_code == 200
        return json.loads(resp.data.decode())['overdue_reports']

    def test_overdue_uses_bc_date(self, test_client, auth_headers, db_session):
        """Overdue count just after BC midnight"""
        rows = [
            ("Control, UTC-8: 23:30 BC on Dec 9, due Dec 9", "2025-12-10T07:30:00Z", 0,
             self._overdue(test_client, auth_headers, "2025-12-10T07:30:00+00:00", date(2025, 12, 9))),
            ("00:30 BC on Nov 2 after the change, due Nov 1", "2026-11-02T07:30:00Z", 1,
             self._overdue(test_client, auth_headers, "2026-11-02T07:30:00+00:00", date(2026, 11, 1))),
        ]
        assert_rows(rows)
