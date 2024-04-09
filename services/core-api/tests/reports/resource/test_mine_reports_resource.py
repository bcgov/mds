import json
import uuid

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.constants import MINE_REPORT_TYPE

from tests.factories import MineFactory, MineReportFactory
THREE_REPORTS = 3
ONE_REPORT = 1
GUID = str(uuid.uuid4)


# GET
def test_get_code_required_reports_for_mine(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=THREE_REPORTS)
    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == THREE_REPORTS
    assert get_resp.status_code == 200

def test_get_permit_required_reports_for_mine(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=THREE_REPORTS)
    mine_reports = MineReportFactory(mine = mine, permit_required_reports = True)
    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/reports?mine_reports_type={MINE_REPORT_TYPE["PERMIT REQUIRED REPORTS"]}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == 1
    assert get_resp.status_code == 200

def test_get_a_report_for_a_mine(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)
    mine_report = mine.mine_reports[0]

    get_resp = test_client.get(
        f'/mines/{mine.mine_guid}/reports/{mine_report.mine_report_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_data['mine_report_guid'] == str(mine_report.mine_report_guid)
    assert get_resp.status_code == 200


# Create
def test_post_request_report(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=0)
    report_definition = MineReportDefinition.get_all()[0]
    data = {
        'due_date': '2024-07-05',
        'mine_report_definition_guid': str(report_definition.mine_report_definition_guid),
        'mine_report_status_code': "NON",
        'submission_year': '2024',
    }

    post_resp = test_client.post(f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert post_data["mine_report_status_code"] == "NON"
    assert post_data["received_date"] == None
    assert post_data["latest_submission"]["mine_report_submission_guid"] == None

def test_post_mine_report(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)
    mine_report = mine.mine_reports[0]

    mine_report_definition = MineReportDefinition.get_all()

    num_reports = len(mine.mine_reports)
    new_report_definition = [
        x for x in mine_report_definition
        if x.mine_report_definition_guid != mine_report.mine_report_definition_guid
    ][0]
    data = {
        'mine_report_definition_guid': str(new_report_definition.mine_report_definition_guid),
        'submission_year': '2019',
        'due_date': '2019-07-05',
        'permit_guid': None,
        'received_date': None,
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
    post_data = json.loads(post_resp.data.decode())

    updated_mine = Mine.find_by_mine_guid(str(mine.mine_guid))
    reports = updated_mine.mine_reports

    assert post_resp.status_code == 201
    assert len(reports) == num_reports + 1
    assert new_report_definition.mine_report_definition_id in [
        x.mine_report_definition_id for x in reports
    ]


def test_post_mine_report_bad_mine_guid(test_client, db_session, auth_headers):
    data = {}
    post_resp = test_client.post(
        f'/mines/12345142342/reports', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 404


def test_post_mine_report_no_report_definition(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)
    data = {
        'mine_report_definition_guid': None,
        'submission_year': '2019',
        'due_date': '2019-07-05',
        'permit_guid': None,
        'received_date': None,
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 400


def test_post_mine_report_with_permit(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)
    mine_report = mine.mine_reports[0]

    mine_report_definition = MineReportDefinition.get_all()
    new_report_definition = [
        x for x in mine_report_definition
        if x.mine_report_definition_guid != mine_report.mine_report_definition_guid
    ][0]

    data = {
        'mine_report_definition_guid': new_report_definition.mine_report_definition_guid,
        'submission_year': '2019',
        'due_date': '2019-07-05',
        'permit_guid': mine.mine_permit[0].permit_guid,
        'received_date': None,
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
    post_data = json.loads(post_resp.data.decode())
    assert post_resp.status_code == 201
    assert post_data['permit_guid'] == str(mine.mine_permit[0].permit_guid)


def test_post_mine_report_with_bad_permit_guid(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)
    mine2 = MineFactory(mine_reports=ONE_REPORT)

    data = {
        'mine_report_definition_guid': 1,
        'submission_year': '2019',
        'permit_guid': mine2.mine_permit[0].permit_guid,
        'due_date': '2019-07-05 20:27:45.11929+00',
    }
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/reports', headers=auth_headers['full_auth_header'], json=data)
    assert post_resp.status_code == 400


# Put
def test_put_mine_report(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)

    data = {
        'due_date': '2019-10-05 20:27:45.11929+00',
        'mine_report_submission_status': 'NRQ',
        'mine_report_submissions': []
    }
    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/reports/{mine.mine_reports[0].mine_report_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert put_data.get('due_date') == '2019-10-05'


def test_put_mine_report_bad_mine_report_guid(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)

    data = {'due_date': '2019-10-05 20:27:45.11929+00'}
    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/reports/234lk23j4234k',
        headers=auth_headers['full_auth_header'],
        json=data)
    assert put_resp.status_code == 404


# Delete
def test_delete_mine_report(test_client, db_session, auth_headers):
    mine = MineFactory(mine_reports=ONE_REPORT)

    delete_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/reports/{mine.mine_reports[0].mine_report_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204, delete_resp.response
