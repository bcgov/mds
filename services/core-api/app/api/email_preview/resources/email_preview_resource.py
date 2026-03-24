from flask import current_app, Response
from flask_restx import Resource
import os
from pathlib import Path

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, MINE_ADMIN
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import CORE_PURPLE_LOGO_BASE64_ENCODED, MINESPACE_LOGO_BASE64_ENCODED, BC_GOV_LOGO_BASE64_ENCODED
from werkzeug.exceptions import NotFound, InternalServerError

def _get_available_email_templates():
    """
    Get a list of all available email templates
    Returns a list of template names (relative paths from email/ directory)
    """    
    
    templates_dir = os.path.join(os.getcwd(), 'app', 'templates', 'email')
    templates = []
    
    # Recursively find all .html files in email templates
    for template_file in Path(templates_dir).rglob('*.html'):
        # Skip base and component templates
        if template_file.parts[-2] in ['_base', '_components']:
            continue
            
        # Get relative path from email/ directory
        relative_path = template_file.relative_to(templates_dir)
        template_name = str(relative_path)
        templates.append(template_name)
    
    return sorted(templates)


class EmailPreviewResource(Resource, UserMixin):
    """
    Email Preview API endpoint for development
    """
    
    @api.doc(
        description='Preview an email template with test data',
        params={'template_name': 'The name/path of the email template to preview'})
    @requires_any_of([MINE_ADMIN])
    def get(self, template_name):
        try:
            # Validate template exists and prevent path traversal
            available_templates = _get_available_email_templates()
            if template_name not in available_templates:
                return NotFound("Template not found")
            
            template_path = f"email/{template_name}"
            template = current_app.jinja_env.get_template(template_path)
            
            # Get test data for the template
            test_data = self._get_test_data_for_template(template_name)
            
            # Render the template
            rendered_html = template.render(**test_data)
            
            # Return HTML response for browser viewing (bypass Flask-RESTX JSON serialization)
            response = Response(rendered_html, mimetype='text/html')
            return response
            
        except Exception as e:
            current_app.logger.error(f"Error previewing template {template_name}: {e}")
            raise InternalServerError('Template preview failed due to an internal error.')
    
    def _get_test_data_for_template(self, template_name):
        """Get appropriate test data based on template name"""
        
        # Brand logos (always included) - using actual base64 encoded logos
        base_data = {
            'bc_gov_logo': BC_GOV_LOGO_BASE64_ENCODED,
            'core_logo': CORE_PURPLE_LOGO_BASE64_ENCODED,
            'minespace_logo': MINESPACE_LOGO_BASE64_ENCODED
        }
        
        # Template-specific test data
        if 'error_report' in template_name:
            template_data = {
                'reporter': {
                    'name': 'John Developer',
                    'email': 'john.developer@gov.bc.ca'
                },
                'reported_date': '2024-09-29 14:30:00',
                'environment': 'Development',
                'business_error': 'Database connection timeout',
                'trace_id': 'abc123-def456-ghi789',
                'kibana_link': 'https://kibana.example.com/trace/abc123'
            }
            return {**base_data, **template_data}
            
        elif 'report_submitted' in template_name or 'report_requested' in template_name:
            template_data = {
                'report_submision': {  # Note: keeping original typo for compatibility
                    'mine_name': 'Highland Valley Copper',
                    'mine_number': 'HVC001', 
                    'report_name': 'Annual Environmental Report',
                    'report_type': 'Environmental Report',
                    'report_compliance_year': '2024',
                    'report_due_date': '2024-12-31',
                    'report_recieved_date': '2024-09-29'  # Note: keeping original typo
                },
                'report_request': {  # For ms_new_report_requested_email.html
                    'mine_name': 'Highland Valley Copper',
                    'mine_number': 'HVC001',
                    'permit_info_label': 'Permit Number:',
                    'permit_info_value': 'P-2024-001',
                    'report_name': 'Annual Environmental Report',
                    'report_compliance_year': '2024',
                    'report_due_date': '2024-12-31'
                },
                'ms_report_page_link': 'https://minespace.gov.bc.ca/reports/123',
                'core_report_page_link': 'https://core.gov.bc.ca/reports/123',
                'minespace_login_link': 'https://minespace.gov.bc.ca/login'
            }
            return {**base_data, **template_data}
            
        elif 'incident' in template_name:
            template_data = {
                'incident': {
                    'mine_incident_report_no': 'INC-2024-001',
                    'incident_description': 'Equipment malfunction causing brief production halt',
                    'incident_timestamp': '2024-09-28 10:15:00',
                    'reported_timestamp': '2024-09-28 10:45:00',
                    'report_time_diff': '30 minutes',
                    'reported_by_name': 'Safety Officer Smith'
                },
                'mine': {
                    'mine_name': 'Test Mine Site',
                    'mine_no': 'TM-987654'
                },
                'incident_link': 'https://core.gov.bc.ca/incidents/123',
                'minespace_incident_link': 'https://minespace.gov.bc.ca/incidents/123'
            }
            return {**base_data, **template_data}
            
        elif 'project' in template_name:
            if 'ams_app_submit' in template_name:
                template_data = {
                    'mine': {
                        'mine_name': 'Highland Valley Copper',
                        'mine_no': 'HVC001'
                    },
                    'project': {
                        'project_title': 'Water Treatment Facility Expansion'
                    },
                    'authorization': {
                        'authorization_type': 'Effluent Discharge Permit'
                    },
                    'submitted_date': 'November 26, 2024',
                    'document_groups': [
                        {
                            'type_description': 'Application Instruction Document',
                            'documents': [
                                'Application_Instructions_v2.pdf',
                                'Submission_Checklist.pdf'
                            ]
                        },
                        {
                            'type_description': 'Clause Form',
                            'documents': [
                                'Clause_Form_Schedule_A.pdf'
                            ]
                        },
                        {
                            'type_description': 'Discharge Factor Form',
                            'documents': [
                                'Discharge_Factor_Form_Effluent.pdf'
                            ]
                        },
                        {
                            'type_description': 'Information Requirements Table',
                            'documents': [
                                'Information_Requirements_Table.xlsx'
                            ]
                        },
                        {
                            'type_description': 'Location Map',
                            'documents': [
                                'Location_Map.pdf',
                                'Regional_Context_Map.pdf'
                            ]
                        },
                        {
                            'type_description': 'Notification and Engagement',
                            'documents': [
                                'First_Nations_Notification_Records.pdf',
                                'Public_Engagement_Summary.pdf'
                            ]
                        },
                        {
                            'type_description': 'Qualified Professional Declaration Form',
                            'documents': [
                                'QP_Declaration_Environmental_Engineer.pdf',
                                'QP_Declaration_Geotechnical.pdf'
                            ]
                        },
                        {
                            'type_description': 'Site Plan',
                            'documents': [
                                'Site_Plan_Sheet_1.pdf',
                                'Site_Plan_Sheet_2.pdf'
                            ]
                        },
                        {
                            'type_description': 'Supporting Document',
                            'documents': [
                                'Environmental_Impact_Assessment.pdf',
                                'Community_Engagement_Report.pdf'
                            ]
                        },
                        {
                            'type_description': 'Technical Assessment Report',
                            'documents': [
                                'Technical_Assessment_Report.pdf',
                                'TAR_Appendix_A_Water_Quality.pdf',
                                'TAR_Appendix_B_Monitoring_Plan.pdf'
                            ]
                        }
                    ],
                    'view_link': 'https://minespace.gov.bc.ca/projects/456/authorizations',
                    'button_text': 'View AMS Application in MineSpace',
                    'brand_type': 'minespace'
                }
                return {**base_data, **template_data}
            elif 'mma_submit' in template_name:
                template_data = {
                    'project': {
                        'project_title': 'New Copper Expansion Project'
                    },
                    'primary_documents': [
                        'Application_Form.pdf',
                        'Executive_Summary.pdf',
                        'Project_Description.pdf'
                    ],
                    'appendix_documents': [
                        'Appendix_A_Environmental_Data.pdf',
                        'Appendix_B_Technical_Specifications.pdf',
                        'Appendix_C_Financial_Analysis.pdf'
                    ],
                    'spatial_documents': [
                        'Site_Map.pdf',
                        'Geographic_Information_System_Files.zip'
                    ],
                    'supporting_documents': [
                        'Community_Consultation_Report.pdf',
                        'Archaeological_Assessment.pdf',
                        'Traffic_Impact_Study.pdf'
                    ],
                    'view_link': 'https://minespace.gov.bc.ca/projects/456/major-mine-application/entry',
                    'button_text': 'View Major Mine Application in MineSpace',
                    'brand_type': 'minespace'
                }
                return {**base_data, **template_data}
            elif 'section' in template_name:
                message = 'The status of the Application for the project Mine Life Extension Project for Copper Mountain Mine has been updated to Withdrawn.'
                template_data = {
                    'message': message,
                    'project': {
                        'mine_name': 'Copper Mountain Mine',
                        'mine_no': 'CU003',
                        'project_title': 'Mine Life Extension Project',
                        'submitted': 'September 25, 2024'
                    },
                    'project_section': 'Environmental Assessment',
                    'core_link': 'https://core.gov.bc.ca/project/456/section/789',
                    'minespace_link': 'https://minespace.gov.bc.ca/project/456'
                }
                return {**base_data, **template_data}
            else:  # project summary
                template_data = {
                    'message': 'New Project Description Submitted',
                    'mine': {
                        'mine_name': 'Mountain View Mine',
                        'mine_no': 'MV-456789'
                    },
                    'project_summary': {
                        'project_summary_description': 'Expansion of existing copper mining operations with new processing facility'
                    },
                    'core_project_summary_link': 'https://core.gov.bc.ca/projects/456',
                    'minespace_project_summary_link': 'https://minespace.gov.bc.ca/projects/456',
                    'ema_auth_link': 'https://ema.gov.bc.ca/auth'
                }
                return {**base_data, **template_data}
                
        elif 'mine_party_appt' in template_name:
            template_data = {
                'start_date': '2024-01-15',
                'party': {
                    'first_name': 'John',
                    'last_name': 'Engineer'
                },
                'tsf_name': 'Tailings Storage Facility A',
                'mine': {
                    'mine_name': 'Test Mine',
                    'mine_no': 'TM001'
                },
                'submitted_at': '2024-01-15 10:30:00',
                'core_appt_link': 'https://core.gov.bc.ca/appointments/123',
                'minespace_appt_link': 'https://minespace.gov.bc.ca/appointments/123',
                'minespace_login_link': 'https://minespace.gov.bc.ca/login'
            }
            return {**base_data, **template_data}
            
        else:
            # Default test data for unknown templates
            template_data = {
                'message': 'Test Email Template',
                'mine_name': 'Test Mine',
                'mine_no': 'TEST001',
                'link': 'https://example.com'
            }
            return {**base_data, **template_data}


class EmailPreviewListResource(Resource, UserMixin):
    """
    List all available email templates
    """
    
    @api.doc(description='List all available email templates for preview')
    @requires_any_of([MINE_ADMIN])
    def get(self):
        try:
            available_templates = _get_available_email_templates()
            templates = []
            
            for template_name in available_templates:
                # Create preview URL
                preview_url = f"/api/email-preview/{template_name}"
                
                templates.append({
                    'name': template_name,
                    'preview_url': preview_url,
                    'brand': 'core' if 'ministry' in template_name or 'core' in template_name else 'minespace'
                })
            
            return {
                'templates': templates
            }
            
        except Exception as e:
            current_app.logger.error(f"Error listing email templates: {e}")
            raise InternalServerError('Failed to list templates due to an internal error.')