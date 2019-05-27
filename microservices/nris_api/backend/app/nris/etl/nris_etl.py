import re
from xml.etree.ElementTree import fromstring
from flask import current_app
from json import dumps
from xml.etree import ElementTree as ET
from app.extensions import db

from app.nris.models.inspection import Inspection
from app.nris.models.inspection_status import InspectionStatus
from app.nris.models.location import Location
from app.nris.models.inspected_location import InspectedLocation
from app.nris.models.order_request_detail import OrderRequestDetail
from app.nris.models.order_advisory_detail import OrderAdvisoryDetail
from app.nris.models.order_warning_detail import OrderWarningDetail
from app.nris.models.order_stop_detail import OrderStopDetail
from app.nris.models.inspected_location_type import InspectedLocationType
from app.nris.models.noncompliance_legislation import NonComplianceLegislation
from app.nris.models.noncompliance_permit import NonCompliancePermit
from app.nris.models.legislation_act import LegislationAct
from app.nris.models.legislation_act_section import LegislationActSection
from app.nris.models.legislation_compliance_article import LegislationComplianceArticle
from app.nris.models.document import Document
from app.nris.models.document_type import DocumentType
from app.nris.models.nris_raw_data import NRISRawData
from app.nris.models.inspection_type import InspectionType

import cx_Oracle

# Truncates all tables on the nris schema, except for the alembic_version table and the nris_raw_data table.
TRUNCATE_TABLES_SQL = """
DO $$
DECLARE
i TEXT;
BEGIN
 FOR i IN (select distinct concat(table_schema, '.', table_name)  from information_schema.tables where table_catalog = 'mds' and table_schema = 'nris' and table_name != 'alembic_version' and table_name != 'nris_raw_data') LOOP
         EXECUTE 'TRUNCATE TABLE '|| i ||' RESTART IDENTITY CASCADE;';

  END LOOP;
END $$;
"""


def clean_nris_data():
    db.session.execute(TRUNCATE_TABLES_SQL)
    db.session.commit()


def clean_nris_xml_import():
    db.session.execute('truncate table nris_raw_data cascade;')
    db.session.commit()


def import_nris_xml():
    try:
        dsn_tns = cx_Oracle.makedsn(
            current_app.config['NRIS_DB_HOSTNAME'],
            current_app.config['NRIS_DB_PORT'],
            service_name=current_app.config['NRIS_DB_SERVICENAME'])
        oracle_db = cx_Oracle.connect(
            user=current_app.config['NRIS_DB_USER'],
            password=current_app.config['NRIS_DB_PASSWORD'],
            dsn=dsn_tns)

        cursor = oracle_db.cursor()

        cursor.execute(
            "select xml_document from CORS.CORS_CV_ASSESSMENTS_XVW where business_area = 'EMPR'")

        results = cursor.fetchall()

        for result in results:
            data = NRISRawData.create(result[0].read())
            db.session.add(data)
            db.session.commit()

        cursor.close()

    except cx_Oracle.DatabaseError as e:
        current_app.logger.error("Error establishing connection to NRIS database.", e)
        raise e


def etl_nris_data():
    nris_data = db.session.query(NRISRawData).all()
    for item in nris_data:
        _parse_nris_element(item.nris_data)


