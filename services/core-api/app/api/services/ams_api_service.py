import requests
import json

from app.api.municipalities.models.municipality import Municipality
from app.config import Config
from app.date_time_helper import get_date_iso8601_string


class AMSApiService():
    """Service wrapper for the AMS API Service."""

    @classmethod
    def __get_transformed_party_code(cls, data):
        if data and data.lower() == "ORG":
            return "Business"
        else:
            return "Individual"

    @classmethod
    def __create_full_address(cls, address_line1, city, sub_division_code, post_code):
        return f"{address_line1}, {city}, {sub_division_code}, {post_code}"

    @classmethod
    def __get_new_authorization_details(cls, authorizations_data):
        new_authorization_values = []

        if len(authorizations_data['new']) > 0:
            for item in authorizations_data['new']:
                new_authorization_values.append({
                    'project_summary_guid': item.get('project_summary_guid'),
                    'project_summary_authorization_type': item.get('project_summary_authorization_type'),
                    'authorization_type': item.get('new_type'),
                    'authorization_description': item.get('authorization_description'),
                    'new_type': item.get('new_type'),
                    'exemption_requested': item.get('exemption_requested'),
                    'is_contaminated': item.get('is_contaminated')
                })

        return new_authorization_values

    @classmethod
    def __get_permit_type(cls, data):
        if data and data.lower() == "PER":
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
        return 'No'

    @classmethod
    def create_new_ams_authorization(cls,
                                 ams_authorizations,
                                 applicant,
                                 nearest_municipality,
                                 agent,
                                 contacts,
                                 facility_type,
                                 facility_desc,
                                 facility_latitude,
                                 facility_longitude,
                                 facility_coords_source,
                                 facility_coords_source_desc,
                                 legal_land_desc,
                                 facility_operator,
                                 legal_land_owner_name,
                                 legal_land_owner_contact_number,
                                 legal_land_owner_email_address,
                                 is_legal_land_owner,
                                 is_crown_land_federal_or_provincial,
                                 is_landowner_aware_of_discharge_application,
                                 has_landowner_received_copy_of_application
                                 ):
        """Creates a new AMS authorization application"""

        ams_results = []
        headers = {
            'bearer': Config.AMS_BEARER_TOKEN,
            'Content-Type': 'application/json'
        }
        nearest_municipality_name = Municipality.find_by_guid(nearest_municipality).municipality_name
        authorization_list = cls.__get_new_authorization_details(ams_authorizations)

        for authorization in authorization_list:
            ams_authorization_data = {
                'isauthamendment': 'No',
                'authorizationtype': {
                    'authorizationname': cls.__get_permit_type(authorization.get('new_type')),
                },
                'authorizationnumber': 'TEST1',
                'receiveddate': get_date_iso8601_string(),
                'majorcentre': {
                    'name': nearest_municipality_name
                },
                'applicant': {
                    'applicanttype': cls.__get_transformed_party_code(applicant['party_type_code']),
                    'em_companyname': applicant['party_name'],
                    'em_businessphone': cls.__format_phone_number(applicant['phone_no']),
                    'em_firstname': applicant['first_name'],
                    'em_middlename': applicant['middle_name'],
                    'em_lastname': applicant['party_name'],
                    'em_email': applicant['email'],
                    'billingaddress': cls.__create_full_address(
                        applicant['address'][2]['address_line_1'],
                        applicant['address'][2]['city'],
                        applicant['address'][2]['sub_division_code'],
                        applicant['address'][2]['post_code'])
                },
                'agent': {
                    'em_lastname': agent['party_name'],
                    'em_firstname': agent['first_name'],
                    'em_email': agent['email'],
                    'em_companyname': agent['party_name']
                },
                'preappexemptionrequest': cls.__boolean_to_yes_no(authorization.get('exemption_requested')),
                'preappexemptionrequestreason': 'Test',
                'iscontaminatedsite': cls.__boolean_to_yes_no(authorization.get('is_contaminated')),
                'contact': {
                    'em_lastname': contacts[0]['last_name'],
                    'em_firstname': contacts[0]['first_name'],
                    'em_title': contacts[0]['job_title'],
                    'em_businessphone': cls.__format_phone_number(contacts[0]['phone_number']),
                    'em_email': contacts[0]['email']
                },
                'facilitytype': facility_type,
                'facilitydescription': facility_desc,
                'facilitylocationlatitude': str(facility_latitude),
                'facilitylocationlongitude': str(facility_longitude),
                'sourceofdata': facility_coords_source,
                'sourceofdatadescription': facility_coords_source_desc,
                'legallanddescription': legal_land_desc,
                'facilityaddress': {
                    'addresstype': 'Civic',
                    'suitenumber': facility_operator['address']['suite_no'],
                    'streetnumber': facility_operator['address']['suite_no'],
                    'street': facility_operator['address']['address_line_1'],
                    'line2': facility_operator['address']['address_line_2'],
                    'municipality': facility_operator['address']['city'],
                    'province': 'British Columbia',
                    'country': 'Canada',
                    'postalcode': facility_operator['address']['post_code']
                },
                'facilityopname': facility_operator['name'],
                'facilityopphonenumber': cls.__format_phone_number(facility_operator['phone_no']),
                'facilityopphonenumberext': facility_operator['phone_ext'],
                'facilityopemail': facility_operator['email'],
                'landownername': legal_land_owner_name,
                'landownerphonenumber': cls.__format_phone_number(legal_land_owner_contact_number),
                'landowneremail': legal_land_owner_email_address,
                'istheapplicantthelandowner': cls.__boolean_to_yes_no(is_legal_land_owner),
                'landfedorprov': cls.__boolean_to_yes_no(is_crown_land_federal_or_provincial),
                'landownerawareofapplication': cls.__boolean_to_yes_no(is_landowner_aware_of_discharge_application),
                'landownerreceivedcopy': cls.__boolean_to_yes_no(has_landowner_received_copy_of_application)
            }
            payload = json.dumps(ams_authorization_data)
            response = requests.post(Config.AMS_URL, data=payload, headers=headers)
            ams_result = response.json()
            ams_result['project_summary_guid'] = authorization['project_summary_guid']
            ams_result['project_summary_authorization_type'] = authorization['project_summary_authorization_type']
            ams_results.append(ams_result)
        return ams_results
