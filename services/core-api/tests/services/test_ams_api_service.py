from unittest.mock import patch
from flask import current_app
from app.api.services.ams_api_service import AMSApiService


def test_create_new_ams_authorization_unsuccessful_outcome(test_client):
    data = {}

    mock_return_value = [
        {
            "project_summary_authorization_guid": "ec130a0a-9b31-4ebf-89e4-9d62dc420839",
            "project_summary_guid": "fb7d7a7d-452b-4357-b0b4-a0cab41d708f",
            "project_summary_authorization_type": "some type",
            "detail": ["some error"],
        }
]

    with current_app.test_request_context() as a, patch(
            "app.api.services.ams_api_service.AMSApiService.create_new_ams_authorization",
            return_value=mock_return_value
    ) as mock_create_new_ams_authorization:
        service = AMSApiService()
        result = service.create_new_ams_authorization(data.get('ams_authorizations'),
                                                      data.get('applicant'),
                                                      data.get('nearest_municipality'),
                                                      data.get('agent'),
                                                      data.get('contacts'),
                                                      data.get('facility_type'),
                                                      data.get('facility_desc'),
                                                      data.get('facility_latitude'),
                                                      data.get('facility_longitude'),
                                                      data.get('facility_coords_source'),
                                                      data.get('facility_coords_source_desc'),
                                                      data.get('legal_land_desc'),
                                                      data.get('facility_operator'),
                                                      data.get('legal_land_owner_name'),
                                                      data.get('legal_land_owner_contact_number'),
                                                      data.get('legal_land_owner_email_address'),
                                                      data.get('is_legal_land_owner'),
                                                      data.get('is_crown_land_federal_or_provincial'),
                                                      data.get('is_landowner_aware_of_discharge_application'),
                                                      data.get('has_landowner_received_copy_of_application'),
                                                      data.get('facility_pid_pin_crown_file_no'),
                                                      data.get('company_alias'),
                                                      data.get('zoning'),
                                                      data.get('zoning_reason'),
                                                      data.get('regional_district_name'),
                                                      data.get('project_guid'),
                                                      data.get('payment_contact'),
                                                      data.get('incorporation_number'))

        mock_create_new_ams_authorization.assert_called_once()
        assert result[0]['detail'] == 'some error'


