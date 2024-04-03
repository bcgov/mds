import requests
import json
from app.config import Config
from app.date_time_helper import get_date_iso8601_string


class AMSApiService():
    """Service wrapper for the AMS API Service."""

    @classmethod
    def __get_transformed_party_code(cls, data):
        if data.lower() == "ORG":
            return "Business"
        else:
            return "Individual"

    @classmethod
    def __create_full_address(cls, address_line1, city, sub_division_code, post_code):
        return f"{address_line1}, {city}, {sub_division_code}, {post_code}"

    @classmethod
    def __get_new_authorization_details(cls, authorizations_data):
        new_authorization_values = [
            {
                'project_summary_authorization_guid': item.get('project_summary_authorization_guid'),
                'authorization_type': auth_type,
                'authorization_description': item.get('authorization_description'),
                'new_type': item.get('new_type'),
                'exemption_requested': item.get('exemption_requested'),
                'is_contaminated': item.get('is_contaminated')
            }
            for auth_type, auth_data in authorizations_data.items()
            for item in auth_data.get('NEW', [])
        ]

        return new_authorization_values

    @classmethod
    def __get_permit_type(cls, data):
        if data.lower() == "PER":
            return "Permit"
        else:
            return "Approval"

    @classmethod
    def __format_phone_number(cls, phone_no):
        return phone_no.replace('-', '').strip()

    @classmethod
    def __boolean_to_yes_no(cls, value):
        if isinstance(value, bool):
            return 'Yes' if value else 'No'
        elif value.lower() in ['yes', 'no']:
            return value

    @classmethod
    def create_ams_authorization(cls, project_summary_data):
        """Creates a new AMS authorization application"""

        ams_results = []
        headers = {
            'bearer': Config.AMS_BEARER_TOKEN,
            'Content-Type': 'application/json'
        }
        authorizations = cls.__get_new_authorization_details(project_summary_data['authorizations'])

        for authorization in authorizations:
            ams_authorization_data = {
                'isauthamendment': 'No',
                'authorizationtype': {
                    'authorizationname': cls.__get_permit_type(authorization.get('new_type')),
                },
                'authorizationnumber': 'TEST1',
                'receiveddate': get_date_iso8601_string(),
                'majorcentre': {
                    'name': project_summary_data['municipality']['municipality_name']
                },
                'applicant': {
                    'applicanttype': cls.__get_transformed_party_code(
                        project_summary_data['applicant']['party_type_code']),
                    'em_companyname': project_summary_data['applicant']['party_name'],
                    'em_businessphone': cls.__format_phone_number(project_summary_data['applicant']['phone_no']),
                    'em_firstname': project_summary_data['applicant']['first_name'],
                    'em_middlename': project_summary_data['applicant']['middle_name'],
                    'em_lastname': project_summary_data['applicant']['party_name'],
                    'em_email': project_summary_data['applicant']['email'],
                    'billingaddress': cls.__create_full_address(
                        project_summary_data['applicant']['address'][2]['address_line_1'],
                        project_summary_data['applicant']['address'][2]['city'],
                        project_summary_data['applicant']['address'][2]['sub_division_code'],
                        project_summary_data['applicant']['address'][2]['post_code'])
                },
                'agent': {
                    'em_lastname': project_summary_data['agent']['party_name'],
                    'em_firstname': project_summary_data['agent']['first_name'],
                    'em_email': project_summary_data['agent']['email'],
                    'em_companyname': project_summary_data['agent']['party_name']
                },
                'preappexemptionrequest': cls.__boolean_to_yes_no(authorization.get('exemption_requested')),
                'preappexemptionrequestreason': 'Test',
                'iscontaminatedsite': cls.__boolean_to_yes_no(authorization.get('is_contaminated')),
                'contact': {
                    'em_lastname': project_summary_data['contacts'][0]['last_name'],
                    'em_firstname': project_summary_data['contacts'][0]['first_name'],
                    'em_title': project_summary_data['contacts'][0]['job_title'],
                    'em_businessphone': cls.__format_phone_number(project_summary_data['contacts'][0]['phone_number']),
                    'em_email': project_summary_data['contacts'][0]['email']
                },
                'facilitytype': project_summary_data['facility_type'],
                'facilitydescription': project_summary_data['facility_desc'],
                'facilitylocationlatitude': project_summary_data['facility_latitude'],
                'facilitylocationlongitude': project_summary_data['facility_longitude'],
                'sourceofdata': project_summary_data['facility_coords_source'],
                'sourceofdatadescription': project_summary_data['facility_coords_source_desc'],
                'legallanddescription': project_summary_data['legal_land_desc'],
                'facilityaddress': {
                    'addresstype': 'Civic',
                    'suitenumber': project_summary_data['facility_operator']['address']['suite_no'],
                    'streetnumber': project_summary_data['facility_operator']['address']['suite_no'],
                    'street': project_summary_data['facility_operator']['address']['address_line_1'],
                    'line2': project_summary_data['facility_operator']['address']['address_line_2'],
                    'municipality': project_summary_data['facility_operator']['address']['city'],
                    'province': 'British Columbia',
                    'country': 'Canada',
                    'postalcode': project_summary_data['facility_operator']['address']['post_code']
                },
                'facilityopname': project_summary_data['facility_operator']['name'],
                'facilityopphonenumber': cls.__format_phone_number(project_summary_data['facility_operator']['phone_no']),
                'facilityopphonenumberext': project_summary_data['facility_operator']['phone_ext'],
                'facilityopemail': project_summary_data['facility_operator']['email'],
                'landownername': project_summary_data['legal_land_owner_name'],
                'landownerphonenumber': cls.__format_phone_number(project_summary_data['legal_land_owner_contact_number']),
                'landowneremail': project_summary_data['legal_land_owner_email_address'],
                'istheapplicantthelandowner': cls.__boolean_to_yes_no(project_summary_data['is_legal_land_owner'])
            }
            payload = json.dumps(ams_authorization_data)
            response = requests.post(Config.AMS_URL, data=payload, headers=headers)
            ams_result = response.json()
            ams_result['project_summary_authorization_guid'] = authorization['project_summary_authorization_guid']
            ams_results.append(ams_result)

        return ams_results
