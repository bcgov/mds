import json
import traceback

import requests
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
    def __get_mapped_amendment_type(cls, data):
        amendment_type_mapping = {
            "MIN": "Minor",
            "SIG": "Significant",
        }
        return amendment_type_mapping[data]

    @classmethod
    def __create_full_address(cls, address_line1, city, sub_division_code, post_code):
        return f"{address_line1}, {city}, {sub_division_code}, {post_code}"

    @classmethod
    def __get_authorization_details(cls, ams_authorizations, detail_type):
        new_authorization_values = []
        if len(ams_authorizations[detail_type]) > 0:
            for item in ams_authorizations[detail_type]:
                new_authorization_values.append({
                    'project_summary_authorization_guid': item.get('project_summary_authorization_guid', ''),
                    'project_summary_guid': item.get('project_summary_guid'),
                    'project_summary_authorization_type': item.get('project_summary_authorization_type'),
                    'authorization_type': item.get('new_type'),
                    'authorization_description': item.get('authorization_description') or 'N/A',
                    'exemption_reason': item.get('exemption_reason') or 'N/A',
                    'new_type': item.get('new_type'),
                    'exemption_requested': item.get('exemption_requested') or False,
                    'is_contaminated': item.get('is_contaminated') or False,
                    'amendment_severity': item.get('amendment_severity') or None,
                    'amendment_changes': item.get('amendment_changes') or None,
                    'existing_permits_authorizations': item.get('existing_permits_authorizations') or None,
                    'ams_status_code': item.get('ams_status_code') or '0',
                    # This will be used to track new authorizations that have been submitted successfully
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
    def __get_ams_document_url(cls, project_guid):
        if project_guid is None:
            return ''
        return f"{Config.CORE_WEB_URL}/pre-applications/{project_guid}/documents"

    @classmethod
    def __set_contact_details(cls, contact):
        contact_details = {
            'em_lastname': contact.get('last_name', ''),
            'em_firstname': contact.get('first_name', ''),
            'em_title': contact.get('job_title', ''),
            'em_businessphone': cls.__format_phone_number(contact.get('phone_number')),
            'em_email': contact.get('email', ''),
            'em_mailingaddress': cls.__create_full_address(
                contact['address'].get('address_line_1', ''),
                contact['address'].get('city', ''),
                contact['address'].get('sub_division_code', ''),
                contact['address'].get('post_code', '')
            ) if contact.get('address') else ''
        }
        return contact_details

    @classmethod
    def __set_applicant_details(cls, applicant, company_alias):
        applicant_details = {
            'applicanttype': cls.__get_mapped_party_type(applicant.get('party_type_code')),
            'em_companyname': applicant.get('party_name', ''),
            'em_firstname': applicant.get('first_name', ''),
            'em_middlename': applicant.get('middle_name', ''),
            'em_lastname': applicant.get('party_name', ''),
            'em_doingbusinessas': company_alias,
            'bccompanyregistrationnumber': applicant.get('party_orgbook_entity', {}).get('registration_id', ''),
            'em_businessphone': cls.__format_phone_number(applicant.get('phone_no', '')),
            'em_email': applicant.get('email', ''),
            'legaladdress': cls.__create_full_address(
                applicant.get('address')[1].get('address_line_1', ''),
                applicant.get('address')[1].get('city', ''),
                applicant.get('address')[1].get('sub_division_code', ''),
                applicant.get('address')[1].get('post_code')),
            'mailingaddress': cls.__create_full_address(
                applicant.get('address')[0].get('address_line_1', ''),
                applicant.get('address')[0].get('city', ''),
                applicant.get('address')[0].get('sub_division_code', ''),
                applicant.get('address')[0].get('post_code')),
            'billingaddress': cls.__create_full_address(
                applicant.get('address')[2].get('address_line_1', ''),
                applicant.get('address')[2].get('city', ''),
                applicant.get('address')[2].get('sub_division_code', ''),
                applicant.get('address')[2].get('post_code')),
            'billingemailaddress': ''
        }
        return applicant_details

    @classmethod
    def __set_agent_details(cls, agent):
        agent_details = {
            'em_lastname': agent.get('party_name', '') if agent else '',
            'em_firstname': agent.get('first_name', '') if agent else '',
            'em_email': agent.get('email', '') if agent else '',
            'em_companyname': agent.get('party_name', '') if agent else '',
            'em_mailingaddress': cls.__create_full_address(
                agent.get('address').get('address_line_1', ''),
                agent.get('address').get('city', ''),
                agent.get('address').get('sub_division_code', ''),
                agent.get('address').get('post_code')) if agent else '',
            'em_businessphone': cls.__format_phone_number(agent.get('phone_no')) if agent else '',
            'em_title': agent.get('job_title', '') if agent else '',
        }
        return agent_details

    @classmethod
    def __set_facility_address_details(cls, facility_operator, address_type=None):
        facility_address = {
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
        }
        if address_type is not None:
            facility_address['addresstype'] = address_type
        return facility_address

    @classmethod
    def __create_failed_ams_submission(cls, err, project_summary_authorization_guid, project_summary_authorization_type):
        ams_failure = {'project_summary_authorization_guid': project_summary_authorization_guid,
                       'errorMessage': err,
                       'statusCode': "500",
                       'project_summary_authorization_type': project_summary_authorization_type}
        return ams_failure

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
                                     company_alias,
                                     zoning,
                                     zoning_reason,
                                     regional_district_name,
                                     project_guid
                                     ):
        """Creates a new AMS authorization application"""

        ams_results = []
        current_project_summary_authorization_guid = ''
        current_project_summary_authorization_type = ''
        headers = {
            'bearer': Config.AMS_BEARER_TOKEN,
            'Content-Type': 'application/json'
        }
        try:
            nearest_municipality_name = ''
            if nearest_municipality:
                nearest_municipality_name = Municipality.find_by_guid(nearest_municipality).municipality_name

            authorization_list = cls.__get_authorization_details(ams_authorizations, 'new')
            if authorization_list.__len__() > 0:
                for authorization in authorization_list:
                    existing_ams_status_code = authorization.get('ams_status_code')
                    current_project_summary_authorization_guid = authorization.get(
                        'project_summary_authorization_guid')
                    
                    if existing_ams_status_code != '200' and current_project_summary_authorization_guid:
                        current_project_summary_authorization_type = authorization.get(
                            'project_summary_authorization_type')
                        ams_authorization_data = {
                            'isauthamendment': 'No',
                            'authorizationtype': {
                                'authorizationname': cls.__get_mapped_permit_type(authorization.get('new_type')),
                            },
                            'receiveddate': get_date_iso8601_string(),
                            'majorcentre': {
                                'name': nearest_municipality_name
                            },
                            'applicant': cls.__set_applicant_details(applicant, company_alias),
                            'agent': cls.__set_agent_details(agent),
                            'purposeofapplication': authorization.get('authorization_description', ''),
                            'preappexemptionrequest': cls.__boolean_to_yes_no(authorization.get('exemption_requested')),
                            'preappexemptionrequestreason': authorization.get('authorization_description',
                                                                              'Not Applicable'),
                            'iscontaminatedsite': cls.__boolean_to_yes_no(authorization.get('is_contaminated')),
                            'contact': cls.__set_contact_details(contacts[0]),
                            'facilitytype': facility_type,
                            'facilitydescription': facility_desc,
                            'latitude': str(facility_latitude),
                            'longitude': str(abs(facility_longitude)),
                            'sourceofdata': facility_coords_source,
                            'sourceofdatadescription': facility_coords_source_desc,
                            'legallanddescription': legal_land_desc,
                            'pidpincrownfilenumber': facility_pid_pin_crown_file_no,
                            'facilityaddress': cls.__set_facility_address_details(facility_operator,
                                                                                  "Other / International"),
                            'facilityopphonenumberext': facility_operator.get('phone_ext', ''),
                            'isappropriatezoning': cls.__boolean_to_yes_no(zoning),
                            'isappropriatezoningreason': zoning_reason,
                            'landownername': legal_land_owner_name,
                            'landownerphonenumber': cls.__format_phone_number(legal_land_owner_contact_number),
                            'landowneremail': legal_land_owner_email_address,
                            'istheapplicantthelandowner': cls.__boolean_to_yes_no(is_legal_land_owner),
                            'landfedorprov': cls.__boolean_to_yes_no(is_crown_land_federal_or_provincial),
                            'landownerawareofapplication': cls.__boolean_to_yes_no(
                                is_landowner_aware_of_discharge_application),
                            'landownerreceivedcopy': cls.__boolean_to_yes_no(
                                has_landowner_received_copy_of_application),
                            'facilityoperator': facility_operator.get('name', ''),
                            'facilityoperatorphonenumber': cls.__format_phone_number(
                                facility_operator.get('phone_no', '')),
                            'facilityoperatoremail': facility_operator.get('email', ''),
                            'facilityoperatortitle': facility_operator.get('job_title', ''),
                            'regionaldistrict': {
                                'name': regional_district_name
                            },
                            'documents': cls.__get_ams_document_url(project_guid)
                        }
                        payload = json.dumps(ams_authorization_data)
                        response = requests.post(Config.AMS_URL, data=payload, headers=headers)
                        ams_result = response.json()
                        ams_result['project_summary_authorization_guid'] = authorization.get(
                            'project_summary_authorization_guid')
                        ams_result['project_summary_guid'] = authorization.get('project_summary_guid')
                        ams_result['project_summary_authorization_type'] = authorization.get(
                            'project_summary_authorization_type')
                        ams_results.append(ams_result)
        except requests.exceptions.HTTPError as http_err:
            err_message = f'AMS Service HTTP error occurred for POST request: {str(http_err)}'
            ams_results.append(
                cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid,
                                                   current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except requests.exceptions.ConnectionError as conn_err:
            err_message = f'AMS Service Connection error occurred for POST request: {str(conn_err)}'
            ams_results.append(
                cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid,
                                                   current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except requests.exceptions.Timeout as timeout_err:
            err_message = f'AMS Service Timeout error occurred for POST request: {str(timeout_err)}'
            ams_results.append(
                cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid,
                                                   current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except Exception as err:
            err_message = f'AMS Input Exception error occurred for POST request: {str(err)}'
            ams_results.append(
                cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid,
                                                   current_project_summary_authorization_type))
            current_app.logger.error(err_message)
            current_app.logger.error(traceback.format_exc())

        return ams_results

    @classmethod
    def create_amendment_ams_authorization(cls,
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
                                           is_landowner_aware_of_discharge_application,
                                           has_landowner_received_copy_of_application,
                                           facility_pid_pin_crown_file_no,
                                           company_alias,
                                           zoning,
                                           zoning_reason,
                                           regional_district_name,
                                           is_legal_land_owner,
                                           is_crown_land_federal_or_provincial,
                                           project_guid
                                           ):
        """Creates an AMS authorization application amendment"""

        ams_results = []
        current_project_summary_authorization_guid = ''
        current_project_summary_authorization_type = ''

        headers = {
            'bearer': Config.AMS_BEARER_TOKEN,
            'Content-Type': 'application/json'
        }
        try:
            nearest_municipality_name = ''
            if nearest_municipality:
                nearest_municipality_name = Municipality.find_by_guid(nearest_municipality).municipality_name

            authorization_list = cls.__get_authorization_details(ams_authorizations, 'amendments')

            for authorization in authorization_list:
                existing_ams_status_code = authorization.get('ams_status_code')
                amendment_changes = authorization.get('amendment_changes', [])
                existing_permits_authorizations = authorization.get('existing_permits_authorizations', [])
                current_project_summary_authorization_guid = authorization.get(
                        'project_summary_authorization_guid')
                if existing_ams_status_code != '200' and current_project_summary_authorization_guid:
                    current_project_summary_authorization_type = authorization.get(
                        'project_summary_authorization_type')
                    ams_authorization_data = {
                        'isauthamendment': 'Yes',
                        'receiveddate': get_date_iso8601_string(),
                        'authorizationnumber': existing_permits_authorizations[0],
                        'amendmenttype': cls.__get_mapped_amendment_type(authorization.get('amendment_severity')),
                        'amendmentobjectives': {
                            'increasedischargelimitslt10': str('ILT' in amendment_changes).capitalize(),
                            'increasedischargelimitsgt10': str('IGT' in amendment_changes).capitalize(),
                            'decreasedischargelimits': str('DDL' in amendment_changes).capitalize(),
                            'namechange': str('NAM' in amendment_changes).capitalize(),
                            'transfer': str('TRA' in amendment_changes).capitalize(),
                            'modifymonitoringrequirements': str('MMR' in amendment_changes).capitalize(),
                            'regulatorychange': str('RCH' in amendment_changes).capitalize(),
                            'other': str('OTH' in amendment_changes).capitalize()
                        },
                        'purposeofapplication': authorization.get('authorization_description', ''),
                        'newmajorcentre': {
                            'name': nearest_municipality_name
                        },
                        'preappexemptionrequest': cls.__boolean_to_yes_no(authorization.get('exemption_requested')),
                        'preappexemptionrequestreason': authorization.get('authorization_description',
                                                                          'Not Applicable'),
                        'newapplicant': cls.__set_applicant_details(applicant, company_alias),
                        'newcontact': cls.__set_contact_details(contacts[0]),
                        'newagent': cls.__set_agent_details(agent),
                        'newfacilitytype': facility_type,
                        'newfacilitydescrption': facility_desc,
                        'newregionaldistrict': {
                            'name': regional_district_name
                        },
                        'newlatitude': str(facility_latitude),
                        'newlongitude': str(abs(facility_longitude)),
                        'newsourceofdata': facility_coords_source,
                        'newsourceofdatadescription': facility_coords_source_desc,
                        'newlegallanddescription': legal_land_desc,
                        'newpidpincrownfilenumber': facility_pid_pin_crown_file_no,
                        'newfacilityaddress': cls.__set_facility_address_details(facility_operator,
                                                                                 "Other / International"),
                        'newisappropriatezoning': cls.__boolean_to_yes_no(zoning),
                        'newisappropriatezoningreason': zoning_reason,
                        'newfacilityoperator': facility_operator.get('name', ''),
                        'newfacilityoperatortitle': facility_operator.get('job_title', ''),
                        'newfacilityoperatorphonenumber': cls.__format_phone_number(
                            facility_operator.get('phone_no', '')),
                        'newfacilityopphonenumberext': facility_operator.get('phone_ext', ''),
                        'newfacilityoperatoremail': facility_operator.get('email', ''),
                        'newlandownerawareofapplication': cls.__boolean_to_yes_no(
                            is_landowner_aware_of_discharge_application),
                        'newlandownerreceivedcopy': cls.__boolean_to_yes_no(has_landowner_received_copy_of_application),
                        'newlandownername': legal_land_owner_name,
                        'newlandownerphonenumber': cls.__format_phone_number(legal_land_owner_contact_number),
                        'newlandowneremail': legal_land_owner_email_address,
                        'newistheapplicantthelandowner': cls.__boolean_to_yes_no(is_legal_land_owner),
                        'newlandfedorprov': cls.__boolean_to_yes_no(is_crown_land_federal_or_provincial),
                        'documents': cls.__get_ams_document_url(project_guid)
                    }
                    payload = json.dumps(ams_authorization_data)
                    response = requests.post(Config.AMS_URL, data=payload, headers=headers)
                    ams_result = response.json()
                    current_app.logger.error(f'AMS Result: {ams_result}')
                    ams_result['project_summary_authorization_guid'] = authorization.get(
                        'project_summary_authorization_guid')
                    ams_result['project_summary_guid'] = authorization.get('project_summary_guid')
                    ams_result['project_summary_authorization_type'] = authorization.get(
                        'project_summary_authorization_type')
                    ams_results.append(ams_result)


        except requests.exceptions.HTTPError as http_err:
            err_message = f'AMS Service HTTP error occurred for POST request: {str(http_err)}'
            ams_results.append(
                cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid, current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except requests.exceptions.ConnectionError as conn_err:
            err_message = f'AMS Service Connection error occurred for POST request: {str(conn_err)}'
            ams_results.append(cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid, current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except requests.exceptions.Timeout as timeout_err:
            err_message = f'AMS Service Timeout error occurred for POST request: {str(timeout_err)}'
            ams_results.append(cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid, current_project_summary_authorization_type))
            current_app.logger.error(err_message)
        except Exception as err:
            err_message = f'AMS Input Exception error occurred for POST request: {str(err)}'
            ams_results.append(cls.__create_failed_ams_submission(err_message, current_project_summary_authorization_guid, current_project_summary_authorization_type))
            current_app.logger.error(err_message)
            current_app.logger.error(traceback.format_exc())

        return ams_results