def test_create_new_ams_authorization_successful_outcome(test_client):
    data = {
        'documents': [],
        'company_alias': 'Test',
        'contacts': [{
            'project_contact_guid': '5ba69052-ebf7-433d-8a31-e277b412f232',
            'project_guid': '4f3ce441-05a4-4df0-b51a-3726e1e78ee3',
            'email': 'test@test.com',
            'phone_number': '123-456-7890',
            'first_name': 'Tester',
            'last_name': 'Tester',
            'address': {
                'suite_no': '15',
                'address_line_1': 'Pump Street',
                'city': 'Victoria',
                'sub_division_code': 'BC',
                'post_code': 'V9B2T8',
                'address_type_code': 'CAN'
            }
        }],
        'ams_authorizations': {
            'new': [
                {
                    'project_summary_authorization_guid': 'xyz123',
                    'project_summary_guid': 'abcde12345',
                    'new_type': 'PER',
                    'authorization_description': 'Test desc',
                    'exemption_reason': 'test exemption',
                    'exemption_requested': True,
                    'is_contaminated': True
                }
            ]
        },
        'agent': {
            'party_guid': '81406c88-277b-402f-a9d9-38db3f00904b',
            'party_type_code': 'ORG',
            'phone_no': '123-456-7890',
            'email': 'test@test.com',
            'party_name': 'Test Agent Name',
            'name': 'Test Agent Name',
            'address': {
                'suite_no': '20',
                'address_line_1': 'Pump Street',
                'city': 'Victoria',
                'sub_division_code': 'BC',
                'post_code': 'V9B2T3',
                'address_type_code': 'CAN'
            }
        },
        'is_legal_land_owner': False,
        'is_crown_land_federal_or_provincial': True,
        'is_landowner_aware_of_discharge_application': True,
        'has_landowner_received_copy_of_application': True,
        'legal_land_owner_name': 'Test Land owner',
        'legal_land_owner_contact_number': '123-456-7890',
        'legal_land_owner_email_address': 'test@test.com',
        'facility_operator': {
            'party_guid': '3a532eee-9d43-4662-b11d-a81e5fbc4543',
            'party_type_code': 'PER',
            'phone_no': '123-456-7890',
            'party_name': 'Last name',
            'name': 'First Last name',
            'first_name': 'First',
            'address': {
                'suite_no': '15',
                'address_line_1': 'Pump Street',
                'city': 'Victoria',
                'sub_division_code': 'BC',
                'post_code': 'V9B2T8',
                'address_type_code': 'CAN'
            },
        },
        'zoning': True,
        'facility_pid_pin_crown_file_no': '12345',
        'facility_type': 'Test Facility',
        'facility_desc': 'Test Facility',
        'facility_latitude': '47.0000000',
        'facility_longitude': '-113.0000000',
        'facility_coords_source': 'GPS',
        'nearest_municipality': 'abcde12345',
        'is_legal_address_same_as_mailing_address': False,
        'is_billing_address_same_as_mailing_address': False,
        'is_billing_address_same_as_legal_address': True,
        'applicant': {
            'party_guid': '58336bde-ee23-4b58-ba0a-864fa033e343',
            'party_type_code': 'ORG',
            'phone_no': '123-456-7890',
            'email': 'test@gold.com',
            'party_name': 'SELECT REALTY',
            'name': 'SELECT REALTY',
            'address': [
                {
                    'suite_no': '35',
                    'address_line_1': '15 Cancun Street',
                    'city': 'Victoria',
                    'sub_division_code': 'BC',
                    'post_code': 'V9B2T9',
                    'address_type_code': 'CAN'
                },
                {
                    'suite_no': '27B',
                    'address_line_1': '35 Ade street',
                    'city': 'Pretoria',
                    'sub_division_code': None,
                    'post_code': '29192',
                    'address_type_code': 'INT'
                },
                {
                    'suite_no': '27B',
                    'address_line_1': '35 Ade street',
                    'city': 'Pretoria',
                    'sub_division_code': None,
                    'post_code': '29192',
                    'address_type_code': 'INT'
                }
            ],
        },
        'regional_district_name': None,
        'project_guid': '58336bde-ee23-4b58-ba0a-864fa033e555',
        'payment_contact': {},
        'incorporation_number': None,
    }

    mock_return_value = [
        {'trackingnumber': '123456', 'outcome': 'Successfull',
         'project_summary_authorization_guid': 'xyz123'}
    ]
    with current_app.test_request_context() as a, patch(
            "app.api.services.ams_api_service.AMSApiService.create_new_ams_authorization",
            return_value=mock_return_value
    ) as mock_create_new_ams_authorization:
        service = AMSApiService()
        result = service.create_new_ams_authorization(data.get('ams_authorizations'),
                                                      data.get('applicant'),
                                                      data.get('nearest_municipality'),
                                                      data.get('agent'),
                                                      data.get('contacts'),
                                                      data.get('facility_type'),
                                                      data.get('facility_desc'),
                                                      data.get('facility_latitude'),
                                                      data.get('facility_longitude'),
                                                      data.get('facility_coords_source'),
                                                      data.get('facility_coords_source_desc'),
                                                      data.get('legal_land_desc'),
                                                      data.get('facility_operator'),
                                                      data.get('legal_land_owner_name'),
                                                      data.get('legal_land_owner_contact_number'),
                                                      data.get('legal_land_owner_email_address'),
                                                      data.get('is_legal_land_owner'),
                                                      data.get('is_crown_land_federal_or_provincial'),
                                                      data.get('is_landowner_aware_of_discharge_application'),
                                                      data.get('has_landowner_received_copy_of_application'),
                                                      data.get('facility_pid_pin_crown_file_no'),
                                                      data.get('company_alias'),
                                                      data.get('zoning'),
                                                      data.get('zoning_reason'),
                                                      data.get('regional_district_name'),
                                                      data.get('project_guid'),
                                                      data.get('payment_contact'),
                                                      data.get('incorporation_number'))
        mock_create_new_ams_authorization.assert_called_once()
        assert result[0]['trackingnumber'] == '123456'

