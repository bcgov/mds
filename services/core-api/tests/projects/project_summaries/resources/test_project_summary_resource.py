import json
import re

from tests.factories import ProjectFactory, ProjectSummaryFactory, PartyFactory
from tests.constants import *

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
    data['contacts'] = []
    data['ams_authorizations'] = {}
    data['authorizations'] = []
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = 'Test Project Title - Updated'
    data['project_summary_description'] = project_summary.project_summary_description
    data['status_code'] = 'DFT'

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
    data['contacts'] = []
    data['ams_authorizations'] = {}
    data['authorizations'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['project_summary_title'] = project_summary.project_summary_title
    data['project_summary_description'] = project_summary.project_summary_description
    data['status_code'] = 'DFT'
    data['confirmation_of_submission'] = True
    data['project_lead_party_guid'] = party.party_guid

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data['status_code'] == 'ASG'

def test_submit_project_summary_without_ams_auths(test_client, db_session, auth_headers):
    '''Project summary submitted without AMS authorizations submitted successfully'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['documents'] = []
    data['mine_guid'] = project_summary.project.mine_guid
    data['status_code'] = 'SUB'
    data['project_lead_party_guid'] = party.party_guid

    # Basic info data
    data['project_summary_title'] = project_summary.project_summary_title
    data['project_summary_description'] = project_summary.project_summary_description

    # Authorization data
    data['ams_authorizations'] = {
        'amendments': [],
        'new': []
    }

    data['authorizations'] = [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
        "project_summary_authorization_type": "MINES_ACT_PERMIT",
        }
    ]

    # Project Contacts data
    data['contacts'] = CONTACTS_DATA

    # Applicant data
    data['applicant'] = APPLICANT_DATA

    # Agent data
    data['is_agent'] = False

    # Facility data
    data |= FACILITY_DATA

    # Legal land data
    data['is_legal_land_owner'] = True
    data |= LEGAL_LAND_DATA

    # Location, Access data
    data |= LOCATION_ACCESS_DATA
    
    # Declaration data
    data['confirmation_of_submission'] = True

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    # should not be bad request
    assert put_resp.status_code == 200

def test_update_project_summary_bad_request_with_validation_errors(test_client, db_session, auth_headers):
    '''A payload with status_code of SUB needs all required input fields filled else the errors by sections are returned'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}

    data['mine_guid'] = project_summary.project.mine_guid
    data['status_code'] = 'SUB'
    data['project_lead_party_guid'] = party.party_guid
    data['documents'] = []

    # Basic info data
    data['project_summary_title'] = project_summary.project_summary_title
    data['project_summary_description'] = project_summary.project_summary_description

    # Authorization data
    data['ams_authorizations'] = AMS_AUTHORIZATION_DATA
    data['authorizations'] = AUTHORIZATION_DATA

    # Project Contact data
    data['contacts'] = CONTACTS_DATA

    # Applicant data
    data['applicant'] = APPLICANT_DATA
    
    # Agent data
    data['is_agent'] = True
    data['agent'] = AGENT_DATA

    # Facility data
    data |= FACILITY_DATA

    # Legal land data
    data['is_legal_land_owner'] = False
    data |= LEGAL_LAND_DATA

    # Declaration data
    data['confirmation_of_submission'] = None
    data['ams_terms_agreed'] = False

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)
    put_data = json.loads(put_resp.data.decode())

    error_message = """400 Bad Request: {'surface_level_data': [], 
    'basic_info': [], 
    'project_contacts': [], 
    'authorizations': [], 
    'applicant_info': [], 
    'agent': ['{"address": ["no definitions validate", {"anyof definition 0": ["must be of list type"], "anyof definition 1": [{"address_line_1": ["null value not allowed"]}]}]}'], 
    'location_access_land_use': ['{"is_crown_land_federal_or_provincial": ["null value not allowed"]}', '{"facility_coords_source": ["required field"], "facility_latitude": ["required field"], "facility_lease_no": ["required field"], "facility_longitude": ["required field"], "facility_pid_pin_crown_file_no": ["required field"], "legal_land_desc": ["required field"], "nearest_municipality": ["required field"]}'],
    'mine_component_and_offsite': [], 
    'declaration': ['{"confirmation_of_submission": ["null value not allowed"]}']}"""

    assert put_resp.status_code == 400
    assert put_data['message'] == re.compile(r"\s+").sub(" ", error_message).strip()


def test_update_project_summary_validation_success(test_client, db_session, auth_headers):
    '''A payload with status_code SUB validates successfully'''
    project = ProjectFactory(project_summary=0)
    project_summary = ProjectSummaryFactory(project=project)
    party = PartyFactory(person=True)

    data = {}
    data['mine_guid'] = project_summary.project.mine_guid
    data['status_code'] = 'SUB'
    data['project_lead_party_guid'] = party.party_guid
    data['documents'] = []

    # Basic info data
    data['project_summary_title'] = project_summary.project_summary_title
    data['project_summary_description'] = project_summary.project_summary_description

    # Authorization data
    data['ams_authorizations'] = AMS_AUTHORIZATION_DATA
    data['authorizations'] = AUTHORIZATION_DATA

    # Project Contact data
    data['contacts'] = CONTACTS_DATA

    # Applicant data
    data['applicant'] = APPLICANT_DATA

    # Agent data
    data['is_agent'] = False

    # Facility data
    data |= FACILITY_DATA

    # Legal land data
    data['is_legal_land_owner'] = True

    # Location, Access data
    data |= LOCATION_ACCESS_DATA

    # Declaration data
    data['confirmation_of_submission'] = True
    data['ams_terms_agreed'] = True

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert put_resp.status_code == 200
