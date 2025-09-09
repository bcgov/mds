import re
from app.api.mines.response_models import PERMIT_CONDITION_TEMPLATE_MODEL
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL
from app.api.parties.party.models.party import Party
from datetime import datetime
from flask_restx import marshal
from werkzeug.exceptions import NotFound
from app.api.utils.helpers import create_image_with_aspect_ratio, format_datetime_to_string, format_currency

SIGNATURE_IMAGE_HEIGHT_INCHES = 0.8

def get_default_disturbance_or_cost(obj, field, currency=False):
    if obj is not None:
        data = getattr(obj, field)
        if currency:
            return format_currency(data)
        else:
            return str(data) if data is not None else '0'
    else:
        return ' '
        
def transform_variables_to_data(now_application, permit_amendment, mine, total_liability):
    return {
        'mine_name': now_application.mine_name,
        'mine_no': now_application.mine_no,
        'application_type': now_application.notice_of_work_type.description,
        'proposed_annual_maximum_tonnage': str(now_application.proposed_annual_maximum_tonnage) if now_application.proposed_annual_maximum_tonnage is not None else ' ',
        'issue_date': format_datetime_to_string(permit_amendment.issue_date),
        'application_dated': format_datetime_to_string(now_application.submitted_date),
        'application_last_updated_date': format_datetime_to_string(now_application.last_updated_date) if now_application.last_updated_date else now_application.submitted_date,
        'authorization_end_date': format_datetime_to_string(permit_amendment.authorization_end_date),
        'permit_no': permit_amendment.permit_no,
        'liability_adjustment': format_currency(now_application.liability_adjustment),
        'total_liability': format_currency(total_liability),
        'security_received_date': format_datetime_to_string(now_application.security_received_date),
        'regional_mine_inbox': mine.region.regional_contact_office.email,
        'major_mine_inbox': MAJOR_MINES_OFFICE_EMAIL,
        'hectare_unit': 'ha',
        'cut_lines_polarization_survey.cost': get_default_disturbance_or_cost(now_application.cut_lines_polarization_survey, 'reclamation_cost', True),
        'cut_lines_polarization_survey.total': get_default_disturbance_or_cost(now_application.cut_lines_polarization_survey, 'calculated_total_disturbance'),
        'settling_pond.total': get_default_disturbance_or_cost(now_application.settling_pond, 'calculated_total_disturbance'),
        'settling_pond.cost': get_default_disturbance_or_cost(now_application.settling_pond, 'reclamation_cost', True),
        'sand_gravel_quarry_operation.total': get_default_disturbance_or_cost(now_application.sand_gravel_quarry_operation, 'calculated_total_disturbance'),
        'sand_gravel_quarry_operation.cost': get_default_disturbance_or_cost(now_application.sand_gravel_quarry_operation, 'reclamation_cost', True),
        'underground_exploration.total': get_default_disturbance_or_cost(now_application.underground_exploration, 'calculated_total_disturbance'),
        'underground_exploration.cost': get_default_disturbance_or_cost(now_application.underground_exploration, 'reclamation_cost', True),
        'camp.total': get_default_disturbance_or_cost(now_application.camp, 'calculated_total_disturbance'),
        'camp.cost': get_default_disturbance_or_cost(now_application.camp, 'reclamation_cost', True),
        'exploration_surface_drilling.cost': get_default_disturbance_or_cost(now_application.exploration_surface_drilling, 'reclamation_cost', True),
        'exploration_surface_drilling.total': get_default_disturbance_or_cost(now_application.exploration_surface_drilling, 'calculated_total_disturbance'),
        'mechanical_trenching.total': get_default_disturbance_or_cost(now_application.mechanical_trenching, 'calculated_total_disturbance'),
        'mechanical_trenching.cost': get_default_disturbance_or_cost(now_application.mechanical_trenching, 'reclamation_cost', True),
        'surface_bulk_sample.total': get_default_disturbance_or_cost(now_application.surface_bulk_sample, 'calculated_total_disturbance'),
        'surface_bulk_sample.cost': get_default_disturbance_or_cost(now_application.surface_bulk_sample, 'reclamation_cost', True),
        'placer_operation.total': get_default_disturbance_or_cost(now_application.placer_operation, 'calculated_total_disturbance'),
        'placer_operation.cost': get_default_disturbance_or_cost(now_application.placer_operation, 'reclamation_cost', True),
        'exploration_access.total': get_default_disturbance_or_cost(now_application.exploration_access, 'calculated_total_disturbance'),
        'exploration_access.cost': get_default_disturbance_or_cost(now_application.exploration_access, 'reclamation_cost', True),
    }

def replace_condition_value_with_data(condition, condition_var):
    pattern = r'\b({})\b'.format('|'.join(sorted(re.escape(k) for k in condition_var)))
    return re.sub(
        pattern, lambda m: condition_var.get(m.group(0)), condition,
        flags=re.IGNORECASE).translate({
            ord('{'): None,
            ord('}'): None
        })

