import re
from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection
from app.nris.models.inspection_status import InspectionStatus


def _etl_nris_data(input):

    xmlstring = re.sub(' xmlns="[^"]+"', '', input, count=1)
    data = ET.fromstring(xmlstring)
    assessment_id = data.find('assessment_id')
    assessment_status = data.find('assessment_status')

    if assessment_status is not None:
        assessment_status_code = assessment_status.text

    if assessment_status_code != 'Deleted':

        if assessment_id is not None:
            inspection = Inspection(external_id=assessment_id.text)
        assessment_date = data.find('assessment_date')
        if assessment_date is not None:
            inspection.inspection_date = assessment_date.text
        business_area = data.find('businessArea').find('business_area_name')
        if business_area is not None:
            inspection.business_area = business_area.text

        status_codes = InspectionStatus.find_all_inspection_status()
        code_exists = False
        status = None

        for code in status_codes:

            if code.inspection_status_code == assessment_status_code:
                code_exists = True
                status = code

        if not code_exists:
            status = _create_status(assessment_status_code)

        inspection.inspection_status_id = status.inspection_status_id

        if assessment_status_code == 'Complete':
            completed_date = data.find('completion_date')

            if completed_date is not None:
                inspection.completed_date = completed_date.text

        mine_number = data.find('location').find('location_id')
        if mine_number is not None:
            inspection.mine_no = mine_number.text
        inspector = data.find('assessor')
        if inspector is not None:
            inspection.inspector_idir = inspector.text
        intro = data.find('report_introduction')
        if intro is not None:
            inspection.inspection_introduction = intro.text
        preamble = data.find('report_preamble')
        if preamble is not None:
            inspection.inspection_preamble = preamble.text
        closing = data.find('report_closing')
        if closing is not None:
            inspection.inspection_closing = closing.text

        notes = data.find('officer_notes')
        if notes is not None:
            inspection.officer_notes = notes.text

        db.session.add(inspection)
        db.session.commit()


def _create_status(status):
    inspection_status = InspectionStatus(inspection_status_code=status)
    db.session.add(inspection_status)
    db.session.commit()
    return inspection_status