def _parse_nris_element(input):

    xmlstring = re.sub(' xmlns="[^"]+"', '', input, count=1)
    data = ET.fromstring(xmlstring)
    assessment_id = data.find('assessment_id')
    assessment_status = data.find('assessment_status')

    if assessment_status is not None:
        assessment_status_code = assessment_status.text

    if assessment_status_code != 'Deleted':
        assessment_date = data.find('assessment_date')
        business_area = data.find('businessArea').find('business_area_name')

        inspection = Inspection(
            external_id=assessment_id.text if assessment_id is not None else None)
        inspection.inspection_date = assessment_date.text if assessment_date is not None else None
        inspection.business_area = business_area.text if business_area is not None else None
        status = _create_status(assessment_status_code)

        inspection.inspection_status = status

        if assessment_status_code == 'Complete':
            completed_date = data.find('completion_date')
            inspection.completed_date = completed_date.text if completed_date is not None else None

        mine_number = data.find('location').find('location_id')
        inspector = data.find('assessor')
        intro = data.find('report_introduction')
        preamble = data.find('report_preamble')
        closing = data.find('report_closing')
        notes = data.find('officer_notes')

        inspection.mine_no = mine_number.text if mine_number is not None else None
        inspection.inspector_idir = inspector.text if inspector is not None else None
        inspection.inspection_introduction = intro.text if intro is not None else None
        inspection.inspection_preamble = preamble.text if preamble is not None else None
        inspection.inspection_closing = closing.text if closing is not None else None
        inspection.officer_notes = notes.text if notes is not None else None

        db.session.add(inspection)

        inspection_data = data.find('inspection')
        inspection_type = inspection_data.find('inspection_type')
        inspection_report_sent_date = inspection_data.find('inspct_report_sent_date')
        inspection.inspection_report_sent_date = inspection_report_sent_date.text if inspection_report_sent_date is not None else None
        if inspection_type is not None:
            inspection_type_code = _find_or_save_inspection_type(inspection_type)
            inspection.inspection_type = inspection_type_code

        for attachment in data.findall('attachment'):
            doc = _save_document(attachment)
            inspection.documents.append(doc)

        if inspection_data is not None:
            _save_stops(inspection_data, inspection)


def _create_status(assessment_status_code):
    status_codes = InspectionStatus.find_all_inspection_status()
    code_exists = False
    status = None

    for code in status_codes:
        if code.inspection_status_code == assessment_status_code:
            code_exists = True
            status = code

    if not code_exists:
        status = InspectionStatus(inspection_status_code=assessment_status_code)
        db.session.add(status)
    return status


def _save_stops(nris_inspection_data, inspection):
    for stop in nris_inspection_data.findall('stops'):
        order_location = stop.find('secondary_locations')
        if order_location is not None:
            latitude = order_location.find('secondary_latitude')
            longitude = order_location.find('secondary_longitude')
            desc = order_location.find('secondary_location_description')
            notes = order_location.find('secondary_location_notes')
            utm_info = order_location.find('secondary_location_utm')
            if utm_info is not None:
                utm_easting = utm_info.find('utm_easting')
                utm_northing = utm_info.find('utm_northing')
                utm_zone_number = utm_info.find('zone_number')
                utm_zone_letter = utm_info.find('zone_letter')
            location = Location(
                description=desc.text if desc is not None else None,
                notes=notes.text if notes is not None else None,
                latitude=latitude.text if latitude is not None else None,
                longitude=longitude.text if longitude is not None else None,
                utm_easting=utm_easting.text if utm_easting is not None else None,
                utm_northing=utm_northing.text if utm_northing is not None else None,
                zone_number=utm_zone_number.text if utm_zone_number is not None else None,
                zone_letter=utm_zone_letter.text if utm_zone_letter is not None else None)
            db.session.add(location)

        stop_type = stop.find('stop_type')
        inspected_location = InspectedLocation()
        inspected_location.location = location
        inspection.inspected_locations.append(inspected_location)

        inspected_location_type = _find_or_save_inspected_location_type(stop_type)
        inspected_location.inspected_location_type_rel = inspected_location_type

        for stop_order in stop.findall('stop_orders'):
            stop_detail = _save_stop_order(stop_order)
            inspected_location.stop_details.append(stop_detail)

        for stop_advisory in stop.findall('stop_advisories'):
            detail = stop_advisory.find('advisory_detail')
            advisory = OrderAdvisoryDetail(detail=detail.text if detail is not None else None)
            inspected_location.advisory_details.append(advisory)

        for stop_warning in stop.findall('stop_warnings'):
            detail = stop_warning.find('warning_detail')
            respond_date = stop_warning.find('warning_respond_date')
            warning = OrderWarningDetail(
                detail=detail.text if detail is not None else None,
                respond_date=respond_date.text if respond_date is not None else None)
            inspected_location.warning_details.append(warning)

        for stop_request in stop.findall('stop_requests'):
            detail = stop_request.find('request_detail')
            response = stop_request.find('request_response')
            respond_date = stop_request.find('request_respond_date')
            request = OrderRequestDetail(
                detail=detail.text if detail is not None else None,
                respond_date=respond_date.text if respond_date is not None else None,
                response=response.text if response is not None else None)
            inspected_location.request_details.append(request)

        for attachment in stop.findall('attachment'):
            doc = _save_document(attachment)
            inspected_location.documents.append(doc)

        db.session.add(inspected_location)
        db.session.commit()


