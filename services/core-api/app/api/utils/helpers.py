import re
from datetime import datetime
from pytz import timezone, utc


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