def calculate_liability(now_application):
    # If amendment, get sum total security adjustment
    if not now_application.is_new_permit:
        permit_amendment = PermitAmendment.find_by_now_application_guid(
            now_application.now_application_guid)
        associated_permit = Permit.find_by_permit_id(
            permit_amendment.mine_permit_xref.permit_id)
        return float(now_application.liability_adjustment or 0) + float(
            associated_permit.assessed_liability_total or 0)
    else:
        return float(now_application.liability_adjustment or 0)

def validate_issuing_inspector(now_application):
    if not now_application.issuing_inspector:
        raise Exception('No Issuing Inspector has been assigned')
    if not now_application.issuing_inspector.signature:
        raise Exception('No signature for the Issuing Inspector has been provided')

def replace_nested_conditions(section_data, condition_variables):
    for sub_condition in section_data['sub_conditions']:
        sub_condition['condition'] = replace_condition_value_with_data(
            sub_condition['condition'], condition_variables)
        replace_nested_conditions(sub_condition, condition_variables)

# Transform template data for "Working Permit" (PMT) or "Working Permit for Amendment" (PMA)
def transform_permit(template_data, now_application):
    is_draft = False
    permit_amendment = None
    if now_application.active_permit:
        permit_amendment = now_application.active_permit
    elif now_application.draft_permit:
        permit_amendment = now_application.draft_permit
        is_draft = template_data.get('is_draft', True)
    elif now_application.remitted_permit:
        permit_amendment = now_application.remitted_permit
    else:
        raise Exception('Notice of Work has no permit')

    validate_issuing_inspector(now_application)

    if not is_draft:
        template_data['images'] = {
            'issuing_inspector_signature':
            create_image_with_aspect_ratio(
                now_application.issuing_inspector.signature,
                height=SIGNATURE_IMAGE_HEIGHT_INCHES)
        }

    # NOTE: This is how the front-end is determining whether it's an amendment or not. But, is it not more correct to check permit_amendment.permit_amendment_type_code == 'AMD'?
    template_data['is_amendment'] = not now_application.is_new_permit

    template_data['is_draft'] = is_draft

    template_data['latitude'] = str(now_application.latitude)
    template_data['longitude'] = str(now_application.longitude)
    template_data['mine_name'] = now_application.mine_name

    mine = Mine.find_by_mine_no(now_application.mine_no)
    if mine is None:
        raise NotFound('Mine not found')

    total_liability = calculate_liability(now_application)
    template_data['security_adjustment'] = format_currency(total_liability)

    # Replace variables in conditions with  NoW data or Permit data
    condition_variables = transform_variables_to_data(now_application, permit_amendment, mine,
                                                        total_liability)

    template_data['preamble_text'] = replace_condition_value_with_data(
        template_data['preamble_text'], condition_variables)
    conditions = permit_amendment.conditions
    conditions_template_data = {}
    for section in conditions:
        # replace section title variables with data
        section.condition = replace_condition_value_with_data(section.condition,
                                                                condition_variables)
        category_code = section.condition_category_code
        if not conditions_template_data.get(category_code):
            conditions_template_data[category_code] = []
        section_data = marshal(section, PERMIT_CONDITION_TEMPLATE_MODEL)

        replace_nested_conditions(section_data, condition_variables)
        conditions_template_data[category_code].append(section_data)
    template_data['conditions'] = conditions_template_data

    return template_data

# Transform template data for "Acknowledgement Letter" (CAL), "Withdrawal Letter" (WDL), "Rejection Letter" (RJL), and "Permit Enclosed Letter" (NPE)
def transform_letter(template_data, now_application, now_application_document_type_code):
    if now_application_document_type_code in ('CAL', 'NPE'):
        organization = Party.find_by_name(template_data['proponent_name'])
        date_display_format = '%B %-d, %Y'
        template_data['letter_dt'] = datetime.strptime(template_data["letter_dt"], '%b %d %Y').strftime(date_display_format)
        template_data['application_dt'] = datetime.strptime(template_data["application_dt"], '%b %d %Y').strftime(date_display_format)
        if template_data.get('start_date') and template_data['start_date'] != "Invalid date":
            template_data['start_date'] = datetime.strptime(template_data["start_date"], '%Y-%m-%d').strftime(date_display_format)
        if template_data.get('end_date') and template_data['end_date'] != "Invalid date":
            template_data['end_date'] = datetime.strptime(template_data["end_date"], '%Y-%m-%d').strftime(date_display_format)
        template_data['organization_email'] = organization.email if organization else None

    validate_issuing_inspector(now_application)
    agent_contact = next(
        (contact for contact in now_application.contacts if contact.mine_party_appt_type_code == 'AGT'),
        None
    )
    template_data['agent_email'] = agent_contact.party.email if agent_contact else None

    template_data['images'] = {
        'issuing_inspector_signature':
        create_image_with_aspect_ratio(
            now_application.issuing_inspector.signature,
            height=SIGNATURE_IMAGE_HEIGHT_INCHES)
    }

    return template_data