def _save_stop_order(stop_order):
    stop_detail = OrderStopDetail()

    detail = stop_order.find('order_detail')
    stop_type = stop_order.find('order_type')
    response_status = stop_order.find('order_response_status')
    stop_status = stop_order.find('order_status')
    observation = stop_order.find('order_observation')
    response = stop_order.find('order_response')
    response_received = stop_order.find('order_response_received_date')
    completion_date = stop_order.find('order_completion_date')
    authority_act = stop_order.find('order_authority_act')
    authority_act_section = stop_order.find('order_authority_section')

    for order_legislation in stop_order.findall('order_legislations'):
        noncompliance_legislation = _save_order_noncompliance_legislation(order_legislation)
        stop_detail.noncompliance_legislations.append(noncompliance_legislation)

    for order_permit in stop_order.findall('order_permits'):
        noncompliance_permit = _save_order_noncompliance_permit(order_permit)
        stop_detail.noncompliance_permits.append(noncompliance_permit)

    stop_detail.detail = detail.text if detail is not None else None
    stop_detail.stop_type = stop_type.text if stop_type is not None else None
    stop_detail.response_status = response_status.text if response_status is not None else None
    stop_detail.stop_status = stop_status.text if stop_status is not None else None
    stop_detail.observation = observation.text if observation is not None else None
    stop_detail.response = response.text if response is not None else None
    stop_detail.response_received = response_received.text if response_received is not None else None
    stop_detail.completion_date = completion_date.text if completion_date is not None else None
    stop_detail.authority_act = authority_act.text if authority_act is not None else None
    stop_detail.authority_act_section = authority_act_section.text if authority_act_section is not None else None

    for attachment in stop_order.findall('attachment'):
        doc = _save_document(attachment)
        stop_detail.documents.append(doc)

    return stop_detail


def _find_or_save_inspected_location_type(stop_type):
    inspected_location_types = InspectedLocationType.find_all_inspected_location_types()
    type_found = False
    inspected_location_type = None
    if stop_type is not None:
        for type in inspected_location_types:
            if type.inspected_location_type == stop_type.text:
                type_found = True
                inspected_location_type = type
    if not type_found:
        inspected_location_type = InspectedLocationType(inspected_location_type=stop_type.text)
        db.session.add(inspected_location_type)
    return inspected_location_type


def _save_order_noncompliance_permit(order_permit):
    noncompliance_permit = NonCompliancePermit()

    permit_section_number = order_permit.find('permit_section_number')
    permit_section_text = order_permit.find('permit_section_text')
    permit_section_title = order_permit.find('permit_section_title')

    noncompliance_permit.section_number = permit_section_number.text if permit_section_number is not None else None
    noncompliance_permit.section_title = permit_section_text.text if permit_section_text is not None else None
    noncompliance_permit.section_text = permit_section_title.text if permit_section_title is not None else None

    return noncompliance_permit


