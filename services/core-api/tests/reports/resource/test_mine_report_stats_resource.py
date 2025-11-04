import json
from datetime import date, datetime, timedelta

import app.api.mines.reports.resources.mine_report_stats as stats_mod
from pytz import timezone as pytz_timezone
from tests.factories import (
    MineFactory,
    MinePermitXrefFactory,
    MineReportFactory,
    MineReportSubmissionFactory,
    PermitFactory,
)


def test_report_stats_active_permits_excludes_drafts(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=0, minimal=True)

    p_draft = PermitFactory(permit_status_code='D')
    p_open = PermitFactory(permit_status_code='O')
    MinePermitXrefFactory(permit=p_draft, mine=mine)
    MinePermitXrefFactory(permit=p_open, mine=mine)

    resp = test_client.get(
        f"/mines/{mine.mine_guid}/reports/stats", headers=auth_headers['full_auth_header']
    )
    data = json.loads(resp.data.decode())

    assert resp.status_code == 200
    assert data['active_permits'] == 1


def test_report_stats_overdue_and_next_90_days_pst(test_client, db_session, auth_headers):
    today_pst = datetime.now(pytz_timezone('US/Pacific')).date()
    in_10 = today_pst + timedelta(days=10)
    in_95 = today_pst + timedelta(days=95)
    ytd = today_pst - timedelta(days=1)
    apr_1_2025 = date(2025, 4, 1)

    mine = MineFactory(mine_reports=0)

    # 1) Overdue: due yesterday, after Apr 1, 2025, and NOT submitted => counts
    overdue_report = MineReportFactory(
        mine=mine,
        mine_report_submissions=0,
        due_date=max(ytd, apr_1_2025 + timedelta(days=1)),
        received_date=None,
    )

    # 2) Past due but before Apr 1, 2025 => should NOT count toward overdue
    pre_window_past_due = MineReportFactory(
        mine=mine,
        mine_report_submissions=0,
        due_date=date(2025, 3, 15),
        received_date=None,
    )

    # 3) Due within 90 days and NOT submitted => counts
    upcoming_report = MineReportFactory(
        mine=mine,
        mine_report_submissions=0,
        due_date=in_10,
        received_date=None,
    )

    # 4) Due after 90 days => should NOT count
    far_future_report = MineReportFactory(
        mine=mine,
        mine_report_submissions=0,
        due_date=in_95,
        received_date=None,
    )

    # 5) Due within 90 days but has a latest submission (status not NON) => should NOT count
    submitted_report = MineReportFactory(
        mine=mine,
        mine_report_submissions=0,
        due_date=today_pst + timedelta(days=5),
        received_date=None,
    )
    sub = MineReportSubmissionFactory(
        report=submitted_report,
        mine_report_submission_status_code='INI',
    )
    resp = test_client.get(
        f"/mines/{mine.mine_guid}/reports/stats", headers=auth_headers['full_auth_header']
    )
    data = json.loads(resp.data.decode())

    assert resp.status_code == 200
    assert data['overdue_reports'] == 1
    assert data['due_next_90_days'] == 1


def test_pst_midnight_boundary_just_after_midnight(test_client, db_session, auth_headers):
    today = datetime.now(pytz_timezone('US/Pacific')).date()
    yesterday = today - timedelta(days=1)

    mine = MineFactory(mine_reports=0, minimal=True)

    # Due yesterday => overdue; Due today => NOT overdue (but should count in next 90 days)
    MineReportFactory(mine=mine, mine_report_submissions=0, due_date=yesterday, received_date=None)
    MineReportFactory(mine=mine, mine_report_submissions=0, due_date=today, received_date=None)

    resp = test_client.get(
        f"/mines/{mine.mine_guid}/reports/stats", headers=auth_headers['full_auth_header']
    )
    data = json.loads(resp.data.decode())

    assert resp.status_code == 200
    assert data['overdue_reports'] == 1
    # The 'due today' report should be included in the next 90 days bucket
    assert data['due_next_90_days'] >= 1


def test_overdue_threshold_april_1_boundary(test_client, db_session, auth_headers):
    today = datetime.now(pytz_timezone('US/Pacific')).date()
    apr_1_2025 = date(2025, 4, 1)
    mar_31_2025 = date(2025, 3, 31)

    mine = MineFactory(mine_reports=0, minimal=True)

    # Due on April 1, 2025 => counts as overdue (past due relative to today)
    MineReportFactory(mine=mine, mine_report_submissions=0, due_date=apr_1_2025, received_date=None)
    # Due before window (Mar 31, 2025) => should NOT count toward overdue
    MineReportFactory(mine=mine, mine_report_submissions=0, due_date=mar_31_2025, received_date=None)

    resp = test_client.get(
        f"/mines/{mine.mine_guid}/reports/stats", headers=auth_headers['full_auth_header']
    )
    data = json.loads(resp.data.decode())

    assert resp.status_code == 200
    assert data['overdue_reports'] == 1
