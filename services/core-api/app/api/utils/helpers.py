import base64
from io import BytesIO
import re
from datetime import datetime
from pytz import timezone, utc
from PIL import Image
from flask import current_app
from app.config import Config


def clean_HTML_string(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext


"""
Add two digits suffix to new draft permit numbers modifying the permit_no to the pattern:
{NOW_type_code}-DRAFT-{NOW_No}-{dd}
"""


def generate_draft_permit_no_suffix(permit, separator, filling=2):
    result = permit.split(separator + "-")
    version_str = '0' if len(result) < 2 else result[1]
    version = str(int(version_str) + 1).zfill(filling)
    permit_no = separator + "-" + version

    return permit_no


def format_datetime_to_string(date):
    return date.strftime("%b %d %Y") if date else ''

def format_email_datetime_to_string(date, timezoneName="Canada/Pacific"):
    return date.replace(tzinfo=utc).astimezone(timezone(timezoneName)).strftime('%b %d %Y at %H:%M %Z') if date else ''

def format_currency(value):
    return '${:,.2f}'.format(float(value or 0)) if value else '$0.00'


def get_preamble_text(description):
    new_line = '\n\n'
    return f"{description.title()} for the {{mine_name}} {{application_type}} project was filed with the Chief Permitting Officer, " \
           f"submitted on {{application_dated}} and last updated on {{application_last_updated_date}}.  The application included a " \
           f"plan of the proposed work system (“Mine Plan”) and a program for the protection and reclamation of the surface of " \
           f"the land and watercourses (“Reclamation Program”), affected by the {description}. {new_line}" \
           f"The Mines Act, the Health, Safety and Reclamation Code for Mines in British Columbia (“Code” or “HSRC”), and this "\
           f"Mines Act Permit contain the requirements of the Chief Permitting Officer for the execution of the Mine Plan and "\
           f"Reclamation Program, including the deposit of reclamation securities. Nothing in this permit limits the authority of "\
           f"other government agencies to set additional requirements or to act independently under their respective authorizations "\
           f"and legislation."

def create_image_with_aspect_ratio(source, width=None, height=None):

    # If there is a prefix in the source, remove it
    base64_source = source
    if ';base64,' in base64_source:
        prefix, base64_source = base64_source.split(';base64,', 1)

    # Pad base64_source if it's not correctly padded
    missing_padding = len(base64_source) % 4
    if missing_padding:
        current_app.logger.debug('Padding base64 string with {} ='.format(missing_padding))
        base64_source += '=' * (4 - missing_padding)

    # Convert base64 string to PIL Image to get dimensions
    img_data = base64.b64decode(base64_source)
    img = Image.open(BytesIO(img_data))

    # Use aspect ratio of image to calculate width if not provided
    if height and not width:
        aspect_ratio = img.width / img.height
        # Convert height from inches to pixels (Word assumes 96 DPI)
        height_in_pixels = height * 96

        # Calculate width while maintaining aspect ratio
        width = height_in_pixels * aspect_ratio
        # Convert width from pixels back to inches
        width = width / 96

    return {'source': source, 'width': width, 'height': height}

def validate_phone_no(phone_no, address_type_code='CAN'):
    if not phone_no:
        raise AssertionError('Phone number is not provided.')
    # TODO: this is an arbitrary limit for phone number characters, actual number depends on formatting decisions
    if address_type_code == 'INT' and len(phone_no) > 50:
        raise AssertionError('Invalid phone number, max 50 characters')
    if address_type_code in ['CAN', 'USA'] and not re.match(r'[0-9]{3}-[0-9]{3}-[0-9]{4}', phone_no):
        raise AssertionError('Invalid phone number format, must be of XXX-XXX-XXXX.')
    return phone_no

def get_current_core_or_ms_env_url(app):
    if app == 'core':
        core_config_property = f'CORE_{(Config.ENVIRONMENT_NAME).upper()}_URL'
        return getattr(Config, core_config_property)
    elif app == 'ms':
        ms_config_property = f'MINESPACE_{(Config.ENVIRONMENT_NAME).upper()}_URL'
        return getattr(Config, ms_config_property)