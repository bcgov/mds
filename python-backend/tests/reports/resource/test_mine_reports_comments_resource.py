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


# PUT
# def test_put_mine_report_comment(test_client, db_session, auth_headers):
#     mine = MineFactory(mine_reports=THREE_REPORTS)
#     get_resp = test_client.get(
#         f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'])
#     get_data = json.loads(get_resp.data.decode())
#     assert len(get_data['records']) == THREE_REPORTS
#     assert get_resp.status_code == 200

# POST
def test_post_mine_report_comment(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    num_comments = len(mine_report.mine_report_submissions[0].comments)

    data = {'report_comment': 'Test comment', 'comment_visibility_ind': False}

    post_resp = test_client.post(
        f'/mines/{mine_report.mine_guid}/reports/{mine_report.mine_report_guid}/submissions/{mine_report.mine_report_submissions[0].mine_report_submission_guid}/comments', headers=auth_headers['full_auth_header'], json=data)
    # post_data = json.loads(post_resp.data.decode())

    updated_mine_report = MineReport.find_by_mine_report_guid(str(mine_report.mine_report_guid))
    comments = updated_mine_report.mine_report_submissions[0].comments

    assert post_resp.status_code == 201
    assert len(comments) == num_comments + 1
    assert comments[-1].report_comment == 'Test comment'


def test_post_mine_report_comment_no_comment(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    data = {'comment_visibility_ind': False}
    post_resp = test_client.post(
        f'/mines/{mine_report.mine_guid}/reports/{mine_report.mine_report_guid}/submissions/{mine_report.mine_report_submissions[0].mine_report_submission_guid}/comments', headers=auth_headers['full_auth_header'], json=data)

    assert post_resp.status_code == 201


# Delete
# def test_delete_mine_report(test_client, db_session, auth_headers):
#     mine = MineFactory(mine_reports=ONE_REPORT)

#     data = {'due_date': '2019-10-05 20:27:45.11929+00'}
#     delete_resp = test_client.delete(
#         f'/mines/{mine.mine_guid}/reports/{mine.mine_reports[0].mine_report_guid}',
#         headers=auth_headers['full_auth_header'])
#     assert delete_resp.status_code == 204, delete_resp.response
