import json
import uuid
import pytest
from datetime import datetime

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.constants import MINE_REPORT_TYPE

from tests.factories import MineFactory, MineDocumentFactory, MineReportFactory

# GET
def test_get_all_mine_report_submissions_for_report(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    
    params = f'?mine_report_guid={mine_report.mine_report_guid}'
    get_resp = test_client.get(
        f'mines/reports/submissions{params}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert len(mine_report.mine_report_submissions) == len(get_data)
    assert str(mine_report.mine_report_guid) == get_data[0]['mine_report_guid']
    assert get_resp.status_code == 200

def test_get_latest_mine_report_submission_for_report(test_client, db_session, auth_headers):
    mine_report = MineReportFactory()
    
    params = f'?latest_submission=true&mine_report_guid={mine_report.mine_report_guid}'
    get_resp = test_client.get(
        f'mines/reports/submissions{params}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_data['mine_report_guid'] == str(mine_report.mine_report_guid)
    assert get_resp.status_code == 200


def test_get_latest_report_submission_without_mine_report_guid(test_client, db_session, auth_headers):
    # TODO: in the end this is not desired behaviour, 
    # this is just a reminder to write a real test when implementing 
    params = '?latest_submission=true'
    get_resp = test_client.get(
        f'mines/reports/submissions{params}', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 400

# # POST
def test_post_initial_crr_mine_report_submission(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)

    new_document_data = MineDocumentFactory()
    new_document = {
        'document_name': new_document_data.document_name,
        'document_manager_guid': new_document_data.document_manager_guid
    }
    mine_report_definition = MineReportDefinition.get_all()[0]

    submission_data = {
        'description_comment': "description comment",
        'documents': [new_document],
        'due_date': "2024-02-11",
        'mine_guid': mine.mine_guid,
        'mine_report_definition_guid': str(mine_report_definition.mine_report_definition_guid),
        'received_date': "2024-02-09",
        'submission_year': "2024",
        'submitter_email': "email@email.com",
        'submitter_name': "Submitter Name",        
    }

    # post from Minespace
    post_resp = test_client.post(
        f'mines/reports/submissions', headers=auth_headers['proponent_only_auth_header'], json=submission_data)
    post_data = json.loads(post_resp.data.decode())

    mine_report = MineReport.find_by_mine_report_guid(str(post_data['mine_report_guid']))
    latest_submission = MineReportSubmission.find_latest_by_mine_report_guid(str(mine_report.mine_report_guid)).json()

    num_submissions = len(mine_report.mine_report_submissions)

    assert num_submissions == 1
    assert latest_submission['mine_report_submission_status_code'] == "INI"

def test_post_additional_mine_report_submission(test_client, db_session, auth_headers):
    mine_report = MineReportFactory(mine_report_submissions=1)
    first_submission = mine_report.mine_report_submissions[0]

    num_submissions = len(mine_report.mine_report_submissions)

    # modify original submission
    previous_submission = first_submission.json()
    submission_data = first_submission.json()

    # add a document
    new_document_data = MineDocumentFactory()
    new_document = {
        'document_name': new_document_data.document_name,
        'document_manager_guid': new_document_data.document_manager_guid
    }
    submission_data['documents'].append(new_document)

    # add a mine report contact
    new_contact = {
        'name': "New Contact",
        'email': "new@contact.com"
    }
    submission_data['mine_report_contacts'].append(new_contact)

    mine_report_definition = MineReportDefinition.get_all()[0]
    submission_data['mine_report_definition_guid'] = str(mine_report_definition.mine_report_definition_guid)

    # change status code
    mine_report_status_code = MineReportSubmissionStatusCode.get_all()
    new_status_code = [
        x for x in mine_report_status_code
        if x.mine_report_submission_status_code != first_submission.mine_report_submission_status_code
    ][0]
    submission_data['mine_report_submission_status_code'] = new_status_code.mine_report_submission_status_code
    
    submission_data['description_comment'] = "New description comment"

    post_resp = test_client.post(
        f'mines/reports/submissions', headers=auth_headers['full_auth_header'], json=submission_data)
    post_data = json.loads(post_resp.data.decode())

    updated_report = MineReport.find_by_mine_report_guid(str(mine_report.mine_report_guid))
    latest_submission = MineReportSubmission.find_latest_by_mine_report_guid(str(mine_report.mine_report_guid)).json()
    submissions = updated_report.mine_report_submissions

    assert post_resp.status_code == 201
    assert len(submissions) == num_submissions + 1
    assert len(previous_submission['documents']) + 1 == len(latest_submission['documents'])
    assert len(previous_submission['mine_report_contacts']) + 1 == len(latest_submission['mine_report_contacts'])

    # fields that should be changed
    assert previous_submission['update_timestamp'][:19] == latest_submission['update_timestamp'][:19]
    assert previous_submission['update_timestamp'] != latest_submission['update_timestamp']
    assert previous_submission['submission_date'] != latest_submission['submission_date']
    assert previous_submission['mine_report_submission_status_code'] != latest_submission['mine_report_submission_status_code']
    assert previous_submission['description_comment'] != latest_submission['description_comment']
    
    # fields that should not change
    assert previous_submission['received_date'] == latest_submission['received_date']    
    assert previous_submission['create_timestamp'] == latest_submission['create_timestamp']
    