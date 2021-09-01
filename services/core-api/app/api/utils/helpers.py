import re


def clean_HTML_string(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext


"""
Add sufix to permit number adding one to versioning.
"""


def generate_permit_no_sufix(permit, separator, filling=2):
    result = permit.split(separator + "-")
    version_str = '0' if len(result) < 2 else result[1]
    version = str(int(version_str) + 1).zfill(filling)
    permit_no = separator + "-" + version

    return permit_no
