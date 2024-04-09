import json

from tests.factories import ProjectFactory, ProjectSummaryFactory, PartyFactory
from flask_restx import marshal
from app.api.projects.response_models import PROJECT_SUMMARY_MODEL


def test_get_project_summary_by_project_summary_guid(test_client, db_session, auth_headers):
    project = ProjectFactory()
    project_summary = ProjectSummaryFactory(project=project)

    get_resp = test_client.get(
        f'/projects/{project_summary.project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_guid'] == str(project_summary.project.project_guid)
    assert get_data['project_summary_guid'] == str(project_summary.project_summary_guid)
    assert get_data['project_summary_title'] == str(project_summary.project_summary_title)
    assert get_data['status_code'] == str(project_summary.status_code)


def test_put_project_summary(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = 'Test Project Title - Updated'
    data['status_code'] = 'UNR'

    put_resp = test_client.put(
        f'/projects/{project_summary.project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200, put_resp.response
    assert put_data['project_summary_title'] == str(project_summary.project.project_title)
    assert put_data['status_code'] == str(project_summary.status_code)


def test_delete_project_summary_bad_status_code(test_client, db_session, auth_headers):
    '''Status code needs to be DFT in order to delete a project description'''
    project = ProjectFactory()
    project_summary = ProjectSummaryFactory(project=project)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = 'Test Title'
    data['status_code'] = 'SUB'

    put_resp = test_client.delete(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert put_resp.status_code == 400, put_resp.response == 'Project description must have status code of "DRAFT" to be eligible for deletion.'


def test_update_project_summary_assign_project_lead(test_client, db_session, auth_headers):
    '''Assigning a project lead will change status code to ASG'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = project_summary.project_summary_title
    data['status_code'] = 'SUB'
    data['confirmation_of_submission'] = True
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data['status_code'] == 'ASG'

def test_update_project_summary_bad_request_without_terms(test_client, db_session, auth_headers):
    '''Not agreeing to terms returns an error'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = project_summary.project_summary_title
    data['status_code'] = 'SUB'
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 400
    assert put_data['message'] == "400 Bad Request: Please agree to the terms and conditions of submission"

def test_update_project_summary_bad_request_without_terms_ams_auths(test_client, db_session, auth_headers):
    '''Not agreeing to AMS terms when there are AMS auths returns an error'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = project_summary.project_summary_title
    data['status_code'] = 'SUB'
    data['confirmation_of_submission'] = True
    data['ams_authorizations'] = {
        'amendments': [],
        'new': [{
            'authorization_description': 'Purpose of application',
            'exemption_requested': False,
            'new_type': 'APP',
            'project_summary_authorization_type': 'MUNICIPAL_WASTEWATER_REGULATION',
            'project_summary_guid': project_summary.project_summary_guid,
            'project_summary_permit_type': ['NEW']
        }]
    }
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 400
    assert put_data['message'] == "400 Bad Request: Please agree to the terms and conditions of submission"

def test_update_project_summary_with_ams_auths(test_client, db_session, auth_headers):
    '''AMS authorizations are posted successfully'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = project_summary.project_summary_title
    data['status_code'] = 'SUB'
    data['confirmation_of_submission'] = True
    data['ams_terms_agreed'] = True
    data['ams_authorizations'] = {
        'amendments': [{
            'amendment_changes': ['ILT'],
            'amendment_severity': 'SIG',
            'authorization_description': 'Description',
            'exemption_requested': True,
            'existing_permits_authorizations': ['1234'],
            'is_contaminated': False,
            'project_summary_authorization_type': 'AIR_EMISSIONS_DISCHARGE_PERMIT',
            'project_summary_guid': project_summary.project_summary_guid,
            'project_summary_permit_type': ['AMENDMENT']
        }],
        'new': [{
            'authorization_description': 'Purpose of application',
            'exemption_requested': False,
            'new_type': 'APP',
            'project_summary_authorization_type': 'MUNICIPAL_WASTEWATER_REGULATION',
            'project_summary_guid': project_summary.project_summary_guid,
            'project_summary_permit_type': ['NEW']
        }]
    }
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data['authorizations'][0]['project_summary_authorization_guid'] is not None
    assert put_data['authorizations'][1]['project_summary_authorization_guid'] is not None
