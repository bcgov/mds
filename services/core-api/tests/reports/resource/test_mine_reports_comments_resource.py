import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition

from tests.factories import MineReportFactory
THREE_REPORTS = 3
ONE_REPORT = 1
GUID = str(uuid.uuid4)


def test_post_mine_report_comment(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    num_comments = len(mine_report.mine_report_submissions[-1].comments)

    data = {'report_comment': 'Test comment', 'comment_visibility_ind': False}

    post_resp = test_client.post(
        f'/mines/{mine_report.mine_guid}/reports/{mine_report.mine_report_guid}/comments',
        headers=auth_headers['full_auth_header'],
        json=data)

    updated_mine_report = MineReport.find_by_mine_report_guid(str(mine_report.mine_report_guid))
    comments = updated_mine_report.mine_report_submissions[-1].comments

    assert post_resp.status_code == 201
    assert len(comments) == num_comments + 1
    assert comments[-1].report_comment == 'Test comment'


def test_post_mine_report_comment_no_body(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    data = {'comment_visibility_ind': False}
    post_resp = test_client.post(
        f'/mines/{mine_report.mine_guid}/reports/{mine_report.mine_report_guid}/comments',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert post_resp.status_code == 400
