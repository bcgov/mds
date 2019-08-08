import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition

from tests.factories import MineFactory, MineReportFactory, PermitFactory, PermitAmendmentFactory, PartyFactory
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
# def test_post_mine_report_comment(test_client, db_session, auth_headers):
#     mine = MineFactory(mine_reports=ONE_REPORT)
#     mine_report = mine.mine_reports[0]

#     mine_report_definition = MineReportDefinition.active()

#     num_reports = len(mine.mine_reports)
#     new_report_definition = [
#         x for x in mine_report_definition
#         if x.mine_report_definition_guid != mine_report.mine_report_definition_guid
#     ][0]
#     data = {
#         'mine_report_definition_guid': str(new_report_definition.mine_report_definition_guid),
#         'submission_year': '2019',
#         'due_date': '2019-07-05',
#         'permit_guid': None,
#         'received_date': None,
#     }
#     post_resp = test_client.post(
#         f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
#     post_data = json.loads(post_resp.data.decode())

#     updated_mine = Mine.find_by_mine_guid(str(mine.mine_guid))
#     reports = updated_mine.mine_reports

#     assert post_resp.status_code == 201
#     assert len(reports) == num_reports + 1
#     assert new_report_definition.mine_report_definition_id in [
#         x.mine_report_definition_id for x in reports
#     ]

# Delete
# def test_delete_mine_report(test_client, db_session, auth_headers):
#     mine = MineFactory(mine_reports=ONE_REPORT)

#     data = {'due_date': '2019-10-05 20:27:45.11929+00'}
#     delete_resp = test_client.delete(
#         f'/mines/{mine.mine_guid}/reports/{mine.mine_reports[0].mine_report_guid}',
#         headers=auth_headers['full_auth_header'])
#     assert delete_resp.status_code == 204, delete_resp.response
