"""
Email Preview Resource
Provides development endpoints for previewing email templates with test data
"""

from flask import current_app, request, jsonify, Response
from flask_restx import Resource, reqparse

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import VIEW_ALL, MINESPACE_PROPONENT
from app.api.constants import CORE_PURPLE_LOGO_BASE64_ENCODED, MINESPACE_LOGO_BASE64_ENCODED, BC_GOV_LOGO_BASE64_ENCODED


class EmailPreviewResource(Resource, UserMixin):
    """
    Email Preview API endpoint for development
    """
    
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, template_name):
        """
        Preview an email template with test data
        GET /api/email-preview/<template_name>
        """
        try:
            # Get template with proper path
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
            return jsonify({
                'error': f'Template preview failed: {str(e)}',
                'template': template_name
            }), 400
    
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
            if 'section' in template_name:
                template_data = {
                    'message': 'Project Section Submitted for Review',
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
    
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        """
        List all available email templates for preview
        GET /api/email-preview/
        """
        try:
            import os
            from pathlib import Path
            
            templates_dir = Path(current_app.root_path) / 'templates' / 'email'
            templates = []
            
            # Recursively find all .html files in email templates
            for template_file in templates_dir.rglob('*.html'):
                # Skip base and component templates
                if template_file.parts[-2] in ['_base', '_components']:
                    continue
                    
                # Get relative path from email/ directory
                relative_path = template_file.relative_to(templates_dir)
                template_name = str(relative_path)
                
                # Create preview URL
                preview_url = f"/api/email-preview/{template_name}"
                
                templates.append({
                    'name': template_name,
                    'preview_url': preview_url,
                    'brand': 'core' if 'ministry' in template_name or 'core' in template_name else 'minespace'
                })
            
            # Sort templates by name
            templates.sort(key=lambda x: x['name'])
            
            return jsonify({
                'templates': templates,
                'total': len(templates),
                'base_url': request.host_url.rstrip('/') + '/api/email-preview/'
            })
            
        except Exception as e:
            current_app.logger.error(f"Error listing email templates: {e}")
            return jsonify({
                'error': f'Failed to list templates: {str(e)}'
            }), 500