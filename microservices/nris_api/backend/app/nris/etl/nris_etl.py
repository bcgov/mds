from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection


def _etl_nris_data(input):
    data = ET.fromstring(input)
    assessment_id = data[0].text
    current_app.logger.info(assessment_id)
    inspection = Inspection(external_id=assessment_id)

    inspection.inspection_date = data.find('caeAssessment').find('assessment_id').text
    inspection.business_area = data.find('businessArea').get('business_area_name').text

    db.session.add(inspection)
    db.session.commit()