def _save_order_noncompliance_legislation(order_legislation):
    noncompliance_legislation = NonComplianceLegislation()

    estimated_incident_date = order_legislation.find('estimated_incident_date')
    noncompliant_description = order_legislation.find('noncompliant_description')
    parent_act = order_legislation.find('parent_act')
    act_regulation = order_legislation.find('act_regulation')
    section = order_legislation.find('section')
    compliance_article_id = order_legislation.find('compliance_article_id')
    compliance_article_comments = order_legislation.find('compliance_article_comments')

    noncompliance_legislation.estimated_incident_date = _parse_dumb_nris_date_string(
        estimated_incident_date.text) if estimated_incident_date is not None else None
    noncompliance_legislation.noncompliant_description = noncompliant_description.text if noncompliant_description is not None else None

    noncompliance_legislation.parent_legislation_act = _save_legislation_act(parent_act)
    legislation_act_regulation = _save_legislation_act(act_regulation)

    noncompliance_legislation.regulation_legislation_act_section = _save_legislation_act_section(
        legislation_act_regulation, section)
    noncompliance_legislation.compliance_article = _save_compliance_article(
        compliance_article_id, compliance_article_comments)

    return noncompliance_legislation


def _parse_dumb_nris_date_string(_dumb_nris_date_string):
    return _replace_string_at_index(_dumb_nris_date_string, "T", 10)


def _replace_string_at_index(s, newstring, index, nofail=False):
    if not nofail and index not in range(len(s)):
        raise ValueError("index outside given string")
    if index < 0:
        return newstring + s
    if index > len(s):
        return s + newstring
    return s[:index] + newstring + s[index + 1:]


def _save_legislation_act(legislation_act_to_get):
    legislation_acts = LegislationAct.find_all_legislation_acts()
    act_found = False
    legislation_act = None

    if legislation_act_to_get is not None:
        for act in legislation_acts:
            if act.act == legislation_act_to_get.text:
                act_found = True
                legislation_act = act

        if not act_found:
            legislation_act = LegislationAct(act=legislation_act_to_get.text)
            db.session.add(legislation_act)

    return legislation_act


def _save_legislation_act_section(legislation_act, section_to_get):
    section_found = False
    section = None

    if legislation_act is not None and section_to_get is not None:
        for legislation_act_section in legislation_act.sections:
            if legislation_act_section.section == section_to_get.text:
                section_found = True
                section = legislation_act_section

        if not section_found:
            section = LegislationActSection(section=section_to_get.text)
            legislation_act.sections.append(section)
            db.session.add(section)

    return section


def _save_compliance_article(compliance_article_id, compliance_article_comments):
    if compliance_article_id is not None:
        compliance_article = LegislationComplianceArticle.find_legislation_compliance_article_by_external_id(
            compliance_article_id.text)

        if compliance_article is None:
            compliance_article = LegislationComplianceArticle(
                external_id=compliance_article_id.text, comments=compliance_article_comments.text)
            db.session.add(compliance_article)

        return compliance_article


def _save_document(attachment):
    external_id = attachment.find('attachment_id')
    document_date = attachment.find('attachment_date')
    file_name = attachment.find('file_path')
    comment = attachment.find('attachment_comment')

    doc = Document(
        external_id=external_id.text if external_id is not None else None,
        document_date=document_date.text if document_date is not None else None,
        file_name=file_name.text if file_name is not None else None,
        comment=comment.text if comment is not None else None)

    file_type = attachment.find('file_type')
    doc_type = _find_or_save_doc_type(file_type)

    doc.document_type_rel = doc_type

    db.session.add(doc)
    return doc


def _find_or_save_doc_type(file_type):
    types = DocumentType.find_all_document_types()
    type_found = False
    doc_type = None
    if file_type is not None:
        for type in types:
            if type.document_type == file_type.text:
                type_found = True
                doc_type = type
    if not type_found:
        doc_type = DocumentType(document_type=file_type.text)
        db.session.add(doc_type)

    return doc_type


def _find_or_save_inspection_type(inspection_type):
    types = InspectionType.find_all_inspection_types()
    type_found = False
    inspec_type = None
    if inspection_type is not None:
        for type in types:
            if type.inspection_type_code == inspection_type.text:
                type_found = True
                inspec_type = type
    if not type_found:
        inspec_type = InspectionType(inspection_type_code=inspection_type.text)
        db.session.add(inspec_type)
    return inspec_type
