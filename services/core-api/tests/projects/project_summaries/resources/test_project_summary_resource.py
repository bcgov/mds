import json
import re

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

    # Project contacts data
    data['contacts'] = [
        {
            "email": "test@gov.bc.ca",
            "phone_number": "123-123-1234",
            "is_primary": True,
            "first_name": "test name",
            "last_name": "test name",
            "address": {
                "suite_no": "123",
                "address_line_1": "some street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        },
    ]

    # Authorization data
    data['ams_authorizations'] = {
    "amendments": [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "test descript",
            "exemption_requested": False,
        }
    ],
    "new": []
    }

    data['authorizations'] = [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "description",
            "exemption_requested": False,
        }
    ]

    # Applicant data
    data['applicant'] = {
        "party_type_code": "ORG",
        "phone_no": party.phone_no,
        "email": "test@gov.bc.ca",
        "party_name": "test name",
        "address": [
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        ],
    }
    
    # Agent data
    data['is_agent'] = True
    data['agent'] = {
        "party_type_code": "PER",
        "phone_no": party.phone_no,
        "email": "test@gov.bc.ca",
        "party_name": "test name",
        "first_name": "test name",
        "address": {
            "suite_no": "",
            "address_line_1": None,
            "city": "Vancouver",
            "sub_division_code": "BC",
            "post_code": None,
            "address_type_code": "CAN"
        },
    }

    # Facility operator data
    data['facility_coords_source'] = 'GPS'
    data['facility_desc'] = 'description'
    data['facility_latitude'] = '50.0000000'
    data['facility_longitude'] = '-115.0000000'
    data['facility_type'] = 'test type'
    data['zoning'] = True
    data['facility_operator'] = {
        "party_type_code": "PER",
        "phone_no": "123-123-1234",
        "email": "test@govb.bc.ca",
        "party_name": "test name",
        "first_name": "test",
        "address": {
            "suite_no": "123",
            "address_line_1": "some address",
            "city": "vancouver",
            "sub_division_code": "BC",
            "post_code": "V5S4W2",
            "address_type_code": "CAN"
        },
    }

    # Legal land data
    data['is_legal_land_owner'] = False
    data['is_crown_land_federal_or_provincial'] = None
    data['is_landowner_aware_of_discharge_application'] = True
    data['has_landowner_received_copy_of_application'] = False
    data['legal_land_owner_name'] = 'some name'
    data['legal_land_owner_contact_number'] = '123-123-1234'
    data['legal_land_owner_email_address'] = 'test@gov.bc.ca'

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
    'authorizations': [], 
    'project_contacts': [], 
    'applicant_info': [], 
    'agent': ['{"address": ["no definitions validate", {"anyof definition 0": ["must be of list type"], "anyof definition 1": [{"address_line_1": ["null value not allowed"]}]}]}'], 
    'facility': [], 
    'legal_land': ['{"is_crown_land_federal_or_provincial": ["null value not allowed"]}'], 
    'declaration': ['{"ams_terms_agreed": ["unallowed value False"], "confirmation_of_submission": ["null value not allowed"]}']}"""
    
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

    # Project contacts data
    data['contacts'] = [
        {
            "email": "test@gov.bc.ca",
            "phone_number": "123-123-1234",
            "is_primary": True,
            "first_name": "test name",
            "last_name": "test name",
            "address": {
                "suite_no": "123",
                "address_line_1": "some street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        },
    ]

    # Authorization data
    data['ams_authorizations'] = {
    "amendments": [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "test descript",
            "exemption_requested": False,
        }
    ],
    "new": []
    }

    data['authorizations'] = [
        {
            "project_summary_permit_type": [
                "AMENDMENT"
            ],
            "project_summary_authorization_type": "AIR_EMISSIONS_DISCHARGE_PERMIT",
            "existing_permits_authorizations": [
                "1234"
            ],
            "amendment_changes": [
                "ILT",
                "IGT"
            ],
            "amendment_severity": "SIG",
            "is_contaminated": False,
            "authorization_description": "description",
            "exemption_requested": False,
        }
    ]

    # Applicant data
    data['applicant'] = {
        "party_type_code": "ORG",
        "phone_no": party.phone_no,
        "email": "test@gov.bc.ca",
        "party_name": "test name",
        "address": [
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            },
            {
                "address_line_1": "123 fake street",
                "city": "Vancouver",
                "sub_division_code": "BC",
                "post_code": "V5S4W2",
                "address_type_code": "CAN"
            }
        ],
    }
    
    # Agent data
    data['is_agent'] = False

    # Facility operator data
    data['facility_coords_source'] = 'GPS'
    data['facility_desc'] = 'description'
    data['facility_latitude'] = '50.0000000'
    data['facility_longitude'] = '-115.0000000'
    data['facility_type'] = 'test type'
    data['zoning'] = True
    data['facility_operator'] = {
        "party_type_code": "PER",
        "phone_no": "123-123-1234",
        "email": "test@govb.bc.ca",
        "party_name": "test name",
        "first_name": "test",
        "address": {
            "suite_no": "123",
            "address_line_1": "some address",
            "city": "vancouver",
            "sub_division_code": "BC",
            "post_code": "V5S4W2",
            "address_type_code": "CAN"
        },
    }

    # Legal land data
    data['is_legal_land_owner'] = True

    # Declaration data
    data['confirmation_of_submission'] = True
    data['ams_terms_agreed'] = True

    put_resp = test_client.put(
        f'/projects/{project.project_guid}/project-summaries/{project_summary.project_summary_guid}',
        headers=auth_headers['full_auth_header'],
        json=data)

    assert put_resp.status_code == 200
