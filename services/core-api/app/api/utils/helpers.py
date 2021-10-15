import re
from datetime import datetime


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
    return date.strftime("%b %d %Y")


def format_currency(value):
    return '${:,.2f}'.format(float(value or 0)) if value else '$0.00'
