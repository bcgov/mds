import pytest
from flask import current_app

# Email brand colors - centralized constants
MINESPACE_PRIMARY = '#003366'
CORE_PRIMARY = '#5e46a1'
TEXT_COLOR = '#6B6363'
BORDER_COLOR = '#DED9D9'
BACKGROUND_COLOR = '#ffffff'


def get_template(template_env, template_path):
    """Helper function to get template with app context"""
    with current_app.test_request_context():
        return template_env.get_template(template_path)

def render_template_content(template_env, template_content, **kwargs):
    """Helper function to render template string with app context"""
    with current_app.test_request_context():
        template = template_env.from_string(template_content)
        return template.render(**kwargs)

@pytest.fixture
def template_env(test_client):
    """Set up Flask template environment for testing templates"""
    with current_app.test_request_context():
        # Use Flask's built-in template loader
        return current_app.jinja_env

@pytest.fixture
def sample_error_report_data():
    """Sample data for error report email"""
    return {
        'environment': 'Development',
        'business_error': 'Database connection timeout',
        'reported_date': '2025-09-29 14:30:00',
        'reporter': {
            'name': 'John Developer',
            'email': 'john.developer@gov.bc.ca'
        },
        'trace_id': 'abc123-def456-ghi789',
        'kibana_link': 'https://kibana.example.com/logs/abc123',
        'minespace_logo': 'https://via.placeholder.com/200x80/003366/ffffff?text=Minespace+Logo'
    }

@pytest.fixture
def sample_report_submission_data():
    """Sample data for report submission email"""
    return {
        'report_submision': {  # Note: matches the template variable name
            'mine_name': 'Test Mine',
            'mine_number': 'M-123456',
            'report_name': 'Annual Environmental Report',
            'report_type': 'Environmental Report',
            'report_compliance_year': '2024',
            'report_due_date': '2025-03-31',
            'report_recieved_date': '2025-09-29'
        },
        'minespace_login_link': 'https://minespace.gov.bc.ca/login',
        'ms_report_page_link': 'https://minespace.gov.bc.ca/reports/123',
        'core_report_page_link': 'https://core.gov.bc.ca/reports/123',
        'minespace_logo': 'https://via.placeholder.com/200x80/003366/ffffff?text=Minespace+Logo'
    }

@pytest.fixture
def sample_incident_data():
    """Sample data for incident email"""
    return {
        'mine': {
            'mine_name': 'Test Mine Site',
            'mine_no': 'TM-987654'
        },
        'incident': {
            'mine_incident_report_no': 'INC-2024-001',
            'incident_description': 'Equipment malfunction during routine operations',
            'incident_timestamp': '2024-01-15 14:30:00',
            'reported_timestamp': '2024-01-15 16:45:00',
            'report_time_diff': '2 hours 15 minutes',
            'reported_by_name': 'John Safety Officer'
        },
        'incident_link': 'https://core.gov.bc.ca/incidents/123'
    }

@pytest.fixture
def sample_project_data():
    """Sample data for project summary email"""
    return {
        'message': 'New Project Description Submitted',
        'mine': {
            'mine_name': 'Mountain View Mine',
            'mine_no': 'MV-456789'
        },
        'project_summary': {
            'project_summary_description': 'Expansion of existing copper mining operations with new processing facility'
        },
        'core_project_summary_link': 'https://core.gov.bc.ca/projects/456'
    }

@pytest.fixture
def sample_project_section_data():
    """Sample data for project section email"""
    return {
        'mine_name': 'Copper Mountain Mine',
        'mine_no': 'CU003',
        'project_title': 'Mine Life Extension Project',
        'submitted': 'September 25, 2024'
    }

def test_template_structure_exists(test_client, template_env):
    # Check if base template exists
    get_template(template_env, 'email/_base/email_base.html')
    
    # Check if components exist
    required_components = [
        'email/_components/brand_colors.html',
        'email/_components/email_macros.html',
        'email/_components/email_styles.html',
        'email/_components/email_header.html',
        'email/_components/email_footer.html'
    ]
    
    for component in required_components:
        get_template(template_env, component)


def test_error_report_email_renders(test_client, template_env, sample_error_report_data):
    template = get_template(template_env, 'email/report_error/ms_error_report_email.html')
    
    rendered_html = template.render(**sample_error_report_data)
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'Error Reported in Development Environment' in rendered_html
    assert 'Database connection timeout' in rendered_html
    assert 'john.developer@gov.bc.ca' in rendered_html


