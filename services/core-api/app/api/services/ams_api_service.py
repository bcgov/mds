import requests
import json

from flask import current_app

from app.api.municipalities.models.municipality import Municipality
from app.config import Config
from app.date_time_helper import get_date_iso8601_string


class AMSApiService():
    """Service wrapper for the AMS API Service."""

    @classmethod
    def __get_mapped_party_type(cls, data):
        party_type_code_mapping = {
            "ORG": "Business",
            "PER": "Individual"
        }
        return party_type_code_mapping[data]

    @classmethod
    def __get_mapped_permit_type(cls, data):
        permit_type_mapping = {
            "PER": "Permit",
            "APP": "Approval"
        }
        return permit_type_mapping[data]

    @classmethod
    def __create_full_address(cls, address_line1, city, sub_division_code, post_code):
        return f"{address_line1}, {city}, {sub_division_code}, {post_code}"

    @classmethod
    def __get_new_authorization_details(cls, ams_authorizations):
        new_authorization_values = []
        if len(ams_authorizations['new']) > 0:
            for item in ams_authorizations['new']:
                new_authorization_values.append({
                    'project_summary_authorization_guid': item.get('project_summary_authorization_guid', ''),
                    'project_summary_guid': item.get('project_summary_guid'),
                    'project_summary_authorization_type': item.get('project_summary_authorization_type'),
                    'authorization_type': item.get('new_type'),
                    'authorization_description': item.get('authorization_description') or 'N/A',
                    'new_type': item.get('new_type'),
                    'exemption_requested': item.get('exemption_requested') or False,
                    'is_contaminated': item.get('is_contaminated') or False
                })
        return new_authorization_values

    @classmethod
    def __format_phone_number(cls, phone_no):
        return phone_no.replace('-', '').strip() if phone_no else None

    @classmethod
    def __boolean_to_yes_no(cls, value):
        if value is None:
            return 'No'
        return 'Yes' if value else 'No'

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
                                     has_landowner_received_copy_of_application,
                                     facility_pid_pin_crown_file_no,
                                     company_alias
                                     ):
        """Creates a new AMS authorization application"""

        ams_results = []
        headers = {
            'bearer': Config.AMS_BEARER_TOKEN,
            'Content-Type': 'application/json'
        }
        try:
            nearest_municipality_name = ''
            if nearest_municipality:
                nearest_municipality_name = Municipality.find_by_guid(nearest_municipality).municipality_name

            authorization_list = cls.__get_new_authorization_details(ams_authorizations)
            for authorization in authorization_list:
                ams_authorization_data = {
                    'isauthamendment': 'No',
                    'authorizationtype': {
                        'authorizationname': cls.__get_mapped_permit_type(authorization.get('new_type')),
                    },
                    'receiveddate': get_date_iso8601_string(),
                    'majorcentre': {
                        'name': nearest_municipality_name
                    },
                    'applicant': {
                        'applicanttype': cls.__get_mapped_party_type(applicant.get('party_type_code')),
                        'em_companyname': applicant.get('party_name', ''),
                        'em_businessphone': cls.__format_phone_number(applicant.get('phone_no', '')),
                        'em_firstname': applicant.get('first_name', ''),
                        'em_middlename': applicant.get('middle_name', ''),
                        'em_lastname': applicant.get('party_name', ''),
                        'em_email': applicant.get('email', ''),
                        'billingaddress': cls.__create_full_address(
                            applicant.get('address')[2].get('address_line_1', ''),
                            applicant.get('address')[2].get('city', ''),
                            applicant.get('address')[2].get('sub_division_code', ''),
                            applicant.get('address')[2].get('post_code')),
                        'em_doingbusinessas': company_alias,
                    },
                    'agent': {
                        'em_lastname': agent.get('party_name', '') if agent else '',
                        'em_firstname': agent.get('first_name', '') if agent else '',
                        'em_email': agent.get('email', '') if agent else '',
                        'em_companyname': agent.get('party_name', '') if agent else ''
                    },
                    'purposeofapplication': authorization.get('authorization_description', ''),
                    'preappexemptionrequest': cls.__boolean_to_yes_no(authorization.get('exemption_requested')),
                    'preappexemptionrequestreason': authorization.get('authorization_description', 'Not Applicable'),
                    'iscontaminatedsite': cls.__boolean_to_yes_no(authorization.get('is_contaminated')),
                    'contact': {
                        'em_lastname': contacts[0].get('last_name', ''),
                        'em_firstname': contacts[0].get('first_name', ''),
                        'em_title': contacts[0].get('job_title', ''),
                        'em_businessphone': cls.__format_phone_number(contacts[0].get('phone_number')),
                        'em_email': contacts[0].get('email', ''),
                        'em_mailingaddress': cls.__create_full_address(
                            contacts[0].get('address').get('address_line_1', ''),
                            contacts[0].get('address').get('city', ''),
                            contacts[0].get('address').get('sub_division_code', ''),
                            contacts[0].get('address').get('post_code')),
                    },
                    'facilitytype': facility_type,
                    'facilitydescription': facility_desc,
                    'facilitylocationlatitude': str(facility_latitude),
                    'facilitylocationlongitude': str(facility_longitude),
                    'latitude': str(facility_latitude),
                    'longitude': str(abs(facility_longitude)),
                    'sourceofdata': facility_coords_source,
                    'sourceofdatadescription': facility_coords_source_desc,
                    'legallanddescription': legal_land_desc,
                    'pidpincrownfilenumber': facility_pid_pin_crown_file_no,
                    'facilityaddress': {
                        'addresstype': 'Other / International',
                        'suitenumber': facility_operator.get('address').get('suite_no', ''),
                        'streetnumber': facility_operator.get('address').get('suite_no', ''),
                        'street': facility_operator.get('address').get('address_line_1', ''),
                        'line2': facility_operator.get('address').get('address_line_2', ''),
                        'municipality': facility_operator.get('address').get('city', ''),
                        'province': 'British Columbia',
                        'country': 'Canada',
                        'postalcode': facility_operator.get('address').get('post_code'),
                        'otheraddress': cls.__create_full_address(
                            facility_operator.get('address').get('address_line_1'),
                            facility_operator.get('address').get('city'),
                            facility_operator.get('address').get('sub_division_code'),
                            facility_operator.get('address').get('post_code'))
                    },
                    'facilityopname': facility_operator.get('name', ''),
                    'facilityopphonenumber': cls.__format_phone_number(facility_operator.get('phone_no', '')),
                    'facilityopphonenumberext': facility_operator.get('phone_ext', ''),
                    'facilityopemail': facility_operator.get('email', ''),
                    'landownername': legal_land_owner_name,
                    'landownerphonenumber': cls.__format_phone_number(legal_land_owner_contact_number),
                    'landowneremail': legal_land_owner_email_address,
                    'istheapplicantthelandowner': cls.__boolean_to_yes_no(is_legal_land_owner),
                    'landfedorprov': cls.__boolean_to_yes_no(is_crown_land_federal_or_provincial),
                    'landownerawareofapplication': cls.__boolean_to_yes_no(is_landowner_aware_of_discharge_application),
                    'landownerreceivedcopy': cls.__boolean_to_yes_no(has_landowner_received_copy_of_application),
                    'facilityoperator': facility_operator.get('name', ''),
                    'facilityoperatorphonenumber': cls.__format_phone_number(facility_operator.get('phone_no', '')),
                    'facilityoperatoremail': facility_operator.get('email', ''),
                }
                payload = json.dumps(ams_authorization_data)
                response = requests.post(Config.AMS_URL, data=payload, headers=headers)
                ams_result = response.json()
                ams_result['project_summary_authorization_guid'] = authorization.get('project_summary_authorization_guid')
                ams_result['project_summary_guid'] = authorization.get('project_summary_guid')
                ams_result['project_summary_authorization_type'] = authorization.get(
                    'project_summary_authorization_type')
                ams_results.append(ams_result)
        except requests.exceptions.HTTPError as http_err:
            current_app.logger.error(f'AMS Service HTTP error occurred for POST request: {http_err}')
        except requests.exceptions.ConnectionError as conn_err:
            current_app.logger.error(f'AMS Service Connection error occurred for POST request: {conn_err}')
        except requests.exceptions.Timeout as timeout_err:
            current_app.logger.error(f'AMS Service Timeout error occurred for POST request: {timeout_err}')
        except Exception as err:
            current_app.logger.error(f'AMS Input Exception error occurred for POST request: {err}')

        return ams_results