def test_create_amendment_ams_authorization_successful_outcome(test_client):
        data = {
            'documents': [],
            'company_alias': 'Test',
            'contacts': [{
                'project_contact_guid': '5ba69052-ebf7-433d-8a31-e277b412f232',
                'project_guid': '4f3ce441-05a4-4df0-b51a-3726e1e78ee3',
                'email': 'test@test.com',
                'phone_number': '123-456-7890',
                'first_name': 'Tester',
                'last_name': 'Tester',
                'address': {
                    'suite_no': '15',
                    'address_line_1': 'Pump Street',
                    'city': 'Victoria',
                    'sub_division_code': 'BC',
                    'post_code': 'V9B2T8',
                    'address_type_code': 'CAN'
                }
            }],
            'ams_authorizations': {
                'amendment': [
                    {
                        'project_summary_authorization_guid': 'xyz123',
                        'project_summary_guid': 'abcde12345',
                        'new_type': 'PER',
                        'authorization_description': 'Test desc',
                        'exemption_requested': True,
                        'is_contaminated': True
                    }
                ]
            },
            'agent': {
                'party_guid': '81406c88-277b-402f-a9d9-38db3f00904b',
                'party_type_code': 'ORG',
                'phone_no': '123-456-7890',
                'email': 'test@test.com',
                'party_name': 'Test Agent Name',
                'name': 'Test Agent Name',
                'address': {
                    'suite_no': '20',
                    'address_line_1': 'Pump Street',
                    'city': 'Victoria',
                    'sub_division_code': 'BC',
                    'post_code': 'V9B2T3',
                    'address_type_code': 'CAN'
                }
            },
            'is_legal_land_owner': False,
            'is_crown_land_federal_or_provincial': True,
            'is_landowner_aware_of_discharge_application': True,
            'has_landowner_received_copy_of_application': True,
            'legal_land_owner_name': 'Test Land owner',
            'legal_land_owner_contact_number': '123-456-7890',
            'legal_land_owner_email_address': 'test@test.com',
            'facility_operator': {
                'party_guid': '3a532eee-9d43-4662-b11d-a81e5fbc4543',
                'party_type_code': 'PER',
                'phone_no': '123-456-7890',
                'party_name': 'Last name',
                'name': 'First Last name',
                'first_name': 'First',
                'address': {
                    'suite_no': '15',
                    'address_line_1': 'Pump Street',
                    'city': 'Victoria',
                    'sub_division_code': 'BC',
                    'post_code': 'V9B2T8',
                    'address_type_code': 'CAN'
                },
            },
            'zoning': True,
            'facility_pid_pin_crown_file_no': '12345',
            'facility_type': 'Test Facility',
            'facility_desc': 'Test Facility',
            'facility_latitude': '47.0000000',
            'facility_longitude': '-113.0000000',
            'facility_coords_source': 'GPS',
            'nearest_municipality': 'abcde12345',
            'is_legal_address_same_as_mailing_address': False,
            'is_billing_address_same_as_mailing_address': False,
            'is_billing_address_same_as_legal_address': True,
            'applicant': {
                'party_guid': '58336bde-ee23-4b58-ba0a-864fa033e343',
                'party_type_code': 'ORG',
                'phone_no': '123-456-7890',
                'email': 'test@gold.com',
                'party_name': 'SELECT REALTY',
                'name': 'SELECT REALTY',
                'address': [
                    {
                        'suite_no': '35',
                        'address_line_1': '15 Cancun Street',
                        'city': 'Victoria',
                        'sub_division_code': 'BC',
                        'post_code': 'V9B2T9',
                        'address_type_code': 'CAN'
                    },
                    {
                        'suite_no': '27B',
                        'address_line_1': '35 Ade street',
                        'city': 'Pretoria',
                        'sub_division_code': None,
                        'post_code': '29192',
                        'address_type_code': 'INT'
                    },
                    {
                        'suite_no': '27B',
                        'address_line_1': '35 Ade street',
                        'city': 'Pretoria',
                        'sub_division_code': None,
                        'post_code': '29192',
                        'address_type_code': 'INT'
                    }
                ],
            }
        }

        mock_return_value = [
            {'trackingnumber': '123456', 'outcome': 'Successfull',
             'project_summary_authorization_guid': 'xyz123'}
        ]
        with current_app.test_request_context() as a, patch(
                "app.api.services.ams_api_service.AMSApiService.create_amendment_ams_authorization",
                return_value=mock_return_value
        ) as create_amendment_ams_authorization:
            service = AMSApiService()
            result = service.create_amendment_ams_authorization(data.get('ams_authorizations'),
                                                          data.get('applicant'),
                                                          data.get('nearest_municipality'),
                                                          data.get('agent'),
                                                          data.get('contacts'),
                                                          data.get('facility_type'),
                                                          data.get('facility_desc'),
                                                          data.get('facility_latitude'),
                                                          data.get('facility_longitude'),
                                                          data.get('facility_coords_source'),
                                                          data.get('facility_coords_source_desc'),
                                                          data.get('legal_land_desc'),
                                                          data.get('facility_operator'),
                                                          data.get('legal_land_owner_name'),
                                                          data.get('legal_land_owner_contact_number'),
                                                          data.get('legal_land_owner_email_address'),
                                                          data.get('is_legal_land_owner'),
                                                          data.get('is_crown_land_federal_or_provincial'),
                                                          data.get('is_landowner_aware_of_discharge_application'),
                                                          data.get('has_landowner_received_copy_of_application'),
                                                          data.get('facility_pid_pin_crown_file_no'),
                                                          data.get('company_alias'),
                                                          data.get('zoning'),
                                                          data.get('zoning_reason'),
                                                          data.get('regional_district_name'),
                                                          data.get('project_guid'),
                                                          data.get('payment_contact'),
                                                          data.get('incorporation_number'))
            create_amendment_ams_authorization.assert_called_once()
            assert result[0]['trackingnumber'] == '123456'