def test_core_error_report_email_renders(test_client, template_env, sample_error_report_data):
    template = get_template(template_env, 'email/report_error/core_error_report_email.html')

    rendered_html = template.render(**sample_error_report_data)
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'Error Reported in Development Environment' in rendered_html
    assert 'Database connection timeout' in rendered_html
    assert 'john.developer@gov.bc.ca' in rendered_html
    # Check for Core brand color in the page title or text color
    assert CORE_PRIMARY in rendered_html or TEXT_COLOR in rendered_html  # Core primary or text color

def test_report_submitted_email_renders(test_client, template_env, sample_report_submission_data):
    template = get_template(template_env, 'email/report/ms_new_report_submitted_email.html')
    rendered_html = template.render(**sample_report_submission_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'Your report has been successfully submitted' in rendered_html
    assert 'Test Mine' in rendered_html
    assert 'M-123456' in rendered_html

def test_core_report_submitted_email_renders(test_client, template_env, sample_report_submission_data):
    template = get_template(template_env, 'email/report/core_new_report_submitted_email.html')
    rendered_html = template.render(**sample_report_submission_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'A new report was submitted to Core' in rendered_html
    assert 'Test Mine' in rendered_html
    assert 'M-123456' in rendered_html
    assert 'Environmental Report' in rendered_html

def test_ministry_incident_email_renders(test_client, template_env, sample_incident_data):
    template = get_template(template_env, 'email/incident/ministry_final_report_received_incident_email.html')
    rendered_html = template.render(**sample_incident_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'A final incident report has been submitted' in rendered_html
    assert 'Test Mine Site' in rendered_html
    assert 'TM-987654' in rendered_html
    assert 'INC-2024-001' in rendered_html
    assert 'Equipment malfunction' in rendered_html

def test_ministry_awaiting_incident_email_renders(test_client, template_env, sample_incident_data):
    template = get_template(template_env, 'email/incident/ministry_awaiting_incident_final_report_email.html')
    rendered_html = template.render(**sample_incident_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'You can view this incident and see its current status' in rendered_html
    assert 'Test Mine Site' in rendered_html
    assert 'TM-987654' in rendered_html
    assert 'INC-2024-001' in rendered_html
    assert 'View Incident in CORE' in rendered_html

def test_ministry_project_summary_email_renders(test_client, template_env, sample_project_data):
    template = get_template(template_env, 'email/projects/ministry_project_summary_email.html')
    rendered_html = template.render(**sample_project_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'New Project Description Submitted' in rendered_html
    assert 'Mountain View Mine' in rendered_html
    assert 'MV-456789' in rendered_html
    assert 'Expansion of existing copper mining operations' in rendered_html
    assert 'View Project Description in CORE' in rendered_html

def test_ministry_detailed_incident_email_renders(test_client, template_env, sample_incident_data):
    template = get_template(template_env, 'email/incident/ministry_incident_email.html')
    rendered_html = template.render(**sample_incident_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert 'A new incident has been submitted to CORE' in rendered_html
    assert 'Test Mine Site' in rendered_html
    assert 'TM-987654' in rendered_html
    assert 'INC-2024-001' in rendered_html
    assert '2024-01-15 14:30:00' in rendered_html  # Incident timestamp
    assert '2 hours 15 minutes' in rendered_html  # Report time diff
    assert 'John Safety Officer' in rendered_html  # Reported by name
    assert 'Equipment malfunction' in rendered_html

def test_brand_specific_components_render_correctly(test_client, template_env):
    """Test that brand-specific components use correct colors for each brand"""
    
    # Test Minespace brand with button_link (which uses brand-specific primary color)
    minespace_content = """
    {% from "email/_components/email_macros.html" import button_link, inline_link %}
    {{ button_link("https://example.com", "Minespace Button", brand="minespace") }}
    {{ inline_link("https://example.com", "Minespace Link", brand="minespace") }}
    """
    
    minespace_html = render_template_content(template_env, minespace_content)
    assert MINESPACE_PRIMARY in minespace_html  # Should contain Minespace brand color
    assert CORE_PRIMARY not in minespace_html  # Should NOT contain Core brand color
    
    # Test Core brand with button_link (which uses brand-specific primary color) 
    core_content = """
    {% from "email/_components/email_macros.html" import button_link, inline_link %}
    {{ button_link("https://example.com", "Core Button", brand="core") }}
    {{ inline_link("https://example.com", "Core Link", brand="core") }}
    """
    
    core_html = render_template_content(template_env, core_content)
    assert CORE_PRIMARY in core_html  # Should contain Core brand color
    assert MINESPACE_PRIMARY not in core_html  # Should NOT contain Minespace brand color

def test_paragraph_macro(test_client, template_env):
    template_content = """
    {% from "email/_components/email_macros.html" import paragraph %}
    {{ paragraph("Test content", align="center", margin_top=16, brand="minespace") }}
    """
    
    rendered_html = render_template_content(template_env, template_content)
    
    assert 'Test content' in rendered_html

def test_button_link_macro(test_client, template_env):
    template_content = """
    {% from "email/_components/email_macros.html" import button_link %}
    {{ button_link("https://example.com", "Click Me", brand="minespace") }}
    """
    
    rendered_html = render_template_content(template_env, template_content)
    
    assert 'https://example.com' in rendered_html
    assert 'Click Me' in rendered_html
    assert MINESPACE_PRIMARY in rendered_html  # Minespace button color

def test_template_accessibility_features(test_client, template_env, sample_error_report_data):
    template = get_template(template_env, 'email/report_error/ms_error_report_email.html')
    rendered_html = template.render(**sample_error_report_data)
    
    # Check for basic accessibility features
    assert 'role="presentation"' in rendered_html  # Table roles
    assert 'aria-label=' in rendered_html or 'alt=' in rendered_html  # Some accessibility attributes

def test_template_responsive_features(test_client, template_env, sample_error_report_data):
    template = get_template(template_env, 'email/report_error/ms_error_report_email.html')
    rendered_html = template.render(**sample_error_report_data)
    
    # Check for responsive meta tag and styles
    assert 'viewport' in rendered_html
    assert '@media' in rendered_html or 'max-width' in rendered_html

@pytest.mark.parametrize("brand", ["minespace", "core"])
def test_brand_consistency(test_client, template_env, brand):
    template_content = f"""
    {{% from "email/_components/email_macros.html" import paragraph, button_link %}}
    {{{{ paragraph("Title text", brand="{brand}") }}}}
    {{{{ button_link("https://example.com", "Button", brand="{brand}") }}}}
    """
    
    rendered_html = render_template_content(template_env, template_content)
    
    if brand == 'minespace':
        assert MINESPACE_PRIMARY in rendered_html
    else:  # core
        assert CORE_PRIMARY in rendered_html
    
    # Both brands should have same text color
    assert TEXT_COLOR in rendered_html


def test_macro_based_brand_colors_work(test_client, template_env):
    # Test data for the templates
    minespace_data = {
        'start_date': '2024-01-15',
        'party': {'first_name': 'John', 'last_name': 'Doe'},
        'tsf_name': 'Test TSF',
        'mine': {'mine_name': 'Test Mine', 'mine_no': 'TM001'},
        'minespace_login_link': 'https://example.com/login',
        'minespace_appt_link': 'https://example.com/appointment'
    }
    
    core_data = {
        'start_date': '2024-01-15',
        'party': {'first_name': 'Jane', 'last_name': 'Smith'},
        'tsf_name': 'Test TSF',
        'mine': {'mine_name': 'Test Mine', 'mine_no': 'TM002'},
        'core_appt_link': 'https://example.com/core-appointment',
        'submitted_at': '2024-01-15 10:30:00'
    }
    
    # Test Minespace template with macro-based brand colors
    template = get_template(template_env, 'email/mine_party_appt/minespace_new_eor_email.html')
    rendered_html = template.render(**minespace_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert MINESPACE_PRIMARY in rendered_html  # Minespace brand color should be present
    assert 'Test Mine' in rendered_html
    
    # Test Core template with macro-based brand colors
    template = get_template(template_env, 'email/mine_party_appt/ministry_new_eor_email.html')
    rendered_html = template.render(**core_data)
    
    assert rendered_html is not None
    assert len(rendered_html) > 0
    assert CORE_PRIMARY in rendered_html  # Core brand color should be present
    assert 'Test Mine' in rendered_html

def test_ministry_project_section_email_renders(test_client, template_env, sample_project_section_data):
    template = get_template(template_env, 'email/projects/ministry_project_section_email.html')
    
    template_data = {
        'message': 'Project Section Submitted for Review',
        'project': sample_project_section_data,
        'project_section': 'Environmental Assessment',
        'core_link': 'https://core.gov.bc.ca/project/456/section/789'
    }
    
    rendered_html = template.render(**template_data)
    assert rendered_html is not None
    assert len(rendered_html) > 0
    # Check Core branding colors are present
    assert CORE_PRIMARY in rendered_html  # Core primary color
    # Check for HTML output from info_block macro (includes <b> tags)
    assert '<b>Mine Name:</b> ' + sample_project_section_data['mine_name'] in rendered_html
    assert '<b>Project Title:</b> ' + sample_project_section_data['project_title'] in rendered_html
    assert 'View Environmental Assessment in CORE' in rendered_html