def test_get_ams_authorization_status_unsuccessful_outcome(test_client):
    ams_tracking_numbers = ['12354']
    ams_error_messages = 'AMS Services get status request returned 400.\n Error: No object found in AMS for trackingNumber: 12354'
    mock_return_value = [
        {
            "ams_tracking_number": "12354",
            "ams_mining_permit_number": None,
            "ams_authorization_number": None,
            "status": None,
            "regional_case_manager": None,
            "documents": [],
            "errors": [ams_error_messages],
        }
    ]

    with current_app.test_request_context() as a, patch(
            "app.api.services.ams_api_service.AMSApiService.get_ams_authorization_statuses",
            return_value=mock_return_value
    ) as mock_get_ams_authorization_status:
        service = AMSApiService()
        result = service.get_ams_authorization_statuses(ams_tracking_numbers)
        mock_get_ams_authorization_status.assert_called_once()
        assert result[0]['message'] == "No object found in AMS for trackingNumber: 12354"

def test_get_ams_authorization_status_successful_outcome(test_client):
    ams_tracking_numbers = ['442542']

    mock_return_value = [
        {
            "ams_tracking_number": "442542",
            "ams_mining_permit_number": None,
            "ams_authorization_number": "112497",
            "status": "New",
            "regional_case_manager": None,
            "documents": [],
            "errors": [],
        }
    ]

    with current_app.test_request_context() as a, patch(
            "app.api.services.ams_api_service.AMSApiService.get_ams_authorization_statuses",
            return_value=mock_return_value
    ) as mock_get_ams_authorization_status:
        service = AMSApiService()
        result = service.get_ams_authorization_statuses(ams_tracking_numbers)
        mock_get_ams_authorization_status.assert_called_once()
        assert result[0]['ams_tracking_number'] == "442542"
        assert result[0]['status'] == "New"